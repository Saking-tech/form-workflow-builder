'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  GitBranch, 
  Plus, 
  Settings, 
  ArrowRight,
  Clock,
  Edit,
  Trash2
} from 'lucide-react';
import { useFormStore } from '@/stores/formStore';
import { useWorkflowStore } from '@/stores/workflowStore';

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
  const { forms } = useFormStore();

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
    }
  ];

  // Get recent forms (last 5, sorted by updatedAt)
  const recentForms = forms
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

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
        {recentForms.length > 0 ? (
          <div className="space-y-3">
            {recentForms.map((form) => (
              <div
                key={form.id}
                className="group bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-lg p-3 md:p-4 hover:bg-white/90 hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => router.push(`/forms?id=${form.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-blue-100/50">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm md:text-base font-medium text-gray-900 truncate">
                        {form.name}
                      </h4>
                      {form.description && (
                        <p className="text-xs md:text-sm text-gray-500 truncate mt-1">
                          {form.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-2 mt-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {new Date(form.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      className="p-1 rounded hover:bg-gray-100 transition-colors duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/forms?id=${form.id}`);
                      }}
                    >
                      <Edit className="w-3 h-3 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 md:py-8 text-gray-500">
            <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 p-3 rounded-xl bg-gray-100/50">
              <FileText className="w-full h-full text-gray-400" />
            </div>
            <p className="text-sm">No recent forms</p>
            <p className="text-xs text-gray-400 mt-1">Create your first form to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}

function WorkflowCreatorSection() {
  const router = useRouter();
  const { workflows } = useWorkflowStore();

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
    }
  ];

  // Get recent workflows (last 5, sorted by createdAt)
  const recentWorkflows = workflows
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

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
        {recentWorkflows.length > 0 ? (
          <div className="space-y-3">
            {recentWorkflows.map((workflow) => (
              <div
                key={workflow.id}
                className="group bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-lg p-3 md:p-4 hover:bg-white/90 hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => router.push(`/workflows?id=${workflow.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-green-100/50">
                      <GitBranch className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm md:text-base font-medium text-gray-900 truncate">
                        {workflow.name}
                      </h4>
                      {workflow.description && (
                        <p className="text-xs md:text-sm text-gray-500 truncate mt-1">
                          {workflow.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-2 mt-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {new Date(workflow.createdAt).toLocaleDateString()}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          workflow.status === 'active' ? 'bg-green-100 text-green-700' :
                          workflow.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {workflow.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      className="p-1 rounded hover:bg-gray-100 transition-colors duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/workflows?id=${workflow.id}`);
                      }}
                    >
                      <Edit className="w-3 h-3 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 md:py-8 text-gray-500">
            <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 p-3 rounded-xl bg-gray-100/50">
              <GitBranch className="w-full h-full text-gray-400" />
            </div>
            <p className="text-sm">No recent workflows</p>
            <p className="text-xs text-gray-400 mt-1">Create your first workflow to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}