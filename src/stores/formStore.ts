import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Form, FormField } from '@/types';

interface FormStore {
  forms: Form[];
  currentForm: Form | null;
  
  // Actions
  addForm: (form: Form) => void;
  updateForm: (id: string, updates: Partial<Form>) => void;
  deleteForm: (id: string) => void;
  setCurrentForm: (form: Form | null) => void;
  
  // Form field operations
  addFieldToForm: (formId: string, field: FormField) => void;
  updateFieldInForm: (formId: string, fieldId: string, updates: Partial<FormField>) => void;
  removeFieldFromForm: (formId: string, fieldId: string) => void;
  reorderFormFields: (formId: string, fromIndex: number, toIndex: number) => void;
  
  // Utility functions
  getFormById: (id: string) => Form | undefined;
  duplicateForm: (id: string) => void;
}

export const useFormStore = create<FormStore>()(
  persist(
    (set, get) => ({
      forms: [],
      currentForm: null,
      
      addForm: (form) =>
        set((state) => ({
          forms: [...state.forms, form],
        })),
      
      updateForm: (id, updates) =>
        set((state) => ({
          forms: state.forms.map((form) =>
            form.id === id ? { ...form, ...updates, updatedAt: new Date() } : form
          ),
          currentForm: state.currentForm?.id === id 
            ? { ...state.currentForm, ...updates, updatedAt: new Date() } 
            : state.currentForm,
        })),
      
      deleteForm: (id) =>
        set((state) => ({
          forms: state.forms.filter((form) => form.id !== id),
          currentForm: state.currentForm?.id === id ? null : state.currentForm,
        })),
      
      setCurrentForm: (form) =>
        set(() => ({
          currentForm: form,
        })),
      
      addFieldToForm: (formId, field) =>
        set((state) => ({
          forms: state.forms.map((form) =>
            form.id === formId
              ? { ...form, fields: [...form.fields, field], updatedAt: new Date() }
              : form
          ),
          currentForm: state.currentForm?.id === formId
            ? { ...state.currentForm, fields: [...state.currentForm.fields, field], updatedAt: new Date() }
            : state.currentForm,
        })),
      
      updateFieldInForm: (formId, fieldId, updates) =>
        set((state) => ({
          forms: state.forms.map((form) =>
            form.id === formId
              ? {
                  ...form,
                  fields: form.fields.map((field) =>
                    field.id === fieldId ? { ...field, ...updates } : field
                  ),
                  updatedAt: new Date(),
                }
              : form
          ),
          currentForm: state.currentForm?.id === formId
            ? {
                ...state.currentForm,
                fields: state.currentForm.fields.map((field) =>
                  field.id === fieldId ? { ...field, ...updates } : field
                ),
                updatedAt: new Date(),
              }
            : state.currentForm,
        })),
      
      removeFieldFromForm: (formId, fieldId) =>
        set((state) => ({
          forms: state.forms.map((form) =>
            form.id === formId
              ? {
                  ...form,
                  fields: form.fields.filter((field) => field.id !== fieldId),
                  updatedAt: new Date(),
                }
              : form
          ),
          currentForm: state.currentForm?.id === formId
            ? {
                ...state.currentForm,
                fields: state.currentForm.fields.filter((field) => field.id !== fieldId),
                updatedAt: new Date(),
              }
            : state.currentForm,
        })),
      
      reorderFormFields: (formId, fromIndex, toIndex) =>
        set((state) => {
          const updateFields = (fields: FormField[]) => {
            const newFields = [...fields];
            const [removed] = newFields.splice(fromIndex, 1);
            newFields.splice(toIndex, 0, removed);
            return newFields;
          };
          
          return {
            forms: state.forms.map((form) =>
              form.id === formId
                ? { ...form, fields: updateFields(form.fields), updatedAt: new Date() }
                : form
            ),
            currentForm: state.currentForm?.id === formId
              ? { ...state.currentForm, fields: updateFields(state.currentForm.fields), updatedAt: new Date() }
              : state.currentForm,
          };
        }),
      
      getFormById: (id) => get().forms.find((form) => form.id === id),
      
      duplicateForm: (id) => {
        const form = get().getFormById(id);
        if (form) {
          const duplicatedForm: Form = {
            ...form,
            id: `${form.id}_copy_${Date.now()}`,
            name: `${form.name} (Copy)`,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          get().addForm(duplicatedForm);
        }
      },
    }),
    {
      name: 'form-store',
    }
  )
);