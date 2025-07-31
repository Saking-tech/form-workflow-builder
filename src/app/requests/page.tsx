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
  const { requests = [], updateRequest, deleteRequest } = useRequestStore();
  const { workflows = [] } = useWorkflowStore();
  const { forms = [] } = useFormStore();
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [showExecution, setShowExecution] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState<string | null>(null);
  const [editingRequest, setEditingRequest] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: ''
  });

  // Add loading state to prevent errors during initial render
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set loading to false after a short delay to ensure stores are initialized
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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
      const target = event.target as Element;
      if (!target.closest('.settings-menu')) {
        setShowSettingsMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (showExecution && selectedRequest) {
    const workflow = getRequestWorkflow(selectedRequest);
    const form = getRequestForm(selectedRequest);
    
    if (!workflow || !form) {
      return (
        <div className="p-4 md:p-6">
          <div className="text-center">
            <p className="text-red-600">Workflow or form not found</p>
            <button
              onClick={handleExecutionClose}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Workflow Execution</h2>
            <p className="text-sm text-gray-600">
              Executing: {workflow?.name || 'Unknown'} - Step {selectedRequest ? (requests.find(r => r.id === selectedRequest)?.currentStep ?? 0) + 1 : 0}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExecutionClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
        <div className="flex-1">
          <WorkflowExecution
            request={requests.find(r => r.id === selectedRequest) || requests[0] || { id: '', title: '', workflowId: '', currentStep: 0, status: 'pending', formData: {}, createdAt: new Date() }}
            onComplete={handleExecutionComplete}
            onClose={handleExecutionClose}
          />
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading requests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">My Requests</h1>
          <p className="text-sm md:text-base text-gray-600">Track and manage your workflow requests</p>
        </div>
      </div>

      {/* All Requests Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
          <h2 className="text-base md:text-lg font-semibold text-gray-900">All Requests</h2>
        </div>
        
        {/* Mobile Cards View */}
        <div className="md:hidden">
          {requests && requests.length > 0 ? (
            requests.map((request) => {
              const workflow = workflows.find(w => w.id === request.workflowId);
              const statusIcon = getStatusIcon(request.status || 'pending');
              
              return (
                <div key={request.id} className="p-4 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      {editingRequest === request.id ? (
                        <div className="mb-2">
                          <input
                            type="text"
                            value={editFormData.title}
                            onChange={(e) => setEditFormData({ title: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <div className="flex space-x-2 mt-2">
                            <button
                              onClick={handleSaveEdit}
                              className="px-2 py-1 bg-blue-600 text-white rounded text-xs"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <h3 className="text-sm font-medium text-gray-900 mb-1">{request.title}</h3>
                      )}
                      <p className="text-xs text-gray-500 mb-2">
                        Workflow: {workflow?.name || 'Unknown'}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Step {request.currentStep + 1}</span>
                        <span>{formatDate(request.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        <span className="mr-1">{statusIcon}</span>
                        {request.status}
                      </span>
                      <div className="relative settings-menu">
                        <button
                          onClick={() => toggleSettingsMenu(request.id)}
                          className="p-1 rounded hover:bg-gray-100"
                        >
                          <MoreHorizontal className="w-4 h-4 text-gray-500" />
                        </button>
                        {showSettingsMenu === request.id && (
                          <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[120px]">
                            <button
                              onClick={() => handleEditRequest(request.id)}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                            >
                              <Edit className="w-3 h-3 mr-2" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteRequest(request.id)}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center text-red-600"
                            >
                              <Trash2 className="w-3 h-3 mr-2" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => handleExecuteWorkflow(request.id)}
                      className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Execute Workflow
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <FileText className="mx-auto h-8 w-8 text-gray-500" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No requests</h3>
              <p className="mt-1 text-sm text-gray-500">
                Your workflow requests will appear here.
              </p>
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
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
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
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
                  const workflow = workflows.find(w => w.id === request.workflowId);
                  const statusIcon = getStatusIcon(request.status || 'pending');
                  
                  return (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          {editingRequest === request.id ? (
                            <div>
                              <input
                                type="text"
                                value={editFormData.title}
                                onChange={(e) => setEditFormData({ title: e.target.value })}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                              <div className="flex space-x-2 mt-2">
                                <button
                                  onClick={handleSaveEdit}
                                  className="px-2 py-1 bg-blue-600 text-white rounded text-xs"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs"
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
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{workflow?.name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{workflow?.description || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                                                 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                           <span className="mr-1">{statusIcon}</span>
                           {request.status}
                         </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Step {request.currentStep + 1}</div>
                        <div className="text-sm text-gray-500">
                          {workflow ? `${workflow.nodes.length} total steps` : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(request.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleExecuteWorkflow(request.id)}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Execute Workflow
                          </button>
                          <div className="relative settings-menu">
                            <button
                              onClick={() => toggleSettingsMenu(request.id)}
                              className="p-2 rounded hover:bg-gray-100"
                            >
                              <MoreHorizontal className="w-4 h-4 text-gray-500" />
                            </button>
                            {showSettingsMenu === request.id && (
                              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[120px]">
                                <button
                                  onClick={() => handleEditRequest(request.id)}
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                                >
                                  <Edit className="w-3 h-3 mr-2" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteRequest(request.id)}
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center text-red-600"
                                >
                                  <Trash2 className="w-3 h-3 mr-2" />
                                  Delete
                                </button>
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
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <FileText className="mx-auto h-8 w-8 text-gray-500" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No requests</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Your workflow requests will appear here.
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
        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
          <h2 className="text-base md:text-lg font-semibold text-gray-900">Workflow Templates</h2>
        </div>
        <div className="p-4 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {workflows && workflows.length > 0 ? (
              workflows.map((workflow) => (
                <div key={workflow.id} className="border border-gray-200 rounded-lg p-3 md:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 text-sm md:text-base">{workflow.name}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      workflow.status === 'active' ? 'bg-green-100 text-green-800' :
                      workflow.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {workflow.status}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3">{workflow.description}</p>
                  <div className="text-xs md:text-sm text-gray-500">
                    {workflow.nodes.length} steps
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <FileText className="mx-auto h-8 w-8 text-gray-500" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No workflow templates</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Create workflow templates to get started.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}