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
  },

  // Business Elements
  {
    type: 'company-info',
    label: 'Company Information',
    icon: '🏢',
    category: 'business',
    description: 'Company details section'
  },
  {
    type: 'contact-info',
    label: 'Contact Information',
    icon: '👤',
    category: 'business',
    description: 'Contact details section'
  },
  {
    type: 'address',
    label: 'Address',
    icon: '📍',
    category: 'business',
    description: 'Address input fields'
  },

  // Legal Elements
  {
    type: 'terms',
    label: 'Terms & Conditions',
    icon: '⚖️',
    category: 'legal',
    description: 'Legal terms section'
  },
  {
    type: 'agreement-type',
    label: 'Agreement Type',
    icon: '📋',
    category: 'legal',
    description: 'Agreement type selection'
  }
];

export const createFormElement = (type: FormElement['type']): FormElement => {
  const baseElement: FormElement = {
    id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    label: '',
    required: false,
    settings: {
      width: 'full', // Default to full width
    },
  };

  switch (type) {
    case 'short-text':
      return {
        ...baseElement,
        placeholder: 'Enter text...',
        validation: { minLength: 1, maxLength: 100 },
        settings: {
          ...baseElement.settings,
          width: 'half', // Default to half width for side-by-side
        },
      };
    case 'long-text':
      return {
        ...baseElement,
        placeholder: 'Enter detailed text...',
        settings: {
          ...baseElement.settings,
          multiline: true,
          rows: 4,
          width: 'full',
        },
      };
    case 'number':
      return {
        ...baseElement,
        placeholder: 'Enter number...',
        validation: { min: 0 },
        settings: {
          ...baseElement.settings,
          width: 'half',
        },
      };
    case 'email':
      return {
        ...baseElement,
        placeholder: 'Enter email address...',
        validation: { pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' },
        settings: {
          ...baseElement.settings,
          width: 'half',
        },
      };
    case 'phone':
      return {
        ...baseElement,
        placeholder: 'Enter phone number...',
        settings: {
          ...baseElement.settings,
          width: 'half',
        },
      };
    case 'date':
      return {
        ...baseElement,
        placeholder: 'Select date...',
        settings: {
          ...baseElement.settings,
          width: 'half',
        },
      };
    case 'dropdown':
      return {
        ...baseElement,
        placeholder: 'Select option...',
        options: [
          { label: 'Option 1', value: 'option1' },
          { label: 'Option 2', value: 'option2' },
        ],
        settings: {
          ...baseElement.settings,
          width: 'half',
        },
      };
    case 'checkbox':
      return {
        ...baseElement,
        defaultValue: false,
        settings: {
          ...baseElement.settings,
          width: 'full',
        },
      };
    case 'radio':
      return {
        ...baseElement,
        options: [
          { label: 'Option 1', value: 'option1' },
          { label: 'Option 2', value: 'option2' },
        ],
        settings: {
          ...baseElement.settings,
          width: 'full',
        },
      };
    case 'file-upload':
      return {
        ...baseElement,
        placeholder: 'Choose file...',
        settings: {
          ...baseElement.settings,
          accept: '*/*',
          multiple: false,
          width: 'full',
        },
      };
    case 'signature':
      return {
        ...baseElement,
        placeholder: 'Click to sign...',
        settings: {
          ...baseElement.settings,
          width: 'full',
        },
      };
    case 'heading':
      return {
        ...baseElement,
        label: 'Section Heading',
        settings: {
          ...baseElement.settings,
          width: 'full',
        },
      };
    case 'paragraph':
      return {
        ...baseElement,
        placeholder: 'Enter paragraph text...',
        settings: {
          ...baseElement.settings,
          width: 'full',
        },
      };
    case 'divider':
      return {
        ...baseElement,
        label: '',
        settings: {
          ...baseElement.settings,
          width: 'full',
        },
      };
    case 'company-info':
      return {
        ...baseElement,
        label: 'Company Information',
        settings: {
          ...baseElement.settings,
          width: 'full',
          autoFill: true,
        },
      };
    case 'contact-info':
      return {
        ...baseElement,
        label: 'Contact Information',
        settings: {
          ...baseElement.settings,
          width: 'full',
          autoFill: true,
        },
      };
    case 'address':
      return {
        ...baseElement,
        label: 'Address',
        settings: {
          ...baseElement.settings,
          width: 'full',
          autoFill: true,
        },
      };
    case 'terms':
      return {
        ...baseElement,
        label: 'Terms & Conditions',
        settings: {
          ...baseElement.settings,
          width: 'full',
        },
      };
    case 'agreement-type':
      return {
        ...baseElement,
        label: 'Agreement Type',
        options: [
          { label: 'Vendor Agreement', value: 'vendor' },
          { label: 'NDA Agreement', value: 'nda' },
          { label: 'Service Agreement', value: 'service' },
          { label: 'Purchase Agreement', value: 'purchase' },
        ],
        settings: {
          ...baseElement.settings,
          width: 'full',
        },
      };
    default:
      return baseElement;
  }
};

export const createFormComponent = (type: FormComponent['type']): FormComponent => {
  const baseComponent: FormComponent = {
    id: `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    title: '',
    elements: [],
  };

  switch (type) {
    case 'section':
      return {
        ...baseComponent,
        title: 'New Section',
        description: 'Add a description for this section',
        settings: {
          layout: 'vertical',
          fieldSpacing: 'normal',
          responsive: true,
        },
      };
    case 'part':
      return {
        ...baseComponent,
        title: 'Part 1',
        description: 'First part of the form',
        settings: {
          layout: 'vertical',
          fieldSpacing: 'normal',
          responsive: true,
          isPart: true,
          partNumber: 1,
          autoSave: true,
        },
      };
    case 'row':
      return {
        ...baseComponent,
        title: 'Field Row',
        description: 'Add fields side by side',
        settings: {
          layout: 'side-by-side',
          fieldSpacing: 'compact',
          responsive: true,
        },
      };
    case 'group':
      return {
        ...baseComponent,
        title: 'Field Group',
        description: 'Group related fields together',
        settings: {
          layout: 'vertical',
          fieldSpacing: 'normal',
          responsive: true,
        },
      };
    case 'grid':
      return {
        ...baseComponent,
        title: 'Grid Layout',
        description: 'Arrange fields in a grid',
        settings: {
          columns: 2,
          layout: 'horizontal',
          fieldSpacing: 'normal',
          responsive: true,
        },
      };
    case 'tabs':
      return {
        ...baseComponent,
        title: 'Tabbed Section',
        description: 'Organize content in tabs',
        settings: {
          layout: 'vertical',
          fieldSpacing: 'normal',
          responsive: true,
        },
      };
    case 'accordion':
      return {
        ...baseComponent,
        title: 'Collapsible Section',
        description: 'Expandable content area',
        settings: {
          layout: 'vertical',
          collapsible: true,
          defaultOpen: true,
          fieldSpacing: 'normal',
          responsive: true,
        },
      };
    default:
      return baseComponent;
  }
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
      allowPrint: true,
      multiPart: false,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

export const createMultiPartForm = (name: string, description?: string, parts: number = 2): Form => {
  const components = [];
  for (let i = 1; i <= parts; i++) {
    const part = createFormComponent('part');
    part.title = `Part ${i}`;
    part.description = `Part ${i} of the form`;
    part.settings = {
      ...part.settings,
      isPart: true,
      partNumber: i,
      autoSave: true,
    };
    components.push(part);
  }

  return {
    id: `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    description: description || '',
    components,
    settings: {
      theme: 'default',
      layout: 'single-column',
      showProgress: true,
      allowSave: true,
      allowPrint: true,
      multiPart: true,
      parts: {
        total: parts,
        current: 1,
        titles: Array.from({ length: parts }, (_, i) => `Part ${i + 1}`),
      },
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