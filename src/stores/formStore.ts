import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Form, FormComponent, FormElement } from '@/types';
import { createNewForm, createFormComponent, createFormElement } from '@/lib/formUtils';

interface FormStore {
  forms: Form[];
  currentForm: Form | null;
  
  // Form CRUD operations
  addForm: (form: Form) => void;
  updateForm: (id: string, updates: Partial<Form>) => void;
  deleteForm: (id: string) => void;
  duplicateForm: (id: string) => void;
  setCurrentForm: (form: Form | null) => void;
  
  // Component operations
  addComponentToForm: (formId: string, component: FormComponent) => void;
  updateComponentInForm: (formId: string, componentId: string, updates: Partial<FormComponent>) => void;
  removeComponentFromForm: (formId: string, componentId: string) => void;
  reorderComponents: (formId: string, oldIndex: number, newIndex: number) => void;
  
  // Element operations
  addElementToComponent: (formId: string, componentId: string, element: FormElement) => void;
  updateElementInComponent: (formId: string, componentId: string, elementId: string, updates: Partial<FormElement>) => void;
  removeElementFromComponent: (formId: string, componentId: string, elementId: string) => void;
  reorderElements: (formId: string, componentId: string, oldIndex: number, newIndex: number) => void;
  
  // Utility functions
  getFormById: (id: string) => Form | undefined;
  getComponentById: (formId: string, componentId: string) => FormComponent | undefined;
  getElementById: (formId: string, componentId: string, elementId: string) => FormElement | undefined;
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
      
      duplicateForm: (id) => {
        const form = get().forms.find(f => f.id === id);
        if (form) {
          const duplicatedForm: Form = {
            ...form,
            id: `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: `${form.name} (Copy)`,
            createdAt: new Date(),
            updatedAt: new Date(),
            components: form.components.map(component => ({
              ...component,
              id: `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              elements: component.elements.map(element => ({
                ...element,
                id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              }))
            }))
          };
          get().addForm(duplicatedForm);
        }
      },
      
      setCurrentForm: (form) =>
        set(() => ({
          currentForm: form,
        })),
      
      addComponentToForm: (formId, component) => {
        set((state) => ({
          forms: state.forms.map((form) =>
            form.id === formId
              ? { ...form, components: [...form.components, component], updatedAt: new Date() }
              : form
          ),
          currentForm: state.currentForm?.id === formId
            ? { ...state.currentForm, components: [...state.currentForm.components, component], updatedAt: new Date() }
            : state.currentForm,
        }));
      },
      
      updateComponentInForm: (formId, componentId, updates) => {
        set((state) => ({
          forms: state.forms.map((form) =>
            form.id === formId
              ? {
                  ...form,
                  components: form.components.map((component) =>
                    component.id === componentId ? { ...component, ...updates } : component
                  ),
                  updatedAt: new Date()
                }
              : form
          ),
          currentForm: state.currentForm?.id === formId
            ? {
                ...state.currentForm,
                components: state.currentForm.components.map((component) =>
                  component.id === componentId ? { ...component, ...updates } : component
                ),
                updatedAt: new Date()
              }
            : state.currentForm,
        }));
      },
      
      removeComponentFromForm: (formId, componentId) => {
        set((state) => ({
          forms: state.forms.map((form) =>
            form.id === formId
              ? {
                  ...form,
                  components: form.components.filter((component) => component.id !== componentId),
                  updatedAt: new Date()
                }
              : form
          ),
          currentForm: state.currentForm?.id === formId
            ? {
                ...state.currentForm,
                components: state.currentForm.components.filter((component) => component.id !== componentId),
                updatedAt: new Date()
              }
            : state.currentForm,
        }));
      },
      
      reorderComponents: (formId, oldIndex, newIndex) => {
        set((state) => ({
          forms: state.forms.map((form) =>
            form.id === formId
              ? {
                  ...form,
                  components: (() => {
                    const components = [...form.components];
                    const [removed] = components.splice(oldIndex, 1);
                    components.splice(newIndex, 0, removed);
                    return components;
                  })(),
                  updatedAt: new Date()
                }
              : form
          ),
          currentForm: state.currentForm?.id === formId
            ? {
                ...state.currentForm,
                components: (() => {
                  const components = [...state.currentForm.components];
                  const [removed] = components.splice(oldIndex, 1);
                  components.splice(newIndex, 0, removed);
                  return components;
                })(),
                updatedAt: new Date()
              }
            : state.currentForm,
        }));
      },
      
      addElementToComponent: (formId, componentId, element) => {
        set((state) => ({
          forms: state.forms.map((form) =>
            form.id === formId
              ? {
                  ...form,
                  components: form.components.map((component) =>
                    component.id === componentId
                      ? { ...component, elements: [...component.elements, element] }
                      : component
                  ),
                  updatedAt: new Date()
                }
              : form
          ),
          currentForm: state.currentForm?.id === formId
            ? {
                ...state.currentForm,
                components: state.currentForm.components.map((component) =>
                  component.id === componentId
                    ? { ...component, elements: [...component.elements, element] }
                    : component
                ),
                updatedAt: new Date()
              }
            : state.currentForm,
        }));
      },
      
      updateElementInComponent: (formId, componentId, elementId, updates) => {
        set((state) => ({
          forms: state.forms.map((form) =>
            form.id === formId
              ? {
                  ...form,
                  components: form.components.map((component) =>
                    component.id === componentId
                      ? {
                          ...component,
                          elements: component.elements.map((element) =>
                            element.id === elementId ? { ...element, ...updates } : element
                          )
                        }
                      : component
                  ),
                  updatedAt: new Date()
                }
              : form
          ),
          currentForm: state.currentForm?.id === formId
            ? {
                ...state.currentForm,
                components: state.currentForm.components.map((component) =>
                  component.id === componentId
                    ? {
                        ...component,
                        elements: component.elements.map((element) =>
                          element.id === elementId ? { ...element, ...updates } : element
                        )
                      }
                    : component
                ),
                updatedAt: new Date()
              }
            : state.currentForm,
        }));
      },
      
      removeElementFromComponent: (formId, componentId, elementId) => {
        set((state) => ({
          forms: state.forms.map((form) =>
            form.id === formId
              ? {
                  ...form,
                  components: form.components.map((component) =>
                    component.id === componentId
                      ? {
                          ...component,
                          elements: component.elements.filter((element) => element.id !== elementId)
                        }
                      : component
                  ),
                  updatedAt: new Date()
                }
              : form
          ),
          currentForm: state.currentForm?.id === formId
            ? {
                ...state.currentForm,
                components: state.currentForm.components.map((component) =>
                  component.id === componentId
                    ? {
                        ...component,
                        elements: component.elements.filter((element) => element.id !== elementId)
                      }
                    : component
                ),
                updatedAt: new Date()
              }
            : state.currentForm,
        }));
      },
      
      reorderElements: (formId, componentId, oldIndex, newIndex) => {
        set((state) => ({
          forms: state.forms.map((form) =>
            form.id === formId
              ? {
                  ...form,
                  components: form.components.map((component) =>
                    component.id === componentId
                      ? {
                          ...component,
                          elements: (() => {
                            const elements = [...component.elements];
                            const [removed] = elements.splice(oldIndex, 1);
                            elements.splice(newIndex, 0, removed);
                            return elements;
                          })()
                        }
                      : component
                  ),
                  updatedAt: new Date()
                }
              : form
          ),
          currentForm: state.currentForm?.id === formId
            ? {
                ...state.currentForm,
                components: state.currentForm.components.map((component) =>
                  component.id === componentId
                    ? {
                        ...component,
                        elements: (() => {
                          const elements = [...component.elements];
                          const [removed] = elements.splice(oldIndex, 1);
                          elements.splice(newIndex, 0, removed);
                          return elements;
                        })()
                      }
                    : component
                ),
                updatedAt: new Date()
              }
            : state.currentForm,
        }));
      },
      
      getFormById: (id) => {
        return get().forms.find(form => form.id === id);
      },
      
      getComponentById: (formId, componentId) => {
        const form = get().getFormById(formId);
        return form?.components.find(component => component.id === componentId);
      },
      
      getElementById: (formId, componentId, elementId) => {
        const component = get().getComponentById(formId, componentId);
        return component?.elements.find(element => element.id === elementId);
      },
    }),
    {
      name: 'form-store',
    }
  )
);