export interface FormElement {
  id: string;
  type: 'short-text' | 'long-text' | 'date' | 'dropdown' | 'number' | 'email' | 'phone' | 'checkbox' | 'radio' | 'file-upload' | 'signature' | 'divider' | 'heading' | 'paragraph';
  label: string;
  placeholder?: string;
  required: boolean;
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
  }>; // For dropdown, radio fields
  defaultValue?: string | number | boolean;
  helpText?: string;
  settings?: {
    multiline?: boolean;
    rows?: number;
    accept?: string; // For file upload
    multiple?: boolean; // For file upload
  };
}

export interface FormComponent {
  id: string;
  type: 'section' | 'group' | 'grid' | 'tabs' | 'accordion';
  title: string;
  description?: string;
  elements: FormElement[];
  settings?: {
    columns?: number; // For grid
    collapsible?: boolean; // For accordion
    defaultOpen?: boolean; // For accordion
    layout?: 'horizontal' | 'vertical';
  };
}

export interface Form {
  id: string;
  name: string;
  description?: string;
  components: FormComponent[];
  settings?: {
    theme?: 'default' | 'modern' | 'minimal' | 'corporate';
    layout?: 'single-column' | 'two-column' | 'responsive';
    showProgress?: boolean;
    allowSave?: boolean;
    allowPrint?: boolean;
  };
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
  handles?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
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

export interface FieldType {
  type: 'short-text' | 'long-text' | 'date' | 'dropdown' | 'number' | 'email' | 'phone' | 'checkbox' | 'radio' | 'file-upload' | 'signature' | 'divider' | 'heading' | 'paragraph';
  label: string;
  icon: string;
  category: 'basic' | 'advanced' | 'layout' | 'media';
  description: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  currentStepIndex: number;
  stepData: Record<string, any>;
  completedSteps: string[];
  status: 'idle' | 'in-progress' | 'completed' | 'error';
  startedAt?: Date;
  completedAt?: Date;
}