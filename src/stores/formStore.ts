import { create } from 'zustand';
import { Form, FormField, FormSection, FormTemplate } from '@/types';
import { FORM_TEMPLATES } from '@/lib/formTemplates';
import { persistStore } from '@/lib/persistStore';

interface FormStore {
  forms: Form[];
  currentForm: Form | null;
  templates: FormTemplate[];
  addForm: (form: Form) => void;
  updateForm: (id: string, updates: Partial<Form>) => void;
  deleteForm: (id: string) => void;
  setCurrentForm: (form: Form | null) => void;
  createFormFromTemplate: (templateId: string) => Form;
  addSectionToForm: (formId: string, section: FormSection) => void;
  updateSectionInForm: (formId: string, sectionId: string, updates: Partial<FormSection>) => void;
  removeSectionFromForm: (formId: string, sectionId: string) => void;
  addFieldToSection: (formId: string, sectionId: string, field: FormField) => void;
  updateFieldInSection: (formId: string, sectionId: string, fieldId: string, updates: Partial<FormField>) => void;
  removeFieldFromSection: (formId: string, sectionId: string, fieldId: string) => void;
  reorderSections: (formId: string, sectionIds: string[]) => void;
  reorderFieldsInSection: (formId: string, sectionId: string, fieldIds: string[]) => void;
}

export const useFormStore = create<FormStore>(
  persistStore<FormStore>('formStore', (set, get) => ({
  forms: [],
  currentForm: null,
  templates: FORM_TEMPLATES,
  
  addForm: (form) => set((state) => ({
    forms: [...state.forms, form]
  })),
  
  updateForm: (id, updates) => set((state) => ({
    forms: state.forms.map(form => 
      form.id === id ? { ...form, ...updates, updatedAt: new Date() } : form
    )
  })),
  
  deleteForm: (id) => set((state) => ({
    forms: state.forms.filter(form => form.id !== id)
  })),
  
  setCurrentForm: (form) => set({ currentForm: form }),
  
  createFormFromTemplate: (templateId) => {
    const template = FORM_TEMPLATES.find(t => t.id === templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }
    
    const newForm: Form = {
      id: `form_${Date.now()}`,
      name: template.name,
      description: template.description,
      sections: template.sections.map(section => ({
        ...section,
        id: `section_${Date.now()}_${Math.random()}`,
        fields: section.fields.map(field => ({
          ...field,
          id: `field_${Date.now()}_${Math.random()}`
        }))
      })),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    get().addForm(newForm);
    return newForm;
  },


  
  addSectionToForm: (formId, section) => set((state) => ({
    forms: state.forms.map(form => 
      form.id === formId 
        ? { 
            ...form, 
            sections: [...form.sections, section].sort((a, b) => a.order - b.order).filter(Boolean),
            updatedAt: new Date()
          }
        : form
    )
  })),
  
  updateSectionInForm: (formId, sectionId, updates) => set((state) => ({
    forms: state.forms.map(form => 
      form.id === formId 
        ? { 
            ...form, 
            sections: form.sections.map(section => 
              section.id === sectionId ? { ...section, ...updates } : section
            ).filter(Boolean),
            updatedAt: new Date()
          }
        : form
    )
  })),
  
  removeSectionFromForm: (formId, sectionId) => set((state) => ({
    forms: state.forms.map(form => 
      form.id === formId 
        ? { 
            ...form, 
            sections: form.sections.filter(section => section.id !== sectionId),
            updatedAt: new Date()
          }
        : form
    )
  })),
  
  addFieldToSection: (formId, sectionId, field) => set((state) => ({
    forms: state.forms.map(form => 
      form.id === formId 
        ? { 
            ...form, 
            sections: form.sections.map(section => 
              section.id === sectionId 
                ? { ...section, fields: [...section.fields, field] }
                : section
            ),
            updatedAt: new Date()
          }
        : form
    )
  })),
  
  updateFieldInSection: (formId, sectionId, fieldId, updates) => set((state) => ({
    forms: state.forms.map(form => 
      form.id === formId 
        ? { 
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
            ),
            updatedAt: new Date()
          }
        : form
    )
  })),
  
  removeFieldFromSection: (formId, sectionId, fieldId) => set((state) => ({
    forms: state.forms.map(form => 
      form.id === formId 
        ? { 
            ...form, 
            sections: form.sections.map(section => 
              section.id === sectionId 
                ? { 
                    ...section, 
                    fields: section.fields.filter(field => field.id !== fieldId)
                  }
                : section
            ),
            updatedAt: new Date()
          }
        : form
    )
  })),
  
  reorderSections: (formId, sectionIds) => set((state) => ({
    forms: state.forms.map(form => 
      form.id === formId 
        ? { 
            ...form, 
            sections: sectionIds.map((id, index) => {
              const section = form.sections.find(s => s.id === id);
              return section ? { ...section, order: index } : section;
            }).filter(Boolean) as FormSection[],
            updatedAt: new Date()
          }
        : form
    )
  })),
  
  reorderFieldsInSection: (formId, sectionId, fieldIds) => set((state) => ({
    forms: state.forms.map(form => 
      form.id === formId 
        ? { 
            ...form, 
            sections: form.sections.map(section => 
              section.id === sectionId 
                ? { 
                    ...section, 
                    fields: fieldIds.map((id, index) => {
                      const field = section.fields.find(f => f.id === id);
                      return field ? { ...field, order: index } : field;
                    }).filter(Boolean) as FormField[]
                  }
                : section
            ),
            updatedAt: new Date()
          }
        : form
    )
  }))
})));