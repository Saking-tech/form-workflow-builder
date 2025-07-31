'use client';

import { Handle, Position } from '@xyflow/react';
import { Check } from 'lucide-react';

interface EndNodeProps {
  data: {
    label: string;
  };
}

export default function EndNode({ data }: EndNodeProps) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-red-400 min-w-[100px]">
      {/* Connection handles on all four sides */}
      <Handle id="target-top" type="target" position={Position.Top} className="w-3 h-3 !bg-red-500" />
      <Handle id="target-right" type="target" position={Position.Right} className="w-3 h-3 !bg-red-500" />
      <Handle id="target-bottom" type="target" position={Position.Bottom} className="w-3 h-3 !bg-red-500" />
      <Handle id="target-left" type="target" position={Position.Left} className="w-3 h-3 !bg-red-500" />
      
      <div className="flex items-center space-x-2">
        <Check className="h-4 w-4 text-red-500" />
        <div className="font-bold text-sm">{data.label}</div>
      </div>
    </div>
  );
}