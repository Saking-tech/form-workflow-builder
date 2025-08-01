'use client';

import { useState } from 'react';
import { useWorkflowStore } from '@/stores/workflowStore';
import { useFormStore } from '@/stores/formStore';
import { Workflow } from '@/types';
import { generateId, formatDate } from '@/lib/utils';
import WorkflowDesigner from '@/components/workflow-designer/WorkflowDesigner';
import { 
  Plus, 
  Settings, 
  Eye, 
  Trash2, 
  Copy,
  FileText,
  Save
} from 'lucide-react';
import { WORKFLOW_TEMPLATES } from '@/lib/workflowTemplates';

export default function WorkflowsPage() {
  const { workflows, addWorkflow, updateWorkflow, deleteWorkflow, createWorkflowFromTemplate, saveWorkflowAsTemplate, saveWorkflowObjectAsTemplate } = useWorkflowStore();
  const { forms } = useFormStore();
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [showDesigner, setShowDesigner] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingWorkflow, setViewingWorkflow] = useState<Workflow | null>(null);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [currentWorkflowData, setCurrentWorkflowData] = useState<Workflow | null>(null);

  const handleCreateWorkflow = () => {
    if (!newWorkflowName.trim()) return;

    const newWorkflow: Workflow = {
      id: generateId(),
      name: newWorkflowName,
      description: 'New workflow',
      nodes: [],
      connections: [],
      status: 'draft',
      createdAt: new Date()
    };

    addWorkflow(newWorkflow);
    setSelectedWorkflow(newWorkflow);
    setShowDesigner(true);
    setShowCreateModal(false);
    setNewWorkflowName('');
  };

  const handleCreateFromTemplate = (templateId: string) => {
    const newWorkflow = createWorkflowFromTemplate(templateId);
    setSelectedWorkflow(newWorkflow);
    setShowDesigner(true);
    setShowTemplateModal(false);
  };

  const handleSaveAsTemplate = (defaultName: string, defaultDescription: string) => {
    setTemplateName(defaultName);
    setTemplateDescription(defaultDescription);
    setShowSaveTemplateModal(true);
  };

  const handleConfirmSaveAsTemplate = () => {
    if (currentWorkflowData && templateName) {
      saveWorkflowObjectAsTemplate(currentWorkflowData, templateName, templateDescription);
      setShowSaveTemplateModal(false);
      setTemplateName('');
      setTemplateDescription('');
      setCurrentWorkflowData(null);
      alert('Workflow saved as template successfully!');
    }
  };

  const handleEditWorkflow = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setShowDesigner(true);
  };

  const handleSaveWorkflow = (workflow: Workflow) => {
    if (selectedWorkflow) {
      updateWorkflow(selectedWorkflow.id, workflow);
    } else {
      addWorkflow(workflow);
    }
    setShowDesigner(false);
    setSelectedWorkflow(null);
  };

  const handleDeleteWorkflow = (workflowId: string) => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      deleteWorkflow(workflowId);
    }
  };

  const handleDuplicateWorkflow = (workflow: Workflow) => {
    const duplicatedWorkflow: Workflow = {
      ...workflow,
      id: generateId(),
      name: `${workflow.name} (Copy)`,
      status: 'draft',
      createdAt: new Date()
    };
    addWorkflow(duplicatedWorkflow);
  };

  const handleViewWorkflow = (workflow: Workflow) => {
    setViewingWorkflow(workflow);
    setShowViewModal(true);
  };

  if (showDesigner) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Workflow Designer</h2>
            <p className="text-sm text-gray-600">
              {selectedWorkflow ? `Editing: ${selectedWorkflow.name}` : 'Create new workflow'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowDesigner(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Back to Workflows
            </button>
          </div>
        </div>
        <div className="flex-1">
          <WorkflowDesigner
            workflow={selectedWorkflow || undefined}
            onSave={handleSaveWorkflow}
            onSaveAsTemplate={handleSaveAsTemplate}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Workflows</h1>
          <p className="text-sm md:text-base text-gray-600">Create and manage workflow templates</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowTemplateModal(true)}
            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <FileText className="w-4 h-4 mr-2" />
            Use Template
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Workflow
          </button>
        </div>
      </div>



      {/* Workflows List */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm">
        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100">
          <h2 className="text-base md:text-lg font-semibold text-gray-900">All Workflows</h2>
        </div>
        
        {/* Mobile Cards View */}
        <div className="md:hidden">
          {workflows?.map((workflow) => {
            const formCount = workflow.nodes.filter(node => node.formId).length;
            
            return (
              <div key={workflow.id} className="p-4 border-b border-gray-100 last:border-b-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 mb-1">{workflow.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">{workflow.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{formCount} forms</span>
                      <span>{workflow.nodes.length} steps</span>
                      <span>{formatDate(workflow.createdAt)}</span>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    workflow.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                    workflow.status === 'draft' ? 'bg-amber-100 text-amber-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {workflow.status}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditWorkflow(workflow)}
                    className="flex-1 flex items-center justify-center px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 text-xs shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <Settings className="w-3 h-3 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDuplicateWorkflow(workflow)}
                    className="flex-1 flex items-center justify-center px-3 py-1.5 bg-white/60 backdrop-blur-sm text-gray-700 rounded-lg hover:bg-white/80 text-xs border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </button>
                  <button
                    onClick={() => handleViewWorkflow(workflow)}
                    className="flex-1 flex items-center justify-center px-3 py-1.5 bg-white/60 backdrop-blur-sm text-gray-700 rounded-lg hover:bg-white/80 text-xs border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </button>
                  <button
                    onClick={() => handleDeleteWorkflow(workflow.id)}
                    className="flex-1 flex items-center justify-center px-3 py-1.5 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 text-xs shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Workflow
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Forms
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
            <tbody className="bg-white/50 divide-y divide-gray-200">
              {workflows && workflows.length > 0 ? workflows.map((workflow) => {
                const formCount = workflow.nodes.filter(node => node.formId).length;
                
                return (
                  <tr key={workflow.id} className="hover:bg-white/80 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{workflow.name}</div>
                        <div className="text-sm text-gray-500">{workflow.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formCount} forms</div>
                      <div className="text-sm text-gray-500">{workflow.nodes.length} total steps</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        workflow.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                        workflow.status === 'draft' ? 'bg-amber-100 text-amber-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {workflow.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(workflow.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditWorkflow(workflow)}
                          className="flex items-center px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          <Settings className="w-4 h-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDuplicateWorkflow(workflow)}
                          className="flex items-center px-3 py-1 bg-white/60 backdrop-blur-sm text-gray-700 rounded-lg hover:bg-white/80 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Duplicate
                        </button>
                        <button
                          onClick={() => handleViewWorkflow(workflow)}
                          className="flex items-center px-3 py-1 bg-white/60 backdrop-blur-sm text-gray-700 rounded-lg hover:bg-white/80 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteWorkflow(workflow.id)}
                          className="flex items-center px-3 py-1 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : null}
            </tbody>
          </table>
        </div>

        {(!workflows || workflows.length === 0) && (
          <div className="text-center py-8 md:py-12">
            <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 p-3 rounded-xl bg-gray-100/50">
              <FileText className="w-full h-full text-gray-400" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No workflows</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first workflow.
            </p>
          </div>
        )}
      </div>

      {/* Available Forms */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm">
        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100">
          <h2 className="text-base md:text-lg font-semibold text-gray-900">Available Forms</h2>
        </div>
        <div className="p-4 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {forms.map((form) => (
              <div key={form.id} className="bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl p-3 md:p-4 hover:bg-white/80 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 text-sm md:text-base">{form.name}</h3>
                  <span className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-2 py-1 rounded-lg">
                    {form.sections.length} sections
                  </span>
                </div>
                <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3">{form.description}</p>
                <div className="text-xs md:text-sm text-gray-500">
                  {form.sections.reduce((total, section) => total + section.fields.length, 0)} fields
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Workflow Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-r from-blue-200 to-indigo-100 border border-gray-200/50 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200/50">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">Create New Workflow</h2>
              <p className="text-sm text-gray-600 mt-1">Design a custom workflow process</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Workflow Name</label>
                <input
                  type="text"
                  value={newWorkflowName}
                  onChange={(e) => setNewWorkflowName(e.target.value)}
                  placeholder="Enter workflow name..."
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all duration-200"
                />
              </div>
              <p className="text-sm text-gray-600">
                You&apos;ll be able to add forms and configure the workflow in the designer.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3 px-6 py-4 border-t border-gray-200/50">
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-full sm:w-auto px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWorkflow}
                disabled={!newWorkflowName.trim()}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all duration-200 font-medium"
              >
                Create Workflow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Workflow Modal */}
      {showViewModal && viewingWorkflow && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900">Workflow Details</h2>
                  <p className="text-sm text-gray-600 mt-1">Viewing: {viewingWorkflow.name}</p>
                </div>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setViewingWorkflow(null);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Workflow Overview */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Name</p>
                    <p className="font-medium text-gray-900">{viewingWorkflow.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      viewingWorkflow.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                      viewingWorkflow.status === 'draft' ? 'bg-amber-100 text-amber-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {viewingWorkflow.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Description</p>
                    <p className="font-medium text-gray-900">{viewingWorkflow.description}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Created</p>
                    <p className="font-medium text-gray-900">{formatDate(viewingWorkflow.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Workflow Steps */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow Steps</h3>
                {viewingWorkflow.nodes.length > 0 ? (
                  <div className="space-y-3">
                    {viewingWorkflow.nodes.map((node, index) => {
                      const form = forms.find(f => f.id === node.formId);
                      return (
                        <div key={node.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-medium text-sm mr-3">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {form ? form.name : `Step ${index + 1}`}
                            </p>
                            <p className="text-sm text-gray-600">
                              {form ? `${form.sections.length} sections, ${form.sections.reduce((total, section) => total + section.fields.length, 0)} fields` : 'No form assigned'}
                            </p>
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            node.status === 'active' ? 'bg-green-100 text-green-800' :
                            node.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {node.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-gray-500">No steps defined in this workflow</p>
                  </div>
                )}
              </div>

              {/* Workflow Connections */}
              {viewingWorkflow.connections.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow Connections</h3>
                  <div className="space-y-2">
                    {viewingWorkflow.connections.map((connection, index) => (
                      <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-600">
                          Step {viewingWorkflow.nodes.findIndex(n => n.id === connection.from) + 1} → Step {viewingWorkflow.nodes.findIndex(n => n.id === connection.to) + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setViewingWorkflow(null);
                  }}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setViewingWorkflow(null);
                    handleEditWorkflow(viewingWorkflow);
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-sm hover:shadow-md transition-all duration-200 font-medium"
                >
                  Edit Workflow
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Selection Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200/50">
              <h2 className="text-xl font-semibold text-gray-900">Choose a Workflow Template</h2>
              <p className="text-sm text-gray-600 mt-1">Start with a pre-built workflow template that matches common business processes.</p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {WORKFLOW_TEMPLATES.map((template) => (
                  <div key={template.id} className="bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl p-4 hover:bg-white/80 hover:shadow-md transition-all duration-200">
                    <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      {template.nodes.map((node, index) => (
                        <div key={node.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">Step {index + 1}</span>
                          <span className="text-gray-500">{node.formId ? 'Form' : 'Node'}</span>
                        </div>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => handleCreateFromTemplate(template.id)}
                      className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-sm hover:shadow-md transition-all duration-200 font-medium"
                    >
                      Use This Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200/50">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Workflow as Template Modal */}
      {showSaveTemplateModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200/50">
              <h2 className="text-xl font-semibold text-gray-900">Save Workflow as Template</h2>
              <p className="text-sm text-gray-600 mt-1">Give your workflow a name and description to save it as a template.</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all duration-200"
                  placeholder="Enter template name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all duration-200"
                  placeholder="Enter template description"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200/50">
              <button
                onClick={() => {
                  setShowSaveTemplateModal(false);
                  setTemplateName('');
                  setTemplateDescription('');
                }}
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSaveAsTemplate}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-sm hover:shadow-md transition-all duration-200 font-medium"
              >
                Save as Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}