import { z } from 'zod';
import { FormField, Form, FieldType } from '@/types';

// Field type definitions for the palette
export const FIELD_TYPES: FieldType[] = [
  {
    type: 'text',
    label: 'Text Input',
    icon: '📝',
  },
  {
    type: 'select',
    label: 'Dropdown',
    icon: '📋',
  },
  {
    type: 'date',
    label: 'Date Picker',
    icon: '📅',
  },
  {
    type: 'file',
    label: 'File Upload',
    icon: '📎',
  },
];

// Create a new form field from type
export const createFieldFromType = (
  type: 'text' | 'select' | 'date' | 'file',
  customLabel?: string
): FormField => {
  const fieldType = FIELD_TYPES.find(ft => ft.type === type);
  const baseField: FormField = {
    id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    label: customLabel || fieldType?.label || 'New Field',
    placeholder: type === 'text' ? 'Enter text...' : undefined,
    required: false,
    validation: type === 'text' ? { minLength: 1, maxLength: 100 } : undefined,
  };

  // Add default options for select fields
  if (type === 'select') {
    baseField.options = [
      { label: 'Option 1', value: 'option1' },
      { label: 'Option 2', value: 'option2' },
    ];
  }

  return baseField;
};

// Create validation schema for a form field
export const createFieldValidationSchema = (field: FormField) => {
  let schema: z.ZodString | z.ZodOptional<z.ZodString>;

  switch (field.type) {
    case 'text':
      schema = z.string();
      if (field.required) {
        schema = schema.min(1, 'This field is required');
      }
      if (field.validation?.minLength) {
        schema = schema.min(field.validation.minLength, `Minimum ${field.validation.minLength} characters required`);
      }
      if (field.validation?.maxLength) {
        schema = schema.max(field.validation.maxLength, `Maximum ${field.validation.maxLength} characters allowed`);
      }
      if (field.validation?.pattern) {
        schema = schema.regex(new RegExp(field.validation.pattern), 'Invalid format');
      }
      break;

    case 'select':
      schema = z.string();
      if (field.required) {
        schema = schema.min(1, 'Please select an option');
      }
      if (field.options) {
        const validValues = field.options.map(opt => opt.value);
        schema = schema.refine(val => !val || validValues.includes(val), 'Invalid selection');
      }
      break;

    case 'date':
      schema = z.string();
      if (field.required) {
        schema = schema.min(1, 'Date is required');
      }
      schema = schema.refine(val => !val || !isNaN(Date.parse(val)), 'Invalid date format');
      break;

    case 'file':
      schema = z.string();
      if (field.required) {
        schema = schema.min(1, 'File is required');
      }
      break;

    default:
      schema = z.string();
  }

  return field.required ? schema : schema.optional();
};

// Create validation schema for entire form
export const createFormValidationSchema = (form: Form) => {
  const schemaObject: Record<string, z.ZodTypeAny> = {};
  
  form.fields.forEach(field => {
    schemaObject[field.id] = createFieldValidationSchema(field);
  });

  return z.object(schemaObject);
};

// Create new form
export const createNewForm = (name: string, description?: string): Form => ({
  id: `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name,
  description,
  fields: [],
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Validate form field configuration
export const validateFieldConfig = (field: FormField): string[] => {
  const errors: string[] = [];

  if (!field.label.trim()) {
    errors.push('Field label is required');
  }

  if (field.type === 'select' && (!field.options || field.options.length === 0)) {
    errors.push('Select field must have at least one option');
  }

  if (field.validation?.minLength && field.validation?.maxLength) {
    if (field.validation.minLength > field.validation.maxLength) {
      errors.push('Minimum length cannot be greater than maximum length');
    }
  }

  return errors;
};

// Get field type icon
export const getFieldIcon = (type: string): string => {
  const fieldType = FIELD_TYPES.find(ft => ft.type === type);
  return fieldType?.icon || '❓';
};

// Format field value for display
export const formatFieldValue = (field: FormField, value: any): string => {
  if (!value) return '';

  switch (field.type) {
    case 'select':
      const option = field.options?.find(opt => opt.value === value);
      return option?.label || value;
    
    case 'date':
      try {
        return new Date(value).toLocaleDateString();
      } catch {
        return value;
      }
    
    case 'file':
      return value.name || value;
    
    default:
      return String(value);
  }
};