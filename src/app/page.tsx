'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  GitBranch, 
  Plus, 
  Settings, 
  Eye,
  Edit3,
  Trash2,
  Copy,
  ArrowRight
} from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'forms' | 'workflows'>('forms');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Creator Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('forms')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'forms'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Form Creator</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('workflows')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'workflows'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <GitBranch className="w-5 h-5" />
                <span>Workflow Creator</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'forms' ? (
            <FormCreatorSection />
          ) : (
            <WorkflowCreatorSection />
          )}
        </div>
      </div>
    </div>
  );
}

function FormCreatorSection() {
  const router = useRouter();

  const quickActions = [
    {
      title: 'Create New Form',
      description: 'Start from scratch with a blank form',
      icon: Plus,
      action: () => router.push('/forms'),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Use Template',
      description: 'Start with a pre-built template',
      icon: FileText,
      action: () => router.push('/forms'),
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Import Form',
      description: 'Import from JSON or other formats',
      icon: Settings,
      action: () => router.push('/forms'),
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Form Creator</h2>
        <p className="text-gray-600">Create and manage your form templates</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action, index) => (
          <div
            key={index}
            onClick={action.action}
            className="bg-gray-50 border border-gray-200 rounded-lg p-6 cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${action.color} text-white`}>
                <action.icon className="w-6 h-6" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
            <p className="text-sm text-gray-600">{action.description}</p>
          </div>
        ))}
      </div>

      {/* Recent Forms */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Forms</h3>
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-sm">No recent forms</p>
          <p className="text-xs text-gray-400 mt-1">Create your first form to get started</p>
        </div>
      </div>
    </div>
  );
}

function WorkflowCreatorSection() {
  const router = useRouter();

  const quickActions = [
    {
      title: 'Create New Workflow',
      description: 'Design a custom workflow from scratch',
      icon: Plus,
      action: () => router.push('/workflows'),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Use Template',
      description: 'Start with a pre-built workflow template',
      icon: GitBranch,
      action: () => router.push('/workflows'),
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Import Workflow',
      description: 'Import workflow from external sources',
      icon: Settings,
      action: () => router.push('/workflows'),
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Workflow Creator</h2>
        <p className="text-gray-600">Design and manage your workflow processes</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action, index) => (
          <div
            key={index}
            onClick={action.action}
            className="bg-gray-50 border border-gray-200 rounded-lg p-6 cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${action.color} text-white`}>
                <action.icon className="w-6 h-6" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
            <p className="text-sm text-gray-600">{action.description}</p>
          </div>
        ))}
      </div>

      {/* Recent Workflows */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Workflows</h3>
        <div className="text-center py-8 text-gray-500">
          <GitBranch className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-sm">No recent workflows</p>
          <p className="text-xs text-gray-400 mt-1">Create your first workflow to get started</p>
        </div>
      </div>
    </div>
  );
}