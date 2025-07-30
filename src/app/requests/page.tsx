'use client';

import { useState } from 'react';
import { useRequestStore } from '@/stores/requestStore';
import { useWorkflowStore } from '@/stores/workflowStore';
import { useFormStore } from '@/stores/formStore';
import { getStatusColor, getStatusIcon, formatDate } from '@/lib/utils';
import WorkflowExecution from '@/components/workflow-execution/WorkflowExecution';
import { 
  Play, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileText,
  Settings
} from 'lucide-react';

export default function RequestsPage() {
  const { requests, updateRequest } = useRequestStore();
  const { workflows } = useWorkflowStore();
  const { forms } = useFormStore();
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [showExecution, setShowExecution] = useState(false);

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

      {/* Request Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {requests.filter(r => r.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {requests.filter(r => r.status === 'in-progress').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {requests.filter(r => r.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-gray-900">
                {requests.filter(r => r.status === 'cancelled').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Requests List */}
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
              {requests.map((request) => {
                const workflow = getRequestWorkflow(request.id);
                const currentForm = getRequestForm(request.id);
                
                return (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{request.title}</div>
                        <div className="text-sm text-gray-500">ID: {request.id}</div>
                      </div>
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
                        <button className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </button>
                        <button className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                          <Settings className="w-4 h-4 mr-1" />
                          Settings
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {requests.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No requests</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new request.
            </p>
          </div>
        )}
      </div>

      {/* Workflow Templates */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Workflow Templates</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflows.map((workflow) => (
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}