import { Form, FormComponent, FormElement, FieldType } from '@/types';

export const fieldTypes: FieldType[] = [
  // Basic Elements
  {
    type: 'short-text',
    label: 'Short Text',
    icon: '📝',
    category: 'basic',
    description: 'Single line text input'
  },
  {
    type: 'long-text',
    label: 'Long Text',
    icon: '📄',
    category: 'basic',
    description: 'Multi-line text area'
  },
  {
    type: 'number',
    label: 'Number',
    icon: '🔢',
    category: 'basic',
    description: 'Numeric input field'
  },
  {
    type: 'email',
    label: 'Email',
    icon: '📧',
    category: 'basic',
    description: 'Email address input'
  },
  {
    type: 'phone',
    label: 'Phone',
    icon: '📞',
    category: 'basic',
    description: 'Phone number input'
  },
  {
    type: 'date',
    label: 'Date',
    icon: '📅',
    category: 'basic',
    description: 'Date picker'
  },
  
  // Advanced Elements
  {
    type: 'dropdown',
    label: 'Dropdown',
    icon: '📋',
    category: 'advanced',
    description: 'Select from options'
  },
  {
    type: 'checkbox',
    label: 'Checkbox',
    icon: '☑️',
    category: 'advanced',
    description: 'Multiple choice selection'
  },
  {
    type: 'radio',
    label: 'Radio Buttons',
    icon: '🔘',
    category: 'advanced',
    description: 'Single choice selection'
  },
  
  // Media Elements
  {
    type: 'file-upload',
    label: 'File Upload',
    icon: '📎',
    category: 'media',
    description: 'File attachment'
  },
  {
    type: 'signature',
    label: 'Signature',
    icon: '✍️',
    category: 'media',
    description: 'Digital signature'
  },
  
  // Layout Elements
  {
    type: 'heading',
    label: 'Heading',
    icon: '📌',
    category: 'layout',
    description: 'Section title'
  },
  {
    type: 'paragraph',
    label: 'Paragraph',
    icon: '📖',
    category: 'layout',
    description: 'Text content'
  },
  {
    type: 'divider',
    label: 'Divider',
    icon: '➖',
    category: 'layout',
    description: 'Visual separator'
  }
];

export const createFormElement = (type: FormElement['type']): FormElement => {
  const baseElement: FormElement = {
    id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    label: '',
    required: false,
  };

  switch (type) {
    case 'short-text':
      return {
        ...baseElement,
        placeholder: 'Enter text...',
        validation: { minLength: 1, maxLength: 100 }
      };
    
    case 'long-text':
      return {
        ...baseElement,
        placeholder: 'Enter your message...',
        settings: { multiline: true, rows: 4 },
        validation: { minLength: 1, maxLength: 1000 }
      };
    
    case 'number':
      return {
        ...baseElement,
        placeholder: 'Enter number...',
        validation: { min: 0, max: 999999 }
      };
    
    case 'email':
      return {
        ...baseElement,
        placeholder: 'Enter email address...',
        validation: { pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' }
      };
    
    case 'phone':
      return {
        ...baseElement,
        placeholder: 'Enter phone number...',
        validation: { pattern: '^[+]?[0-9\\s\\-()]{10,}$' }
      };
    
    case 'date':
      return {
        ...baseElement,
        placeholder: 'Select date...'
      };
    
    case 'dropdown':
      return {
        ...baseElement,
        options: [
          { label: 'Option 1', value: 'option1' },
          { label: 'Option 2', value: 'option2' },
          { label: 'Option 3', value: 'option3' }
        ]
      };
    
    case 'checkbox':
      return {
        ...baseElement,
        options: [
          { label: 'Option 1', value: 'option1' },
          { label: 'Option 2', value: 'option2' }
        ]
      };
    
    case 'radio':
      return {
        ...baseElement,
        options: [
          { label: 'Option 1', value: 'option1' },
          { label: 'Option 2', value: 'option2' }
        ]
      };
    
    case 'file-upload':
      return {
        ...baseElement,
        settings: { accept: '.pdf,.doc,.docx,.jpg,.png', multiple: false }
      };
    
    case 'signature':
      return {
        ...baseElement,
        settings: {}
      };
    
    case 'heading':
      return {
        ...baseElement,
        label: 'Section Heading',
        required: false
      };
    
    case 'paragraph':
      return {
        ...baseElement,
        label: 'Paragraph Text',
        placeholder: 'Enter paragraph content...',
        required: false
      };
    
    case 'divider':
      return {
        ...baseElement,
        label: 'Divider',
        required: false
      };
    
    default:
      return baseElement;
  }
};

export const createFormComponent = (type: FormComponent['type'] = 'section'): FormComponent => {
  return {
    id: `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    title: 'New Section',
    description: '',
    elements: [],
    settings: {
      columns: type === 'grid' ? 2 : undefined,
      collapsible: type === 'accordion' ? true : undefined,
      defaultOpen: type === 'accordion' ? true : undefined,
      layout: 'vertical'
    }
  };
};

export const createNewForm = (name: string, description?: string): Form => {
  return {
    id: `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    description: description || '',
    components: [
      createFormComponent('section')
    ],
    settings: {
      theme: 'default',
      layout: 'single-column',
      showProgress: true,
      allowSave: true,
      allowPrint: true
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

export const getFieldTypeByType = (type: FormElement['type']): FieldType | undefined => {
  return fieldTypes.find(fieldType => fieldType.type === type);
};

export const getFieldTypesByCategory = (category: FieldType['category']): FieldType[] => {
  return fieldTypes.filter(fieldType => fieldType.category === category);
};