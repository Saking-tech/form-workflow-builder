'use client';

import { Handle, Position } from '@xyflow/react';
import { Diamond } from 'lucide-react';

interface DecisionNodeProps {
  data: {
    label: string;
    status: 'pending' | 'completed' | 'active';
  };
}

export default function DecisionNode({ data }: DecisionNodeProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-50';
      case 'active':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className={`px-4 py-2 border-2 rounded-lg ${getStatusColor(data.status)}`}>
      {/* Connection handles on all four sides */}
      <Handle id="target-top" type="target" position={Position.Top} className="w-3 h-3 !bg-yellow-500" />
      <Handle id="target-right" type="target" position={Position.Right} className="w-3 h-3 !bg-yellow-500" />
      <Handle id="target-bottom" type="target" position={Position.Bottom} className="w-3 h-3 !bg-yellow-500" />
      <Handle id="target-left" type="target" position={Position.Left} className="w-3 h-3 !bg-yellow-500" />
      
      <div className="flex items-center space-x-2">
        <Diamond className="h-5 w-5 text-yellow-600" />
        <div>
          <div className="font-semibold text-gray-900">{data.label}</div>
          <div className="text-xs text-gray-500 capitalize">{data.status}</div>
        </div>
      </div>
      
      <Handle id="source-top" type="source" position={Position.Top} className="w-3 h-3 !bg-yellow-500" />
      <Handle id="source-right" type="source" position={Position.Right} className="w-3 h-3 !bg-yellow-500" />
      <Handle id="source-bottom" type="source" position={Position.Bottom} className="w-3 h-3 !bg-yellow-500" />
      <Handle id="source-left" type="source" position={Position.Left} className="w-3 h-3 !bg-yellow-500" />
    </div>
  );
}