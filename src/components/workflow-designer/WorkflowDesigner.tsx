'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  Panel,
  NodeMouseHandler,
  EdgeMouseHandler
} from '@xyflow/react';
import { useFormStore } from '@/stores/formStore';
import { useWorkflowStore } from '@/stores/workflowStore';
import { useRequestStore } from '@/stores/requestStore';
import { Workflow, Request } from '@/types';
import { generateId } from '@/lib/utils';
import { Plus, Save, Play, X, FileText } from 'lucide-react';
import FormNode from '@/components/workflow-designer/FormNode';
import StartNode from '@/components/workflow-designer/StartNode';
import EndNode from '@/components/workflow-designer/EndNode';
import DecisionNode from '@/components/workflow-designer/DecisionNode';

const nodeTypes = {
  formNode: FormNode,
  startNode: StartNode,
  endNode: EndNode,
  decisionNode: DecisionNode
};

interface WorkflowDesignerProps {
  workflow?: Workflow;
  onSave?: (workflow: Workflow) => void;
  onSaveAsTemplate?: (templateName: string, templateDescription: string) => void;
  onWorkflowDataChange?: (workflow: Workflow) => void;
}

export default function WorkflowDesigner({ workflow, onSave, onSaveAsTemplate }: WorkflowDesignerProps) {
  const router = useRouter();
  const { forms } = useFormStore();
  const { addWorkflow, updateWorkflow } = useWorkflowStore();
  const { addRequest } = useRequestStore();
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedElements, setSelectedElements] = useState<{ nodes: string[]; edges: string[] }>({ nodes: [], edges: [] });
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; type: 'node' | 'edge'; id: string } | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(
    workflow?.nodes.map(node => {
      // Determine node type based on formId and other properties
      let nodeType = 'formNode';
      let label = 'Form';
      
      if (!node.formId) {
        // If no formId, it could be start, end, or decision node
        // For now, default to startNode, but we should extend the WorkflowNode interface
        nodeType = 'startNode';
        label = 'Start';
      } else {
        const form = forms.find(f => f.id === node.formId);
        label = form?.name || 'Form';
      }
      
      return {
        id: node.id,
        type: nodeType,
        position: node.position,
        data: {
          formId: node.formId,
          label: label,
          status: node.status
        }
      };
    }) || []
  );
  
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    workflow?.connections.map(conn => ({
      id: `${conn.from}-${conn.to}`,
      source: conn.from,
      target: conn.to,
      type: 'smoothstep',
      style: { stroke: '#3b82f6', strokeWidth: 2 }
    })) || []
  );

  // Edge editing handler
  const onEdgeDoubleClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation();
    const newLabel = prompt('Edit connection label:', edge.label?.toString() || '');
    if (newLabel !== null) {
      setEdges(eds => eds.map(e => e.id === edge.id ? { ...e, label: newLabel } : e));
    }
  }, [setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      style: { stroke: '#3b82f6', strokeWidth: 2 }
    }, eds)),
    [setEdges]
  );

  const addFormNode = (formId?: string) => {
    if (forms.length === 0) {
      alert('Please create forms first before adding them to the workflow.');
      return;
    }

    // If no formId provided, show the modal
    if (!formId) {
      setShowFormModal(true);
      return;
    }

    const selectedForm = forms.find(f => f.id === formId);
    if (!selectedForm) return;

    const reactFlowNode: Node = {
      id: generateId(),
      type: 'formNode',
      position: { x: 250, y: 100 + nodes.length * 100 },
      data: {
        formId: selectedForm.id,
        label: selectedForm.name,
        status: 'pending'
      }
    };

    setNodes((nds) => [...nds, reactFlowNode]);
    setShowFormModal(false);
  };

  const addStartNode = () => {
    const reactFlowNode: Node = {
      id: generateId(),
      type: 'startNode',
      position: { x: 250, y: 100 + nodes.length * 100 },
      data: {
        formId: '',
        label: 'Start',
        status: 'pending'
      }
    };

    setNodes((nds) => [...nds, reactFlowNode]);
  };

  const addEndNode = () => {
    const reactFlowNode: Node = {
      id: generateId(),
      type: 'endNode',
      position: { x: 250, y: 100 + nodes.length * 100 },
      data: {
        formId: '',
        label: 'End',
        status: 'pending'
      }
    };

    setNodes((nds) => [...nds, reactFlowNode]);
  };

  const addDecisionNode = () => {
    const reactFlowNode: Node = {
      id: generateId(),
      type: 'decisionNode',
      position: { x: 250, y: 100 + nodes.length * 100 },
      data: {
        formId: '',
        label: 'Decision',
        status: 'pending'
      }
    };

    setNodes((nds) => [...nds, reactFlowNode]);
  };



  const saveWorkflow = () => {
    const workflowData: Workflow = {
      id: workflow?.id || generateId(),
      name: workflow?.name || 'New Workflow',
      description: workflow?.description || '',
      nodes: nodes.map(node => ({
        id: node.id,
        formId: (node.data as Record<string, unknown>).formId as string || '',
        position: node.position,
        status: ((node.data as Record<string, unknown>).status as 'active' | 'completed' | 'pending') || 'pending'
      })),
      connections: edges.map(edge => ({
        from: edge.source,
        to: edge.target
      })),
      status: 'draft',
      createdAt: workflow?.createdAt || new Date()
    };

    if (workflow) {
      updateWorkflow(workflow.id, workflowData);
    } else {
      addWorkflow(workflowData);
    }

    onSave?.(workflowData);
  };

  const executeWorkflow = () => {
    if (!workflow) {
      alert('Please save the workflow first before executing it.');
      return;
    }

    // Create a new request from the workflow
    const timestamp = new Date().toLocaleString();
    const newRequest: Request = {
      id: generateId(),
      title: `${workflow.name} - ${timestamp}`,
      workflowId: workflow.id,
      status: 'pending',
      currentStep: 0,
      formData: {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add the request to the store
    addRequest(newRequest);

    // Show success message and ask if user wants to view the request
    const shouldViewRequest = confirm(
      `Workflow executed! New request "${newRequest.title}" has been created.\n\nWould you like to view it in "My Requests"?`
    );

    if (shouldViewRequest) {
      // Navigate to the requests page
      router.push('/requests');
    }

    console.log('Created request:', newRequest);
  };

  // Selection change handler
  const onSelectionChange = useCallback((params: { nodes: Node[]; edges: Edge[] }) => {
    setSelectedElements({
      nodes: params.nodes?.map((n) => n.id) || [],
      edges: params.edges?.map((e) => e.id) || [],
    });
  }, []);

  // Keyboard delete handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't handle if the target is any form element or contentEditable
    const target = e.target as HTMLElement;
    
    // Check if target is any form element
    const isFormElement = target.tagName === 'INPUT' || 
                         target.tagName === 'TEXTAREA' || 
                         target.tagName === 'SELECT' || 
                         target.contentEditable === 'true' ||
                         target.closest('input') ||
                         target.closest('textarea') ||
                         target.closest('select') ||
                         target.closest('[contenteditable="true"]') ||
                         target.closest('form') ||
                         target.closest('.form-builder') ||
                         target.closest('.field-editor');
    
    if (isFormElement) {
      return;
    }
    
    // Check if any input field is currently focused
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && (
      activeElement.tagName === 'INPUT' || 
      activeElement.tagName === 'TEXTAREA' || 
      activeElement.tagName === 'SELECT' ||
      activeElement.contentEditable === 'true'
    )) {
      return;
    }
    
    // Only handle Delete/Backspace when ReactFlow canvas is focused and active
    const reactFlowElement = document.querySelector('.react-flow');
    if (!reactFlowElement?.contains(target)) {
      return;
    }
    
    // Additional check: ensure we're not in any modal or overlay
    const isInModal = target.closest('.modal') || 
                     target.closest('[role="dialog"]') ||
                     target.closest('.fixed');
    if (isInModal) {
      return;
    }
    
    if (e.key === 'Delete' || e.key === 'Backspace') {
      setNodes(nds => nds.filter(n => !selectedElements.nodes.includes(n.id)));
      setEdges(eds => eds.filter(e => !selectedElements.edges.includes(e.id)));
    }
  }, [selectedElements, setNodes, setEdges]);

  // Context menu for nodes/edges
  const onNodeContextMenu: NodeMouseHandler = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, type: 'node', id: node.id });
  }, []);
  const onEdgeContextMenu: EdgeMouseHandler = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, type: 'edge', id: edge.id });
  }, []);
  const handleDeleteContext = useCallback(() => {
    if (!contextMenu) return;
    if (contextMenu.type === 'node') {
      setNodes(nds => nds.filter(n => n.id !== contextMenu.id));
      setEdges(eds => eds.filter(e => e.source !== contextMenu.id && e.target !== contextMenu.id));
    } else if (contextMenu.type === 'edge') {
      setEdges(eds => eds.filter(e => e.id !== contextMenu.id));
    }
    setContextMenu(null);
  }, [contextMenu, setNodes, setEdges]);

  // Attach keyboard event
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Workflow Designer</h2>
          <p className="text-sm text-gray-600">Design your workflow by connecting forms and decision points</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => addFormNode()}
            className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Form
          </button>
          <button
            onClick={saveWorkflow}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </button>
          {onSaveAsTemplate && (
            <button
              onClick={() => onSaveAsTemplate('New Workflow Template', 'A new workflow template')}
              className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <FileText className="w-4 h-4 mr-2" />
              Save as Template
            </button>
          )}
          <button
            onClick={executeWorkflow}
            className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            <Play className="w-4 h-4 mr-2" />
            Execute
          </button>
        </div>
      </div>

      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-gray-50"
          onEdgeDoubleClick={onEdgeDoubleClick}
          onSelectionChange={onSelectionChange}
          onNodeContextMenu={onNodeContextMenu}
          onEdgeContextMenu={onEdgeContextMenu}
        >
          <Controls />
          <Background />
          <MiniMap />
          <Panel position="top-left" className="bg-white p-2 rounded shadow">
            <div className="text-sm text-gray-600">
              <p>Forms Available: {forms.length}</p>
              <p>Nodes: {nodes.length}</p>
              <p>Connections: {edges.length}</p>
            </div>
          </Panel>
          {/* Context menu for delete */}
          {contextMenu && (
            <div
              style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, zIndex: 1000 }}
              className="text-white bg-red-500 hover:bg-red-700 border border-red-300 rounded shadow p-2"
              onClick={handleDeleteContext}
              onContextMenu={e => e.preventDefault()}
            >
              <button className="text-white font-semibold">Delete</button>
            </div>
          )}
        </ReactFlow>
      </div>

      {/* Form Selection Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200/50">
              <h3 className="text-lg font-semibold text-gray-900">Select Form to Add</h3>
              <p className="text-sm text-gray-600 mt-1">Choose a form to add to your workflow</p>
              <button
                onClick={() => setShowFormModal(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              {forms.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-4 p-3 rounded-xl bg-gray-100/50">
                    <FileText className="w-full h-full text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">No forms available</p>
                  <p className="text-sm text-gray-500 mt-2">Create forms first to add them to the workflow</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {forms.map((form) => (
                    <button
                      key={form.id}
                      onClick={() => addFormNode(form.id)}
                      className="w-full flex items-center p-4 text-left bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl hover:bg-white/80 hover:shadow-md transition-all duration-200"
                    >
                      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white mr-3">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{form.name}</p>
                        {form.description && (
                          <p className="text-sm text-gray-600">{form.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {form.sections.length} sections, {form.sections.reduce((acc, section) => acc + section.fields.length, 0)} fields
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200/50">
              <button
                onClick={() => setShowFormModal(false)}
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}