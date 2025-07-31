'use client';

import { Handle, Position } from '@xyflow/react';
import { Play } from 'lucide-react';

interface StartNodeProps {
  data: {
    label: string;
  };
}

export default function StartNode({ data }: StartNodeProps) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-green-400 min-w-[100px]">
      <div className="flex items-center space-x-2">
        <Play className="h-4 w-4 text-green-500" />
        <div className="font-bold text-sm">{data.label}</div>
      </div>
      
      {/* Connection handles on all four sides */}
      <Handle id="source-top" type="source" position={Position.Top} className="w-3 h-3 !bg-green-500" />
      <Handle id="source-right" type="source" position={Position.Right} className="w-3 h-3 !bg-green-500" />
      <Handle id="source-bottom" type="source" position={Position.Bottom} className="w-3 h-3 !bg-green-500" />
      <Handle id="source-left" type="source" position={Position.Left} className="w-3 h-3 !bg-green-500" />
    </div>
  );
}