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
  FileText
} from 'lucide-react';

export default function WorkflowsPage() {
  const { workflows, addWorkflow, updateWorkflow, deleteWorkflow } = useWorkflowStore();
  const { forms } = useFormStore();
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [showDesigner, setShowDesigner] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');

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
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-sm hover:shadow-md transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Workflow
        </button>
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
                  <button className="flex-1 flex items-center justify-center px-3 py-1.5 bg-white/60 backdrop-blur-sm text-gray-700 rounded-lg hover:bg-white/80 text-xs border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200">
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
              {workflows?.map((workflow) => {
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
                        <button className="flex items-center px-3 py-1 bg-white/60 backdrop-blur-sm text-gray-700 rounded-lg hover:bg-white/80 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200">
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
              })}
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
          <div className="bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-2xl shadow-2xl w-full max-w-md">
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
    </div>
  );
}