export interface FormElement {
  id: string;
  type: 'short-text' | 'long-text' | 'date' | 'dropdown' | 'number' | 'email' | 'phone' | 'checkbox' | 'radio' | 'file-upload' | 'signature' | 'divider' | 'heading' | 'paragraph' | 'company-info' | 'contact-info' | 'address' | 'terms' | 'agreement-type';
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
    width?: 'full' | 'half' | 'third' | 'quarter'; // For layout control
    autoFill?: boolean; // For auto-filling fields
    conditional?: {
      dependsOn: string;
      showWhen: string;
    };
  };
}

export interface FormComponent {
  id: string;
  type: 'section' | 'group' | 'grid' | 'tabs' | 'accordion' | 'row' | 'part';
  title: string;
  description?: string;
  elements: FormElement[];
  settings?: {
    columns?: number; // For grid
    collapsible?: boolean; // For accordion
    defaultOpen?: boolean; // For accordion
    layout?: 'horizontal' | 'vertical' | 'side-by-side';
    fieldSpacing?: 'compact' | 'normal' | 'spacious';
    responsive?: boolean; // For mobile responsiveness
    isPart?: boolean; // For multi-part forms
    partNumber?: number; // Part number in the form
    autoSave?: boolean; // Auto-save part data
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
    multiPart?: boolean; // Enable multi-part form structure
    parts?: {
      total: number;
      current: number;
      titles: string[];
    };
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
  settings?: {
    autoAdvance?: boolean; // Auto-advance to next step
    requireApproval?: boolean; // Require approval before next step
    conditional?: {
      dependsOn: string;
      showWhen: string;
    };
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
  settings?: {
    type: 'procurement' | 'vendor-agreement' | 'nda' | 'custom';
    category: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    estimatedDuration?: number; // in hours
    assignees?: string[];
    autoAssign?: boolean;
  };
}

export interface FieldType {
  type: 'short-text' | 'long-text' | 'date' | 'dropdown' | 'number' | 'email' | 'phone' | 'checkbox' | 'radio' | 'file-upload' | 'signature' | 'divider' | 'heading' | 'paragraph' | 'company-info' | 'contact-info' | 'address' | 'terms' | 'agreement-type';
  label: string;
  icon: string;
  category: 'basic' | 'advanced' | 'layout' | 'media' | 'business' | 'legal';
  description: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  currentStepIndex: number;
  stepData: Record<string, any>;
  completedSteps: string[];
  status: 'idle' | 'in-progress' | 'completed' | 'error' | 'paused';
  startedAt?: Date;
  completedAt?: Date;
  pausedAt?: Date;
  resumedAt?: Date;
  assignee?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  estimatedCompletion?: Date;
}

export interface DashboardStats {
  pendingAssignments: number;
  withLegal: number;
  withProcurement: number;
  completedLast30Days: number;
  cancelled: number;
  activeMattersByDepartment: Record<string, number>;
  activeMattersByDocumentType: Record<string, number>;
  criticalMatters: number;
  mattersTrendline: Array<{
    month: string;
    created: number;
    completed: number;
    active: number;
  }>;
}