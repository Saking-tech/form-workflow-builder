'use client';

import React, { useState } from 'react';
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
  Plus,
  Sparkles
} from 'lucide-react';

type NavigationTab = 'forms' | 'workflows' | 'executions';

interface NavigationProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const { forms, addForm } = useFormStore();
  const { workflows, executions, addWorkflow } = useWorkflowStore();
  
  // Dialog states
  const [isNewFormDialogOpen, setIsNewFormDialogOpen] = useState(false);
  const [isNewWorkflowDialogOpen, setIsNewWorkflowDialogOpen] = useState(false);
  
  // Form states
  const [newFormName, setNewFormName] = useState('');
  const [newFormDescription, setNewFormDescription] = useState('');
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowDescription, setNewWorkflowDescription] = useState('');

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

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Brand and Navigation */}
          <div className="flex items-center space-x-8">
            {/* Brand */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Form Builder Studio</h1>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center space-x-1">
              <Button
                variant={activeTab === 'forms' ? 'default' : 'ghost'}
                size="default"
                className="flex items-center space-x-2"
                onClick={() => onTabChange('forms')}
              >
                <FileText className="w-4 h-4" />
                <span>Forms</span>
                <Badge variant="outline" className="ml-1 text-xs">
                  {forms.length}
                </Badge>
              </Button>

              <Button
                variant={activeTab === 'workflows' ? 'default' : 'ghost'}
                size="default"
                className="flex items-center space-x-2"
                onClick={() => onTabChange('workflows')}
              >
                <GitBranch className="w-4 h-4" />
                <span>Workflows</span>
                <Badge variant="outline" className="ml-1 text-xs">
                  {workflows.length}
                </Badge>
              </Button>

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
          </div>

          {/* Right: Quick Actions */}
          <div className="flex items-center space-x-3">
            {activeTab === 'forms' && (
              <Dialog open={isNewFormDialogOpen} onOpenChange={setIsNewFormDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="default" size="default" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    New Form
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md mx-4">
                  <DialogHeader className="space-y-2">
                    <DialogTitle className="text-lg font-semibold">Create New Form</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="form-name" className="text-sm font-medium text-gray-700">
                        Form Name
                      </Label>
                      <Input
                        id="form-name"
                        type="text"
                        value={newFormName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFormName(e.target.value)}
                        placeholder="Enter form name..."
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="form-description" className="text-sm font-medium text-gray-700">
                        Description (Optional)
                      </Label>
                      <Input
                        id="form-description"
                        type="text"
                        value={newFormDescription}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFormDescription(e.target.value)}
                        placeholder="Enter form description..."
                        className="w-full"
                      />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button variant="outline" size="default" className="" onClick={() => setIsNewFormDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button variant="default" size="default" className="" onClick={handleCreateForm}>
                        Create Form
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {activeTab === 'workflows' && (
              <Dialog open={isNewWorkflowDialogOpen} onOpenChange={setIsNewWorkflowDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="default" size="default" className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    New Workflow
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md mx-4">
                  <DialogHeader className="space-y-2">
                    <DialogTitle className="text-lg font-semibold">Create New Workflow</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="workflow-name" className="text-sm font-medium text-gray-700">
                        Workflow Name
                      </Label>
                      <Input
                        id="workflow-name"
                        type="text"
                        value={newWorkflowName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewWorkflowName(e.target.value)}
                        placeholder="Enter workflow name..."
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="workflow-description" className="text-sm font-medium text-gray-700">
                        Description (Optional)
                      </Label>
                      <Input
                        id="workflow-description"
                        type="text"
                        value={newWorkflowDescription}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewWorkflowDescription(e.target.value)}
                        placeholder="Enter workflow description..."
                        className="w-full"
                      />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button variant="outline" size="default" className="" onClick={() => setIsNewWorkflowDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button variant="default" size="default" className="" onClick={handleCreateWorkflow}>
                        Create Workflow
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}