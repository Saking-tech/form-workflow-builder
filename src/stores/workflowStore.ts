import { create } from 'zustand';
import { Workflow, WorkflowNode } from '@/types';
import { persistStore } from '@/lib/persistStore';

interface WorkflowStore {
  workflows: Workflow[];
  currentWorkflow: Workflow | null;
  addWorkflow: (workflow: Workflow) => void;
  updateWorkflow: (id: string, updates: Partial<Workflow>) => void;
  deleteWorkflow: (id: string) => void;
  setCurrentWorkflow: (workflow: Workflow | null) => void;
  addNodeToWorkflow: (workflowId: string, formId: string, position: { x: number; y: number }) => void;
  updateNodeInWorkflow: (workflowId: string, nodeId: string, updates: Partial<WorkflowNode>) => void;
  removeNodeFromWorkflow: (workflowId: string, nodeId: string) => void;
  addConnectionToWorkflow: (workflowId: string, from: string, to: string) => void;
  removeConnectionFromWorkflow: (workflowId: string, from: string, to: string) => void;
}

export const useWorkflowStore = create<WorkflowStore>(
  persistStore<WorkflowStore>('workflowStore', (set, get) => ({
  workflows: [],
  currentWorkflow: null,
  
  addWorkflow: (workflow) => set((state) => ({
    workflows: [...state.workflows, workflow]
  })),
  
  updateWorkflow: (id, updates) => set((state) => ({
    workflows: state.workflows.map(workflow => 
      workflow.id === id ? { ...workflow, ...updates } : workflow
    )
  })),
  
  deleteWorkflow: (id) => set((state) => ({
    workflows: state.workflows.filter(workflow => workflow.id !== id)
  })),
  
  setCurrentWorkflow: (workflow) => set({ currentWorkflow: workflow }),
  
  addNodeToWorkflow: (workflowId, formId, position) => set((state) => ({
    workflows: state.workflows.map(workflow => 
      workflow.id === workflowId 
        ? { 
            ...workflow, 
            nodes: [...workflow.nodes, {
              id: `node-${Date.now()}`,
              formId,
              position,
              status: 'pending'
            }]
          }
        : workflow
    )
  })),
  
  updateNodeInWorkflow: (workflowId, nodeId, updates) => set((state) => ({
    workflows: state.workflows.map(workflow => 
      workflow.id === workflowId 
        ? { 
            ...workflow, 
            nodes: workflow.nodes.map(node => 
              node.id === nodeId ? { ...node, ...updates } : node
            )
          }
        : workflow
    )
  })),
  
  removeNodeFromWorkflow: (workflowId, nodeId) => set((state) => ({
    workflows: state.workflows.map(workflow => 
      workflow.id === workflowId 
        ? { 
            ...workflow, 
            nodes: workflow.nodes.filter(node => node.id !== nodeId),
            connections: workflow.connections.filter(
              conn => conn.from !== nodeId && conn.to !== nodeId
            )
          }
        : workflow
    )
  })),
  
  addConnectionToWorkflow: (workflowId, from, to) => set((state) => ({
    workflows: state.workflows.map(workflow => 
      workflow.id === workflowId 
        ? { 
            ...workflow, 
            connections: [...workflow.connections, { from, to }]
          }
        : workflow
    )
  })),
  
  removeConnectionFromWorkflow: (workflowId, from, to) => set((state) => ({
    workflows: state.workflows.map(workflow => 
      workflow.id === workflowId 
        ? { 
            ...workflow, 
            connections: workflow.connections.filter(
              conn => !(conn.from === from && conn.to === to)
            )
          }
        : workflow
    )
  }))
})));