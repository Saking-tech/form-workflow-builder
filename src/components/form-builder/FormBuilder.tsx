'use client';

import { useState } from 'react';
import { useFormStore } from '@/stores/formStore';
import { Form, FormSection, FormField } from '@/types';
import { FIELD_TYPES } from '@/lib/formTemplates';
import { generateId } from '@/lib/utils';
import { 
  DndContext, 
  DragEndEvent, 
  useSensors, 
  useSensor, 
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  DragOverlay,
  DragStartEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, GripVertical, Trash2, Settings, Edit2, Eye, Save, X, Check } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';

interface FormBuilderProps {
  form: Form;
  onFormChange: (form: Form) => void;
}

export default function FormBuilder({ form, onFormChange }: FormBuilderProps) {
  const { updateForm, addSectionToForm, addFieldToSection, removeSectionFromForm, removeFieldFromSection, reorderFieldsInSection } = useFormStore();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [draggedField, setDraggedField] = useState<typeof FIELD_TYPES[0] | null>(null);
  const [editingField, setEditingField] = useState<{ sectionId: string; fieldId: string } | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === 'field-type') {
      setDraggedField(active.data.current.fieldType);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedField(null);
    
    if (!over) return;

    // Handle field type drop (from palette to section or drop zone)
    if (active.data.current?.type === 'field-type') {
      const fieldType = active.data.current.fieldType;
      let sectionId = over.id as string;
      
      // Check if dropped on a section drop zone
      if (over.data.current?.type === 'section-drop-zone') {
        sectionId = over.data.current.sectionId;
      }
      
      // Check if the drop target is a section
      const targetSection = form.sections.find(section => section.id === sectionId);
      
      if (targetSection) {
        const newField: FormField = {
          id: generateId(),
          type: fieldType.type,
          label: fieldType.label,
          placeholder: `Enter ${fieldType.label.toLowerCase()}`,
          required: false,
          validation: fieldType.defaultValidation,
          order: targetSection.fields.length
        };
        
        addFieldToSection(form.id, sectionId, newField);
        
        // Update the form in the parent component
        const updatedForm = {
          ...form,
          sections: form.sections.map(section =>
            section.id === sectionId
              ? { ...section, fields: [...section.fields, newField] }
              : section
          )
        };
        onFormChange(updatedForm);
      }
    }

    // Handle field reordering within section
    if (active.data.current?.type === 'field' && over.data.current?.type === 'field') {
      const activeFieldId = active.id as string;
      const overFieldId = over.id as string;
      const sectionId = active.data.current.sectionId;
      
      if (activeFieldId !== overFieldId) {
        const section = form.sections.find(s => s.id === sectionId);
        if (section) {
          const oldIndex = section.fields.findIndex(f => f.id === activeFieldId);
          const newIndex = section.fields.findIndex(f => f.id === overFieldId);
          
          const reorderedFields = [...section.fields];
          const [movedField] = reorderedFields.splice(oldIndex, 1);
          reorderedFields.splice(newIndex, 0, movedField);
          
          // Update field orders
          const updatedFields = reorderedFields.map((field, index) => ({
            ...field,
            order: index
          }));
          
          const updatedForm = {
            ...form,
            sections: form.sections.map(section =>
              section.id === sectionId
                ? { ...section, fields: updatedFields }
                : section
            )
          };
          onFormChange(updatedForm);
        }
      }
    }
  };

  const addNewSection = () => {
    const newSection: FormSection = {
      id: generateId(),
      title: 'New Section',
      fields: [],
      order: form.sections.length
    };
    addSectionToForm(form.id, newSection);
    
    // Update the form in the parent component
    const updatedForm = {
      ...form,
      sections: [...form.sections, newSection]
    };
    onFormChange(updatedForm);
  };

  const updateSectionTitle = (sectionId: string, title: string) => {
    const updatedForm = {
      ...form,
      sections: form.sections.map(section =>
        section.id === sectionId ? { ...section, title } : section
      )
    };
    onFormChange(updatedForm);
  };

  const deleteSection = (sectionId: string) => {
    removeSectionFromForm(form.id, sectionId);
    const updatedForm = {
      ...form,
      sections: form.sections.filter(section => section.id !== sectionId)
    };
    onFormChange(updatedForm);
  };

  const deleteField = (sectionId: string, fieldId: string) => {
    removeFieldFromSection(form.id, sectionId, fieldId);
    const updatedForm = {
      ...form,
      sections: form.sections.map(section =>
        section.id === sectionId
          ? { ...section, fields: section.fields.filter(field => field.id !== fieldId) }
          : section
      )
    };
    onFormChange(updatedForm);
  };

  const updateField = (sectionId: string, fieldId: string, updates: Partial<FormField>) => {
    const updatedForm = {
      ...form,
      sections: form.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              fields: section.fields.map(field =>
                field.id === fieldId ? { ...field, ...updates } : field
              )
            }
          : section
      )
    };
    onFormChange(updatedForm);
  };



  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full">
        {/* Field Palette */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Form Fields</h3>
          <p className="text-sm text-gray-600 mb-4">Drag fields to add them to sections</p>
          


          {/* All Field Types */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">All Field Types</h4>
            <div className="space-y-2">
              {FIELD_TYPES.map((fieldType) => (
                <DraggableFieldType key={fieldType.type} fieldType={fieldType} />
              ))}
            </div>
          </div>
        </div>

        {/* Form Canvas */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Form Builder</h2>
                <p className="text-sm text-gray-600">Build your form by adding sections and fields</p>
              </div>
              <button
                onClick={addNewSection}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Section
              </button>
            </div>

            <SortableContext
              items={form.sections.map(s => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {form.sections.map((section) => (
                                 <SortableSection
                   key={section.id}
                   section={section}
                   formId={form.id}
                   isActive={activeSection === section.id}
                   onActivate={() => setActiveSection(section.id)}
                   onTitleChange={(title) => updateSectionTitle(section.id, title)}
                   onDelete={() => deleteSection(section.id)}
                   onDeleteField={(fieldId) => deleteField(section.id, fieldId)}
                   onUpdateField={(fieldId, updates) => updateField(section.id, fieldId, updates)}
                   editingField={editingField}
                   setEditingField={setEditingField}
                 />
              ))}
            </SortableContext>

            {form.sections.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No sections yet</h3>
                <p className="text-gray-600 mb-4">Start building your form by adding sections</p>
                <button
                  onClick={addNewSection}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add First Section
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <DragOverlay>
        {draggedField ? (
          <div className="p-3 bg-white border border-blue-200 rounded-md shadow-lg">
            <div className="flex items-center">
              <span className="text-lg mr-2">{draggedField.icon}</span>
              <span className="text-sm font-medium text-gray-700">{draggedField.label}</span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// Draggable Field Type Component
function DraggableFieldType({ fieldType }: { fieldType: typeof FIELD_TYPES[0] }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: fieldType.type,
    data: {
      type: 'field-type',
      fieldType
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-3 bg-white border border-gray-200 rounded-md cursor-move hover:border-blue-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-center">
        <span className="text-lg mr-2">{fieldType.icon}</span>
        <span className="text-sm font-medium text-gray-700">{fieldType.label}</span>
      </div>
    </div>
  );
}

// Sortable Section Component
function SortableSection({ 
  section, 
  formId, 
  isActive, 
  onActivate, 
  onTitleChange,
  onDelete, 
  onDeleteField,
  onUpdateField,
  editingField,
  setEditingField
}: { 
  section: FormSection;
  formId: string;
  isActive: boolean;
  onActivate: () => void;
  onTitleChange: (title: string) => void;
  onDelete: () => void;
  onDeleteField: (fieldId: string) => void;
  onUpdateField: (fieldId: string, updates: Partial<FormField>) => void;
  editingField: { sectionId: string; fieldId: string } | null;
  setEditingField: (field: { sectionId: string; fieldId: string } | null) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: section.id,
    data: {
      type: 'section',
      section
    }
  });

  const [editingSectionTitle, setEditingSectionTitle] = useState(false);
  const [sectionTitle, setSectionTitle] = useState(section.title);

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const handleTitleEdit = () => {
    setEditingSectionTitle(true);
  };

  const handleTitleSave = () => {
    onTitleChange(sectionTitle);
    setEditingSectionTitle(false);
  };

  const handleTitleCancel = () => {
    setSectionTitle(section.title);
    setEditingSectionTitle(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white border border-gray-200 rounded-lg p-6 transition-all ${
        isActive ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
      }`}
      data-droppable="true"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <GripVertical className="w-4 h-4 text-gray-500" />
          {editingSectionTitle ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
                className="text-lg font-semibold text-gray-900 border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleTitleSave();
                  } else if (e.key === 'Escape') {
                    handleTitleCancel();
                  }
                }}
              />
              <button
                onClick={handleTitleSave}
                className="p-1 text-green-600 hover:text-green-700"
                title="Save title"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={handleTitleCancel}
                className="p-1 text-red-600 hover:text-red-700"
                title="Cancel editing"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <h3 
              className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
              onClick={handleTitleEdit}
              title="Click to edit section title"
            >
              {section.title}
            </h3>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleTitleEdit}
            className={`p-2 rounded-md transition-colors ${
              isActive 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Edit section title"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onActivate}
            className={`p-2 rounded-md transition-colors ${
              isActive 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Edit section"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button 
            onClick={onDelete}
            className="p-2 rounded-md bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
            title="Delete section"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {section.subtitle && (
        <p className="text-sm text-gray-600 mb-4">{section.subtitle}</p>
      )}

      

      <SortableContext
        items={section.fields.map(f => f.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {section.fields.map((field) => (
            <SortableField
              key={field.id}
              field={field}
              sectionId={section.id}
              onDelete={() => onDeleteField(field.id)}
              onUpdate={(updates) => onUpdateField(field.id, updates)}
              editingField={editingField}
              setEditingField={setEditingField}
            />
          ))}
          
                               {section.fields.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">No fields in this section</p>
              <p className="text-xs text-gray-500">Drag fields from the left panel to add them here</p>
            </div>
          )}
        </div>
      </SortableContext>

      {/* Drop zone at the bottom of each section */}
      <SectionDropZone sectionId={section.id} />
    </div>
  );
}

// Section Drop Zone Component
function SectionDropZone({ sectionId }: { sectionId: string }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `drop-zone-${sectionId}`,
    data: {
      type: 'section-drop-zone',
      sectionId
    }
  });

  return (
    <div 
      ref={setNodeRef}
      className={`mt-4 p-4 border-2 border-dashed rounded-lg transition-colors group ${
        isOver 
          ? 'border-blue-400 bg-blue-100' 
          : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
      }`}
    >
      <div className={`flex items-center justify-center space-x-2 transition-colors ${
        isOver 
          ? 'text-blue-600' 
          : 'text-gray-400 group-hover:text-blue-500'
      }`}>
        <Plus className="w-5 h-5" />
        <span className="text-sm font-medium">
          {isOver ? 'Drop here to add field' : 'Drop fields here to add to this section'}
        </span>
      </div>
    </div>
  );
}

// Sortable Field Component
function SortableField({
  field,
  sectionId,
  onDelete,
  onUpdate,
  editingField,
  setEditingField
}: {
  field: FormField;
  sectionId: string;
  onDelete: () => void;
  onUpdate: (updates: Partial<FormField>) => void;
  editingField: { sectionId: string; fieldId: string } | null;
  setEditingField: (field: { sectionId: string; fieldId: string } | null) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: field.id,
    data: {
      type: 'field',
      field,
      sectionId
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const isEditing = editingField?.sectionId === sectionId && editingField?.fieldId === field.id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-4 border border-gray-200 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
    >
      {isEditing ? (
        <FieldEditor
          field={field}
          onSave={(updates) => {
            onUpdate(updates);
            setEditingField(null);
          }}
          onCancel={() => setEditingField(null)}
        />
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex-1">
                         <div className="flex items-center space-x-2">
               <GripVertical className="w-3 h-3 text-gray-500" />
               <label className="block text-sm font-medium text-gray-700">
                 {field.label}
                 {field.required && <span className="text-red-500 ml-1">*</span>}
               </label>
               <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                 {field.type}
               </span>
             </div>
            {field.placeholder && (
              <p className="text-xs text-gray-500 mt-1">{field.placeholder}</p>
            )}
          </div>
                     <div className="flex items-center space-x-2">
             <button
               onClick={() => setEditingField({ sectionId, fieldId: field.id })}
               className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
               title="Edit field"
             >
               <Edit2 className="w-3 h-3" />
             </button>
             <button
               onClick={onDelete}
               className="p-1 text-red-500 hover:text-red-700 transition-colors"
               title="Delete field"
             >
               <Trash2 className="w-3 h-3" />
             </button>
           </div>
        </div>
      )}
      
      {field.options && field.options.length > 0 && !isEditing && (
        <div className="mt-2">
          <p className="text-xs text-gray-500">Options:</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {field.options.map((option, index) => (
              <span key={index} className="text-xs text-gray-700 bg-gray-200 px-2 py-1 rounded">
                {option.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Field Editor Component
function FieldEditor({
  field,
  onSave,
  onCancel
}: {
  field: FormField;
  onSave: (updates: Partial<FormField>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    label: field.label,
    placeholder: field.placeholder || '',
    required: field.required,
    options: field.options || []
  });

  const [newOption, setNewOption] = useState({ label: '', value: '' });

  const handleSave = () => {
    onSave({
      label: formData.label,
      placeholder: formData.placeholder,
      required: formData.required,
      options: formData.options
    });
  };

  const addOption = () => {
    if (newOption.label && newOption.value) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, { ...newOption }]
      }));
      setNewOption({ label: '', value: '' });
    }
  };

  const removeOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                     <input
             type="text"
             value={formData.label}
             onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
           />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Placeholder</label>
                     <input
             type="text"
             value={formData.placeholder}
             onChange={(e) => setFormData(prev => ({ ...prev, placeholder: e.target.value }))}
             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
           />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="required"
          checked={formData.required}
          onChange={(e) => setFormData(prev => ({ ...prev, required: e.target.checked }))}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="required" className="text-sm font-medium text-gray-700">Required field</label>
      </div>

      {(field.type === 'dropdown' || field.type === 'radio' || field.type === 'checkbox') && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Options</label>
          <div className="space-y-2">
            {formData.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                                 <input
                   type="text"
                   value={option.label}
                   onChange={(e) => {
                     const newOptions = [...formData.options];
                     newOptions[index].label = e.target.value;
                     setFormData(prev => ({ ...prev, options: newOptions }));
                   }}
                   className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                   placeholder="Option label"
                 />
                 <input
                   type="text"
                   value={option.value}
                   onChange={(e) => {
                     const newOptions = [...formData.options];
                     newOptions[index].value = e.target.value;
                     setFormData(prev => ({ ...prev, options: newOptions }));
                   }}
                   className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                   placeholder="Option value"
                 />
                <button
                  onClick={() => removeOption(index)}
                  className="p-2 text-red-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <div className="flex items-center space-x-2">
                             <input
                 type="text"
                 value={newOption.label}
                 onChange={(e) => setNewOption(prev => ({ ...prev, label: e.target.value }))}
                 className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                 placeholder="New option label"
               />
               <input
                 type="text"
                 value={newOption.value}
                 onChange={(e) => setNewOption(prev => ({ ...prev, value: e.target.value }))}
                 className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                 placeholder="New option value"
               />
              <button
                onClick={addOption}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end space-x-2">
        <button
          onClick={onCancel}
          className="px-3 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <X className="w-4 h-4" />
        </button>
        <button
          onClick={handleSave}
          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Check className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}