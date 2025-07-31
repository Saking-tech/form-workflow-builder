'use client';

import { useState, useEffect } from 'react';
import { useFormStore } from '@/stores/formStore';
import { useWorkflowStore } from '@/stores/workflowStore';
import { useRequestStore } from '@/stores/requestStore';
import { Workflow, WorkflowNode, Request } from '@/types';
import { 
  Play, 
  Pause, 
  SkipForward, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import InteractiveForm from '@/components/form-interactive/InteractiveForm';

interface WorkflowExecutionProps {
  request: Request;
  onComplete?: () => void;
  onClose?: () => void;
}

export default function WorkflowExecution({ request, onComplete, onClose }: WorkflowExecutionProps) {
  const { workflows } = useWorkflowStore();
  const { forms } = useFormStore();
  const { updateRequest } = useRequestStore();
  
  const workflow = workflows.find(w => w.id === request.workflowId);
  const [currentStepIndex, setCurrentStepIndex] = useState(request.currentStep);
  const [executionData, setExecutionData] = useState<Record<string, unknown>>(request.formData || {});
  const [isExecuting, setIsExecuting] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const currentStep = workflow?.nodes[currentStepIndex];
  const currentForm = currentStep?.formId ? forms.find(f => f.id === currentStep.formId) : null;

  useEffect(() => {
    // Update request progress
    updateRequest(request.id, {
      currentStep: currentStepIndex,
      formData: executionData
    });
  }, [currentStepIndex, executionData, request.id, updateRequest]);

  const handleStepComplete = (stepData: Record<string, unknown>) => {
    const stepId = currentStep?.id;
    if (!stepId) return;

    // Save step data
    setExecutionData(prev => ({
      ...prev,
      [stepId]: stepData
    }));

    // Mark step as completed
    setCompletedSteps(prev => [...prev, stepId]);

    // Move to next step
    if (currentStepIndex < (workflow?.nodes.length || 0) - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // Workflow completed
      updateRequest(request.id, {
        status: 'completed',
        currentStep: currentStepIndex + 1
      });
      onComplete?.();
    }
  };

  const handleStepSkip = () => {
    if (currentStepIndex < (workflow?.nodes.length || 0) - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleStepBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'active';
    return 'pending';
  };

  const getStepIcon = (stepIndex: number) => {
    const status = getStepStatus(stepIndex);
    const step = workflow?.nodes[stepIndex];
    
    if (status === 'completed') return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (status === 'active') return <Play className="w-5 h-5 text-blue-600" />;
    return <Clock className="w-5 h-5 text-gray-400" />;
  };

  if (!workflow) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Workflow Not Found</h3>
        <p className="text-gray-600">The workflow for this request could not be found.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Workflow Execution</h2>
          <p className="text-sm text-gray-600">{request.title}</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-4 overflow-x-auto">
          {workflow.nodes.map((node, index) => (
            <div key={node.id} className="flex items-center space-x-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                getStepStatus(index) === 'completed' ? 'bg-green-100' :
                getStepStatus(index) === 'active' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                {getStepIcon(index)}
              </div>
              <div className="text-sm">
                <div className={`font-medium ${
                  getStepStatus(index) === 'completed' ? 'text-green-600' :
                  getStepStatus(index) === 'active' ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {node.formId ? forms.find(f => f.id === node.formId)?.name : 'Step ' + (index + 1)}
                </div>
                <div className="text-xs text-gray-500 capitalize">{getStepStatus(index)}</div>
              </div>
              {index < workflow.nodes.length - 1 && (
                <ArrowRight className="w-4 h-4 text-gray-300" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current Step Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {currentStep && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Step {currentStepIndex + 1}: {currentForm?.name || 'Process Step'}
              </h3>
              <p className="text-gray-600">
                {currentForm?.description || 'Complete this step to continue the workflow'}
              </p>
            </div>

            {currentForm ? (
              <FormExecution
                form={currentForm}
                initialData={executionData[currentStep.id] as Record<string, unknown> || {} as Record<string, unknown>}
                onComplete={handleStepComplete}
                onSkip={handleStepSkip}
              />
            ) : (
              <DecisionExecution
                node={currentStep}
                onComplete={handleStepComplete}
                onSkip={handleStepSkip}
              />
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-white">
        <button
          onClick={handleStepBack}
          disabled={currentStepIndex === 0}
          className={`flex items-center px-4 py-2 rounded-md ${
            currentStepIndex === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </button>

        <div className="text-sm text-gray-600">
          Step {currentStepIndex + 1} of {workflow.nodes.length}
        </div>

        <button
          onClick={handleStepSkip}
          className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
        >
          <SkipForward className="w-4 h-4 mr-2" />
          Skip Step
        </button>
      </div>
    </div>
  );
}

// Form Execution Component
interface FormExecutionProps {
  form: any; // Changed from Record<string, unknown> to any to match InteractiveForm
  initialData: Record<string, unknown>;
  onComplete: (data: Record<string, unknown>) => void;
  onSkip: () => void;
}

function FormExecution({ form, initialData, onComplete, onSkip }: FormExecutionProps) {
  const handleFormSubmit = (data: Record<string, unknown>) => {
    onComplete(data);
  };

  return (
    <div className="space-y-6">
      <InteractiveForm 
        form={form} 
        onSubmit={handleFormSubmit}
        className=""
      />
      
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button
          onClick={onSkip}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Skip Step
        </button>
      </div>
    </div>
  );
}

// Decision Execution Component
interface DecisionExecutionProps {
  node: WorkflowNode;
  onComplete: (data: Record<string, unknown>) => void;
  onSkip: () => void;
}

function DecisionExecution({ node, onComplete, onSkip }: DecisionExecutionProps) {
  const [decision, setDecision] = useState('');

  const handleDecision = (value: string) => {
    setDecision(value);
    onComplete({ decision: value });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">Decision Point</h4>
      <p className="text-gray-600 mb-6">Please make a decision to continue the workflow.</p>
      
      <div className="space-y-4">
        <button
          onClick={() => handleDecision('approve')}
          className="w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Approve
        </button>
        <button
          onClick={() => handleDecision('reject')}
          className="w-full px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Reject
        </button>
        <button
          onClick={() => handleDecision('review')}
          className="w-full px-4 py-3 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
        >
          Send for Review
        </button>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={onSkip}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Skip Decision
        </button>
      </div>
    </div>
  );
}