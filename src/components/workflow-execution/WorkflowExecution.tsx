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
  const { updateRequest, resetRequest, saveStepData, getStepData } = useRequestStore();
  
  const workflow = workflows.find(w => w.id === request.workflowId);
  const [currentStepIndex, setCurrentStepIndex] = useState(request.currentStep);
  const [executionData, setExecutionData] = useState<Record<string, unknown>>(request.formData || {});
  
  // Restore skipped steps from request data or initialize empty set
  const [skippedSteps, setSkippedSteps] = useState<Set<number>>(() => {
    const skippedStepsData = request.formData?.skippedSteps as number[];
    return new Set(skippedStepsData || []);
  });

  // Track completed steps (steps that were actually completed, not skipped)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(() => {
    const completedStepsData = request.formData?.completedSteps as number[];
    return new Set(completedStepsData || []);
  });

  const currentStep = workflow?.nodes[currentStepIndex];
  const currentForm = currentStep?.formId ? forms.find(f => f.id === currentStep.formId) : null;

  // Load existing step data for the current step
  const existingStepData = currentStep?.id ? getStepData(request.id, currentStep.id) : null;

  // Calculate completion status
  const totalSteps = workflow?.nodes.length || 0;
  const completedStepsCount = completedSteps.size;
  const skippedStepsCount = skippedSteps.size;
  const actualCompletedSteps = completedStepsCount; // Only count actually completed steps
  const isWorkflowCompleted = actualCompletedSteps === totalSteps;

  // Sync currentStepIndex when request.currentStep changes
  useEffect(() => {
    setCurrentStepIndex(request.currentStep);
  }, [request.currentStep]);

  useEffect(() => {
    // Update request progress with skipped and completed steps
    updateRequest(request.id, {
      currentStep: currentStepIndex,
      formData: {
        ...executionData,
        skippedSteps: Array.from(skippedSteps),
        completedSteps: Array.from(completedSteps)
      },
      status: 'in-progress'
    });
  }, [currentStepIndex, executionData, skippedSteps, completedSteps, request.id, updateRequest]);

  const handleStepComplete = (stepData: Record<string, unknown>) => {
    const stepId = currentStep?.id;
    if (!stepId) return;

    // Check if current step was previously skipped
    const wasSkipped = skippedSteps.has(currentStepIndex);
    
    // Mark current step as completed
    setCompletedSteps(prev => new Set([...prev, currentStepIndex]));
    
    // If step was previously skipped, remove it from skipped steps
    if (wasSkipped) {
      setSkippedSteps(prev => {
        const newSkippedSteps = new Set(prev);
        newSkippedSteps.delete(currentStepIndex);
        return newSkippedSteps;
      });
    }

    // Save step data using Zustand
    saveStepData(request.id, stepId, stepData);

    // Update local execution data
    setExecutionData(prev => ({
      ...prev,
      [stepId]: stepData,
      skippedSteps: wasSkipped ? Array.from(skippedSteps).filter(step => step !== currentStepIndex) : Array.from(skippedSteps),
      completedSteps: Array.from([...completedSteps, currentStepIndex])
    }));

    // Move to next step
    if (currentStepIndex < (workflow?.nodes.length || 0) - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // Check if all steps are completed (excluding skipped steps)
      const newCompletedSteps = new Set([...completedSteps, currentStepIndex]);
      const newSkippedSteps = wasSkipped ? new Set([...skippedSteps].filter(step => step !== currentStepIndex)) : skippedSteps;
      const actualCompletedCount = newCompletedSteps.size;
      
      // Only mark as completed if all steps are actually completed (not skipped)
      if (actualCompletedCount === totalSteps) {
        updateRequest(request.id, {
          status: 'completed',
          currentStep: currentStepIndex + 1,
          formData: {
            ...executionData,
            [stepId]: stepData,
            skippedSteps: Array.from(newSkippedSteps),
            completedSteps: Array.from(newCompletedSteps)
          }
        });
      } else {
        // Mark as incomplete if some steps are neither completed nor skipped
        updateRequest(request.id, {
          status: 'incomplete',
          currentStep: currentStepIndex + 1,
          formData: {
            ...executionData,
            [stepId]: stepData,
            skippedSteps: Array.from(newSkippedSteps),
            completedSteps: Array.from(newCompletedSteps)
          }
        });
      }
      
      onComplete?.();
    }
  };

  const handleStepSkip = () => {
    if (currentStepIndex < (workflow?.nodes.length || 0) - 1) {
      // Mark current step as skipped
      setSkippedSteps(prev => new Set([...prev, currentStepIndex]));
      
      // Move to next step
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // If skipping the last step, mark as incomplete
      setSkippedSteps(prev => new Set([...prev, currentStepIndex]));
      
      // Mark workflow as incomplete (since we're skipping the last step)
      updateRequest(request.id, {
        status: 'incomplete',
        currentStep: currentStepIndex + 1,
        formData: {
          ...executionData,
          skippedSteps: Array.from([...skippedSteps, currentStepIndex]),
          completedSteps: Array.from(completedSteps)
        }
      });
      
      onComplete?.();
    }
  };

  const handleStepBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const getStepStatus = (stepIndex: number) => {
    if (skippedSteps.has(stepIndex)) return 'skipped';
    if (completedSteps.has(stepIndex)) return 'completed';
    if (stepIndex === currentStepIndex) return 'active';
    return 'pending';
  };

  const isCurrentStepPreviouslySkipped = () => {
    return skippedSteps.has(currentStepIndex);
  };

  const getStepIcon = (stepIndex: number) => {
    const status = getStepStatus(stepIndex);
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'active':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case 'skipped':
        return <SkipForward className="w-5 h-5 text-yellow-500" />;
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
          <p className="text-sm text-gray-500 mt-2">Workflow ID: {request.workflowId}</p>
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
          <p className="text-sm text-gray-500 mt-2">Current Step: {currentStepIndex + 1}, Total Steps: {workflow.nodes.length}</p>
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
          {/* Progress Counter */}
          <div className="mt-2 text-sm text-gray-600">
            <span className="font-medium">Progress: </span>
            <span className="text-green-600 font-semibold">{actualCompletedSteps}</span>
            <span className="text-gray-500"> completed / </span>
            <span className="text-gray-700 font-semibold">{totalSteps}</span>
            <span className="text-gray-500"> total steps</span>
            {skippedStepsCount > 0 && (
              <span className="text-yellow-600 ml-2">
                ({skippedStepsCount} skipped)
              </span>
            )}
          </div>
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
                    : getStepStatus(index) === 'skipped'
                    ? 'bg-yellow-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Step Cards */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {workflow.nodes.map((node, index) => {
            const status = getStepStatus(index);
            const form = node.formId ? forms.find(f => f.id === node.formId) : null;
            const nodeType = node.formId ? 'form' : 'decision';
            
            return (
              <div
                key={node.id}
                className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${
                  status === 'completed'
                    ? 'border-green-300 bg-green-50 shadow-md'
                    : status === 'active'
                    ? 'border-blue-300 bg-blue-50 shadow-lg'
                    : status === 'skipped'
                    ? 'border-yellow-300 bg-yellow-50 shadow-md'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                {/* Step Number Badge */}
                <div className={`absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  status === 'completed'
                    ? 'bg-green-500 text-white'
                    : status === 'active'
                    ? 'bg-blue-500 text-white'
                    : status === 'skipped'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-400 text-white'
                }`}>
                  {index + 1}
                </div>

                {/* Step Content */}
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-medium text-sm ${
                      status === 'completed'
                        ? 'text-green-800'
                        : status === 'active'
                        ? 'text-blue-800'
                        : status === 'skipped'
                        ? 'text-yellow-800'
                        : 'text-gray-600'
                    }`}>
                      {nodeType === 'form' ? (status === 'skipped' ? 'Form Step Skipped' : 'Form Step') : (status === 'skipped' ? 'Decision Step Skipped' : 'Decision Step')}
                    </h4>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : status === 'active'
                        ? 'bg-blue-100 text-blue-800'
                        : status === 'skipped'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {status === 'completed' ? 'Completed' : status === 'active' ? (isCurrentStepPreviouslySkipped() ? 'Resuming Skipped' : 'Active') : status === 'skipped' ? 'Skipped' : 'Pending'}
                    </div>
                  </div>

                  {/* Form/Decision Details */}
                  <div className="space-y-2">
                    {nodeType === 'form' && form ? (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Form Name:</p>
                        <p className={`text-sm font-medium ${
                          status === 'completed'
                            ? 'text-green-700'
                            : status === 'active'
                            ? 'text-blue-700'
                            : status === 'skipped'
                            ? 'text-yellow-700'
                            : 'text-gray-700'
                        }`}>
                          {status === 'skipped' ? `${form.name} (Skipped)` : form.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {form.sections?.length || 0} sections, {form.sections?.reduce((acc, section) => acc + (section.fields?.length || 0), 0) || 0} fields
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Decision Type:</p>
                        <p className={`text-sm font-medium ${
                          status === 'completed'
                            ? 'text-green-700'
                            : status === 'active'
                            ? 'text-blue-700'
                            : status === 'skipped'
                            ? 'text-yellow-700'
                            : 'text-gray-700'
                        }`}>
                          {status === 'skipped' ? 'Decision Point (Skipped)' : 'Decision Point'}
                        </p>
                      </div>
                    )}

                    {/* Step Description */}
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Step ID:</p>
                      <p className="text-xs text-gray-500">{node.id}</p>
                    </div>
                  </div>

                  {/* Status Icon */}
                  <div className="absolute top-4 right-4">
                    {status === 'completed' && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {status === 'active' && (
                      <AlertCircle className="w-5 h-5 text-blue-500" />
                    )}
                    {status === 'skipped' && (
                      <SkipForward className="w-5 h-5 text-yellow-500" />
                    )}
                    {status === 'pending' && (
                      <Clock className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Current Step Content */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Current Step: {currentStepIndex + 1}
            </h4>
            <p className="text-sm text-gray-600">
              {currentStep?.formId ? 'Form Step' : 'Decision Step'}
            </p>
            {isCurrentStepPreviouslySkipped() && (
              <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded-md">
                <p className="text-sm text-yellow-800 font-medium">
                  ⚠️ This step was previously skipped. Completing it will mark it as completed.
                </p>
              </div>
            )}
          </div>
          
          {currentStep ? (
            currentForm ? (
              <FormExecution 
                form={currentForm}
                onComplete={handleStepComplete}
                existingData={existingStepData}
              />
            ) : (
              <DecisionExecution 
                onComplete={handleStepComplete}
                existingData={existingStepData}
              />
            )
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Invalid Step</h3>
              <p className="text-gray-600">The current step is invalid or not found.</p>
            </div>
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
  existingData?: Record<string, unknown> | null;
}

function FormExecution({ form, onComplete, existingData }: FormExecutionProps) {
  const handleFormSubmit = (data: Record<string, unknown>) => {
    onComplete(data);
  };

  return (
    <div className="space-y-6">
      <InteractiveForm 
        form={form} 
        onSubmit={handleFormSubmit}
        className=""
        initialData={existingData}
      />
    </div>
  );
}

// Decision Execution Component
interface DecisionExecutionProps {
  onComplete: (data: Record<string, unknown>) => void;
  existingData?: Record<string, unknown> | null;
}

function DecisionExecution({ onComplete, existingData }: DecisionExecutionProps) {
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