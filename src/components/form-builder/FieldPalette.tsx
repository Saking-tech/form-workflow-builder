'use client';

import { useDraggable } from '@dnd-kit/core';
import { FieldType } from '@/types';

const FIELD_TYPES: FieldType[] = [
  { type: 'text', label: 'Text Input', icon: '📝' },
  { type: 'textarea', label: 'Text Area', icon: '📄' },
  { type: 'select', label: 'Dropdown', icon: '📋' },
  { type: 'date', label: 'Date Picker', icon: '📅' },
  { type: 'file', label: 'File Upload', icon: '📎' },
  { type: 'radio', label: 'Radio Buttons', icon: '🔘' },
  { type: 'checkbox', label: 'Checkbox', icon: '☑️' },
];

function DraggableFieldType({ fieldType }: { fieldType: FieldType }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: fieldType.type,
    data: {
      type: fieldType.type,
    },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="p-3 mb-2 bg-green-200 border border-gray-200 rounded-xl cursor-move hover:shadow-md transition-shadow"
    >
      <div className="flex items-center space-x-2">
        {/* <span className="text-lg">{fieldType.icon}</span> */}
        <span className="text-sm font-medium text-gray-700">{fieldType.label}</span>
      </div>
    </div>
  );
}

export default function FieldPalette() {
  return (
    <div className="p-4 border-r border-gray-200 bg-gray-50 w-64">
      <h3 className="font-semibold text-gray-900 mb-4">Form Fields</h3>
      <div className="space-y-2">
        {FIELD_TYPES.map((fieldType) => (
          <DraggableFieldType key={fieldType.type} fieldType={fieldType} />
        ))}
      </div>
    </div>
  );
}