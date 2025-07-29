'use client';

import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fieldTypes, getFieldTypesByCategory } from '@/lib/formUtils';
import { FieldType } from '@/types';
import { Sparkles, Zap, GripVertical, MousePointer2, Hand, Palette, Layers, Info, Building2, FileText, Scale, Briefcase } from 'lucide-react';

interface DraggableFieldTypeProps {
  fieldType: FieldType;
  index: number;
}

function DraggableFieldType({ fieldType, index }: DraggableFieldTypeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: fieldType.type,
    data: {
      type: fieldType.type,
      label: fieldType.label,
    },
  });

  const style = {
    animationDelay: `${index * 100}ms`,
    ...CSS.Transform.toString(transform) ? { transform: CSS.Transform.toString(transform) } : {},
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  const getFieldTypeColor = (category: string) => {
    switch (category) {
      case 'basic': return 'from-blue-500 to-blue-600';
      case 'advanced': return 'from-green-500 to-green-600';
      case 'media': return 'from-orange-500 to-orange-600';
      case 'layout': return 'from-purple-500 to-purple-600';
      case 'business': return 'from-indigo-500 to-indigo-600';
      case 'legal': return 'from-red-500 to-red-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getFieldDescription = (type: string) => {
    switch (type) {
      case 'text': return 'Single line text input for names, emails, etc.';
      case 'select': return 'Dropdown menu with multiple choice options';
      case 'date': return 'Date picker for scheduling and timestamps';
      case 'file': return 'File upload for documents and media';
      case 'company-info': return 'Complete company information section';
      case 'contact-info': return 'Contact person details section';
      case 'address': return 'Full address input fields';
      case 'terms': return 'Legal terms and conditions section';
      case 'agreement-type': return 'Agreement type selection';
      default: return 'Form field component';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="cursor-move transition-transform duration-200 hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className={`
        p-4 transition-all duration-200 bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300
        ${isDragging ? 'shadow-xl border-blue-400 bg-blue-50 rotate-2 scale-105' : ''}
        relative overflow-hidden group
      `}>
        {/* Drag Indicator */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <GripVertical className="w-3 h-3 text-gray-400" />
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Field Type Icon */}
          <div className={`
            p-2.5 rounded-lg bg-gradient-to-r ${getFieldTypeColor(fieldType.category)} text-white shadow-sm
            transition-transform duration-200 ${isHovered ? 'scale-110' : 'scale-100'}
          `}>
            <span className="text-lg font-semibold">
              {fieldType.icon}
            </span>
          </div>
          
          {/* Field Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-medium text-gray-900 text-sm">
                {fieldType.label}
              </h4>
              <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200">
                {fieldType.category}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              {fieldType.description}
            </p>
          </div>
        </div>

        {/* Dragging Visual Effect */}
        {isDragging && (
          <div className="absolute -top-1 -right-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping" />
            <div className="absolute top-0 right-0 w-3 h-3 bg-blue-600 rounded-full" />
          </div>
        )}
      </Card>
    </div>
  );
}

export function FieldPalette() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  const categories = [
    { id: 'all', label: 'All Fields', icon: Palette },
    { id: 'basic', label: 'Basic', icon: MousePointer2 },
    { id: 'advanced', label: 'Advanced', icon: Zap },
    { id: 'business', label: 'Business', icon: Building2 },
    { id: 'legal', label: 'Legal', icon: Scale },
    { id: 'media', label: 'Media', icon: FileText },
    { id: 'layout', label: 'Layout', icon: Layers },
  ];

  const filteredFields = activeCategory === 'all' 
    ? fieldTypes 
    : getFieldTypesByCategory(activeCategory as any);

  return (
    <aside className="w-80 flex flex-col h-full bg-white border-r border-gray-200 shadow-sm">
      {/* === PALETTE HEADER === */}
      <header className="flex-shrink-0 bg-gray-50 border-b border-gray-200">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-sm">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Field Palette</h2>
              <p className="text-xs text-gray-600">Drag fields to build your form</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1 text-gray-600">
              <Layers className="w-3 h-3" />
              <span>{fieldTypes.length} Field Types</span>
            </div>
            <Badge variant="outline" className="bg-white text-gray-600 border-gray-300 text-xs">
              v2.1
            </Badge>
          </div>
        </div>
      </header>

      {/* === CATEGORY FILTERS === */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white">
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Briefcase className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-700">Categories</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    activeCategory === category.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-3 h-3 inline mr-1" />
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* === FIELD TYPES SECTION === */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <MousePointer2 className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                {activeCategory === 'all' ? 'Available Fields' : `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Fields`}
              </h3>
            </div>
            <Badge variant="outline" className="text-xs">
              {filteredFields.length} fields
            </Badge>
          </div>
          
          {/* Field Types List */}
          <div className="space-y-3">
            {filteredFields.map((fieldType, index) => (
              <DraggableFieldType key={fieldType.type} fieldType={fieldType} index={index} />
            ))}
          </div>
          
          {/* Component Types Section */}
          <div className="mt-8">
            <div className="flex items-center space-x-2 mb-4">
              <Layers className="w-4 h-4 text-purple-500" />
              <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                Layout Components
              </h3>
            </div>
            
            <div className="space-y-3">
              <div
                draggable
                onDragStart={(e) => {
                  const componentData = {
                    type: 'row',
                    title: 'Field Row',
                    description: 'Add fields side by side',
                    settings: {
                      layout: 'side-by-side',
                      fieldSpacing: 'compact',
                      responsive: true,
                    },
                  };
                  e.dataTransfer.setData('application/json', JSON.stringify(componentData));
                }}
                className="cursor-move transition-transform duration-200 hover:scale-105"
              >
                <Card className="p-4 transition-all duration-200 bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 relative overflow-hidden group">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-sm">
                      <span className="text-lg">📐</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm">Field Row</h4>
                      <p className="text-xs text-gray-500">Side-by-side field layout</p>
                    </div>
                  </div>
                </Card>
              </div>
              
              <div
                draggable
                onDragStart={(e) => {
                  const componentData = {
                    type: 'section',
                    title: 'New Section',
                    description: 'Add a description for this section',
                    settings: {
                      layout: 'vertical',
                      fieldSpacing: 'normal',
                      responsive: true,
                    },
                  };
                  e.dataTransfer.setData('application/json', JSON.stringify(componentData));
                }}
                className="cursor-move transition-transform duration-200 hover:scale-105"
              >
                <Card className="p-4 transition-all duration-200 bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 relative overflow-hidden group">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm">
                      <span className="text-lg">📋</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm">Section</h4>
                      <p className="text-xs text-gray-500">Vertical field layout</p>
                    </div>
                  </div>
                </Card>
              </div>

              <div
                draggable
                onDragStart={(e) => {
                  const componentData = {
                    type: 'part',
                    title: 'Part 1',
                    description: 'First part of the form',
                    settings: {
                      layout: 'vertical',
                      fieldSpacing: 'normal',
                      responsive: true,
                      isPart: true,
                      partNumber: 1,
                      autoSave: true,
                    },
                  };
                  e.dataTransfer.setData('application/json', JSON.stringify(componentData));
                }}
                className="cursor-move transition-transform duration-200 hover:scale-105"
              >
                <Card className="p-4 transition-all duration-200 bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 relative overflow-hidden group">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm">
                      <span className="text-lg">📄</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm">Form Part</h4>
                      <p className="text-xs text-gray-500">Multi-part form section</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* === PALETTE FOOTER === */}
      <footer className="flex-shrink-0 border-t border-gray-200 bg-gray-50">
        <div className="p-6 space-y-4">
          {/* Usage Instructions */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              <Info className="w-4 h-4 mr-2 text-blue-500" />
              How to Use
            </h4>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
                <span>Drag any field type to the form canvas</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5"></div>
                <span>Use business fields for vendor agreements</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5"></div>
                <span>Legal fields for terms and conditions</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5"></div>
                <span>Create multi-part forms with Form Parts</span>
              </div>
            </div>
          </div>
        
          {/* Feature Highlights */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
              <Sparkles className="w-4 h-4 mr-2" />
              New Features
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
              <div className="flex items-center space-x-1">
                <Building2 className="w-3 h-3" />
                <span>Business Fields</span>
              </div>
              <div className="flex items-center space-x-1">
                <Scale className="w-3 h-3" />
                <span>Legal Fields</span>
              </div>
              <div className="flex items-center space-x-1">
                <FileText className="w-3 h-3" />
                <span>Multi-Part Forms</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="w-3 h-3" />
                <span>Auto-Fill</span>
              </div>
            </div>
          </div>

          {/* Version Info */}
          <div className="text-center">
            <div className="text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded-lg inline-flex items-center space-x-2">
              <Zap className="w-3 h-3" />
              <span>Form Builder Studio v2.1</span>
            </div>
          </div>
        </div>
      </footer>
    </aside>
  );
}