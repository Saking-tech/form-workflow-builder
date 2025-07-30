'use client';

import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { useFormStore } from '@/stores/formStore';
import { FormField } from '@/types';
import { generateId } from '@/lib/utils';
import { Trash2, GripVertical } from 'lucide-react';

interface FormFieldRendererProps {
  field: FormField;
  onUpdate: (updates: Partial<FormField>) => void;
  onDelete: () => void;
}

function FormFieldRenderer({ field, onUpdate, onDelete }: FormFieldRendererProps) {
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
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-gray-200 rounded-lg p-4 mb-4 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <button {...attributes} {...listeners} className="cursor-grab">
            <GripVertical className="h-4 w-4 text-gray-400" />
          </button>
          <span className="text-sm font-medium text-gray-700">{field.label}</span>
        </div>
        <button
          onClick={onDelete}
          className="text-red-500 hover:text-red-700 p-1"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Field Label
          </label>
          <input
            type="text"
            value={field.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Placeholder
          </label>
          <input
            type="text"
            value={field.placeholder || ''}
            onChange={(e) => onUpdate({ placeholder: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) => onUpdate({ required: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Required</span>
          </label>
        </div>

        {field.type === 'select' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Options (one per line)
            </label>
            <textarea
              value={field.options?.map(opt => opt.label).join('\n') || ''}
              onChange={(e) => {
                const options = e.target.value.split('\n').filter(Boolean).map(label => ({
                  label,
                  value: label.toLowerCase().replace(/\s+/g, '_')
                }));
                onUpdate({ options });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              rows={3}
            />
          </div>
        )}

        <div className="flex space-x-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Length
            </label>
            <input
              type="number"
              value={field.validation?.minLength || ''}
              onChange={(e) => onUpdate({ 
                validation: { 
                  ...field.validation, 
                  minLength: e.target.value ? parseInt(e.target.value) : undefined 
                } 
              })}
              className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Length
            </label>
            <input
              type="number"
              value={field.validation?.maxLength || ''}
              onChange={(e) => onUpdate({ 
                validation: { 
                  ...field.validation, 
                  maxLength: e.target.value ? parseInt(e.target.value) : undefined 
                } 
              })}
              className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface FormCanvasProps {
  formId: string;
}

export default function FormCanvas({ formId }: FormCanvasProps) {
  const { forms, addFieldToSection, updateFieldInSection, removeFieldFromSection } = useFormStore();
  const form = forms.find(f => f.id === formId);
  const [isOver, setIsOver] = useState(false);

  const { setNodeRef } = useDroppable({
    id: 'form-canvas',
  });

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (over && over.id === 'form-canvas' && active.data?.current?.type) {
      const fieldType = active.data.current.type;
      const newField: FormField = {
        id: generateId(),
        type: fieldType,
        label: `New ${fieldType} field`,
        placeholder: `Enter ${fieldType}...`,
        required: false,
        order: 0
      };
      
      // Add to the first section if it exists, otherwise we need to handle this differently
      if (form && form.sections.length > 0) {
        addFieldToSection(formId, form.sections[0].id, newField);
      }
    }
    setIsOver(false);
  };

  if (!form) {
    return <div className="p-6 text-center text-gray-500">Form not found</div>;
  }

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{form.name}</h2>
        <p className="text-gray-600">{form.description}</p>
      </div>

      <div
        ref={setNodeRef}
        className={`min-h-[400px] p-6 border-2 border-dashed rounded-lg transition-colors ${
          isOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 bg-gray-50'
        }`}
        onDrop={handleDragEnd}
      >
        {form.sections.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p className="text-lg mb-2">Drag fields here to build your form</p>
            <p className="text-sm">Start by dragging field types from the left panel</p>
          </div>
        ) : (
          <div className="space-y-6">
            {form.sections.map((section) => (
              <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{section.title}</h3>
                {section.subtitle && (
                  <p className="text-sm text-gray-600 mb-4">{section.subtitle}</p>
                )}
                <div className="space-y-4">
                  {section.fields.map((field) => (
                    <FormFieldRenderer
                      key={field.id}
                      field={field}
                      onUpdate={(updates) => updateFieldInSection(formId, section.id, field.id, updates)}
                      onDelete={() => removeFieldFromSection(formId, section.id, field.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}