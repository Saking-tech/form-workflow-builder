'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  ConnectionMode,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useFormStore } from '@/stores/formStore';
import { useWorkflowStore } from '@/stores/workflowStore';
import { FormNode } from './FormNode';
import { Workflow } from '@/types';
import { 
  Plus, 
  Play, 
  Save, 
  Settings, 
  GitBranch, 
  FileText,
  Edit,
  Eye,
  Copy,
  Trash2,
  AlertTriangle,
  X,
  Rocket,
  Star,
  Zap,
  Calendar,
  Activity,
  BarChart3,
  Workflow as WorkflowIcon,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Grid3X3,
  List,
  Maximize2,
  Minimize2,
  RotateCcw,
  Share2,
  Download
} from 'lucide-react';

const nodeTypes = {
  formNode: FormNode as any,
};

interface WorkflowDesignerProps {
  workflow?: Workflow;
}

export function WorkflowDesigner({ workflow: initialWorkflow }: WorkflowDesignerProps) {
  const { forms } = useFormStore();
  const { 
    workflows, 
    currentWorkflow, 
    setCurrentWorkflow, 
    addWorkflow, 
    updateWorkflow,
    addNodeToWorkflow,
    addConnection,
    removeConnection 
  } = useWorkflowStore();
  
  const [isNewWorkflowDialogOpen, setIsNewWorkflowDialogOpen] = useState(false);
  const [isAddFormDialogOpen, setIsAddFormDialogOpen] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowDescription, setNewWorkflowDescription] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showConnectionInfo, setShowConnectionInfo] = useState(false);
  const [showConnectionManager, setShowConnectionManager] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);

  const activeWorkflow = currentWorkflow || initialWorkflow;

  // Convert workflow nodes to React Flow nodes
  const initialNodes: Node[] = useMemo(() => {
    if (!activeWorkflow) return [];
    
    return activeWorkflow.nodes.map((node) => {
      const form = forms.find(f => f.id === node.formId);
      return {
        id: node.id,
        type: 'formNode',
        position: node.position,
        data: {
          formId: node.formId,
          label: form?.name || 'Unknown Form',
          status: node.status,
          workflowId: activeWorkflow.id,
          handles: node.handles || {
            top: 1,
            bottom: 1,
            left: 1,
            right: 1,
          },
        },
      };
    });
  }, [activeWorkflow, forms]);

  // Convert workflow connections to React Flow edges with enhanced styling
  const initialEdges: Edge[] = useMemo(() => {
    if (!activeWorkflow) return [];
    
    return activeWorkflow.connections.map((connection, index) => ({
      id: `edge-${index}`,
      source: connection.from,
      target: connection.to,
      type: 'smoothstep',
      animated: true,
      style: {
        stroke: '#3b82f6',
        strokeWidth: 2,
        strokeDasharray: '5,5',
      },
      label: `Connection ${index + 1}`,
      labelStyle: {
        fill: '#6b7280',
        fontSize: '10px',
        fontWeight: 'bold',
      },
      labelBgStyle: {
        fill: '#ffffff',
        fillOpacity: 0.8,
      },
    }));
  }, [activeWorkflow]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Enhanced edge styling with selection state
  const getEdgeStyle = useCallback((edge: Edge) => {
    const isSelected = edge.id === selectedEdge;
    return {
      stroke: isSelected ? '#ef4444' : '#3b82f6',
      strokeWidth: isSelected ? 3 : 2,
      strokeDasharray: '5,5',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    };
  }, [selectedEdge]);

  // Enhanced edges with custom styling
  const enhancedEdges = useMemo(() => {
    return edges.map(edge => ({
      ...edge,
      style: getEdgeStyle(edge),
      className: edge.id === selectedEdge ? 'selected-edge' : '',
    }));
  }, [edges, getEdgeStyle, selectedEdge]);

  // Connection validation function
  const isValidConnection = useCallback((source: string, target: string) => {
    // Extract node IDs from handle IDs
    const sourceNodeId = source.split('-')[0];
    const targetNodeId = target.split('-')[0];
    
    // Don't allow self-connections
    if (sourceNodeId === targetNodeId) {
      console.log('Self-connection prevented');
      return false;
    }
    
    // Check if connection already exists
    const existingConnection = activeWorkflow?.connections.find(
      conn => conn.from === source && conn.to === target
    );
    
    if (existingConnection) {
      console.log('Duplicate connection prevented');
      return false;
    }
    
    console.log('Valid connection:', { source, target });
    return true;
  }, [activeWorkflow]);

  // Update nodes and edges when workflow changes
  React.useEffect(() => {
    if (activeWorkflow) {
      const newNodes = activeWorkflow.nodes.map((node) => {
        const form = forms.find(f => f.id === node.formId);
        return {
          id: node.id,
          type: 'formNode',
          position: node.position,
          data: {
            formId: node.formId,
            label: form?.name || 'Unknown Form',
            status: node.status,
            workflowId: activeWorkflow.id,
            handles: node.handles || {
              top: 1,
              bottom: 1,
              left: 1,
              right: 1,
            },
          },
        };
      });
      
      const newEdges = activeWorkflow.connections.map((connection, index) => ({
        id: `edge-${index}`,
        source: connection.from,
        target: connection.to,
        type: 'smoothstep',
        animated: true,
        style: {
          stroke: '#3b82f6',
          strokeWidth: 2,
          strokeDasharray: '5,5',
        },
        label: `Connection ${index + 1}`,
        labelStyle: {
          fill: '#6b7280',
          fontSize: '10px',
          fontWeight: 'bold',
        },
        labelBgStyle: {
          fill: '#ffffff',
          fillOpacity: 0.8,
        },
      }));

      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [activeWorkflow, forms, setNodes, setEdges]);

  // Enhanced connection handling for horizontal and vertical connections
  const onConnect = useCallback(
    (params: Connection) => {
      console.log('Connection attempt:', params);
      if (activeWorkflow && params.source && params.target) {
        // Validate the connection
        if (!isValidConnection(params.source, params.target)) {
          console.log('Connection validation failed');
          return;
        }
        
        // Allow connections between any handles (horizontal and vertical)
        console.log('Adding connection:', { from: params.source, to: params.target });
        addConnection(activeWorkflow.id, params.source, params.target);
        setEdges((eds) => addEdge({
          ...params,
          type: 'smoothstep',
          animated: true,
          style: {
            stroke: '#3b82f6',
            strokeWidth: 2,
            strokeDasharray: '5,5',
          },
          label: `Connection ${eds.length + 1}`,
          labelStyle: {
            fill: '#6b7280',
            fontSize: '10px',
            fontWeight: 'bold',
          },
          labelBgStyle: {
            fill: '#ffffff',
            fillOpacity: 0.8,
          },
        }, eds));
      }
    },
    [activeWorkflow, addConnection, setEdges, isValidConnection]
  );

  // Handle edge deletion
  const onEdgesDelete = useCallback(
    (edgesToDelete: Edge[]) => {
      console.log('Deleting edges:', edgesToDelete);
      edgesToDelete.forEach(edge => {
        if (activeWorkflow && edge.source && edge.target) {
          removeConnection(activeWorkflow.id, edge.source, edge.target);
        }
      });
    },
    [activeWorkflow, removeConnection]
  );

  // Enhanced connection validation
  const onConnectStart = useCallback((event: any, params: any) => {
    console.log('Connection start:', params);
  }, []);

  const onConnectEnd = useCallback((event: any) => {
    console.log('Connection end:', event);
  }, []);

  // Handle edge selection
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    console.log('Edge clicked:', edge);
    setSelectedEdge(edge.id);
  }, []);

  // Handle edge selection change
  const onSelectionChange = useCallback(({ nodes, edges }: { nodes: Node[], edges: Edge[] }) => {
    if (edges.length === 1) {
      setSelectedEdge(edges[0].id);
    } else {
      setSelectedEdge(null);
    }
  }, []);

  // Remove selected edge
  const removeSelectedEdge = useCallback(() => {
    if (selectedEdge && activeWorkflow) {
      const edge = edges.find(e => e.id === selectedEdge);
      if (edge && edge.source && edge.target) {
        removeConnection(activeWorkflow.id, edge.source, edge.target);
        setSelectedEdge(null);
      }
    }
  }, [selectedEdge, activeWorkflow, edges, removeConnection]);

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' && selectedEdge) {
        event.preventDefault();
        removeSelectedEdge();
      }
      if (event.key === 'Escape') {
        setSelectedEdge(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedEdge, removeSelectedEdge]);

  const createWorkflow = () => {
    if (!newWorkflowName.trim()) return;
    
    const workflow: Workflow = {
      id: `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newWorkflowName.trim(),
      description: newWorkflowDescription.trim() || undefined,
      nodes: [],
      connections: [],
      status: 'draft',
      createdAt: new Date(),
    };
    
    addWorkflow(workflow);
    setCurrentWorkflow(workflow);
    
    // Reset form
    setNewWorkflowName('');
    setNewWorkflowDescription('');
    setIsNewWorkflowDialogOpen(false);
  };

  const addFormToWorkflow = (formId: string) => {
    if (!activeWorkflow) return;
    
    // Improved positioning for better horizontal and vertical layout
    const existingNodes = activeWorkflow.nodes;
    const position = {
      x: existingNodes.length * 300 + 100,
      y: Math.random() * 200 + 100,
    };
    
    addNodeToWorkflow(activeWorkflow.id, formId, position);
    setIsAddFormDialogOpen(false);
  };

  const startWorkflowExecution = () => {
    if (!activeWorkflow) return;
    
    // Update workflow status to active
    updateWorkflow(activeWorkflow.id, { status: 'active' });
    
    // Create a new execution for this workflow
    const newExecution = {
      id: `execution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      workflowId: activeWorkflow.id,
      status: 'in-progress' as const,
      currentStep: 0,
      completedSteps: [],
      formData: {},
      startedAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Add execution to store (this would be done in a real app)
    console.log('Starting workflow execution:', activeWorkflow.id);
    console.log('New execution created:', newExecution);
    
    // Show success message with next steps
    alert(`Workflow "${activeWorkflow.name}" execution started! 
    
Execution Details:
- Workflow ID: ${activeWorkflow.id}
- Execution ID: ${newExecution.id}
- Status: In Progress
- Steps: ${activeWorkflow.nodes.length} forms to complete

Next Steps:
1. Navigate to the "Executions" tab to see active executions
2. Fill out forms in sequence as they appear
3. Track progress through the workflow steps
4. Complete all forms to finish the workflow

The workflow is now active and ready for execution!`);
  };

  // Get connection statistics
  const getConnectionStats = () => {
    if (!activeWorkflow) return { total: 0, horizontal: 0, vertical: 0 };
    
    const connections = activeWorkflow.connections;
    let horizontal = 0;
    let vertical = 0;
    
    connections.forEach(conn => {
      const sourceNode = activeWorkflow.nodes.find(n => n.id === conn.from);
      const targetNode = activeWorkflow.nodes.find(n => n.id === conn.to);
      
      if (sourceNode && targetNode) {
        const isHorizontal = Math.abs(sourceNode.position.y - targetNode.position.y) < 50;
        if (isHorizontal) {
          horizontal++;
        } else {
          vertical++;
        }
      }
    });
    
    return {
      total: connections.length,
      horizontal,
      vertical,
    };
  };

  const connectionStats = getConnectionStats();

  // Connection management functions
  const removeConnectionById = useCallback((connectionIndex: number) => {
    if (activeWorkflow && activeWorkflow.connections[connectionIndex]) {
      const connection = activeWorkflow.connections[connectionIndex];
      removeConnection(activeWorkflow.id, connection.from, connection.to);
    }
  }, [activeWorkflow, removeConnection]);

  const getConnectionDetails = useCallback((connection: any, index: number) => {
    const sourceNode = activeWorkflow?.nodes.find(n => n.id === connection.from.split('-')[0]);
    const targetNode = activeWorkflow?.nodes.find(n => n.id === connection.to.split('-')[0]);
    
    const sourceForm = forms.find(f => f.id === sourceNode?.formId);
    const targetForm = forms.find(f => f.id === targetNode?.formId);
    
    return {
      sourceForm: sourceForm?.name || 'Unknown Form',
      targetForm: targetForm?.name || 'Unknown Form',
      sourceHandle: connection.from.split('-').slice(-2).join('-'),
      targetHandle: connection.to.split('-').slice(-2).join('-'),
    };
  }, [activeWorkflow, forms]);

  if (!activeWorkflow) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <GitBranch className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            No Workflow Selected
          </h2>
          <p className="text-gray-500 mb-6">
            Create a new workflow or select an existing one to start designing your process flow.
          </p>
          
          <div className="space-y-4">
            <Dialog open={isNewWorkflowDialogOpen} onOpenChange={setIsNewWorkflowDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" size="lg" className="w-full">
                  <Plus className="w-5 h-5 mr-2" />
                  Create New Workflow
                </Button>
              </DialogTrigger>
              <DialogContent className="">
                <DialogHeader className="">
                  <DialogTitle className="">Create New Workflow</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="workflow-name" className="">Workflow Name</Label>
                    <Input
                      id="workflow-name"
                      type="text"
                      className=""
                      value={newWorkflowName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewWorkflowName(e.target.value)}
                      placeholder="Enter workflow name"
                      onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && createWorkflow()}
                    />
                  </div>
                  <div>
                    <Label htmlFor="workflow-description" className="">Description (Optional)</Label>
                    <Input
                      id="workflow-description"
                      type="text"
                      className=""
                      value={newWorkflowDescription}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewWorkflowDescription(e.target.value)}
                      placeholder="Enter workflow description"
                      onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && createWorkflow()}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="default"
                      className=""
                      onClick={() => setIsNewWorkflowDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={createWorkflow}
                      disabled={!newWorkflowName.trim()}
                      variant="default"
                      size="default"
                      className=""
                    >
                      Create Workflow
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            {workflows.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Or select an existing workflow:</p>
                <div className="space-y-2">
                  {workflows.map(workflow => (
                    <Button
                      key={workflow.id}
                      variant="outline"
                      size="default"
                      onClick={() => setCurrentWorkflow(workflow)}
                      className="w-full justify-start"
                    >
                      <GitBranch className="w-4 h-4 mr-2" />
                      {workflow.name}
                      <span className="ml-auto text-xs text-gray-500">
                        {workflow.nodes.length} step{workflow.nodes.length !== 1 ? 's' : ''}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-0 space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <WorkflowIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                {activeWorkflow.name}
              </h1>
              <Badge 
                variant={activeWorkflow.status === 'active' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {activeWorkflow.status}
              </Badge>
            </div>
            
            {activeWorkflow.description && (
              <p className="text-xs sm:text-sm text-gray-600 max-w-md truncate hidden sm:block">
                {activeWorkflow.description}
              </p>
            )}
          </div>
          
          {/* Connection Stats */}
          <div className="flex items-center space-x-2 sm:space-x-3 ml-0 sm:ml-6 pl-0 sm:pl-6 border-l-0 sm:border-l border-gray-200">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
              <Activity className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">{activeWorkflow.nodes.length} Steps</span>
              <span className="sm:hidden">{activeWorkflow.nodes.length}</span>
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
              <GitBranch className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">{connectionStats.total} Connections</span>
              <span className="sm:hidden">{connectionStats.total}</span>
            </Badge>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-0 sm:space-x-2">
          {/* Connection Info Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConnectionInfo(!showConnectionInfo)}
            className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
          >
            <GitBranch className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span className="hidden sm:inline">Connections</span>
            <span className="sm:hidden">Info</span>
          </Button>

          {/* Connection Manager */}
          {activeWorkflow.connections.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConnectionManager(!showConnectionManager)}
              className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
            >
              <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">Manage</span>
              <span className="sm:hidden">Manage</span>
            </Button>
          )}

          {/* Fullscreen Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-8 px-2 sm:px-3"
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>

          {/* Add Form Dialog */}
          <Dialog open={isAddFormDialogOpen} onOpenChange={setIsAddFormDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-2 sm:px-3 text-xs sm:text-sm">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">Add Form</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md mx-4">
              <DialogHeader className="">
                <DialogTitle className="">Add Form to Workflow</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {forms.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No forms available. Create forms first in the Form Builder.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {forms.map(form => (
                      <Button
                        key={form.id}
                        variant="outline"
                        size="default"
                        onClick={() => {
                          addFormToWorkflow(form.id);
                          setIsAddFormDialogOpen(false);
                        }}
                        className="w-full justify-start"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        {form.name}
                        <span className="ml-auto text-xs text-gray-500">
                          {form.fields.length} field{form.fields.length !== 1 ? 's' : ''}
                        </span>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Execute Workflow Button */}
          <Button
            onClick={startWorkflowExecution}
            disabled={activeWorkflow.nodes.length === 0}
            variant="default"
            size="sm"
            className={`${
              activeWorkflow.nodes.length === 0 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
            } px-3 sm:px-4 text-xs sm:text-sm`}
            title={
              activeWorkflow.nodes.length === 0 
                ? 'Add forms to the workflow before executing' 
                : `Execute workflow with ${activeWorkflow.nodes.length} form${activeWorkflow.nodes.length !== 1 ? 's' : ''}`
            }
          >
            <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span className="hidden sm:inline">Execute</span>
            <span className="sm:hidden">Run</span>
            {activeWorkflow.nodes.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {activeWorkflow.nodes.length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Connection Info Panel */}
      {showConnectionInfo && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <ArrowRight className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Horizontal: {connectionStats.horizontal}</span>
              </div>
              <div className="flex items-center space-x-2">
                <ArrowDown className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Vertical: {connectionStats.vertical}</span>
              </div>
              <div className="flex items-center space-x-2">
                <GitBranch className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Total: {connectionStats.total}</span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              💡 Drag from any handle to any other handle to create connections
            </div>
          </div>
          
          {/* Selected Edge Info */}
          {selectedEdge && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-red-700">Connection Selected</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Press Delete or click Remove</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={removeSelectedEdge}
                    className="h-6 px-2 text-xs bg-red-100 border-red-300 text-red-700 hover:bg-red-200"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Connection Manager Panel */}
      {showConnectionManager && activeWorkflow.connections.length > 0 && (
        <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center">
              <GitBranch className="w-4 h-4 mr-2 text-blue-600" />
              Connection Manager
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConnectionManager(false)}
              className="h-6 px-2 text-xs"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {activeWorkflow.connections.map((connection, index) => {
              const details = getConnectionDetails(connection, index);
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">{details.sourceForm}</span>
                      <span className="text-gray-500 mx-2">→</span>
                      <span className="font-medium text-gray-900">{details.targetForm}</span>
                      <div className="text-xs text-gray-500 mt-1">
                        {details.sourceHandle} → {details.targetHandle}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeConnectionById(index)}
                    className="h-6 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              );
            })}
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Total Connections: {activeWorkflow.connections.length}</span>
              <span>💡 Click the trash icon to remove a connection</span>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Workflow Canvas */}
      <div className="flex-1 bg-gray-50">
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={enhancedEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onConnectStart={onConnectStart}
            onConnectEnd={onConnectEnd}
            onEdgesDelete={onEdgesDelete}
            onEdgeClick={onEdgeClick}
            onSelectionChange={onSelectionChange}
            nodeTypes={nodeTypes}
            className="bg-gray-50"
            connectionMode={ConnectionMode.Loose}
            fitView
            minZoom={0.1}
            maxZoom={1.5}
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: true,
              style: {
                stroke: '#3b82f6',
                strokeWidth: 2,
                strokeDasharray: '5,5',
              },
            }}
            connectOnClick={false}
            snapToGrid={false}
            snapGrid={[15, 15]}
            deleteKeyCode="Delete"
            multiSelectionKeyCode="Shift"
            panOnDrag={true}
            zoomOnScroll={true}
            zoomOnPinch={true}
            preventScrolling={false}
            attributionPosition="bottom-left"
          >
            <Background />
            <Controls className="!bottom-4 !right-4" />
            <MiniMap
              nodeColor="#3b82f6"
              maskColor="rgba(0, 0, 0, 0.1)"
              className="bg-white border border-gray-300 rounded-lg !bottom-4 !left-4 !w-32 !h-24"
            />
            
            {/* Connection Instructions Panel - Hidden on mobile */}
            <Panel position="top-left" className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 m-4 hidden sm:block">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                  <GitBranch className="w-4 h-4 mr-2 text-blue-600" />
                  Connection Guide
                </h3>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Green handles: Input connections</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Blue handles: Output connections</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ArrowRight className="w-3 h-3 text-gray-500" />
                    <span>Drag from any handle to any other handle</span>
                  </div>
                </div>
              </div>
            </Panel>

            {/* Mobile Connection Guide - Floating */}
            <Panel position="top-right" className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 m-2 sm:hidden">
              <div className="text-xs text-gray-600">
                <div className="flex items-center space-x-1 mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Input</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Output</span>
                </div>
              </div>
            </Panel>

            {/* Floating Remove Button */}
            {selectedEdge && (
              <Panel 
                position="top-right" 
                className="bg-red-50 border border-red-200 rounded-lg shadow-lg p-2 animate-in slide-in-from-top-2 duration-200"
              >
                <div className="flex items-center space-x-2">
                  <div className="text-xs text-red-700 font-medium">
                    Remove Connection
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={removeSelectedEdge}
                    className="h-6 px-2 text-xs bg-red-100 border-red-300 text-red-700 hover:bg-red-200 hover:border-red-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedEdge(null)}
                    className="h-6 px-2 text-xs"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </Panel>
            )}
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    </div>
  );
}