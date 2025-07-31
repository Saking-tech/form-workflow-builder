'use client';

import { useState, useEffect } from 'react';
import { useFormStore } from '@/stores/formStore';
import { useWorkflowStore } from '@/stores/workflowStore';
import { useRequestStore } from '@/stores/requestStore';
import { Request, Form } from '@/types';
import { 
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
}

export default function WorkflowExecution({ request, onComplete }: WorkflowExecutionProps) {
  const { workflows } = useWorkflowStore();
  const { forms } = useFormStore();
  const { updateRequest, resetRequest } = useRequestStore();
  
  const workflow = workflows.find(w => w.id === request.workflowId);
  const [currentStepIndex, setCurrentStepIndex] = useState(request.currentStep);
  const [executionData, setExecutionData] = useState<Record<string, unknown>>(request.formData || {});

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

    // Move to next step
    if (currentStepIndex < (workflow?.nodes.length || 0) - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // Workflow completed - reset for multiple executions
      updateRequest(request.id, {
        status: 'completed',
        currentStep: currentStepIndex + 1
      });
      
      // Reset the request after a short delay to allow for multiple executions
      setTimeout(() => {
        resetRequest(request.id);
        setCurrentStepIndex(0);
        setExecutionData({});
      }, 2000);
      
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
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'active':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  if (!workflow) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Workflow Not Found</h3>
          <p className="text-gray-600">The requested workflow could not be found.</p>
        </div>
      </div>
    );
  }

  if (!currentStep) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Invalid Step</h3>
          <p className="text-gray-600">The current step is invalid or not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
          <p className="text-sm text-gray-600">Step {currentStepIndex + 1} of {workflow.nodes.length}</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            {workflow.nodes.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  getStepStatus(index) === 'completed'
                    ? 'bg-green-500'
                    : getStepStatus(index) === 'active'
                    ? 'bg-blue-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          {workflow.nodes.map((node, index) => (
            <div key={node.id} className="flex items-center space-x-2">
              {getStepIcon(index)}
              <span className={`text-sm ${
                getStepStatus(index) === 'completed'
                  ? 'text-green-600 font-medium'
                  : getStepStatus(index) === 'active'
                  ? 'text-blue-600 font-medium'
                  : 'text-gray-500'
              }`}>
                Step {index + 1}
              </span>
              {index < workflow.nodes.length - 1 && (
                <ArrowRight className="w-4 h-4 text-gray-400" />
              )}
            </div>
          ))}
        </div>

        {/* Current Step Content */}
        <div className="bg-gray-50 rounded-lg p-6">
          {currentForm ? (
            <FormExecution 
              form={currentForm}
              onComplete={handleStepComplete}
            />
          ) : (
            <DecisionExecution 
              onComplete={handleStepComplete}
            />
          )}
        </div>
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
  form: Form;
  onComplete: (data: Record<string, unknown>) => void;
}

function FormExecution({ form, onComplete }: FormExecutionProps) {
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
    </div>
  );
}

// Decision Execution Component
interface DecisionExecutionProps {
  onComplete: (data: Record<string, unknown>) => void;
}

function DecisionExecution({ onComplete }: DecisionExecutionProps) {
  const handleDecision = (value: string) => {
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
    </div>
  );
}