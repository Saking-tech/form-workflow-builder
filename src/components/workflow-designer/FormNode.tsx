'use client';

import { Handle, Position } from '@xyflow/react';
import { FileText } from 'lucide-react';
import { useFormStore } from '@/stores/formStore';

interface FormNodeProps {
  data: {
    formId: string;
    label: string;
    form?: Record<string, unknown>;
  };
}

export default function FormNode({ data }: FormNodeProps) {
  const { forms } = useFormStore();
  const form = forms.find(f => f.id === data.formId);
  const sectionCount = form?.sections?.length || 0;
  const fieldCount = form?.sections?.reduce((acc, section) => acc + section.fields.length, 0) || 0;

  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-blue-400 min-w-[200px] max-w-[320px] relative">
      {/* Connection handles on all four sides */}
      <Handle id="target-top" type="target" position={Position.Top} className="w-3 h-3 !bg-blue-500" />
      <Handle id="target-right" type="target" position={Position.Right} className="w-3 h-3 !bg-blue-500" />
      <Handle id="target-bottom" type="target" position={Position.Bottom} className="w-3 h-3 !bg-blue-500" />
      <Handle id="target-left" type="target" position={Position.Left} className="w-3 h-3 !bg-blue-500" />
      <Handle id="source-top" type="source" position={Position.Top} className="w-3 h-3 !bg-blue-500" />
      <Handle id="source-right" type="source" position={Position.Right} className="w-3 h-3 !bg-blue-500" />
      <Handle id="source-bottom" type="source" position={Position.Bottom} className="w-3 h-3 !bg-blue-500" />
      <Handle id="source-left" type="source" position={Position.Left} className="w-3 h-3 !bg-blue-500" />
      
      <div className="flex items-center space-x-2 mb-1">
        <FileText className="h-4 w-4 text-blue-500" />
        <div>
          <div className="font-bold text-sm truncate" title={form?.name || data.label}>{form?.name || data.label}</div>
        </div>
      </div>
      {form && (
        <div className="text-xs text-gray-600 space-y-1">
          {form.description && <div className="truncate" title={form.description}>{form.description}</div>}
          <div>Sections: {sectionCount}</div>
          <div>Fields: {fieldCount}</div>
        </div>
      )}
    </div>
  );
}