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
  Zap, 
  Star, 
  Sparkles, 
  Rocket,
  Settings,
  Copy,
  Trash2,
  Edit,
  Calendar,
  Users,
  BarChart3,
  Layout,
  Palette,
  Eye,
  Save,
  AlertTriangle,
  X,
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
  Grid3X3,
  List,
  Maximize2,
  Minimize2
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
  
  // Enhanced state for better UX
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const formsSectionRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Enhanced scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (formsSectionRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = formsSectionRef.current;
        setShowScrollButtons(scrollHeight > clientHeight + 100);
      }
    };

    const formsSection = formsSectionRef.current;
    if (formsSection) {
      formsSection.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial check
    }

    return () => {
      if (formsSection) {
        formsSection.removeEventListener('scroll', handleScroll);
      }
    };
  }, [forms]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    
    if (typeof active.id === 'string' && ['text', 'select', 'date', 'file'].includes(active.id)) {
      const fieldType = active.id as 'text' | 'select' | 'date' | 'file';
      const newField = createFieldFromType(fieldType);
      setActiveField(newField);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveField(null);
    const { active, over } = event;

    if (!over || !currentForm) return;

    if (over.id === 'form-canvas') {
      if (typeof active.id === 'string' && ['text', 'select', 'date', 'file'].includes(active.id)) {
        const fieldType = active.id as 'text' | 'select' | 'date' | 'file';
        const newField = createFieldFromType(fieldType);
        addFieldToForm(currentForm.id, newField);
      }
    } else if (active.id !== over.id) {
      const oldIndex = currentForm.fields.findIndex(field => field.id === active.id);
      const newIndex = currentForm.fields.findIndex(field => field.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        reorderFormFields(currentForm.id, oldIndex, newIndex);
      }
    }
  };

  const handleCreateForm = () => {
    if (newFormName.trim()) {
      const newForm = createNewForm(newFormName.trim(), newFormDescription.trim());
      addForm(newForm);
      setCurrentForm(newForm);
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
        updatedAt: new Date()
      });
      setEditFormName('');
      setEditFormDescription('');
      setIsEditFormDialogOpen(false);
      setSelectedFormForAction(null);
    }
  };

  const handleFormSelect = (form: Form) => {
    setCurrentForm(form);
  };

  const handleDuplicateForm = (formId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const formToDuplicate = forms.find(f => f.id === formId);
    if (formToDuplicate) {
      const duplicatedForm = {
        ...formToDuplicate,
        id: `form-${Date.now()}`,
        name: `${formToDuplicate.name} (Copy)`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      addForm(duplicatedForm);
    }
  };

  const handleDeleteForm = (formId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const formToDelete = forms.find(f => f.id === formId);
    if (formToDelete) {
      setSelectedFormForAction(formToDelete);
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDeleteForm = () => {
    if (selectedFormForAction) {
      deleteForm(selectedFormForAction.id);
      if (currentForm?.id === selectedFormForAction.id) {
        setCurrentForm(null);
      }
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
    const duplicatedForm = {
      ...form,
      id: `form-${Date.now()}`,
      name: `${form.name} (Template)`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    addForm(duplicatedForm);
  };

  // Enhanced scroll functions
  const scrollToTop = () => {
    formsSectionRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const scrollToBottom = () => {
    if (formsSectionRef.current) {
      formsSectionRef.current.scrollTo({
        top: formsSectionRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // Filter forms based on search
  const filteredForms = forms.filter(form =>
    form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`h-screen flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      {/* === ENHANCED HEADER SECTION === */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm">
        <div className="p-4 sm:p-6">
          {/* Top Row: Title & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-4 sm:space-y-0">
            {/* Left: Title & Breadcrumb */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Form Builder Studio</h1>
                  <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Create professional forms with drag & drop</p>
                </div>
              </div>
              
              {currentForm && (
                <div className="flex items-center space-x-2 ml-2 sm:ml-6 pl-2 sm:pl-6 border-l border-gray-200">
                  <span className="text-xs sm:text-sm text-gray-500 hidden sm:inline">Active:</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">{currentForm.name}</span>
                    <span className="sm:hidden">Active</span>
                  </Badge>
                </div>
              )}
            </div>

            {/* Right: Actions & Stats */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* View Mode Toggle - Hidden on mobile */}
              <div className="hidden sm:flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 px-3"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 px-3"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              {/* Fullscreen Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="h-8 px-2 sm:px-3"
                title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>

              {/* Stats Badge - Hidden on mobile */}
              <div className="hidden sm:flex items-center space-x-3">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1.5">
                  <BarChart3 className="w-3 h-3 mr-1.5" />
                  {forms.length} Forms Created
                </Badge>
              </div>
              
              {/* Create New Form Button */}
              <Dialog open={isNewFormDialogOpen} onOpenChange={setIsNewFormDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="default" 
                    size="default" 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200 px-3 sm:px-6 text-sm sm:text-base"
                  >
                    <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">New Form</span>
                    <span className="sm:hidden">New</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md mx-4">
                  <DialogHeader className="space-y-2">
                    <DialogTitle className="flex items-center space-x-2 text-lg font-semibold">
                      <Rocket className="w-5 h-5 text-blue-600" />
                      <span>Create New Form</span>
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                      Create a new form with a unique name and description.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="form-name" className="text-sm font-medium text-gray-700">
                        Form Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="form-name"
                        type="text"
                        placeholder="e.g., Contact Form, Registration, Survey..."
                        value={newFormName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFormName(e.target.value)}
                        onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && handleCreateForm()}
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
                        placeholder="Brief description of the form's purpose..."
                        value={newFormDescription}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFormDescription(e.target.value)}
                        onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && handleCreateForm()}
                        className="w-full"
                      />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        variant="outline"
                        size="default"
                        onClick={() => setIsNewFormDialogOpen(false)}
                        className="px-4"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateForm}
                        disabled={!newFormName.trim()}
                        variant="default"
                        size="default"
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6"
                      >
                        <Rocket className="w-4 h-4 mr-2" />
                        Create Form
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Search Bar - Mobile: Full width, Desktop: Inline */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search forms..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 w-full"
              />
            </div>
            
            {/* Mobile: Quick Stats */}
            <div className="flex sm:hidden items-center justify-between">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {forms.length} Forms
              </Badge>
              <div className="flex items-center space-x-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 px-2"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 px-2"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* === ENHANCED MAIN CONTENT SECTION === */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {currentForm ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {/* Left Sidebar: Field Palette - Hidden on mobile, shown on desktop */}
            <aside className="hidden lg:flex flex-shrink-0 w-80 bg-white border-r border-gray-200 overflow-y-auto">
              <FieldPalette />
            </aside>

            {/* Main Canvas Area */}
            <section className="flex-1 flex flex-col overflow-hidden">
              <FormCanvas formId={currentForm.id} />
            </section>

            {/* Mobile Field Palette - Bottom Sheet */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Add Fields</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Toggle mobile palette visibility
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {/* Mobile-optimized field buttons */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex flex-col items-center p-2 h-auto text-xs"
                  >
                    <span className="text-lg mb-1">📝</span>
                    <span>Text</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex flex-col items-center p-2 h-auto text-xs"
                  >
                    <span className="text-lg mb-1">📋</span>
                    <span>Select</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex flex-col items-center p-2 h-auto text-xs"
                  >
                    <span className="text-lg mb-1">📅</span>
                    <span>Date</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex flex-col items-center p-2 h-auto text-xs"
                  >
                    <span className="text-lg mb-1">📎</span>
                    <span>File</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Drag Overlay */}
            <DragOverlay>
              {activeField ? (
                <div className="bg-white p-3 rounded-lg shadow-xl border-2 border-blue-400 transform rotate-2 scale-105">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">
                      {activeField.type === 'text' ? '📝' : 
                       activeField.type === 'select' ? '📋' : 
                       activeField.type === 'date' ? '📅' : '📎'}
                    </span>
                    <span className="font-medium text-gray-700 text-sm">
                      {activeField.label}
                    </span>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          /* Enhanced Welcome/Empty State */
          <section className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 overflow-y-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto py-8 sm:py-12">
              {/* Welcome Icon */}
              <div className="mb-6 sm:mb-8">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                  <Palette className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                </div>
              </div>

              {/* Welcome Content */}
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                    Welcome to Form Builder Studio
                  </h2>
                  <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
                    Create professional, responsive forms with our intuitive drag-and-drop interface. 
                    Perfect for surveys, applications, contact forms, and more.
                  </p>
                </div>

                {/* CTA Button */}
                <div className="pt-4 sm:pt-6">
                  <Button 
                    variant="default"
                    size="default"
                    onClick={() => setIsNewFormDialogOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 text-base sm:text-lg px-6 sm:px-10 py-3 sm:py-4 h-auto w-full sm:w-auto"
                  >
                    <Rocket className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                    Create Your First Form
                  </Button>
                </div>

                {/* Enhanced Feature Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-8 sm:pt-12 max-w-2xl mx-auto">
                  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                    <div className="text-blue-600 mb-3">
                      <Layout className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 text-sm sm:text-base mb-2">Drag & Drop</div>
                      <p className="text-xs sm:text-sm text-gray-600">Intuitive interface for easy form building</p>
                    </div>
                  </div>
                  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                    <div className="text-green-600 mb-3">
                      <Zap className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 text-sm sm:text-base mb-2">Real-time Preview</div>
                      <p className="text-xs sm:text-sm text-gray-600">See changes instantly as you build</p>
                    </div>
                  </div>
                  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                    <div className="text-purple-600 mb-3">
                      <Settings className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 text-sm sm:text-base mb-2">Customizable</div>
                      <p className="text-xs sm:text-sm text-gray-600">Tailor forms to your specific needs</p>
                    </div>
                  </div>
                  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                    <div className="text-orange-600 mb-3">
                      <Star className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 text-sm sm:text-base mb-2">Professional</div>
                      <p className="text-xs sm:text-sm text-gray-600">Create polished, production-ready forms</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* === SCROLL NAVIGATION BUTTONS === */}
      {showScrollButtons && (
        <div className="fixed right-6 bottom-6 flex flex-col space-y-2 z-40">
          <Button
            variant="outline"
            size="sm"
            onClick={scrollToTop}
            className="w-10 h-10 p-0 bg-white shadow-lg hover:shadow-xl border-gray-300 hover:border-blue-400 rounded-full"
            title="Scroll to top"
          >
            <ArrowUp className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={scrollToBottom}
            className="w-10 h-10 p-0 bg-white shadow-lg hover:shadow-xl border-gray-300 hover:border-blue-400 rounded-full"
            title="Scroll to bottom"
          >
            <ArrowDown className="w-4 h-4" />
          </Button>
        </div>
      )}

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
                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 px-6"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* === PREVIEW FORM DIALOG === */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader className="">
            <DialogTitle className="flex items-center space-x-2 text-lg font-semibold">
              <Eye className="w-5 h-5 text-green-600" />
              <span>Form Preview: {selectedFormForAction?.name}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="pt-4">
            {selectedFormForAction && (
              <div className="space-y-4">
                {/* Form Info */}
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">{selectedFormForAction.name}</h3>
                  {selectedFormForAction.description && (
                    <p className="text-sm text-gray-600 mb-3">{selectedFormForAction.description}</p>
                  )}
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{selectedFormForAction.fields.length} fields</span>
                    <span>Created: {new Date(selectedFormForAction.createdAt).toLocaleDateString()}</span>
                    {selectedFormForAction.updatedAt && (
                      <span>Updated: {new Date(selectedFormForAction.updatedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                {/* Form Fields Preview */}
                <div className="space-y-3">
                  {selectedFormForAction.fields.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>This form has no fields yet.</p>
                    </div>
                  ) : (
                    selectedFormForAction.fields.map((field, index) => (
                      <div key={field.id} className="bg-white p-4 border rounded-lg">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{field.label}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">{field.type}</Badge>
                              {field.required && (
                                <Badge variant="destructive" className="text-xs">Required</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Field Preview */}
                        <div className="ml-9">
                          {field.type === 'text' && (
                            <input
                              type="text"
                              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                              disabled
                              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                            />
                          )}
                          {field.type === 'select' && (
                            <select disabled className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                              <option>Choose {field.label.toLowerCase()}...</option>
                              {field.options?.map((option, idx) => (
                                <option key={idx} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                          )}
                          {field.type === 'date' && (
                            <input
                              type="date"
                              disabled
                              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                            />
                          )}
                          {field.type === 'file' && (
                            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                              Choose file...
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* === DELETE CONFIRMATION DIALOG === */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader className="">
            <DialogTitle className="flex items-center space-x-2 text-lg font-semibold text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span>Delete Form</span>
            </DialogTitle>
          </DialogHeader>
          <div className="pt-4">
            <div className="mb-6">
              <p className="text-gray-700 mb-3">
                Are you sure you want to delete <strong>"{selectedFormForAction?.name}"</strong>?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                  <div className="text-sm text-red-800">
                    <p className="font-medium mb-1">This action cannot be undone!</p>
                    <p>The form and all its {selectedFormForAction?.fields.length || 0} fields will be permanently deleted.</p>
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
                onClick={confirmDeleteForm}
                variant="default"
                size="default"
                className="bg-red-600 hover:bg-red-700 text-white px-6"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Form
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}