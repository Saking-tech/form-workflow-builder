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
      <Handle type="target" position={Position.Top} />
      
      <div className="flex items-center space-x-2">
        <Diamond className="h-5 w-5 text-yellow-600" />
        <div>
          <div className="font-semibold text-gray-900">{data.label}</div>
          <div className="text-xs text-gray-500 capitalize">{data.status}</div>
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}