import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Workflow, WorkflowNode, WorkflowExecution } from '@/types';

interface WorkflowStore {
  workflows: Workflow[];
  currentWorkflow: Workflow | null;
  executions: WorkflowExecution[];
  currentExecution: WorkflowExecution | null;
  
  // Workflow CRUD operations
  addWorkflow: (workflow: Workflow) => void;
  updateWorkflow: (id: string, updates: Partial<Workflow>) => void;
  deleteWorkflow: (id: string) => void;
  setCurrentWorkflow: (workflow: Workflow | null) => void;
  
  // Node operations
  addNodeToWorkflow: (workflowId: string, formId: string, position: { x: number; y: number }) => void;
  updateNodeInWorkflow: (workflowId: string, nodeId: string, updates: Partial<WorkflowNode>) => void;
  removeNodeFromWorkflow: (workflowId: string, nodeId: string) => void;
  
  // Connection operations
  addConnection: (workflowId: string, from: string, to: string) => void;
  removeConnection: (workflowId: string, from: string, to: string) => void;
  
  // Workflow execution
  startWorkflowExecution: (workflowId: string) => WorkflowExecution;
  updateExecution: (id: string, updates: Partial<WorkflowExecution>) => void;
  completeStep: (executionId: string, stepIndex: number, stepData: any) => void;
  setCurrentExecution: (execution: WorkflowExecution | null) => void;
  
  // Utility functions
  getWorkflowById: (id: string) => Workflow | undefined;
  getExecutionById: (id: string) => WorkflowExecution | undefined;
  duplicateWorkflow: (id: string) => void;
}

export const useWorkflowStore = create<WorkflowStore>()(
  persist(
    (set, get) => ({
      workflows: [],
      currentWorkflow: null,
      executions: [],
      currentExecution: null,
      
      addWorkflow: (workflow) =>
        set((state) => ({
          workflows: [...state.workflows, workflow],
        })),
      
      updateWorkflow: (id, updates) =>
        set((state) => ({
          workflows: state.workflows.map((workflow) =>
            workflow.id === id ? { ...workflow, ...updates } : workflow
          ),
          currentWorkflow: state.currentWorkflow?.id === id
            ? { ...state.currentWorkflow, ...updates }
            : state.currentWorkflow,
        })),
      
      deleteWorkflow: (id) =>
        set((state) => ({
          workflows: state.workflows.filter((workflow) => workflow.id !== id),
          currentWorkflow: state.currentWorkflow?.id === id ? null : state.currentWorkflow,
        })),
      
      setCurrentWorkflow: (workflow) =>
        set(() => ({
          currentWorkflow: workflow,
        })),
      
      addNodeToWorkflow: (workflowId, formId, position) => {
        const newNode: WorkflowNode = {
          id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          formId,
          position,
          status: 'pending',
        };
        
        set((state) => ({
          workflows: state.workflows.map((workflow) =>
            workflow.id === workflowId
              ? { ...workflow, nodes: [...workflow.nodes, newNode] }
              : workflow
          ),
          currentWorkflow: state.currentWorkflow?.id === workflowId
            ? { ...state.currentWorkflow, nodes: [...state.currentWorkflow.nodes, newNode] }
            : state.currentWorkflow,
        }));
      },
      
      updateNodeInWorkflow: (workflowId, nodeId, updates) =>
        set((state) => ({
          workflows: state.workflows.map((workflow) =>
            workflow.id === workflowId
              ? {
                  ...workflow,
                  nodes: workflow.nodes.map((node) =>
                    node.id === nodeId ? { ...node, ...updates } : node
                  ),
                }
              : workflow
          ),
          currentWorkflow: state.currentWorkflow?.id === workflowId
            ? {
                ...state.currentWorkflow,
                nodes: state.currentWorkflow.nodes.map((node) =>
                  node.id === nodeId ? { ...node, ...updates } : node
                ),
              }
            : state.currentWorkflow,
        })),
      
      removeNodeFromWorkflow: (workflowId, nodeId) =>
        set((state) => ({
          workflows: state.workflows.map((workflow) =>
            workflow.id === workflowId
              ? {
                  ...workflow,
                  nodes: workflow.nodes.filter((node) => node.id !== nodeId),
                  connections: workflow.connections.filter(
                    (conn) => conn.from !== nodeId && conn.to !== nodeId
                  ),
                }
              : workflow
          ),
          currentWorkflow: state.currentWorkflow?.id === workflowId
            ? {
                ...state.currentWorkflow,
                nodes: state.currentWorkflow.nodes.filter((node) => node.id !== nodeId),
                connections: state.currentWorkflow.connections.filter(
                  (conn) => conn.from !== nodeId && conn.to !== nodeId
                ),
              }
            : state.currentWorkflow,
        })),
      
      addConnection: (workflowId, from, to) =>
        set((state) => ({
          workflows: state.workflows.map((workflow) =>
            workflow.id === workflowId &&
            !workflow.connections.some((conn) => conn.from === from && conn.to === to)
              ? { ...workflow, connections: [...workflow.connections, { from, to }] }
              : workflow
          ),
          currentWorkflow: state.currentWorkflow?.id === workflowId &&
            !state.currentWorkflow.connections.some((conn) => conn.from === from && conn.to === to)
            ? { ...state.currentWorkflow, connections: [...state.currentWorkflow.connections, { from, to }] }
            : state.currentWorkflow,
        })),
      
      removeConnection: (workflowId, from, to) =>
        set((state) => ({
          workflows: state.workflows.map((workflow) =>
            workflow.id === workflowId
              ? {
                  ...workflow,
                  connections: workflow.connections.filter(
                    (conn) => !(conn.from === from && conn.to === to)
                  ),
                }
              : workflow
          ),
          currentWorkflow: state.currentWorkflow?.id === workflowId
            ? {
                ...state.currentWorkflow,
                connections: state.currentWorkflow.connections.filter(
                  (conn) => !(conn.from === from && conn.to === to)
                ),
              }
            : state.currentWorkflow,
        })),
      
      startWorkflowExecution: (workflowId) => {
        const execution: WorkflowExecution = {
          id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          workflowId,
          currentStepIndex: 0,
          stepData: {},
          completedSteps: [],
          status: 'in-progress',
          startedAt: new Date(),
        };
        
        set((state) => ({
          executions: [...state.executions, execution],
          currentExecution: execution,
        }));
        
        return execution;
      },
      
      updateExecution: (id, updates) =>
        set((state) => ({
          executions: state.executions.map((execution) =>
            execution.id === id ? { ...execution, ...updates } : execution
          ),
          currentExecution: state.currentExecution?.id === id
            ? { ...state.currentExecution, ...updates }
            : state.currentExecution,
        })),
      
      completeStep: (executionId, stepIndex, stepData) =>
        set((state) => {
          const execution = state.executions.find((e) => e.id === executionId);
          if (!execution) return state;
          
          const workflow = get().getWorkflowById(execution.workflowId);
          if (!workflow) return state;
          
          const newStepData = { ...execution.stepData, [stepIndex]: stepData };
          const newCompletedSteps = [...execution.completedSteps, stepIndex.toString()];
          const isLastStep = stepIndex >= workflow.nodes.length - 1;
          
          const updates: Partial<WorkflowExecution> = {
            stepData: newStepData,
            completedSteps: newCompletedSteps,
            currentStepIndex: isLastStep ? stepIndex : stepIndex + 1,
            status: isLastStep ? 'completed' : 'in-progress',
            completedAt: isLastStep ? new Date() : undefined,
          };
          
          return {
            executions: state.executions.map((exec) =>
              exec.id === executionId ? { ...exec, ...updates } : exec
            ),
            currentExecution: state.currentExecution?.id === executionId
              ? { ...state.currentExecution, ...updates }
              : state.currentExecution,
          };
        }),
      
      setCurrentExecution: (execution) =>
        set(() => ({
          currentExecution: execution,
        })),
      
      getWorkflowById: (id) => get().workflows.find((workflow) => workflow.id === id),
      
      getExecutionById: (id) => get().executions.find((execution) => execution.id === id),
      
      duplicateWorkflow: (id) => {
        const workflow = get().getWorkflowById(id);
        if (workflow) {
          const duplicatedWorkflow: Workflow = {
            ...workflow,
            id: `${workflow.id}_copy_${Date.now()}`,
            name: `${workflow.name} (Copy)`,
            status: 'draft',
            createdAt: new Date(),
          };
          get().addWorkflow(duplicatedWorkflow);
        }
      },
    }),
    {
      name: 'workflow-store',
    }
  )
);