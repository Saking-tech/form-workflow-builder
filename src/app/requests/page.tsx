'use client';

import { useState, useEffect } from 'react';
import { useRequestStore } from '@/stores/requestStore';
import { useWorkflowStore } from '@/stores/workflowStore';
import { useFormStore } from '@/stores/formStore';
import { getStatusColor, getStatusIcon, formatDate, generateId } from '@/lib/utils';
import WorkflowExecution from '@/components/workflow-execution/WorkflowExecution';
import { Request } from '@/types';
import { 
  Play, 
  FileText,
  Edit,
  Trash2,
  MoreHorizontal,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function RequestsPage() {
  const { requests = [], updateRequest, deleteRequest, addRequest } = useRequestStore();
  const { workflows = [] } = useWorkflowStore();
  const { forms = [] } = useFormStore();
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [showExecution, setShowExecution] = useState(false);
  const [editingRequest, setEditingRequest] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: ''
  });
  const [showCreateRequestModal, setShowCreateRequestModal] = useState(false);
  const [newRequestData, setNewRequestData] = useState({
    title: '',
    workflowId: ''
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

  const findFirstIncompleteStep = (request: Request) => {
    const workflow = workflows.find(w => w.id === request.workflowId);
    if (!workflow) return 0;
    
    const totalSteps = workflow.nodes.length;
    const skippedSteps = request.formData?.skippedSteps as number[] || [];
    const completedSteps = request.formData?.completedSteps as number[] || [];
    
    // Find the first step that is neither completed nor skipped
    for (let i = 0; i < totalSteps; i++) {
      if (!completedSteps.includes(i) && !skippedSteps.includes(i)) {
        return i;
      }
    }
    
    // If all steps are completed or skipped, return the last step
    return Math.max(0, totalSteps - 1);
  };

  const handleExecuteWorkflow = (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    
    // Handle in-progress, pending, or incomplete workflows
    if (request && (request.status === 'pending' || request.status === 'in-progress' || request.status === 'incomplete')) {
      // For incomplete workflows, find the first incomplete step
      if (request.status === 'incomplete') {
        const firstIncompleteStep = findFirstIncompleteStep(request);
        console.log('Continuing incomplete workflow:', {
          requestId,
          currentStep: request.currentStep,
          firstIncompleteStep,
          workflowId: request.workflowId,
          status: request.status
        });
        // Update the request to start from the first incomplete step
        updateRequest(requestId, {
          currentStep: firstIncompleteStep
        });
      }
      
      setSelectedRequest(requestId);
      setShowExecution(true);
    }
    // Completed workflows should never be touched - they stay completed forever
  };

  const handleReExecuteWorkflow = (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    
    if (request && request.status === 'completed') {
      // Create a new request for re-execution without affecting the original
      const workflow = workflows.find(w => w.id === request.workflowId);
      if (workflow) {
        const newRequest: Request = {
          id: generateId(),
          title: `${request.title} (Re-execution)`,
          workflowId: request.workflowId,
          status: 'pending',
          currentStep: 0,
          formData: {} as Record<string, unknown>,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        addRequest(newRequest);
        // Start execution of the new request immediately
        setSelectedRequest(newRequest.id);
        setShowExecution(true);
      }
    }
  };

  const handleExecutionComplete = () => {
    setShowExecution(false);
    setSelectedRequest(null);
  };

  const handleCreateRequest = () => {
    if (!newRequestData.title.trim() || !newRequestData.workflowId) return;

    const workflow = workflows.find(w => w.id === newRequestData.workflowId);
    if (!workflow) return;

    const newRequest: Request = {
      id: generateId(),
      title: newRequestData.title,
      workflowId: newRequestData.workflowId,
      status: 'pending',
      currentStep: 0,
      formData: {} as Record<string, unknown>,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    addRequest(newRequest);
    setNewRequestData({ title: '', workflowId: '' });
    setShowCreateRequestModal(false);
  };

  const getProgressStatus = (request: Request) => {
    if (request.status === 'pending') return 'Not started';
    if (request.status === 'completed') return 'Completed';
    if (request.status === 'in-progress') return `Step ${request.currentStep + 1}: Ongoing`;
    if (request.status === 'incomplete') {
      const workflow = workflows.find(w => w.id === request.workflowId);
      const totalSteps = workflow?.nodes.length || 0;
      
      // Get skipped and completed steps from formData
      const skippedSteps = request.formData?.skippedSteps as number[] || [];
      const completedSteps = request.formData?.completedSteps as number[] || [];
      
      // Calculate actual completion status
      const actualCompletedSteps = completedSteps.length;
      const skippedStepsCount = skippedSteps.length;
      
      // Find incomplete steps (steps that are neither completed nor skipped)
      const incompleteSteps = [];
      for (let i = 1; i < totalSteps+1; i++) {
        if (!completedSteps.includes(i) && !skippedSteps.includes(i)) {
          incompleteSteps.push(i); // +1 for 1-based step numbers
        }
      }
      
      if (incompleteSteps.length > 0) {
        const firstIncompleteStep = findFirstIncompleteStep(request);
        return `Step ${request.currentStep}: Incomplete (${actualCompletedSteps}/${totalSteps} completed, Will continue from Step ${firstIncompleteStep})`;
      } else {
        return `Step ${request.currentStep}: Incomplete (${actualCompletedSteps}/${totalSteps} completed)`;
      }
    }
    return 'Unknown';
  };

  const getProgressColor = (request: Request) => {
    if (request.status === 'pending') return 'text-gray-500';
    if (request.status === 'completed') return 'text-green-600';
    if (request.status === 'in-progress') return 'text-blue-600';
    if (request.status === 'incomplete') return 'text-orange-600';
    return 'text-gray-500';
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



  const handleEditRequest = (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (request) {
      setEditFormData({
        title: request.title
      });
      setEditingRequest(requestId);
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
    }
  };

  if (showExecution && selectedRequest) {
    const workflow = getRequestWorkflow(selectedRequest);
    const request = requests.find(r => r.id === selectedRequest);
    
    if (!workflow) {
      return (
        <div className="p-4 md:p-6">
          <div className="text-center">
            <p className="text-red-600">Workflow not found</p>
            <button
              onClick={handleExecutionComplete}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      );
    }

    if (!request) {
      return (
        <div className="p-4 md:p-6">
          <div className="text-center">
            <p className="text-red-600">Request not found</p>
            <button
              onClick={handleExecutionComplete}
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
              Executing: {workflow?.name || 'Unknown'} - Step {selectedRequest ? (requests.find(r => r.id === selectedRequest)?.currentStep ?? 0): 0}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExecutionComplete}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
        <div className="flex-1">
          <WorkflowExecution
            request={request}
            onComplete={handleExecutionComplete}
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
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Executions</h1>
          <p className="text-sm md:text-base text-gray-600">Track and manage your workflow requests</p>
        </div>
      </div>

      {/* Executed Workflow Section */}
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl border border-gray-200">
        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
          <h2 className="text-base md:text-lg font-semibold text-gray-900">Executed Workflows</h2>
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
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                        <span>Step {request.currentStep }</span>
                        <span>{formatDate(request.createdAt)}</span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>Progress</span>
                          <span className={getProgressColor(request)}>{getProgressStatus(request)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              request.status === 'completed' ? 'bg-green-500' :
                              request.status === 'in-progress' ? 'bg-blue-500' :
                              request.status === 'incomplete' ? 'bg-orange-500' :
                              'bg-gray-300'
                            }`}
                            style={{ 
                              width: request.status === 'completed' ? '100%' :
                                     request.status === 'in-progress' || request.status === 'incomplete' ? `${((request.formData?.completedSteps as number[] || []).length / (workflow?.nodes.length || 1)) * 100}%` :
                                     '0%'
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        <span className="mr-1">{statusIcon}</span>
                        {request.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    {request.status !== 'completed' && (
                      <button
                        onClick={() => handleExecuteWorkflow(request.id)}
                        className="flex items-center justify-center px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        {request.status === 'incomplete' ? 'Continue' : 'Execute'}
                      </button>
                    )}
                    {request.status === 'completed' && (
                      <button
                        onClick={() => handleReExecuteWorkflow(request.id)}
                        className="flex items-center justify-center px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-sm"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Re-execute
                      </button>
                    )}
                    <button
                      onClick={() => handleEditRequest(request.id)}
                      className="flex items-center justify-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRequest(request.id)}
                      className="flex items-center justify-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <FileText className="mx-auto h-8 w-8 text-gray-500" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No executed workflows</h3>
              <p className="mt-1 text-sm text-gray-500">
                Your executed workflows will appear here.
              </p>
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block rounded-2xl overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 rounded-2xl">
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
                    <tr key={request.id} className="bg-gradient-to-r from-blue-100 to-indigo-100 hover:bg-gradient-to-r hover:from-blue-200 hover:to-indigo-200">
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
                        <div className="text-sm text-gray-900">Step {request.currentStep}</div>
                        <div className="text-sm text-gray-500">
                          {workflow ? `${workflow.nodes.length} total steps` : ''}
                        </div>
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>Progress</span>
                            <span className={getProgressColor(request)}>{getProgressStatus(request)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                request.status === 'completed' ? 'bg-green-500' :
                                request.status === 'in-progress' ? 'bg-blue-500' :
                                request.status === 'incomplete' ? 'bg-orange-500' :
                                'bg-gray-300'
                              }`}
                              style={{ 
                                width: request.status === 'completed' ? '100%' :
                                       request.status === 'in-progress' || request.status === 'incomplete' ? `${((request.formData?.completedSteps as number[] || []).length / (workflow?.nodes.length || 1)) * 100}%` :
                                       '0%'
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(request.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {request.status !== 'completed' && (
                            <button
                              onClick={() => handleExecuteWorkflow(request.id)}
                              className="flex items-center px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm"
                            >
                              <Play className="w-4 h-4 mr-1" />
                              {request.status === 'incomplete' ? 'Continue' : 'Execute'}
                            </button>
                          )}
                          {request.status === 'completed' && (
                            <button
                              onClick={() => handleReExecuteWorkflow(request.id)}
                              className="flex items-center px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-sm"
                            >
                              <Play className="w-4 h-4 mr-1" />
                              Re-execute
                            </button>
                          )}
                          <button
                            onClick={() => handleEditRequest(request.id)}
                            className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRequest(request.id)}
                            className="flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <FileText className="mx-auto h-8 w-8 text-gray-500" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No executed workflows</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Your executed workflows will appear here.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Execute Workflow Section */}
      <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl border border-gray-200">
        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-base md:text-lg font-semibold text-gray-900">Available Workflow</h2>
            <button
              onClick={() => setShowCreateRequestModal(true)}
              className="flex items-center px-3 py-1 bg-gradient-to-l from-blue-600 to-indigo-500 text-white rounded-lg hover:from-blue-700 hover:to-indigo-600 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-1" />
              Create Request
            </button>
          </div>
        </div>
        <div className="p-4 md:p-6 bg-gray-50 rounded-2xl border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {workflows && workflows.length > 0 ? (
              workflows.map((workflow) => (
                <div key={workflow.id} className="border border-green-300 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-2xl p-3 md:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-700 text-sm md:text-base">{workflow.name}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      workflow.status === 'active' ? 'bg-green-100 text-green-800' :
                      workflow.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {workflow.status}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3">{workflow.description}</p>
                  <div className="text-xs md:text-sm text-gray-500 mb-3">
                    {workflow.nodes.length} steps
                  </div>
                  <button
                    onClick={() => {
                      setNewRequestData({ title: `${workflow.name} Request`, workflowId: workflow.id });
                      setShowCreateRequestModal(true);
                    }}
                    className="w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-600 shadow-sm hover:shadow-md transition-all duration-200 font-medium text-sm"
                  >
                    <Play className="w-4 h-4 mr-2 inline" />
                    Execute Workflow
                  </button>
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

      {/* Create Request Modal */}
      {showCreateRequestModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200/50">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">Create New Request</h2>
              <p className="text-sm text-gray-600 mt-1">Start a new workflow execution</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Request Title</label>
                <input
                  type="text"
                  value={newRequestData.title}
                  onChange={(e) => setNewRequestData({ ...newRequestData, title: e.target.value })}
                  placeholder="Enter request title..."
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Workflow</label>
                <select
                  value={newRequestData.workflowId}
                  onChange={(e) => setNewRequestData({ ...newRequestData, workflowId: e.target.value })}
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all duration-200"
                >
                  <option value="">Select a workflow...</option>
                  {workflows.map((workflow) => (
                    <option key={workflow.id} value={workflow.id}>
                      {workflow.name} ({workflow.nodes.length} steps)
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3 px-6 py-4 border-t border-gray-200/50">
              <button
                onClick={() => {
                  setShowCreateRequestModal(false);
                  setNewRequestData({ title: '', workflowId: '' });
                }}
                className="w-full sm:w-auto px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRequest}
                disabled={!newRequestData.title.trim() || !newRequestData.workflowId}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all duration-200 font-medium"
              >
                Create Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}