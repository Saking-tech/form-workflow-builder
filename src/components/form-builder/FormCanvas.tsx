'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFormStore } from '@/stores/formStore';
import { SortableFormField } from './SortableFormField';
import { FieldEditor } from './FieldEditor';
import { 
  Plus, 
  Settings, 
  ArrowDown, 
  ArrowUp, 
  ChevronDown, 
  Type, 
  List, 
  Calendar, 
  Paperclip, 
  Sparkles, 
  Zap, 
  BarChart3, 
  Activity, 
  Target,
  Maximize2,
  Minimize2,
  RotateCcw,
  Save,
  Eye,
  Download,
  Share2,
  FileText
} from 'lucide-react';
import { FIELD_TYPES, createFieldFromType } from '@/lib/formUtils';

interface FormCanvasProps {
  formId: string;
}

export function FormCanvas({ formId }: FormCanvasProps) {
  const { forms, addFieldToForm } = useFormStore();
  const [editingField, setEditingField] = useState<any>(null);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const form = forms.find(f => f.id === formId);
  const fields = form?.fields || [];

  const { setNodeRef, isOver } = useDroppable({
    id: 'form-canvas',
  });

  // Zoom functions
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleZoomReset = () => {
    setZoomLevel(1);
  };

  const handleWheel = (event: React.WheelEvent) => {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      const delta = event.deltaY > 0 ? -0.1 : 0.1;
      setZoomLevel(prev => Math.max(0.5, Math.min(2, prev + delta)));
    }
  };

  useEffect(() => {
    setShowScrollButtons(fields.length > 8);
  }, [fields.length]);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        setShowScrollButtons(scrollHeight > clientHeight + 100);
      }
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial check
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [fields]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
        setShowAddMenu(false);
      }
    };

    if (showAddMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAddMenu]);

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const scrollToBottom = () => {
    scrollContainerRef.current?.scrollTo({
      top: scrollContainerRef.current.scrollHeight,
      behavior: 'smooth'
    });
  };

  const handleCanvasClick = (event: React.MouseEvent) => {
    if (fields.length === 0) {
      const rect = event.currentTarget.getBoundingClientRect();
      setMenuPosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      });
      setShowAddMenu(true);
    }
  };

  const handleAddField = (fieldType: string) => {
    setIsAnimating(true);
    const newField = createFieldFromType(fieldType as any);
    addFieldToForm(formId, newField);
    setShowAddMenu(false);
    
    setTimeout(() => setIsAnimating(false), 600);
  };

  const getFieldTypeStats = () => {
    const stats = {
      text: 0,
      select: 0,
      date: 0,
      file: 0,
      required: 0
    };

    fields.forEach(field => {
      stats[field.type as keyof typeof stats]++;
      if (field.required) stats.required++;
    });

    return stats;
  };

  const stats = getFieldTypeStats();

  if (!form) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500">No form selected</p>
          <p className="text-sm text-gray-400 mt-1">
            Create a new form to start building
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      {/* === ENHANCED HEADER SECTION === */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          {/* Left: Form Info & Actions */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{form.name}</h2>
                {form.description && (
                  <p className="text-sm text-gray-500">{form.description}</p>
                )}
              </div>
            </div>
            
            {/* Form Status Badge */}
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Activity className="w-3 h-3 mr-1" />
              Active Form
            </Badge>
          </div>

          {/* Right: Quick Actions */}
          <div className="flex items-center space-x-2">
            {/* Quick Actions Dropdown */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="h-8 px-3"
              >
                <Settings className="w-4 h-4 mr-1" />
                Actions
              </Button>
              
              {showQuickActions && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[160px] z-10">
                  <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span>Preview Form</span>
                  </button>
                  <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Export Form</span>
                  </button>
                  <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2">
                    <Share2 className="w-4 h-4" />
                    <span>Share Form</span>
                  </button>
                  <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>Save Draft</span>
                  </button>
                </div>
              )}
            </div>

            {/* Fullscreen Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-8 px-3"
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>

            {/* Zoom Controls */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.5}
                className="h-6 w-6 p-0"
                title="Zoom out"
              >
                <Minimize2 className="w-3 h-3" />
              </Button>
              <span className="text-xs text-gray-600 px-2 min-w-[40px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 2}
                className="h-6 w-6 p-0"
                title="Zoom in"
              >
                <Maximize2 className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomReset}
                className="h-6 w-6 p-0"
                title="Reset zoom"
              >
                <RotateCcw className="w-3 h-3" />
              </Button>
            </div>

            {/* Form Settings */}
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3"
            >
              <Settings className="w-4 h-4 mr-1" />
              <span>Form Settings</span>
            </Button>
          </div>
        </div>

        {/* Enhanced Form Statistics Bar */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mt-4">
          <div className="flex items-center justify-between">
            {/* Left: Field Count & Progress */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {fields.length} Fields
                  </div>
                  <div className="text-xs text-gray-500">
                    {fields.length === 0 && 'Empty form - add your first field'}
                    {fields.length > 0 && fields.length <= 3 && 'Getting started'}
                    {fields.length > 3 && fields.length <= 8 && 'Good progress'}
                    {fields.length > 8 && fields.length <= 15 && 'Comprehensive form'}
                    {fields.length > 15 && 'Complex form'}
                  </div>
                </div>
              </div>

              {/* Progress Indicator */}
              {fields.length > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out"
                      style={{ 
                        width: `${Math.min((fields.length / 20) * 100, 100)}%`
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    {Math.min(Math.round((fields.length / 20) * 100), 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* Right: Field Type Breakdown */}
            {fields.length > 0 && (
              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center space-x-1 text-blue-600">
                  <Type className="w-3 h-3" />
                  <span>Text: {stats.text}</span>
                </div>
                <div className="flex items-center space-x-1 text-green-600">
                  <List className="w-3 h-3" />
                  <span>Select: {stats.select}</span>
                </div>
                <div className="flex items-center space-x-1 text-purple-600">
                  <Calendar className="w-3 h-3" />
                  <span>Date: {stats.date}</span>
                </div>
                <div className="flex items-center space-x-1 text-orange-600">
                  <Paperclip className="w-3 h-3" />
                  <span>File: {stats.file}</span>
                </div>
                <div className="w-px h-4 bg-gray-300"></div>
                <div className="flex items-center space-x-1 text-red-600 font-medium">
                  <Target className="w-3 h-3" />
                  <span>Required: {stats.required}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* === ENHANCED FORM CANVAS SECTION === */}
      <main className="flex-1 bg-gray-50 overflow-hidden">
        <div className="h-full p-6">
          <div
            ref={(node) => {
              setNodeRef(node);
              if (scrollContainerRef.current !== node) {
                scrollContainerRef.current = node;
              }
            }}
            onClick={handleCanvasClick}
            onWheel={handleWheel}
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top left',
              transition: 'transform 0.1s ease-out'
            }}
            className={`
              h-full bg-white rounded-lg border-2 border-dashed transition-all duration-300 shadow-sm relative
              ${isOver 
                ? 'border-blue-400 bg-blue-50 shadow-lg' 
                : 'border-gray-300 hover:border-gray-400'
              }
              ${fields.length === 0 
                ? 'flex items-center justify-center cursor-pointer hover:bg-gray-50' 
                : 'overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'
              }
              ${isAnimating ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
            `}
          >
            {fields.length === 0 ? (
              /* Enhanced Empty State */
              <div className="text-center p-12 max-w-md mx-auto">
                <div className="mb-8">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-10 h-10 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Start Building Your Form
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Create your form using two simple methods:
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-4 text-sm text-gray-600 justify-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Drag field types from the left sidebar</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 justify-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span><strong>Click here</strong> for instant field menu</span>
                  </div>
                </div>

                <div className="inline-flex items-center px-6 py-3 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Click anywhere to add your first field
                </div>
              </div>
            ) : (
              /* Enhanced Fields List */
              <div className="p-6 space-y-6">
                <SortableContext 
                  items={fields.map(f => f.id)} 
                  strategy={verticalListSortingStrategy}
                >
                  {fields.map((field, index) => (
                    <div key={field.id} className="relative">
                      {/* Enhanced Field Number Badge */}
                      <div className="absolute -left-14 top-6 z-10">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-lg">
                          {index + 1}
                        </div>
                      </div>
                      <SortableFormField
                        field={field}
                        formId={formId}
                        onEdit={() => setEditingField(field)}
                      />
                    </div>
                  ))}
                </SortableContext>
                
                {/* Enhanced Add More Fields Section */}
                <div 
                  className="mt-8 p-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border-2 border-dashed border-gray-300 text-center transition-all duration-200 hover:border-blue-400 hover:from-blue-50 hover:to-indigo-50 cursor-pointer group"
                  onClick={handleCanvasClick}
                >
                  <Plus className="w-10 h-10 text-gray-400 mx-auto mb-4 group-hover:text-blue-500 transition-colors duration-200" />
                  <h4 className="font-semibold text-gray-700 mb-2 group-hover:text-blue-700 text-lg">
                    Add More Fields
                  </h4>
                  <p className="text-sm text-gray-500 group-hover:text-blue-600 max-w-md mx-auto">
                    Click here or drag from sidebar • Unlimited fields supported • Advanced validation available
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* === ENHANCED CLICK-TO-ADD DROPDOWN MENU === */}
      {showAddMenu && (
        <div 
          ref={addMenuRef}
          className="fixed z-50 bg-white rounded-xl shadow-2xl border border-gray-200 py-3 min-w-[280px] animate-in fade-in slide-in-from-top-2 duration-200"
          style={{
            left: `${menuPosition.x}px`,
            top: `${menuPosition.y}px`,
          }}
        >
          <div className="px-4 py-3 border-b border-gray-100">
            <h4 className="text-sm font-semibold text-gray-900 flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-blue-500" />
              Add Form Field
            </h4>
            <p className="text-xs text-gray-500 mt-1">Choose a field type to add to your form</p>
          </div>
          
          {FIELD_TYPES.map((fieldType, index) => (
            <button
              key={fieldType.type}
              onClick={() => handleAddField(fieldType.type)}
              className="w-full px-4 py-4 text-left hover:bg-gray-50 transition-colors duration-150 flex items-center space-x-4 group border-b border-gray-50 last:border-b-0"
            >
              <span className="text-2xl">
                {fieldType.icon}
              </span>
              <div className="flex-1">
                <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">
                  {fieldType.label}
                </span>
                <p className="text-xs text-gray-500 group-hover:text-blue-600 mt-1">
                  {fieldType.type === 'text' && 'Single line text input field with validation'}
                  {fieldType.type === 'select' && 'Dropdown with multiple options and custom values'}
                  {fieldType.type === 'date' && 'Date picker field with calendar interface'}
                  {fieldType.type === 'file' && 'File upload field with size and type restrictions'}
                </p>
              </div>
            </button>
          ))}
          
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              💡 Configure field settings after adding • Drag & drop also available
            </p>
          </div>
        </div>
      )}

      {/* === ENHANCED SCROLL NAVIGATION BUTTONS === */}
      {showScrollButtons && (
        <div className="absolute right-6 bottom-6 flex flex-col space-y-3 z-40">
          <Button
            variant="outline"
            size="sm"
            onClick={scrollToTop}
            className="w-12 h-12 p-0 bg-white shadow-lg hover:shadow-xl border-gray-300 hover:border-blue-400 rounded-full"
            title="Scroll to top"
          >
            <ArrowUp className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={scrollToBottom}
            className="w-12 h-12 p-0 bg-white shadow-lg hover:shadow-xl border-gray-300 hover:border-blue-400 rounded-full"
            title="Scroll to bottom"
          >
            <ArrowDown className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* === FIELD EDITOR DIALOG === */}
      {editingField && (
        <FieldEditor
          field={editingField}
          formId={formId}
          isOpen={!!editingField}
          onClose={() => setEditingField(null)}
        />
      )}
    </div>
  );
}