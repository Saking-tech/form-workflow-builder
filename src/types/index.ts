export interface FormField {
  id: string;
  type: 'text' | 'select' | 'date' | 'file' | 'textarea' | 'radio' | 'checkbox' | 'dropdown' | 'multiselect' | 'email' | 'number';
  label: string;
  placeholder?: string;
  required: boolean;
  size: '1x1' | '1x2' | '1x3'; // Grid size for the field
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
  options?: Array<{
    label: string;
    value: string;
  }>;
  section?: string; // For grouping fields into sections
  order?: number; // For field ordering within sections
}

export interface FormSection {
  id: string;
  title: string;
  subtitle?: string;
  fields: FormField[];
  order: number;
  collapsed?: boolean; // For collapsible sections
}

export interface Form {
  id: string;
  name: string;
  description?: string;
  sections: FormSection[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowNode {
  id: string;
  formId: string;
  position: {
    x: number;
    y: number;
  };
  status: 'pending' | 'completed' | 'active';
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  connections: Array<{
    from: string;
    to: string;
  }>;
  status: 'draft' | 'active' | 'completed';
  createdAt: Date;
}

export interface Request {
  id: string;
  title: string;
  workflowId: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'incomplete';
  currentStep: number;
  formData: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface FieldType {
  type: FormField['type'];
  label: string;
  icon: string;
  defaultValidation?: Partial<FormField['validation']>;
}

// Predefined form templates based on the UI inspiration images
export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  sections: FormSection[];
}

// Workflow template interface
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  connections: Array<{ from: string; to: string }>;
}