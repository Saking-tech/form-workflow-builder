'use client';

import { useState } from 'react';
import { useFormStore } from '@/stores/formStore';
import { Form } from '@/types';
import { FORM_TEMPLATES } from '@/lib/formTemplates';
import { generateId } from '@/lib/utils';
import FormBuilder from '@/components/form-builder/FormBuilder';
import FormPreview from '@/components/form-preview/FormPreview';
import InteractiveForm from '@/components/form-interactive/InteractiveForm';
import { Plus, FileText, Settings, Eye, Trash2, Edit3, Copy, Download, Upload, X } from 'lucide-react';

export default function FormsPage() {
  const { forms, createFormFromTemplate, setCurrentForm, currentForm, updateForm, deleteForm, addForm } = useFormStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [editingForm, setEditingForm] = useState<Form | null>(null);
  const [previewForm, setPreviewForm] = useState<Form | null>(null);
  const [interactiveForm, setInteractiveForm] = useState<Form | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');

  const handleCreateForm = () => {
    const newForm: Form = {
      id: generateId(),
      name: formName || 'New Form',
      description: formDescription,
      sections: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    addForm(newForm);
    setCurrentForm(newForm);
    setFormName('');
    setFormDescription('');
    setShowCreateModal(false);
  };

  const handleCreateFromTemplate = (templateId: string) => {
    const newForm = createFormFromTemplate(templateId);
    setCurrentForm(newForm);
    setShowTemplateModal(false);
  };

  const handleFormChange = (updatedForm: Form) => {
    // Update the form in the store
    setCurrentForm(updatedForm);
  };

  const handleSaveForm = () => {
    if (currentForm) {
      updateForm(currentForm.id, currentForm);
      setCurrentForm(null);
    }
  };

  const handleDeleteForm = (formId: string) => {
    deleteForm(formId);
    setShowDeleteModal(null);
  };

  const handleDuplicateForm = (form: Form) => {
    const duplicatedForm: Form = {
      ...form,
      id: generateId(),
      name: `${form.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    addForm(duplicatedForm);
    setCurrentForm(duplicatedForm);
  };

  const handleEditForm = (form: Form) => {
    setEditingForm(form);
    setFormName(form.name);
    setFormDescription(form.description || '');
  };

  const handleUpdateForm = () => {
    if (editingForm) {
      const updatedForm: Form = {
        ...editingForm,
        name: formName,
        description: formDescription,
        updatedAt: new Date()
      };
      updateForm(editingForm.id, updatedForm);
      setEditingForm(null);
      setFormName('');
      setFormDescription('');
    }
  };

  if (currentForm) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Form Builder</h1>
            <p className="text-gray-600">Design your form with drag-and-drop sections</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentForm(null)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Back to Forms
            </button>
            <button 
              onClick={handleSaveForm}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Form
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <FormBuilder form={currentForm} onFormChange={handleFormChange} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Forms</h1>
          <p className="text-gray-600">Create and manage your form templates</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowTemplateModal(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <FileText className="w-4 h-4 mr-2" />
            Use Template
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Form
          </button>
        </div>
      </div>

      {/* Forms List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {forms.map((form) => (
          <div key={form.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{form.name}</h3>
                {form.description && (
                  <p className="text-sm text-gray-600 mt-1">{form.description}</p>
                )}
              </div>
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => handleEditForm(form)}
                  className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                  title="Edit form details"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDuplicateForm(form)}
                  className="p-2 text-gray-500 hover:text-green-600 transition-colors"
                  title="Duplicate form"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setShowDeleteModal(form.id)}
                  className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                  title="Delete form"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>{form.sections.length} sections</span>
              <span>{form.sections.reduce((total, section) => total + section.fields.length, 0)} fields</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Updated {form.updatedAt.toLocaleDateString()}
              </span>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setPreviewForm(form)}
                  className="p-2 text-gray-500 hover:text-blue-600 transition-colors" 
                  title="Preview form"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setInteractiveForm(form)}
                  className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs hover:bg-green-200 transition-colors" 
                  title="Test form with validation"
                >
                  Test
                </button>
                <button
                  onClick={() => setCurrentForm(form)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200 transition-colors"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Form Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Form</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Form Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Enter form name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Enter form description"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormName('');
                  setFormDescription('');
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateForm}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Form
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form Modal */}
      {editingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit Form</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Form Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Enter form name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Enter form description"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setEditingForm(null);
                  setFormName('');
                  setFormDescription('');
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateForm}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Update Form
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Delete Form</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this form? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteForm(showDeleteModal)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Selection Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose a Template</h2>
            <p className="text-gray-600 mb-6">
              Start with a pre-built template that matches common legal request forms.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FORM_TEMPLATES.map((template) => (
                <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    {template.sections.map((section) => (
                      <div key={section.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{section.title}</span>
                        <span className="text-gray-500">{section.fields.length} fields</span>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => handleCreateFromTemplate(template.id)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Use This Template
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-end mt-6">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Preview Modal */}
      {previewForm && (
        <FormPreview
          form={previewForm}
          onClose={() => setPreviewForm(null)}
        />
      )}

      {/* Interactive Form Modal */}
      {interactiveForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Test Form</h2>
                <p className="text-gray-600">{interactiveForm.name} - Interactive Version</p>
              </div>
              <button
                onClick={() => setInteractiveForm(null)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <InteractiveForm
                form={interactiveForm}
                onSubmit={(data) => {
                  console.log('Form submitted:', data);
                  alert('Form submitted successfully! Check console for data.');
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}