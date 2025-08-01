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
import { Plus, GripVertical, Trash2, Settings, Edit2, X, Check, ChevronDown, ChevronRight, Save } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';

interface FormBuilderProps {
  form: Form;
  onFormChange: (form: Form) => void;
  onSaveAsTemplate?: (templateName: string, templateDescription: string) => void;
}

export default function FormBuilder({ form, onFormChange, onSaveAsTemplate }: FormBuilderProps) {
  const { addSectionToForm, addFieldToSection, removeSectionFromForm, removeFieldFromSection } = useFormStore();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [draggedField, setDraggedField] = useState<typeof FIELD_TYPES[0] | null>(null);
  const [editingField, setEditingField] = useState<{ sectionId: string; fieldId: string } | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [showFieldEditModal, setShowFieldEditModal] = useState(false);
  const [fieldEditData, setFieldEditData] = useState({
    label: '',
    placeholder: '',
    required: false,
    size: '1x1' as '1x1' | '1x2' | '1x3',
    options: [] as { label: string; value: string }[]
  });

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
          size: fieldType.defaultSize || '1x1',
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

  const toggleSectionCollapse = (sectionId: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
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

  const handleFieldEdit = (field: FormField) => {
    setFieldEditData({
      label: field.label,
      placeholder: field.placeholder || '',
      required: field.required,
      size: field.size,
      options: field.options || []
    });
    
    // Find the section that contains this field
    const section = form.sections.find(section => 
      section.fields.some(f => f.id === field.id)
    );
    
    if (section) {
      setEditingField({ sectionId: section.id, fieldId: field.id });
      setShowFieldEditModal(true);
    }
  };

  const handleFieldSave = (data: {
    label: string;
    placeholder: string;
    required: boolean;
    size: '1x1' | '1x2' | '1x3';
    options: { label: string; value: string }[];
  }) => {
    if (editingField) {
      updateField(editingField.sectionId, editingField.fieldId, {
        label: data.label,
        placeholder: data.placeholder,
        required: data.required,
        size: data.size,
        options: data.options
      });
      setShowFieldEditModal(false);
      setEditingField(null);
    }
  };

  const handleFieldCancel = () => {
    setShowFieldEditModal(false);
    setEditingField(null);
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
          <h3 className="font-semibold text-xl text-gray-900 mb-4">Form Fields</h3>
          <p className="text-sm text-gray-400 mb-4">Drag fields to add them to sections</p>
          


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
              <div className="flex items-center space-x-2">
                <button
                  onClick={addNewSection}
                  className="flex items-center px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-xl hover:bg-blue-800 hover:shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Section
                </button>
                {onSaveAsTemplate && (
                  <button
                    onClick={() => onSaveAsTemplate('New Template', 'A new form template')}
                    className="flex items-center px-3 py-2 bg-green-600 text-white rounded-xl hover:bg-green-800 hover:shadow-lg transition-all"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save as Template
                  </button>
                )}
              </div>
            </div>

            <SortableContext
              items={form.sections.map(s => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {form.sections.map((section) => (
                <SortableSection
                  key={section.id}
                  section={section}
                  isActive={activeSection === section.id}
                  onActivate={() => setActiveSection(section.id)}
                  onTitleChange={(title) => updateSectionTitle(section.id, title)}
                  onDelete={() => deleteSection(section.id)}
                  onDeleteField={(fieldId) => deleteField(section.id, fieldId)}
                  isCollapsed={collapsedSections.has(section.id)}
                  onToggleCollapse={() => toggleSectionCollapse(section.id)}
                  onFieldEdit={handleFieldEdit}
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
          <DraggableFieldType fieldType={draggedField} />
        ) : null}
      </DragOverlay>

      {/* Field Edit Modal */}
      {showFieldEditModal && editingField && (
        <FieldEditModal
          fieldData={fieldEditData}
          onSave={handleFieldSave}
          onCancel={handleFieldCancel}
          onClose={() => setShowFieldEditModal(false)}
        />
      )}
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
      className="p-3 bg-gradient-to-r from-blue-200 to-indigo-200 border border-blue-200 rounded-xl cursor-move hover:border-blue-800 hover:bg-blue-600"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {/* <span className="text-lg mr-2">{fieldType.icon}</span> */}
          <span className="text-sm font-medium text-gray-700">{fieldType.label}</span>
        </div>
        {/* <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
          {fieldType.defaultSize}
        </span> */}
      </div>
    </div>
  );
}

// Sortable Section Component
function SortableSection({ 
  section, 
  isActive, 
  onActivate, 
  onTitleChange,
  onDelete, 
  onDeleteField,

  isCollapsed,
  onToggleCollapse,
  onFieldEdit
}: { 
  section: FormSection;
  isActive: boolean;
  onActivate: () => void;
  onTitleChange: (title: string) => void;
  onDelete: () => void;
  onDeleteField: (fieldId: string) => void;


  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onFieldEdit: (field: FormField) => void;
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
      className={`bg-gradient-to-r from-blue-100 to-indigo-100 border border-gray-200 rounded-lg p-6 transition-all ${
        isActive ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
      }`}
      data-droppable="true"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <GripVertical className="w-4 h-4 text-gray-500" />
          <button
            onClick={onToggleCollapse}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
            title={isCollapsed ? "Expand section" : "Collapse section"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
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
            className="p-2 rounded-md bg-red-500 text-red-100 hover:bg-red-700 transition-colors"
            title="Delete section"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {section.subtitle && (
        <p className="text-sm text-gray-600 mb-4">{section.subtitle}</p>
      )}

      {!isCollapsed && (
        <>
          <SortableContext
            items={section.fields.map(f => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-3 gap-4 min-h-[100px]">
              {section.fields.map((field) => (
                <SortableField
                  key={field.id}
                  field={field}
                  sectionId={section.id}
                  onDelete={() => onDeleteField(field.id)}
                  onEdit={() => onFieldEdit(field)}
                />
              ))}
              
              {section.fields.length === 0 && (
                <div className="col-span-3 text-center py-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50 backdrop-blur-sm">
                  <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">No fields in this section</p>
                  <p className="text-xs text-gray-500">Drag fields from the left panel to add them here</p>
                </div>
              )}
            </div>
          </SortableContext>

          {/* Drop zone at the bottom of each section */}
          <SectionDropZone sectionId={section.id} />
        </>
      )}
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
  onEdit
}: {
  field: FormField;
  sectionId: string;
  onDelete: () => void;
  onEdit: () => void;
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

  const getGridSpan = () => {
    switch (field.size) {
      case '1x1': return 'col-span-1';
      case '1x2': return 'col-span-2';
      case '1x3': return 'col-span-3';
      default: return 'col-span-1';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${getGridSpan()} ${
        isDragging ? 'z-50 scale-105 shadow-2xl' : ''
      }`}
    >
      <div className={`bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl p-4 hover:bg-white/90 hover:shadow-md transition-all duration-200 ${
        isDragging ? 'border-blue-300 bg-blue-50/50' : ''
      }`}>
        {/* Drag Handle */}
        <div 
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 p-1 rounded-lg bg-gray-100/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-grab active:cursor-grabbing hover:bg-gray-200/80"
          title="Drag to reorder field"
        >
          <GripVertical className="w-3 h-3 text-gray-500" />
        </div>

        {/* Field Content */}
        <div className="ml-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <label className="block text-sm font-medium text-gray-700">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {/* <span className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-2 py-1 rounded-lg">
                  {field.type}
                </span> */}
                <span className="text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-2 py-1 rounded-lg">
                  {field.size}
                </span>
              </div>
              {field.placeholder && (
                <p className="text-xs text-gray-500 mt-1">{field.placeholder}</p>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-1 mt-3">
            <button
              onClick={onEdit}
              className="p-1.5 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
              title="Edit field"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
              title="Delete field"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
        
        {/* Field Options Display */}
        {field.options && field.options.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">Options:</p>
            <div className="flex flex-wrap gap-1">
              {field.options.map((option, index) => (
                <span key={index} className="text-xs text-gray-700 bg-gray-100/80 backdrop-blur-sm px-2 py-1 rounded-lg">
                  {option.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Drag Overlay Indicator */}
        {isDragging && (
          <div className="absolute inset-0 bg-blue-50/50 border-2 border-blue-300 rounded-xl flex items-center justify-center">
            <div className="text-blue-600 text-sm font-medium">Moving field...</div>
          </div>
        )}
      </div>
    </div>
  );
}



// Field Edit Modal Component
function FieldEditModal({
  fieldData,
  onSave,
  onCancel,
  onClose
}: {
  fieldData: {
    label: string;
    placeholder: string;
    required: boolean;
    size: '1x1' | '1x2' | '1x3';
    options: { label: string; value: string }[];
  };
  onSave: (data: {
    label: string;
    placeholder: string;
    required: boolean;
    size: '1x1' | '1x2' | '1x3';
    options: { label: string; value: string }[];
  }) => void;
  onCancel: () => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    label: fieldData.label,
    placeholder: fieldData.placeholder,
    required: fieldData.required,
    size: fieldData.size,
    options: fieldData.options
  });

  const [newOption, setNewOption] = useState({ label: '', value: '' });

  const handleSave = () => {
    onSave(formData);
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
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
      <div className="relative bg-white/95 backdrop-blur-md border border-gray-200/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-gray-200/50 px-6 py-4 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Edit Field Properties</h3>
              <p className="text-sm text-gray-600 mt-1">Configure your field settings</p>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Properties */}
          <div className="bg-gray-50/50 rounded-xl p-4">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Properties</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Field Label</label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all duration-200"
                  placeholder="Enter field label..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Placeholder Text</label>
                <input
                  type="text"
                  value={formData.placeholder}
                  onChange={(e) => setFormData(prev => ({ ...prev, placeholder: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all duration-200"
                  placeholder="Enter placeholder text..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Field Size</label>
                <select
                  value={formData.size}
                  onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value as '1x1' | '1x2' | '1x3' }))}
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all duration-200"
                >
                  <option value="1x1">1 Column (Small)</option>
                  <option value="1x2">2 Columns (Medium)</option>
                  <option value="1x3">3 Columns (Large)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Required Field Toggle */}
          <div className="bg-gray-50/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-medium text-gray-900">Required Field</h4>
                <p className="text-sm text-gray-600 mt-1">Make this field mandatory for form submission</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.required}
                  onChange={(e) => setFormData(prev => ({ ...prev, required: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Options Section */}
          <div className="bg-gray-50/50 rounded-xl p-4">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Field Options</h4>
            <p className="text-sm text-gray-600 mb-4">Add options for dropdown, radio, or checkbox fields</p>
            
            <div className="space-y-3">
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={option.label}
                      onChange={(e) => {
                        const newOptions = [...formData.options];
                        newOptions[index].label = e.target.value;
                        setFormData(prev => ({ ...prev, options: newOptions }));
                      }}
                      className="w-full px-3 py-2 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm"
                      placeholder="Option label"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={option.value}
                      onChange={(e) => {
                        const newOptions = [...formData.options];
                        newOptions[index].value = e.target.value;
                        setFormData(prev => ({ ...prev, options: newOptions }));
                      }}
                      className="w-full px-3 py-2 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm"
                      placeholder="Option value"
                    />
                  </div>
                  <button
                    onClick={() => removeOption(index)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    title="Remove option"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {/* Add New Option */}
              <div className="flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50">
                <div className="flex-1">
                  <input
                    type="text"
                    value={newOption.label}
                    onChange={(e) => setNewOption(prev => ({ ...prev, label: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm"
                    placeholder="New option label"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={newOption.value}
                    onChange={(e) => setNewOption(prev => ({ ...prev, value: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm"
                    placeholder="New option value"
                  />
                </div>
                <button
                  onClick={addOption}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-sm hover:shadow-md transition-all duration-200"
                  title="Add option"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-gray-200/50 px-6 py-4 rounded-b-2xl">
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-sm hover:shadow-md transition-all duration-200 font-medium"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}