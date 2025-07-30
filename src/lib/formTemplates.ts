import { FormTemplate, FormSection, FormField } from '@/types';
import { generateId } from './utils';

// Helper function to create form fields
const createField = (
  type: FormField['type'],
  label: string,
  placeholder?: string,
  required = false,
  options?: Array<{ label: string; value: string }>,
  validation?: FormField['validation'],
  size: '1x1' | '1x2' | '1x3' = '1x1'
): FormField => ({
  id: generateId(),
  type,
  label,
  placeholder,
  required,
  size,
  options,
  validation
});

// Helper function to create form sections
const createSection = (
  title: string,
  subtitle?: string,
  fields: FormField[] = [],
  order = 0,
  collapsed = false
): FormSection => ({
  id: generateId(),
  title,
  subtitle,
  fields,
  order,
  collapsed
});

export const FORM_TEMPLATES: FormTemplate[] = [
  {
    id: 'vendor-agreement',
    name: 'Vendor Agreement Form',
    description: 'Complete vendor agreement request form with all required sections',
    sections: [
      createSection('Agreement Information', undefined, [
        createField('dropdown', 'Customer Legal Entity', 'Select Business Unit', true, [
          { label: 'Business Unit A', value: 'bu_a' },
          { label: 'Business Unit B', value: 'bu_b' },
          { label: 'Business Unit C', value: 'bu_c' }
        ]),
        createField('dropdown', 'Region', 'Select Region', true, [
          { label: 'North America', value: 'na' },
          { label: 'Europe', value: 'eu' },
          { label: 'Asia Pacific', value: 'ap' },
          { label: 'Latin America', value: 'la' }
        ]),
        createField('dropdown', 'Currency', 'Select Currency', true, [
          { label: 'USD', value: 'usd' },
          { label: 'EUR', value: 'eur' },
          { label: 'GBP', value: 'gbp' },
          { label: 'JPY', value: 'jpy' }
        ]),
        createField('number', 'Total Agreement Value', 'Enter agreement value', true, undefined, {
          min: 0,
          pattern: '^[0-9,]+(\.[0-9]{2})?$'
        }),
        createField('date', 'Agreement Start Date', 'Start date', true),
        createField('date', 'Agreement End Date', 'End date', true),
        createField('date', 'Due Date', 'Target date', true)
      ], 1),
      
      createSection('Vendor Information', 'Vendor details and contact information', [
        createField('text', 'Vendor Legal Name', 'Enter vendor legal name', true),
        createField('text', 'Vendor Country', 'Enter vendor country', true),
        createField('email', 'Vendor Email', 'Enter vendor email', true, undefined, {
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        })
      ], 2),
      
      createSection('Approvals', undefined, [
        createField('text', 'Requester Name', 'Enter requester name', true),
        createField('radio', 'Department - Select one or more', undefined, true, [
          { label: 'Product', value: 'product' },
          { label: 'IT', value: 'it' },
          { label: 'Marketing & Sales', value: 'marketing_sales' },
          { label: 'Finance', value: 'finance' },
          { label: 'HR', value: 'hr' },
          { label: 'Operations', value: 'operations' },
          { label: 'Legal', value: 'legal' },
          { label: 'Other(s)', value: 'other' }
        ]),
        createField('dropdown', 'Approvals Received', 'Select approvals...', true, [
          { label: 'Legal Review', value: 'legal_review' },
          { label: 'Finance Approval', value: 'finance_approval' },
          { label: 'IT Security Review', value: 'it_security' },
          { label: 'Procurement Approval', value: 'procurement' }
        ])
      ], 3),
      
      createSection('Comments and Confirmations', undefined, [
        createField('textarea', 'Additional Comments', 'Enter any additional comments or special requirements...', false),
        createField('checkbox', 'Confirmation', undefined, true, [
          { label: 'I confirm that I\'ve read the full agreement and all information provided is accurate.', value: 'confirmed' }
        ])
      ], 4)
    ]
  },
  
  {
    id: 'legal-request',
    name: 'Legal Request Form',
    description: 'Multi-step legal request form with agreement details',
    sections: [
      createSection('Agreement Request Details', undefined, [
        createField('text', 'Title', 'e.g., Master Agreement_Acme Corp_2025-01-18', true)
      ], 1),
      
      createSection('Nature of Agreement', undefined, [
        createField('radio', 'Nature of Agreement(s) - Select Document Type(s)', undefined, true, [
          { label: 'Master or Framework Agreement', value: 'master_framework' },
          { label: 'Order form', value: 'order_form' },
          { label: 'Data Processing Agreement', value: 'dpa' },
          { label: 'Amendment', value: 'amendment' },
          { label: 'Statement of Work', value: 'sow' },
          { label: 'AI Addendum', value: 'ai_addendum' },
          { label: 'Other(s)', value: 'other' }
        ]),
        createField('dropdown', 'Is this a New Vendor?', 'Select: Yes / No', true, [
          { label: 'Yes', value: 'yes' },
          { label: 'No', value: 'no' }
        ]),
        createField('dropdown', 'Will Personal Data be Shared with Vendor?', 'Yes / No', true, [
          { label: 'Yes', value: 'yes' },
          { label: 'No', value: 'no' }
        ]),
        createField('dropdown', 'Does the Product/Service Involve AI?', 'Yes / No', true, [
          { label: 'Yes', value: 'yes' },
          { label: 'No', value: 'no' }
        ])
      ], 2)
    ]
  }
];

export const FIELD_TYPES = [
  {
    type: 'text' as const,
    label: 'Text Input',
    icon: '📝',
    defaultValidation: { minLength: 1 },
    defaultSize: '1x1' as const
  },
  {
    type: 'textarea' as const,
    label: 'Text Area',
    icon: '📄',
    defaultValidation: { minLength: 1 },
    defaultSize: '1x3' as const
  },
  {
    type: 'dropdown' as const,
    label: 'Dropdown',
    icon: '📋',
    defaultValidation: { minLength: 1 },
    defaultSize: '1x1' as const
  },
  {
    type: 'date' as const,
    label: 'Date Picker',
    icon: '📅',
    defaultValidation: { minLength: 1 },
    defaultSize: '1x1' as const
  },
  {
    type: 'radio' as const,
    label: 'Radio Buttons',
    icon: '🔘',
    defaultValidation: { minLength: 1 },
    defaultSize: '1x2' as const
  },
  {
    type: 'checkbox' as const,
    label: 'Checkbox',
    icon: '☑️',
    defaultValidation: { minLength: 1 },
    defaultSize: '1x1' as const
  },
  {
    type: 'file' as const,
    label: 'File Upload',
    icon: '📎',
    defaultValidation: { minLength: 1 },
    defaultSize: '1x2' as const
  },
  {
    type: 'email' as const,
    label: 'Email Input',
    icon: '📧',
    defaultValidation: { 
      pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' 
    },
    defaultSize: '1x1' as const
  },
  {
    type: 'number' as const,
    label: 'Number Input',
    icon: '🔢',
    defaultValidation: { min: 0 },
    defaultSize: '1x1' as const
  },
  {
    type: 'multiselect' as const,
    label: 'Multi-Select',
    icon: '📋',
    defaultValidation: { minLength: 1 },
    defaultSize: '1x2' as const
  }
];