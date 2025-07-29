'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
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
import { createFieldFromType, createNewForm } from '@/lib/formUtils';
import { Form, FormField } from '@/types';
import { 
  Plus, 
  FileText, 
  Search,
  Grid3X3,
  List,
  Eye,
  Edit,
  Copy,
  Trash2,
  X
} from 'lucide-react';

export function FormBuilder() {
  const { forms, currentForm, setCurrentForm, addForm, addFieldToForm, reorderFormFields, duplicateForm, deleteForm, updateForm } = useFormStore();
  const [newFormName, setNewFormName] = useState('');
  const [newFormDescription, setNewFormDescription] = useState('');
  const [isNewFormDialogOpen, setIsNewFormDialogOpen] = useState(false);
  const [isEditFormDialogOpen, setIsEditFormDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFormForAction, setSelectedFormForAction] = useState<Form | null>(null);
  const [editFormName, setEditFormName] = useState('');
  const [editFormDescription, setEditFormDescription] = useState('');
  const [activeField, setActiveField] = useState<FormField | null>(null);
  
  // Simplified state
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const draggedField = active.data.current as FormField;
    setActiveField(draggedField);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveField(null);

    if (over && active.id !== over.id && currentForm) {
      const oldIndex = currentForm.fields.findIndex(field => field.id === active.id);
      const newIndex = currentForm.fields.findIndex(field => field.id === over.id);
      
      reorderFormFields(currentForm.id, oldIndex, newIndex);
    }
  };

  const handleCreateForm = () => {
    if (newFormName.trim()) {
      const newForm = createNewForm(newFormName.trim(), newFormDescription.trim());
      addForm(newForm);
      setNewFormName('');
      setNewFormDescription('');
      setIsNewFormDialogOpen(false);
    }
  };

  const handleEditForm = () => {
    if (selectedFormForAction && editFormName.trim()) {
      updateForm(selectedFormForAction.id, {
        name: editFormName.trim(),
        description: editFormDescription.trim(),
        updatedAt: new Date(),
      });
      setIsEditFormDialogOpen(false);
      setSelectedFormForAction(null);
      setEditFormName('');
      setEditFormDescription('');
    }
  };

  const handleFormSelect = (form: Form) => {
    setCurrentForm(form);
  };

  const handleDuplicateForm = (formId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateForm(formId);
  };

  const handleDeleteForm = (formId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const form = forms.find(f => f.id === formId);
    if (form) {
      setSelectedFormForAction(form);
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDeleteForm = () => {
    if (selectedFormForAction) {
      deleteForm(selectedFormForAction.id);
      setIsDeleteDialogOpen(false);
      setSelectedFormForAction(null);
    }
  };

  const handleEditFormOpen = (form: Form, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFormForAction(form);
    setEditFormName(form.name);
    setEditFormDescription(form.description || '');
    setIsEditFormDialogOpen(true);
  };

  const handlePreviewForm = (form: Form, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFormForAction(form);
    setIsPreviewDialogOpen(true);
  };

  const handleCreateFromTemplate = (form: Form, e: React.MouseEvent) => {
    e.stopPropagation();
    const newForm = {
      ...form,
      id: `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${form.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    addForm(newForm);
  };

  const filteredForms = forms.filter(form =>
    form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full flex">
        {/* Left Panel: Form List */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Forms</h2>
              <Dialog open={isNewFormDialogOpen} onOpenChange={setIsNewFormDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-1" />
                    New
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
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search forms..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2 mt-3">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="flex-1"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="flex-1"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Form List */}
          <div className="flex-1 overflow-y-auto p-4">
            {filteredForms.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No forms yet</h3>
                <p className="text-gray-500 mb-4">Create your first form to get started</p>
                <Button onClick={() => setIsNewFormDialogOpen(true)} variant="default" size="default" className="">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Form
                </Button>
              </div>
            ) : (
              <div className={`grid gap-3 ${viewMode === 'grid' ? 'grid-cols-1' : 'grid-cols-1'}`}>
                {filteredForms.map((form) => (
                  <Card
                    key={form.id}
                    className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                      currentForm?.id === form.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleFormSelect(form)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 truncate">{form.name}</h3>
                        {form.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{form.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>{form.fields.length} fields</span>
                          <span>{new Date(form.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e: React.MouseEvent) => handlePreviewForm(form, e)}
                          className="h-6 w-6 p-0 hover:bg-blue-100"
                          title="Preview form"
                        >
                          <Eye className="w-3 h-3 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e: React.MouseEvent) => handleEditFormOpen(form, e)}
                          className="h-6 w-6 p-0 hover:bg-yellow-100"
                          title="Edit form"
                        >
                          <Edit className="w-3 h-3 text-yellow-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e: React.MouseEvent) => handleCreateFromTemplate(form, e)}
                          className="h-6 w-6 p-0 hover:bg-blue-100"
                          title="Duplicate form"
                        >
                          <Copy className="w-3 h-3 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e: React.MouseEvent) => handleDeleteForm(form.id, e)}
                          className="h-6 w-6 p-0 hover:bg-red-100"
                          title="Delete form"
                        >
                          <Trash2 className="w-3 h-3 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Form Builder */}
        <div className="flex-1 flex">
          {/* Field Palette */}
          <div className="w-64 bg-white border-r border-gray-200">
            <FieldPalette />
          </div>

          {/* Form Canvas */}
          <div className="flex-1 bg-gray-50">
            <FormCanvas formId={currentForm?.id || ''} />
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeField ? (
          <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium">{activeField.label}</span>
            </div>
          </div>
        ) : null}
      </DragOverlay>

      {/* Edit Form Dialog */}
      <Dialog open={isEditFormDialogOpen} onOpenChange={setIsEditFormDialogOpen}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-lg font-semibold">Edit Form</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-form-name" className="text-sm font-medium text-gray-700">
                Form Name
              </Label>
              <Input
                id="edit-form-name"
                type="text"
                value={editFormName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFormName(e.target.value)}
                placeholder="Enter form name..."
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
                value={editFormDescription}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFormDescription(e.target.value)}
                placeholder="Enter form description..."
                className="w-full"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" size="default" className="" onClick={() => setIsEditFormDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="default" size="default" className="" onClick={handleEditForm}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-lg font-semibold text-red-600">Delete Form</DialogTitle>
          </DialogHeader>
          <div className="pt-4">
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete <strong>"{selectedFormForAction?.name}"</strong>?
            </p>
            <p className="text-sm text-red-600 mb-4">This action cannot be undone.</p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" size="default" className="" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="default" size="default" className="bg-red-600 hover:bg-red-700" onClick={confirmDeleteForm}>
                Delete Form
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DndContext>
  );
}