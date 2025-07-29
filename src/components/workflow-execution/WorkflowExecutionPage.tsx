'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWorkflowStore } from '@/stores/workflowStore';
import { WorkflowStepper } from './WorkflowStepper';
import { Workflow, WorkflowExecution } from '@/types';
import { Play, Clock, CheckCircle, RotateCcw, ArrowLeft, GitBranch } from 'lucide-react';

export function WorkflowExecutionPage() {
  const { workflows, executions, currentExecution, setCurrentExecution } = useWorkflowStore();
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

  const getExecutionStatus = (execution: WorkflowExecution) => {
    switch (execution.status) {
      case 'completed':
        return { label: 'Completed', color: 'bg-green-100 text-green-800' };
      case 'in-progress':
        return { label: 'In Progress', color: 'bg-blue-100 text-blue-800' };
      case 'paused':
        return { label: 'Paused', color: 'bg-yellow-100 text-yellow-800' };
      default:
        return { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const handleWorkflowSelect = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
  };

  const handleBackToList = () => {
    setSelectedWorkflow(null);
    setCurrentExecution(null);
  };

  const handleBackToWorkflows = () => {
    setSelectedWorkflow(null);
    setCurrentExecution(null);
  };

  const getWorkflowProgress = (workflow: Workflow) => {
    const workflowExecutions = executions.filter(e => e.workflowId === workflow.id);
    const completedExecutions = workflowExecutions.filter(e => e.status === 'completed');
    return {
      total: workflowExecutions.length,
      completed: completedExecutions.length,
    };
  };

  // If a workflow is selected or there's a current execution, show the stepper
  if (selectedWorkflow || currentExecution) {
    const workflowForExecution = selectedWorkflow || 
      workflows.find(w => w.id === currentExecution?.workflowId);
    
    if (!workflowForExecution) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500">Workflow not found</p>
            <Button onClick={handleBackToList} className="mt-4">
              Back to Workflows
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <Button
            variant="ghost"
            onClick={handleBackToList}
            className="mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Workflow List
          </Button>
        </div>
        
        <div className="flex-1 overflow-auto">
          <WorkflowStepper
            workflow={workflowForExecution}
            execution={currentExecution || undefined}
            onComplete={(execution) => {
              console.log('Workflow completed:', execution);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Execute Workflows</h1>
            <p className="text-gray-600 mt-1">
              Run your workflows step by step with guided form completion
            </p>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>{workflows.length} available workflows</span>
            <span>{executions.length} total executions</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        {workflows.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <GitBranch className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                No Workflows Available
              </h2>
              <p className="text-gray-500 mb-6">
                Create workflows in the Workflow Designer before you can execute them.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workflows.map((workflow) => {
                const progress = getWorkflowProgress(workflow);
                const latestExecution = executions
                  .filter(e => e.workflowId === workflow.id)
                  .sort((a, b) => new Date(b.startedAt || 0).getTime() - new Date(a.startedAt || 0).getTime())[0];
                
                return (
                  <Card key={workflow.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="space-y-4">
                      {/* Workflow Header */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-800 truncate">
                            {workflow.name}
                          </h3>
                          <Badge 
                            variant={workflow.status === 'active' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {workflow.status}
                          </Badge>
                        </div>
                        
                        {workflow.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {workflow.description}
                          </p>
                        )}
                      </div>

                      {/* Workflow Stats */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Steps:</span>
                          <span className="font-medium">{workflow.nodes.length}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Executions:</span>
                          <span className="font-medium">{progress.total}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Completed:</span>
                          <span className="font-medium text-green-600">{progress.completed}</span>
                        </div>
                      </div>

                      {/* Latest Execution Status */}
                      {latestExecution && (
                        <div className="border-t pt-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Latest run:</span>
                            <div className="flex items-center space-x-1">
                              {(() => {
                                const status = getExecutionStatus(latestExecution);
                                const Icon = status.label === 'In Progress' ? Clock : status.label === 'Completed' ? CheckCircle : status.label === 'Paused' ? RotateCcw : Clock;
                                return (
                                  <>
                                    <Icon className={`w-3 h-3 ${status.color}`} />
                                    <span className={`text-xs font-medium ${status.color}`}>
                                      {status.label}
                                    </span>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                          
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDate(latestExecution.startedAt!)}
                          </div>
                          
                          {latestExecution.status === 'in-progress' && (
                            <div className="mt-2">
                              <div className="text-xs text-gray-500 mb-1">
                                Step {latestExecution.currentStepIndex + 1} of {workflow.nodes.length}
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                  style={{
                                    width: `${(latestExecution.completedSteps.length / workflow.nodes.length) * 100}%`
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleWorkflowSelect(workflow)}
                          className="flex-1"
                          disabled={workflow.nodes.length === 0}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Execute
                        </Button>
                        
                        {latestExecution && latestExecution.status === 'in-progress' && (
                          <Button
                            variant="outline"
                            onClick={() => {
                              setCurrentExecution(latestExecution);
                              setSelectedWorkflow(workflow);
                            }}
                          >
                            Continue
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Recent Executions */}
            {executions.length > 0 && (
              <div className="mt-12">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Recent Executions</h2>
                
                <div className="space-y-3">
                  {executions
                    .sort((a, b) => new Date(b.startedAt || 0).getTime() - new Date(a.startedAt || 0).getTime())
                    .slice(0, 10)
                    .map((execution) => {
                      const workflow = workflows.find(w => w.id === execution.workflowId);
                      const status = getExecutionStatus(execution);
                      const Icon = status.label === 'In Progress' ? Clock : status.label === 'Completed' ? CheckCircle : status.label === 'Paused' ? RotateCcw : Clock;
                      
                      return (
                        <Card key={execution.id} className={`p-4 ${status.color} border`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Icon className={`w-5 h-5 ${status.color}`} />
                              <div>
                                <h4 className="font-medium text-gray-800">
                                  {workflow?.name || 'Unknown Workflow'}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  Started {formatDate(execution.startedAt!)}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <div className="text-sm font-medium text-gray-800">
                                  {execution.completedSteps.length} of {workflow?.nodes.length || 0} steps
                                </div>
                                <div className={`text-xs ${status.color}`}>
                                  {status.label}
                                </div>
                              </div>
                              
                              {execution.status === 'in-progress' && workflow && (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setCurrentExecution(execution);
                                    setSelectedWorkflow(workflow);
                                  }}
                                >
                                  Resume
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}