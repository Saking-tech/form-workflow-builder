'use client';

import { useState, useEffect } from 'react';
import { useRequestStore } from '@/stores/requestStore';
import { useWorkflowStore } from '@/stores/workflowStore';
import { useFormStore } from '@/stores/formStore';
import { getStatusColor, getStatusIcon, formatDate } from '@/lib/utils';
import WorkflowExecution from '@/components/workflow-execution/WorkflowExecution';
import { 
  Play, 
  Eye, 
  FileText,
  Settings,
  Edit,
  Trash2,
  MoreHorizontal
} from 'lucide-react';

export default function RequestsPage() {
  const { requests, updateRequest, deleteRequest } = useRequestStore();
  const { workflows } = useWorkflowStore();
  const { forms } = useFormStore();
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [showExecution, setShowExecution] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState<string | null>(null);
  const [editingRequest, setEditingRequest] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: ''
  });

  const handleExecuteWorkflow = (requestId: string) => {
    setSelectedRequest(requestId);
    setShowExecution(true);
  };

  const handleExecutionComplete = () => {
    setShowExecution(false);
    setSelectedRequest(null);
  };

  const handleExecutionClose = () => {
    setShowExecution(false);
    setSelectedRequest(null);
  };

  const getRequestWorkflow = (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return null;
    return workflows.find(w => w.id === request.workflowId);
  };

  const getRequestForm = (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return null;
    const workflow = workflows.find(w => w.id === request.workflowId);
    if (!workflow) return null;
    const currentNode = workflow.nodes[request.currentStep];
    if (!currentNode?.formId) return null;
    return forms.find(f => f.id === currentNode.formId);
  };

  const handleViewRequest = (requestId: string) => {
    // Navigate to a detailed view or open a modal
    console.log('Viewing request:', requestId);
  };

  const handleEditRequest = (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (request) {
      setEditFormData({
        title: request.title
      });
      setEditingRequest(requestId);
      setShowSettingsMenu(null);
    }
  };

  const handleSaveEdit = () => {
    if (editingRequest) {
      updateRequest(editingRequest, {
        title: editFormData.title
      });
      setEditingRequest(null);
      setEditFormData({ title: '' });
    }
  };

  const handleCancelEdit = () => {
    setEditingRequest(null);
    setEditFormData({ title: '' });
  };

  const handleDeleteRequest = (requestId: string) => {
    if (confirm('Are you sure you want to delete this request?')) {
      deleteRequest(requestId);
      setShowSettingsMenu(null);
    }
  };

  const toggleSettingsMenu = (requestId: string) => {
    setShowSettingsMenu(showSettingsMenu === requestId ? null : requestId);
  };

  // Close settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSettingsMenu && !(event.target as Element).closest('.settings-menu')) {
        setShowSettingsMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettingsMenu]);

  if (showExecution && selectedRequest) {
    const request = requests.find(r => r.id === selectedRequest);
    if (!request) return null;

    return (
      <div className="h-full">
        <WorkflowExecution
          request={request}
          onComplete={handleExecutionComplete}
          onClose={handleExecutionClose}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
          <p className="text-gray-600">Track and manage your workflow requests</p>
        </div>
      </div>

      {/* All Requests Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Requests</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Workflow
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Step
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
               {requests && requests.length > 0 ? (
                 requests.map((request) => {
                   const workflow = getRequestWorkflow(request.id);
                   const currentForm = getRequestForm(request.id);
                   
                                       return (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingRequest === request.id ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editFormData.title}
                                onChange={(e) => setEditFormData({ title: e.target.value })}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                                placeholder="Request title"
                              />
                              <div className="flex space-x-2">
                                <button
                                  onClick={handleSaveEdit}
                                  className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="text-sm font-medium text-gray-900">{request.title}</div>
                              <div className="text-sm text-gray-500">ID: {request.id}</div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {workflow?.name || 'Unknown Workflow'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {workflow?.nodes.length || 0} steps
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {currentForm?.name || `Step ${request.currentStep + 1}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.currentStep + 1} of {workflow?.nodes.length || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {getStatusIcon(request.status)}
                            <span className="ml-1 capitalize">{request.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(request.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            {request.status !== 'completed' && request.status !== 'cancelled' && (
                              <button
                                onClick={() => handleExecuteWorkflow(request.id)}
                                className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                              >
                                <Play className="w-4 h-4 mr-1" />
                                Execute
                              </button>
                            )}
                            <button 
                              onClick={() => handleViewRequest(request.id)}
                              className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </button>
                            <div className="relative settings-menu">
                              <button 
                                onClick={() => toggleSettingsMenu(request.id)}
                                className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                              {showSettingsMenu === request.id && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                                  <div className="py-1">
                                    <button
                                      onClick={() => handleEditRequest(request.id)}
                                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteRequest(request.id)}
                                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                 })
               ) : (
                 <tr>
                   <td colSpan={6} className="px-6 py-12 text-center">
                     <FileText className="mx-auto h-12 w-12 text-gray-500" />
                     <h3 className="mt-2 text-sm font-medium text-gray-900">No requests</h3>
                     <p className="mt-1 text-sm text-gray-500">
                       Get started by creating a new request.
                     </p>
                   </td>
                 </tr>
               )}
             </tbody>
          </table>
                 </div>
       </div>

      {/* Workflow Templates */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Workflow Templates</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflows && workflows.length > 0 ? (
              workflows.map((workflow) => (
                <div key={workflow.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{workflow.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      workflow.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {workflow.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{workflow.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{workflow.nodes.length} steps</span>
                    <span>{formatDate(workflow.createdAt)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-500" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No workflow templates</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Create workflows to see them here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}