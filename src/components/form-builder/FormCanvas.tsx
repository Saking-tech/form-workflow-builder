'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFormStore } from '@/stores/formStore';
import { FormComponent, FormElement } from '@/types';
import { createFormComponent, createFormElement } from '@/lib/formUtils';
import { 
  Plus, 
  GripVertical, 
  Settings, 
  Trash2, 
  Copy, 
  Eye,
  ChevronDown,
  ChevronRight,
  FileText,
  Layout,
  Grid3X3,
  FolderOpen,
  Layers
} from 'lucide-react';

interface FormCanvasProps {
  formId: string;
}

export function FormCanvas({ formId }: FormCanvasProps) {
  const { 
    currentForm, 
    addComponentToForm, 
    addElementToComponent,
    updateComponentInForm,
    removeComponentFromForm,
    updateElementInComponent,
    removeElementFromComponent
  } = useFormStore();

  const [expandedComponents, setExpandedComponents] = useState<Set<string>>(new Set());
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  if (!currentForm || currentForm.id !== formId) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Form Selected</h3>
          <p className="text-gray-500">Select a form from the list to start building</p>
        </div>
      </div>
    );
  }

  const toggleComponent = (componentId: string) => {
    const newExpanded = new Set(expandedComponents);
    if (newExpanded.has(componentId)) {
      newExpanded.delete(componentId);
    } else {
      newExpanded.add(componentId);
    }
    setExpandedComponents(newExpanded);
  };

  const handleAddComponent = () => {
    const newComponent = createFormComponent('section');
    addComponentToForm(formId, newComponent);
    setExpandedComponents(prev => new Set([...prev, newComponent.id]));
  };

  const handleAddElement = (componentId: string, element: FormElement) => {
    addElementToComponent(formId, componentId, element);
  };

  const handleDrop = (event: React.DragEvent, componentId: string) => {
    event.preventDefault();
    try {
      const elementData = JSON.parse(event.dataTransfer.getData('application/json'));
      handleAddElement(componentId, elementData);
    } catch (error) {
      console.error('Failed to parse dropped element:', error);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };

  const getComponentIcon = (type: string) => {
    switch (type) {
      case 'section':
        return <FileText className="w-4 h-4" />;
      case 'group':
        return <FolderOpen className="w-4 h-4" />;
      case 'grid':
        return <Grid3X3 className="w-4 h-4" />;
      case 'tabs':
        return <Layers className="w-4 h-4" />;
      case 'accordion':
        return <ChevronDown className="w-4 h-4" />;
      default:
        return <Layout className="w-4 h-4" />;
    }
  };

  const getElementIcon = (type: string) => {
    switch (type) {
      case 'short-text':
        return '📝';
      case 'long-text':
        return '📄';
      case 'number':
        return '🔢';
      case 'email':
        return '📧';
      case 'phone':
        return '📞';
      case 'date':
        return '📅';
      case 'dropdown':
        return '📋';
      case 'checkbox':
        return '☑️';
      case 'radio':
        return '🔘';
      case 'file-upload':
        return '📎';
      case 'signature':
        return '✍️';
      case 'heading':
        return '📌';
      case 'paragraph':
        return '📖';
      case 'divider':
        return '➖';
      default:
        return '📄';
    }
  };

  const getElementColor = (type: string) => {
    switch (type) {
      case 'short-text':
      case 'long-text':
      case 'number':
      case 'email':
      case 'phone':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'date':
      case 'dropdown':
      case 'checkbox':
      case 'radio':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'file-upload':
      case 'signature':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'heading':
      case 'paragraph':
      case 'divider':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{currentForm.name}</h2>
            {currentForm.description && (
              <p className="text-sm text-gray-600">{currentForm.description}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {currentForm.components.length} Components
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {currentForm.components.reduce((total, comp) => total + comp.elements.length, 0)} Elements
            </Badge>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-y-auto p-6">
        {currentForm.components.length === 0 ? (
          <div className="text-center py-12">
            <Layout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Components Yet</h3>
            <p className="text-gray-500 mb-6">Start building your form by adding components</p>
            <Button onClick={handleAddComponent} variant="default" size="default" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add First Component
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {currentForm.components.map((component, componentIndex) => (
              <Card key={component.id} className="border border-gray-200 shadow-sm">
                {/* Component Header */}
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        {getComponentIcon(component.type)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{component.title}</h3>
                        {component.description && (
                          <p className="text-sm text-gray-500">{component.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {component.elements.length} elements
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleComponent(component.id)}
                        className="h-6 w-6 p-0"
                      >
                        {expandedComponents.has(component.id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Component Elements */}
                {expandedComponents.has(component.id) && (
                  <div className="p-4 space-y-3">
                    {component.elements.length === 0 ? (
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-300 hover:bg-blue-50 transition-colors"
                        onDrop={(e) => handleDrop(e, component.id)}
                        onDragOver={handleDragOver}
                      >
                        <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Drop elements here or click to add</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {component.elements.map((element, elementIndex) => (
                          <div
                            key={element.id}
                            className={`p-3 rounded-lg border transition-all duration-200 ${
                              selectedElement === element.id
                                ? 'border-blue-300 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                            onClick={() => setSelectedElement(element.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg ${getElementColor(element.type)}`}>
                                  <span className="text-lg">{getElementIcon(element.type)}</span>
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900 text-sm">
                                    {element.label || `${element.type} field`}
                                  </h4>
                                  <p className="text-xs text-gray-500">
                                    {element.type} {element.required && '(Required)'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-blue-100"
                                  title="Edit element"
                                >
                                  <Settings className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-green-100"
                                  title="Duplicate element"
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-red-100"
                                  title="Delete element"
                                  onClick={(e: React.MouseEvent) => {
                                    e.stopPropagation();
                                    removeElementFromComponent(formId, component.id, element.id);
                                  }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Component Actions */}
                <div className="p-3 border-t border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          const newElement = createFormElement('short-text');
                          handleAddElement(component.id, newElement);
                        }}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Element
                      </Button>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs hover:bg-red-100 hover:text-red-700"
                        onClick={() => removeComponentFromForm(formId, component.id)}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Component Button */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <Button
          onClick={handleAddComponent}
          variant="default"
          size="default"
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Component
        </Button>
      </div>
    </div>
  );
}