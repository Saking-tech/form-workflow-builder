'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FieldPalette } from './FieldPalette';
import { FormCanvas } from './FormCanvas';
import { useFormStore } from '@/stores/formStore';
import { createNewForm } from '@/lib/formUtils';
import { 
  Plus, 
  FileText, 
  Settings, 
  Eye, 
  Trash2, 
  Copy,
  Calendar,
  Clock,
  Users,
  BarChart3
} from 'lucide-react';

export function FormBuilder() {
  const { 
    forms, 
    currentForm, 
    addForm, 
    setCurrentForm, 
    deleteForm, 
    duplicateForm 
  } = useFormStore();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newFormName, setNewFormName] = useState('');
  const [newFormDescription, setNewFormDescription] = useState('');

  const handleCreateForm = () => {
    if (newFormName.trim()) {
      const newForm = createNewForm(newFormName.trim(), newFormDescription.trim());
      addForm(newForm);
      setCurrentForm(newForm);
      setNewFormName('');
      setNewFormDescription('');
      setShowCreateDialog(false);
    }
  };

  const handleFormSelect = (form: any) => {
    setCurrentForm(form);
  };

  const handleDeleteForm = (formId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this form?')) {
      deleteForm(formId);
      if (currentForm?.id === formId) {
        setCurrentForm(null);
      }
    }
  };

  const handleDuplicateForm = (formId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateForm(formId);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="h-full flex">
      {/* Left Sidebar - Form List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Forms</h2>
              <p className="text-sm text-gray-600">{forms.length} forms created</p>
            </div>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button variant="default" size="default" className="w-full bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create New Form
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader className="space-y-2">
                <DialogTitle className="flex items-center space-x-2 text-lg font-semibold">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>Create New Form</span>
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  Create a new form with a unique name and description.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="form-name" className="text-sm font-medium">Form Name</Label>
                  <Input
                    id="form-name"
                    type="text"
                    value={newFormName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFormName(e.target.value)}
                    placeholder="Enter form name..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="form-description" className="text-sm font-medium">Description (Optional)</Label>
                  <Input
                    id="form-description"
                    type="text"
                    value={newFormDescription}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFormDescription(e.target.value)}
                    placeholder="Enter form description..."
                    className="mt-1"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    size="default"
                    onClick={() => setShowCreateDialog(false)}
                    className=""
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateForm}
                    disabled={!newFormName.trim()}
                    variant="default"
                    size="default"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Create Form
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Form List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {forms.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-gray-900 mb-1">No Forms Yet</h3>
              <p className="text-xs text-gray-500">Create your first form to get started</p>
            </div>
          ) : (
            forms.map((form) => (
              <Card
                key={form.id}
                className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  currentForm?.id === form.id
                    ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200'
                    : 'hover:border-gray-300'
                }`}
                onClick={() => handleFormSelect(form)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{form.name}</h3>
                    {form.description && (
                      <p className="text-sm text-gray-500 truncate mt-1">{form.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <BarChart3 className="w-3 h-3" />
                        <span>{form.components.length} components</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{form.components.reduce((total, comp) => total + comp.elements.length, 0)} elements</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-2 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>Updated {formatDate(form.updatedAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-blue-100"
                      title="Duplicate form"
                      onClick={(e: React.MouseEvent) => handleDuplicateForm(form.id, e)}
                    >
                      <Copy className="w-3 h-3 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-red-100"
                      title="Delete form"
                      onClick={(e: React.MouseEvent) => handleDeleteForm(form.id, e)}
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {currentForm ? (
          <>
            {/* Field Palette */}
            <div className="w-80 border-r border-gray-200">
              <FieldPalette />
            </div>
            
            {/* Form Canvas */}
            <div className="flex-1">
              <FormCanvas formId={currentForm.id} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Form Selected</h3>
              <p className="text-gray-500 mb-6">Select a form from the list or create a new one</p>
              <Button
                onClick={() => setShowCreateDialog(true)}
                variant="default"
                size="default"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Form
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}