'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  GitBranch, 
  Plus, 
  Settings, 
  ArrowRight
} from 'lucide-react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'forms' | 'workflows'>('forms');

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Creator Table</h1>
      </div>

      {/* Creator Tabs */}
      <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl shadow-sm border border-gray-200/50">
        <div className="border-b border-gray-100">
          <nav className="flex space-x-4 md:space-x-8 px-4 md:px-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('forms')}
              className={`py-3 md:py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                activeTab === 'forms'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 md:w-5 md:h-5" />
                <span>Form Creator</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('workflows')}
              className={`py-3 md:py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                activeTab === 'workflows'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <GitBranch className="w-4 h-4 md:w-5 md:h-5" />
                <span>Workflow Creator</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-4 md:p-6">
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
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'from-blue-50 to-indigo-50'
    },
    {
      title: 'Use Template',
      description: 'Start with a pre-built template',
      icon: FileText,
      action: () => router.push('/forms'),
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'from-emerald-50 to-teal-50'
    },
    {
      title: 'Import Form',
      description: 'Import from JSON or other formats',
      icon: Settings,
      action: () => router.push('/forms'),
      color: 'from-purple-500 to-pink-600',
      bgColor: 'from-purple-50 to-pink-50'
    }
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 md:p-6 border border-gray-200/50">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">Form Creator</h2>
        <p className="text-sm md:text-base text-gray-600">Create and manage your form templates</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {quickActions.map((action, index) => (
          <div
            key={index}
            onClick={action.action}
            className="group relative bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl p-4 md:p-6 cursor-pointer hover:bg-white/80 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className={`p-2.5 md:p-3 rounded-xl bg-gradient-to-br ${action.color} text-white shadow-sm group-hover:shadow-md transition-shadow duration-200`}>
                <action.icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
            </div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 md:mb-2">{action.title}</h3>
            <p className="text-xs md:text-sm text-gray-600">{action.description}</p>
            
            {/* Hover effect overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${action.bgColor} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300`} />
          </div>
        ))}
      </div>

      {/* Recent Forms */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-gray-200/50">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Recent Forms</h3>
        <div className="text-center py-6 md:py-8 text-gray-500">
          <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 p-3 rounded-xl bg-gray-100/50">
            <FileText className="w-full h-full text-gray-400" />
          </div>
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
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'from-blue-50 to-indigo-50'
    },
    {
      title: 'Use Template',
      description: 'Start with a pre-built workflow template',
      icon: GitBranch,
      action: () => router.push('/workflows'),
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'from-emerald-50 to-teal-50'
    },
    {
      title: 'Import Workflow',
      description: 'Import workflow from external sources',
      icon: Settings,
      action: () => router.push('/workflows'),
      color: 'from-purple-500 to-pink-600',
      bgColor: 'from-purple-50 to-pink-50'
    }
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 md:p-6 border border-gray-200/50">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">Workflow Creator</h2>
        <p className="text-sm md:text-base text-gray-600">Design and manage your workflow processes</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {quickActions.map((action, index) => (
          <div
            key={index}
            onClick={action.action}
            className="group relative bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl p-4 md:p-6 cursor-pointer hover:bg-white/80 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className={`p-2.5 md:p-3 rounded-xl bg-gradient-to-br ${action.color} text-white shadow-sm group-hover:shadow-md transition-shadow duration-200`}>
                <action.icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
            </div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 md:mb-2">{action.title}</h3>
            <p className="text-xs md:text-sm text-gray-600">{action.description}</p>
            
            {/* Hover effect overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${action.bgColor} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300`} />
          </div>
        ))}
      </div>

      {/* Recent Workflows */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-gray-200/50">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Recent Workflows</h3>
        <div className="text-center py-6 md:py-8 text-gray-500">
          <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 p-3 rounded-xl bg-gray-100/50">
            <GitBranch className="w-full h-full text-gray-400" />
          </div>
          <p className="text-sm">No recent workflows</p>
          <p className="text-xs text-gray-400 mt-1">Create your first workflow to get started</p>
        </div>
      </div>
    </div>
  );
}