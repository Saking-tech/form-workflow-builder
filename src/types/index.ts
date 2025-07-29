export interface FormField {
  id: string;
  type: 'text' | 'select' | 'date' | 'file';
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  options?: Array<{
    label: string;
    value: string;
  }>; // For select fields
}

export interface Form {
  id: string;
  name: string;
  description?: string;
  fields: FormField[];
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
  type: 'text' | 'select' | 'date' | 'file';
  label: string;
  icon: string;
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