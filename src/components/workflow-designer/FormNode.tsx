'use client';

import { Handle, Position } from '@xyflow/react';
import { FileText } from 'lucide-react';

interface FormNodeProps {
  data: {
    formId: string;
    label: string;
    form?: any;
  };
}

export default function FormNode({ data }: FormNodeProps) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-blue-400 min-w-[150px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center space-x-2">
        <FileText className="h-4 w-4 text-blue-500" />
        <div>
          <div className="font-bold text-sm">{data.label}</div>
          <div className="text-xs text-gray-500">
            {data.form?.fields?.length || 0} fields
          </div>
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
}