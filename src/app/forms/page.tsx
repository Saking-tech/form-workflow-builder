'use client';

import { useState } from 'react';
import { useFormStore } from '@/stores/formStore';
import { Form } from '@/types';
import { FORM_TEMPLATES } from '@/lib/formTemplates';
import { generateId } from '@/lib/utils';
import FormBuilder from '@/components/form-builder/FormBuilder';
import FormPreview from '@/components/form-preview/FormPreview';
import InteractiveForm from '@/components/form-interactive/InteractiveForm';
import { Plus, FileText, Eye, Trash2, Edit3, Copy, X } from 'lucide-react';

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
            <p className="text-2xl font-bold text-gray-900">Form Builder</p>
            <p className="text-gray-600">Design your form with drag-and-drop sections</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentForm(null)}
              className="px-4 py-2 bg-white text-gray-600 rounded-xl hover:bg-gray-200 border border-gray-400"
            >
              Back to Forms
            </button>
            <button 
              onClick={handleSaveForm}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-xl hover:bg-blue-900 hover:from-blue-800 hover:to-indigo-600"
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
        {forms && forms.length > 0 ? forms.map((form) => (
          <div key={form.id} className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-xl p-6 hover:bg-white/80 hover:shadow-lg transition-all duration-200">
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
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  title="Edit form details"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDuplicateForm(form)}
                  className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                  title="Duplicate form"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setShowDeleteModal(form.id)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
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
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200" 
                  title="Preview form"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setInteractiveForm(form)}
                  className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm hover:from-green-600 hover:to-emerald-700 shadow-sm hover:shadow-md transition-all duration-200" 
                  title="Test form with validation"
                >
                  Test
                </button>
                <button
                  onClick={() => setCurrentForm(form)}
                  className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm hover:from-blue-700 hover:to-indigo-700 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No forms yet</h3>
            <p className="text-gray-600 mb-4">Create your first form to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create First Form
            </button>
          </div>
        )}
      </div>

      {/* Create Form Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200/50">
              <h2 className="text-xl font-semibold text-gray-900">Create New Form</h2>
              <p className="text-sm text-gray-600 mt-1">Start building your custom form</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Form Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all duration-200"
                  placeholder="Enter form name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all duration-200"
                  placeholder="Enter form description"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200/50">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormName('');
                  setFormDescription('');
                }}
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateForm}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-sm hover:shadow-md transition-all duration-200 font-medium"
              >
                Create Form
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form Modal */}
      {editingForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200/50">
              <h2 className="text-xl font-semibold text-gray-900">Edit Form</h2>
              <p className="text-sm text-gray-600 mt-1">Update your form details</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Form Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all duration-200"
                  placeholder="Enter form name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all duration-200"
                  placeholder="Enter form description"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200/50">
              <button
                onClick={() => {
                  setEditingForm(null);
                  setFormName('');
                  setFormDescription('');
                }}
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateForm}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-sm hover:shadow-md transition-all duration-200 font-medium"
              >
                Update Form
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200/50">
              <h2 className="text-xl font-semibold text-gray-900">Delete Form</h2>
              <p className="text-sm text-gray-600 mt-1">This action cannot be undone</p>
            </div>
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 rounded-xl bg-red-100">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-gray-900 font-medium">Confirm Deletion</p>
                  <p className="text-sm text-gray-600">Are you sure you want to delete this form? This action cannot be undone.</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200/50">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteForm(showDeleteModal)}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 shadow-sm hover:shadow-md transition-all duration-200 font-medium"
              >
                Delete Form
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Selection Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200/50">
              <h2 className="text-xl font-semibold text-gray-900">Choose a Template</h2>
              <p className="text-sm text-gray-600 mt-1">Start with a pre-built template that matches common legal request forms.</p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FORM_TEMPLATES.map((template) => (
                  <div key={template.id} className="bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl p-4 hover:bg-white/80 hover:shadow-md transition-all duration-200">
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
                      className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-sm hover:shadow-md transition-all duration-200 font-medium"
                    >
                      Use This Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200/50">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
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
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/50">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Test Form</h2>
                <p className="text-sm text-gray-600">{interactiveForm.name} - Interactive Version</p>
              </div>
              <button
                onClick={() => setInteractiveForm(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
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