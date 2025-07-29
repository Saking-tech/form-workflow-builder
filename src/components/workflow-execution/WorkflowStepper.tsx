'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useFormStore } from '@/stores/formStore';
import { useWorkflowStore } from '@/stores/workflowStore';
import { DynamicFormRenderer } from '../form-renderer/DynamicFormRenderer';
import { Workflow, WorkflowExecution } from '@/types';
import { CheckCircle, Circle, Clock, ArrowRight, ArrowLeft, Play, RotateCcw } from 'lucide-react';

interface WorkflowStepperProps {
  workflow: Workflow;
  execution?: WorkflowExecution;
  onComplete?: (execution: WorkflowExecution) => void;
}

interface StepIndicatorProps {
  step: number;
  status: 'completed' | 'active' | 'pending';
  label: string;
  isLast?: boolean;
  onClick?: () => void;
}

function StepIndicator({ step, status, label, isLast, onClick }: StepIndicatorProps) {
  const getIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-white" />;
      case 'active':
        return <Clock className="w-6 h-6 text-white" />;
      default:
        return <Circle className="w-6 h-6 text-white" />;
    }
  };

  const getColors = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 border-green-500';
      case 'active':
        return 'bg-blue-500 border-blue-500';
      default:
        return 'bg-gray-300 border-gray-300';
    }
  };

  return (
    <div className="flex items-center">
      <div
        className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors cursor-pointer ${getColors()}`}
        onClick={onClick}
      >
        {getIcon()}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
          <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
            {label}
          </span>
        </div>
      </div>
      
      {!isLast && (
        <div className={`flex-1 h-0.5 mx-4 ${
          status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
        }`} />
      )}
    </div>
  );
}

export function WorkflowStepper({ workflow, execution: initialExecution, onComplete }: WorkflowStepperProps) {
  const { forms } = useFormStore();
  const { startWorkflowExecution, completeStep, currentExecution, setCurrentExecution } = useWorkflowStore();
  
  const [execution, setExecution] = useState<WorkflowExecution | null>(initialExecution || null);
  const [currentStepData, setCurrentStepData] = useState<any>({});

  useEffect(() => {
    if (initialExecution) {
      setExecution(initialExecution);
    } else if (currentExecution) {
      setExecution(currentExecution);
    }
  }, [initialExecution, currentExecution]);

  const startExecution = () => {
    const newExecution = startWorkflowExecution(workflow.id);
    setExecution(newExecution);
  };

  const restartExecution = () => {
    const newExecution = startWorkflowExecution(workflow.id);
    setExecution(newExecution);
    setCurrentStepData({});
  };

  const handleStepComplete = (formData: any) => {
    if (!execution) return;

    // Complete the current step
    completeStep(execution.id, execution.currentStepIndex, formData);
    
    // Update local state
    setExecution(prev => {
      if (!prev) return null;
      
      const isLastStep = execution.currentStepIndex >= workflow.nodes.length - 1;
      const newExecution = {
        ...prev,
        stepData: { ...prev.stepData, [execution.currentStepIndex]: formData },
        completedSteps: [...prev.completedSteps, execution.currentStepIndex.toString()],
        currentStepIndex: isLastStep ? execution.currentStepIndex : execution.currentStepIndex + 1,
        status: isLastStep ? 'completed' as const : 'in-progress' as const,
        completedAt: isLastStep ? new Date() : undefined,
      };
      
      if (isLastStep && onComplete) {
        onComplete(newExecution);
      }
      
      return newExecution;
    });
    
    setCurrentStepData({});
  };

  const goToStep = (stepIndex: number) => {
    if (!execution || stepIndex > execution.completedSteps.length) return;
    
    setExecution(prev => prev ? {
      ...prev,
      currentStepIndex: stepIndex,
      status: stepIndex < workflow.nodes.length ? 'in-progress' : 'completed'
    } : null);
  };

  const getStepStatus = (stepIndex: number): 'completed' | 'active' | 'pending' => {
    if (!execution) return 'pending';
    
    if (execution.completedSteps.includes(stepIndex.toString())) {
      return 'completed';
    } else if (stepIndex === execution.currentStepIndex && execution.status === 'in-progress') {
      return 'active';
    } else {
      return 'pending';
    }
  };

  const currentNode = workflow.nodes[execution?.currentStepIndex || 0];
  const currentForm = currentNode ? forms.find(f => f.id === currentNode.formId) : null;
  const progressPercentage = execution 
    ? Math.round((execution.completedSteps.length / workflow.nodes.length) * 100)
    : 0;

  if (!execution) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-8 text-center">
          <div className="mb-6">
            <Play className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Ready to Execute Workflow
            </h2>
            <p className="text-gray-600">
              This workflow contains {workflow.nodes.length} step{workflow.nodes.length !== 1 ? 's' : ''}.
              Click the button below to begin.
            </p>
          </div>
          
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-gray-700">Workflow Steps:</h3>
            <div className="space-y-2">
              {workflow.nodes.map((node, index) => {
                const form = forms.find(f => f.id === node.formId);
                return (
                  <div key={node.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">{index + 1}</Badge>
                      <span className="font-medium">{form?.name || 'Unknown Form'}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {form?.fields.length || 0} field{(form?.fields.length || 0) !== 1 ? 's' : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <Button onClick={startExecution} size="lg">
            <Play className="w-5 h-5 mr-2" />
            Start Workflow
          </Button>
        </Card>
      </div>
    );
  }

  if (execution.status === 'completed') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Workflow Completed!
          </h2>
          <p className="text-gray-600 mb-6">
            All {workflow.nodes.length} steps have been completed successfully.
          </p>
          
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-gray-700">Summary:</h3>
            <div className="text-left space-y-2">
              {workflow.nodes.map((node, index) => {
                const form = forms.find(f => f.id === node.formId);
                const stepData = execution.stepData[index];
                
                return (
                  <div key={node.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="font-medium">{form?.name || 'Unknown Form'}</span>
                      </div>
                      <Badge variant="outline">Step {index + 1}</Badge>
                    </div>
                    {stepData && (
                      <div className="text-sm text-gray-600">
                        {Object.keys(stepData).length} field{Object.keys(stepData).length !== 1 ? 's' : ''} completed
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="flex space-x-4 justify-center">
            <Button variant="outline" onClick={restartExecution}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Run Again
            </Button>
            <Button onClick={() => setCurrentExecution(null)}>
              Back to Workflows
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            {workflow.name} - Execution
          </h1>
          <Badge variant="secondary">
            Step {execution.currentStepIndex + 1} of {workflow.nodes.length}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Progress</span>
            <span>{progressPercentage}% Complete</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="mb-8 px-4">
        <div className="flex items-center justify-between relative pb-8">
          {workflow.nodes.map((node, index) => {
            const form = forms.find(f => f.id === node.formId);
            return (
              <StepIndicator
                key={node.id}
                step={index + 1}
                status={getStepStatus(index)}
                label={form?.name || 'Unknown Form'}
                isLast={index === workflow.nodes.length - 1}
                onClick={() => goToStep(index)}
              />
            );
          })}
        </div>
      </div>

      {/* Current Step Content */}
      <Card className="p-6">
        {currentForm ? (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {currentForm.name}
              </h2>
              {currentForm.description && (
                <p className="text-gray-600">
                  {currentForm.description}
                </p>
              )}
            </div>
            
            <DynamicFormRenderer
              form={currentForm}
              initialData={currentStepData}
              onSubmit={handleStepComplete}
              submitButtonText={
                execution.currentStepIndex === workflow.nodes.length - 1 
                  ? 'Complete Workflow' 
                  : 'Continue to Next Step'
              }
            />
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Form not found for this step.</p>
          </div>
        )}
      </Card>
    </div>
  );
}