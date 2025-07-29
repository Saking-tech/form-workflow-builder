'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormStore } from '@/stores/formStore';
import { useWorkflowStore } from '@/stores/workflowStore';
import { createNewForm } from '@/lib/formUtils';
import { 
  FileText, 
  GitBranch, 
  Play, 
  Users,
  Plus,
  ChevronDown,
  Eye,
  Edit,
  Copy,
  Trash2,
  Save,
  Rocket,
  AlertTriangle,
  X,
  Sparkles,
  Activity,
  BarChart3,
  Settings,
  Calendar
} from 'lucide-react';

type NavigationTab = 'forms' | 'workflows' | 'executions';

interface NavigationProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const { forms, updateForm, deleteForm, duplicateForm, addForm } = useFormStore();
  const { workflows, executions, updateWorkflow, deleteWorkflow, duplicateWorkflow, addWorkflow } = useWorkflowStore();
  
  // Dialog states
  const [isNewFormDialogOpen, setIsNewFormDialogOpen] = useState(false);
  const [isNewWorkflowDialogOpen, setIsNewWorkflowDialogOpen] = useState(false);
  const [isEditFormDialogOpen, setIsEditFormDialogOpen] = useState(false);
  const [isEditWorkflowDialogOpen, setIsEditWorkflowDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showFormsDropdown, setShowFormsDropdown] = useState(false);
  const [showWorkflowsDropdown, setShowWorkflowsDropdown] = useState(false);
  
  // Form states
  const [newFormName, setNewFormName] = useState('');
  const [newFormDescription, setNewFormDescription] = useState('');
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowDescription, setNewWorkflowDescription] = useState('');
  const [editFormName, setEditFormName] = useState('');
  const [editFormDescription, setEditFormDescription] = useState('');
  const [editWorkflowName, setEditWorkflowName] = useState('');
  const [editWorkflowDescription, setEditWorkflowDescription] = useState('');
  
  // Selected items for actions
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);
  const [deleteType, setDeleteType] = useState<'form' | 'workflow'>('form');
  const [deleteItem, setDeleteItem] = useState<any>(null);

  const handleCreateForm = () => {
    if (newFormName.trim()) {
      const newForm = createNewForm(newFormName.trim(), newFormDescription.trim());
      addForm(newForm);
      setNewFormName('');
      setNewFormDescription('');
      setIsNewFormDialogOpen(false);
    }
  };

  const handleCreateWorkflow = () => {
    if (newWorkflowName.trim()) {
      const newWorkflow = {
        id: `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: newWorkflowName.trim(),
        description: newWorkflowDescription.trim(),
        nodes: [],
        connections: [],
        status: 'draft' as const,
        createdAt: new Date(),
      };
      addWorkflow(newWorkflow);
      setNewWorkflowName('');
      setNewWorkflowDescription('');
      setIsNewWorkflowDialogOpen(false);
    }
  };

  const handleEditForm = () => {
    if (selectedForm && editFormName.trim()) {
      updateForm(selectedForm.id, {
        name: editFormName.trim(),
        description: editFormDescription.trim(),
        updatedAt: new Date(),
      });
      setIsEditFormDialogOpen(false);
      setSelectedForm(null);
      setEditFormName('');
      setEditFormDescription('');
    }
  };

  const handleEditWorkflow = () => {
    if (selectedWorkflow && editWorkflowName.trim()) {
      updateWorkflow(selectedWorkflow.id, {
        name: editWorkflowName.trim(),
        description: editWorkflowDescription.trim(),
      });
      setIsEditWorkflowDialogOpen(false);
      setSelectedWorkflow(null);
      setEditWorkflowName('');
      setEditWorkflowDescription('');
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteType === 'form' && deleteItem) {
      deleteForm(deleteItem.id);
    } else if (deleteType === 'workflow' && deleteItem) {
      deleteWorkflow(deleteItem.id);
    }
    setIsDeleteDialogOpen(false);
    setDeleteItem(null);
  };

  const openEditForm = (form: any) => {
    setSelectedForm(form);
    setEditFormName(form.name);
    setEditFormDescription(form.description || '');
    setIsEditFormDialogOpen(true);
    setShowFormsDropdown(false);
  };

  const openEditWorkflow = (workflow: any) => {
    setSelectedWorkflow(workflow);
    setEditWorkflowName(workflow.name);
    setEditWorkflowDescription(workflow.description || '');
    setIsEditWorkflowDialogOpen(true);
    setShowWorkflowsDropdown(false);
  };

  const openDeleteDialog = (type: 'form' | 'workflow', item: any) => {
    setDeleteType(type);
    setDeleteItem(item);
    setIsDeleteDialogOpen(true);
    setShowFormsDropdown(false);
    setShowWorkflowsDropdown(false);
  };

  const handleDuplicate = (type: 'form' | 'workflow', item: any) => {
    if (type === 'form') {
      duplicateForm(item.id);
    } else {
      duplicateWorkflow(item.id);
    }
    setShowFormsDropdown(false);
    setShowWorkflowsDropdown(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Left: Main Navigation */}
          <div className="flex items-center space-x-4 sm:space-x-8">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 hidden sm:block">Form Builder Studio</h1>
              <h1 className="text-lg font-bold text-gray-900 sm:hidden">FBS</h1>
            </div>

            {/* Navigation Tabs - Mobile: Stacked, Desktop: Horizontal */}
            <div className="hidden sm:flex items-center space-x-1">
              {/* Forms Tab with Dropdown */}
              <div className="relative">
                <Button
                  variant={activeTab === 'forms' ? 'default' : 'ghost'}
                  size="default"
                  className="flex items-center space-x-2"
                  onClick={() => {
                    onTabChange('forms');
                    setShowFormsDropdown(!showFormsDropdown);
                    setShowWorkflowsDropdown(false);
                  }}
                >
                  <FileText className="w-4 h-4" />
                  <span>Forms</span>
                  <Badge variant="outline" className="ml-1 text-xs">
                    {forms.length}
                  </Badge>
                  <ChevronDown className="w-3 h-3" />
                </Button>

                {/* Forms Dropdown */}
                {showFormsDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">Form Management</h3>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            setIsNewFormDialogOpen(true);
                            setShowFormsDropdown(false);
                          }}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          New
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">Manage your forms and templates</p>
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto">
                      {forms.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No forms created yet</p>
                        </div>
                      ) : (
                        forms.map((form) => (
                          <div key={form.id} className="p-3 border-b border-gray-50 hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm text-gray-900 truncate">
                                  {form.name}
                                </h4>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className="text-xs text-gray-500">
                                    {form.fields.length} fields
                                  </span>
                                  <span className="text-xs text-gray-400">•</span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(form.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditForm(form)}
                                  className="h-6 w-6 p-0 hover:bg-yellow-100"
                                  title="Edit form"
                                >
                                  <Edit className="w-3 h-3 text-yellow-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDuplicate('form', form)}
                                  className="h-6 w-6 p-0 hover:bg-blue-100"
                                  title="Duplicate form"
                                >
                                  <Copy className="w-3 h-3 text-blue-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openDeleteDialog('form', form)}
                                  className="h-6 w-6 p-0 hover:bg-red-100"
                                  title="Delete form"
                                >
                                  <Trash2 className="w-3 h-3 text-red-600" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Workflows Tab with Dropdown */}
              <div className="relative">
                <Button
                  variant={activeTab === 'workflows' ? 'default' : 'ghost'}
                  size="default"
                  className="flex items-center space-x-2"
                  onClick={() => {
                    onTabChange('workflows');
                    setShowWorkflowsDropdown(!showWorkflowsDropdown);
                    setShowFormsDropdown(false);
                  }}
                >
                  <GitBranch className="w-4 h-4" />
                  <span>Workflows</span>
                  <Badge variant="outline" className="ml-1 text-xs">
                    {workflows.length}
                  </Badge>
                  <ChevronDown className="w-3 h-3" />
                </Button>

                {/* Workflows Dropdown */}
                {showWorkflowsDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">Workflow Management</h3>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            setIsNewWorkflowDialogOpen(true);
                            setShowWorkflowsDropdown(false);
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          New
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">Manage your workflows and processes</p>
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto">
                      {workflows.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          <GitBranch className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No workflows created yet</p>
                        </div>
                      ) : (
                        workflows.map((workflow) => (
                          <div key={workflow.id} className="p-3 border-b border-gray-50 hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm text-gray-900 truncate">
                                  {workflow.name}
                                </h4>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className="text-xs text-gray-500">
                                    {workflow.nodes.length} steps
                                  </span>
                                  <span className="text-xs text-gray-400">•</span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(workflow.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditWorkflow(workflow)}
                                  className="h-6 w-6 p-0 hover:bg-yellow-100"
                                  title="Edit workflow"
                                >
                                  <Edit className="w-3 h-3 text-yellow-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDuplicate('workflow', workflow)}
                                  className="h-6 w-6 p-0 hover:bg-blue-100"
                                  title="Duplicate workflow"
                                >
                                  <Copy className="w-3 h-3 text-blue-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openDeleteDialog('workflow', workflow)}
                                  className="h-6 w-6 p-0 hover:bg-red-100"
                                  title="Delete workflow"
                                >
                                  <Trash2 className="w-3 h-3 text-red-600" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Executions Tab */}
              <Button
                variant={activeTab === 'executions' ? 'default' : 'ghost'}
                size="default"
                className="flex items-center space-x-2"
                onClick={() => onTabChange('executions')}
              >
                <Play className="w-4 h-4" />
                <span>Executions</span>
                <Badge variant="outline" className="ml-1 text-xs">
                  {executions.length}
                </Badge>
              </Button>
            </div>

            {/* Mobile Navigation - Simplified */}
            <div className="flex sm:hidden items-center space-x-2">
              <Button
                variant={activeTab === 'forms' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onTabChange('forms')}
                className="px-2"
              >
                <FileText className="w-4 h-4" />
                <span className="sr-only">Forms</span>
              </Button>
              <Button
                variant={activeTab === 'workflows' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onTabChange('workflows')}
                className="px-2"
              >
                <GitBranch className="w-4 h-4" />
                <span className="sr-only">Workflows</span>
              </Button>
              <Button
                variant={activeTab === 'executions' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onTabChange('executions')}
                className="px-2"
              >
                <Play className="w-4 h-4" />
                <span className="sr-only">Executions</span>
              </Button>
            </div>
          </div>

          {/* Right: Quick Actions */}
          <div className="flex items-center space-x-2">
            {/* Mobile: Menu Button */}
            <div className="sm:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Toggle mobile menu
                  setShowFormsDropdown(!showFormsDropdown);
                  setShowWorkflowsDropdown(false);
                }}
                className="px-2"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>

            {/* Desktop: Quick Action Buttons */}
            <div className="hidden sm:flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsNewFormDialogOpen(true)}
                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                <Plus className="w-3 h-3 mr-1" />
                <span className="hidden md:inline">New Form</span>
                <span className="md:hidden">Form</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsNewWorkflowDialogOpen(true)}
                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
              >
                <Plus className="w-3 h-3 mr-1" />
                <span className="hidden md:inline">New Workflow</span>
                <span className="md:hidden">Flow</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {showFormsDropdown && (
          <div className="sm:hidden mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="space-y-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  setIsNewFormDialogOpen(true);
                  setShowFormsDropdown(false);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-3 h-3 mr-2" />
                New Form
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  setIsNewWorkflowDialogOpen(true);
                  setShowFormsDropdown(false);
                }}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-3 h-3 mr-2" />
                New Workflow
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* === NEW FORM DIALOG === */}
      <Dialog open={isNewFormDialogOpen} onOpenChange={setIsNewFormDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader className="">
            <DialogTitle className="flex items-center space-x-2 text-lg font-semibold">
              <Rocket className="w-5 h-5 text-blue-600" />
              <span>Create New Form</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="new-form-name" className="text-sm font-medium text-gray-700">
                Form Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="new-form-name"
                type="text"
                placeholder="e.g., Contact Form, Survey..."
                value={newFormName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFormName(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-form-description" className="text-sm font-medium text-gray-700">
                Description (Optional)
              </Label>
              <Input
                id="new-form-description"
                type="text"
                placeholder="Brief description..."
                value={newFormDescription}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFormDescription(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <Button 
                variant="outline" 
                size="default" 
                className="px-4" 
                onClick={() => setIsNewFormDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateForm}
                disabled={!newFormName.trim()}
                variant="default"
                size="default"
                className="bg-blue-600 hover:bg-blue-700 px-6"
              >
                <Rocket className="w-4 h-4 mr-2" />
                Create Form
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* === NEW WORKFLOW DIALOG === */}
      <Dialog open={isNewWorkflowDialogOpen} onOpenChange={setIsNewWorkflowDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader className="">
            <DialogTitle className="flex items-center space-x-2 text-lg font-semibold">
              <Rocket className="w-5 h-5 text-purple-600" />
              <span>Create New Workflow</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="new-workflow-name" className="text-sm font-medium text-gray-700">
                Workflow Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="new-workflow-name"
                type="text"
                placeholder="e.g., User Onboarding, Approval Process..."
                value={newWorkflowName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewWorkflowName(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-workflow-description" className="text-sm font-medium text-gray-700">
                Description (Optional)
              </Label>
              <Input
                id="new-workflow-description"
                type="text"
                placeholder="Brief description..."
                value={newWorkflowDescription}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewWorkflowDescription(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <Button 
                variant="outline" 
                size="default" 
                className="px-4" 
                onClick={() => setIsNewWorkflowDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateWorkflow}
                disabled={!newWorkflowName.trim()}
                variant="default"
                size="default"
                className="bg-purple-600 hover:bg-purple-700 px-6"
              >
                <Rocket className="w-4 h-4 mr-2" />
                Create Workflow
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* === EDIT FORM DIALOG === */}
      <Dialog open={isEditFormDialogOpen} onOpenChange={setIsEditFormDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader className="">
            <DialogTitle className="flex items-center space-x-2 text-lg font-semibold">
              <Edit className="w-5 h-5 text-yellow-600" />
              <span>Edit Form Details</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-form-name" className="text-sm font-medium text-gray-700">
                Form Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-form-name"
                type="text"
                placeholder="Enter form name..."
                value={editFormName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFormName(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-form-description" className="text-sm font-medium text-gray-700">
                Description (Optional)
              </Label>
              <Input
                id="edit-form-description"
                type="text"
                placeholder="Brief description..."
                value={editFormDescription}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFormDescription(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <Button 
                variant="outline" 
                size="default" 
                className="px-4" 
                onClick={() => setIsEditFormDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEditForm}
                disabled={!editFormName.trim()}
                variant="default"
                size="default"
                className="bg-yellow-600 hover:bg-yellow-700 px-6"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* === EDIT WORKFLOW DIALOG === */}
      <Dialog open={isEditWorkflowDialogOpen} onOpenChange={setIsEditWorkflowDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader className="">
            <DialogTitle className="flex items-center space-x-2 text-lg font-semibold">
              <Edit className="w-5 h-5 text-yellow-600" />
              <span>Edit Workflow Details</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-workflow-name" className="text-sm font-medium text-gray-700">
                Workflow Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-workflow-name"
                type="text"
                placeholder="Enter workflow name..."
                value={editWorkflowName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditWorkflowName(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-workflow-description" className="text-sm font-medium text-gray-700">
                Description (Optional)
              </Label>
              <Input
                id="edit-workflow-description"
                type="text"
                placeholder="Brief description..."
                value={editWorkflowDescription}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditWorkflowDescription(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <Button 
                variant="outline" 
                size="default" 
                className="px-4" 
                onClick={() => setIsEditWorkflowDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEditWorkflow}
                disabled={!editWorkflowName.trim()}
                variant="default"
                size="default"
                className="bg-yellow-600 hover:bg-yellow-700 px-6"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* === DELETE CONFIRMATION DIALOG === */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader className="">
            <DialogTitle className="flex items-center space-x-2 text-lg font-semibold text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span>Delete {deleteType === 'form' ? 'Form' : 'Workflow'}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="pt-4">
            <div className="mb-6">
              <p className="text-gray-700 mb-3">
                Are you sure you want to delete <strong>"{deleteItem?.name}"</strong>?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                  <div className="text-sm text-red-800">
                    <p className="font-medium mb-1">This action cannot be undone!</p>
                    <p>
                      The {deleteType} and all its {deleteType === 'form' ? 'fields' : 'nodes'} will be permanently deleted.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                size="default" 
                className="px-4" 
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={handleDeleteConfirm}
                variant="default"
                size="default"
                className="bg-red-600 hover:bg-red-700 text-white px-6"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete {deleteType === 'form' ? 'Form' : 'Workflow'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Click outside to close dropdowns */}
      {(showFormsDropdown || showWorkflowsDropdown) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowFormsDropdown(false);
            setShowWorkflowsDropdown(false);
          }}
        />
      )}
    </nav>
  );
}