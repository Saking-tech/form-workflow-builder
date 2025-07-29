'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFormStore } from '@/stores/formStore';
import { FormField } from '@/types';
import { 
  GripVertical, 
  Edit, 
  Trash2, 
  Type, 
  List, 
  Calendar, 
  Paperclip,
  Eye,
  Settings,
  Sparkles,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { getFieldIcon } from '@/lib/formUtils';

interface SortableFormFieldProps {
  field: FormField;
  formId: string;
  onEdit: () => void;
}

export function SortableFormField({ field, formId, onEdit }: SortableFormFieldProps) {
  const { removeFieldFromForm } = useFormStore();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  const handleDelete = () => {
    removeFieldFromForm(formId, field.id);
  };

  const renderFieldPreview = () => {
    const baseInputStyles = "w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 transition-all duration-200 hover:border-gray-400";
    
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
            disabled
            className={baseInputStyles}
          />
        );
      
      case 'select':
        return (
          <div className="relative">
            <select
              disabled
              className={`${baseInputStyles} appearance-none cursor-not-allowed`}
            >
              <option>
                {field.options && field.options.length > 0 
                  ? `Choose ${field.label.toLowerCase()}...` 
                  : 'Add options in field settings'}
              </option>
              {field.options?.map((option, index) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <List className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        );
      
      case 'date':
        return (
          <div className="relative">
            <input
              type="date"
              disabled
              className={`${baseInputStyles} cursor-not-allowed`}
            />
            <Calendar className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        );
      
      case 'file':
        return (
          <div className="relative">
            <div className={`${baseInputStyles} flex items-center justify-between cursor-not-allowed`}>
              <span>Choose file...</span>
              <Paperclip className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const getFieldTypeColor = (type: string) => {
    switch (type) {
      case 'text': return 'from-blue-500 to-blue-600';
      case 'select': return 'from-green-500 to-green-600';
      case 'date': return 'from-purple-500 to-purple-600';
      case 'file': return 'from-orange-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <Type className="w-4 h-4" />;
      case 'select': return <List className="w-4 h-4" />;
      case 'date': return <Calendar className="w-4 h-4" />;
      case 'file': return <Paperclip className="w-4 h-4" />;
      default: return <Type className="w-4 h-4" />;
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="group">
      <Card className={`
        p-5 bg-white border-2 transition-all duration-300 hover:shadow-xl hover:border-blue-300 hover:-translate-y-1
        ${isDragging ? 'shadow-2xl border-blue-400 bg-blue-50 rotate-2' : 'border-gray-200 shadow-md'}
        ${isDragging ? 'scale-105' : 'hover:scale-[1.02]'}
      `}>
        <div className="flex items-start space-x-4">
          {/* Enhanced Drag Handle */}
          <div
            {...listeners}
            {...attributes}
            className="cursor-grab active:cursor-grabbing pt-1 opacity-50 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
          >
            <div className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <GripVertical className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            </div>
          </div>

          {/* Field Content */}
          <div className="flex-1 min-w-0">
            {/* Enhanced Field Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {/* Field Type Badge */}
                <div className={`p-2 rounded-lg bg-gradient-to-r ${getFieldTypeColor(field.type)} text-white shadow-lg transform hover:scale-110 transition-all duration-200`}>
                  {getFieldTypeIcon(field.type)}
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800 text-lg flex items-center space-x-2">
                    <span>{field.label}</span>
                    {field.required && (
                      <span className="text-red-500 text-sm animate-pulse">*</span>
                    )}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge 
                      variant={field.required ? "destructive" : "secondary"}
                      className={`text-xs transition-all duration-200 hover:scale-105 ${
                        field.required 
                          ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {field.required ? (
                        <><CheckCircle className="w-3 h-3 mr-1" />Required</>
                      ) : (
                        <><XCircle className="w-3 h-3 mr-1" />Optional</>
                      )}
                    </Badge>
                    <Badge variant="outline" className="text-xs capitalize bg-white hover:bg-gray-50 transition-colors duration-200">
                      {field.type} field
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEdit}
                  className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all duration-200 hover:scale-110 hover:shadow-md"
                  title="Edit field"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-200 hover:scale-110 hover:shadow-md"
                  title="Delete field"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Field Preview */}
            <div className="space-y-3">
              <div className="transition-all duration-200 hover:scale-[1.01]">
                {renderFieldPreview()}
              </div>
              
              {/* Field Configuration Summary */}
              <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                <div className="flex items-center space-x-4">
                  {field.validation?.minLength && (
                    <span className="flex items-center space-x-1">
                      <span>Min: {field.validation.minLength}</span>
                    </span>
                  )}
                  {field.validation?.maxLength && (
                    <span className="flex items-center space-x-1">
                      <span>Max: {field.validation.maxLength}</span>
                    </span>
                  )}
                  {field.options && field.options.length > 0 && (
                    <span className="flex items-center space-x-1">
                      <List className="w-3 h-3" />
                      <span>{field.options.length} options</span>
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-1 text-blue-600">
                  <Eye className="w-3 h-3" />
                  <span>Preview mode</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hover Effects Overlay */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400/5 to-purple-400/5 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />
        
        {/* Drag Indicator */}
        {isDragging && (
          <div className="absolute -top-2 -left-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-ping" />
            <div className="absolute top-0 left-0 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-2 h-2 text-white" />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}