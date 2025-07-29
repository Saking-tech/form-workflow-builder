'use client';

import React, { useState, useCallback } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFormStore } from '@/stores/formStore';
import { useWorkflowStore } from '@/stores/workflowStore';
import { WorkflowNode } from '@/types';
import { 
  FileText, 
  Settings, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Circle, 
  Plus, 
  Minus,
  MoreHorizontal,
  MoreVertical 
} from 'lucide-react';

interface FormNodeData {
  formId: string;
  label: string;
  status: 'pending' | 'completed' | 'active';
  workflowId: string;
  handles?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

interface HandleConfig {
  id: string;
  type: 'source' | 'target';
  position: Position;
  index: number;
  side: 'top' | 'bottom' | 'left' | 'right';
}

export function FormNode({ id, data, selected }: NodeProps<any>) {
  const nodeData = data as FormNodeData;
  const { forms } = useFormStore();
  const { removeNodeFromWorkflow, updateNodeInWorkflow } = useWorkflowStore();
  
  // Initialize handle counts with defaults
  const [handleCounts, setHandleCounts] = useState({
    top: nodeData.handles?.top || 1,
    bottom: nodeData.handles?.bottom || 1,
    left: nodeData.handles?.left || 1,
    right: nodeData.handles?.right || 1,
  });

  const [showHandleControls, setShowHandleControls] = useState(false);
  
  const form = forms.find(f => f.id === nodeData.formId);
  
  const getStatusIcon = () => {
    switch (nodeData.status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'active':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (nodeData.status) {
      case 'completed':
        return 'border-green-500 bg-green-50';
      case 'active':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  const updateHandleCounts = useCallback((side: 'top' | 'bottom' | 'left' | 'right', change: number) => {
    const newCounts = {
      ...handleCounts,
      [side]: Math.max(1, handleCounts[side] + change)
    };
    setHandleCounts(newCounts);
    
    // Update the node data in the workflow store
    updateNodeInWorkflow(nodeData.workflowId, id, {
      handles: newCounts
    });
  }, [handleCounts, nodeData.workflowId, id, updateNodeInWorkflow]);

  const generateHandles = useCallback((): HandleConfig[] => {
    const handles: HandleConfig[] = [];
    
    // Top handles (targets)
    for (let i = 0; i < handleCounts.top; i++) {
      handles.push({
        id: `${id}-top-${i}`,
        type: 'target',
        position: Position.Top,
        index: i,
        side: 'top'
      });
    }
    
    // Bottom handles (sources)
    for (let i = 0; i < handleCounts.bottom; i++) {
      handles.push({
        id: `${id}-bottom-${i}`,
        type: 'source',
        position: Position.Bottom,
        index: i,
        side: 'bottom'
      });
    }
    
    // Left handles (targets)
    for (let i = 0; i < handleCounts.left; i++) {
      handles.push({
        id: `${id}-left-${i}`,
        type: 'target',
        position: Position.Left,
        index: i,
        side: 'left'
      });
    }
    
    // Right handles (sources)  
    for (let i = 0; i < handleCounts.right; i++) {
      handles.push({
        id: `${id}-right-${i}`,
        type: 'source',
        position: Position.Right,
        index: i,
        side: 'right'
      });
    }
    
    return handles;
  }, [handleCounts, id]);

  const getHandleStyle = (handle: HandleConfig, totalForSide: number) => {
    const baseStyle = "w-3 h-3 border-2 border-white transition-all duration-200 hover:scale-125";
    
    let positionStyle = "";
    if (handle.side === 'top' || handle.side === 'bottom') {
      const leftPercent = totalForSide === 1 ? 50 : (handle.index / (totalForSide - 1)) * 100;
      positionStyle = `left-[${leftPercent}%] transform -translate-x-1/2`;
    } else {
      const topPercent = totalForSide === 1 ? 50 : (handle.index / (totalForSide - 1)) * 100;
      positionStyle = `top-[${topPercent}%] transform -translate-y-1/2`;
    }
    
    const colorStyle = handle.type === 'source' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600';
    
    return `${baseStyle} ${colorStyle} ${positionStyle}`;
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to remove this form from the workflow?')) {
      removeNodeFromWorkflow(nodeData.workflowId, id);
    }
  };

  const handles = generateHandles();

  return (
    <div className="relative">
      {/* Render all handles */}
      {handles.map((handle) => (
        <Handle
          key={handle.id}
          id={handle.id}
          type={handle.type}
          position={handle.position}
          className={getHandleStyle(handle, handleCounts[handle.side])}
          style={{
            [handle.side === 'top' || handle.side === 'bottom' ? 'left' : 'top']: 
              handle.side === 'top' || handle.side === 'bottom'
                ? handleCounts[handle.side] === 1 
                  ? '50%' 
                  : `${(handle.index / (handleCounts[handle.side] - 1)) * 100}%`
                : handleCounts[handle.side] === 1 
                  ? '50%' 
                  : `${(handle.index / (handleCounts[handle.side] - 1)) * 100}%`,
            transform: handle.side === 'top' || handle.side === 'bottom' ? 'translateX(-50%)' : 'translateY(-50%)'
          }}
        />
      ))}

      {/* Handle Controls - Hidden on mobile, shown on desktop */}
      {showHandleControls && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 hidden lg:block">
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-gray-600 font-medium">Handles:</span>
            <div className="flex items-center space-x-1">
              <span className="text-gray-500">T</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={() => updateHandleCounts('top', -1)}
                disabled={handleCounts.top <= 1}
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="w-4 text-center">{handleCounts.top}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={() => updateHandleCounts('top', 1)}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-gray-500">B</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={() => updateHandleCounts('bottom', -1)}
                disabled={handleCounts.bottom <= 1}
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="w-4 text-center">{handleCounts.bottom}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={() => updateHandleCounts('bottom', 1)}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-gray-500">L</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={() => updateHandleCounts('left', -1)}
                disabled={handleCounts.left <= 1}
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="w-4 text-center">{handleCounts.left}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={() => updateHandleCounts('left', 1)}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-gray-500">R</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={() => updateHandleCounts('right', -1)}
                disabled={handleCounts.right <= 1}
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="w-4 text-center">{handleCounts.right}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={() => updateHandleCounts('right', 1)}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <Card className={`${getStatusColor()} border-2 transition-all duration-200 ${
        selected ? 'shadow-lg ring-2 ring-blue-400 ring-opacity-50' : 'shadow-md'
      } min-w-[200px] max-w-[280px]`}>
        <div className="p-3 sm:p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
              <span className="font-semibold text-xs sm:text-sm text-gray-800 truncate max-w-[80px] sm:max-w-[120px]">
                {nodeData.label}
              </span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 sm:h-6 sm:w-6 p-0 opacity-60 hover:opacity-100 hidden lg:block"
                onClick={() => setShowHandleControls(!showHandleControls)}
                title="Manage connection points"
              >
                <MoreHorizontal className="w-3 h-3 text-blue-600" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 sm:h-6 sm:w-6 p-0 opacity-60 hover:opacity-100"
                onClick={handleDelete}
              >
                <Trash2 className="w-3 h-3 text-red-600" />
              </Button>
            </div>
          </div>

          {/* Form Info */}
          <div className="space-y-1 sm:space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Fields:</span>
              <Badge variant="outline" className="text-xs">
                {form?.fields.length || 0}
              </Badge>
            </div>
            
            {form?.description && (
              <p className="text-xs text-gray-600 truncate max-w-[140px] sm:max-w-[180px]">
                {form.description}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Status:</span>
              <Badge 
                variant={nodeData.status === 'completed' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {nodeData.status}
              </Badge>
            </div>

            {/* Connection Points Info - Hidden on mobile */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 hidden sm:block">
              <span className="text-xs text-gray-500">Connections:</span>
              <div className="flex items-center space-x-2 text-xs">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>{handleCounts.top + handleCounts.left}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>{handleCounts.bottom + handleCounts.right}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}