'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  GitBranch, 
  Play, 
  BarChart3,
  Building2,
  Scale,
  Briefcase
} from 'lucide-react';

export type NavigationTab = 'dashboard' | 'forms' | 'workflows' | 'executions';

interface NavigationProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const tabs = [
    {
      id: 'dashboard' as NavigationTab,
      label: 'Dashboard',
      icon: BarChart3,
      description: 'Overview and analytics'
    },
    {
      id: 'forms' as NavigationTab,
      label: 'Forms',
      icon: FileText,
      description: 'Form builder and management'
    },
    {
      id: 'workflows' as NavigationTab,
      label: 'Workflows',
      icon: GitBranch,
      description: 'Workflow designer'
    },
    {
      id: 'executions' as NavigationTab,
      label: 'Executions',
      icon: Play,
      description: 'Run and monitor workflows'
    }
  ];

  return (
    <nav className="bg-white border-b border-gray-200 px-4 sm:px-6">
      <div className="flex items-center justify-between h-16">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Matter Intake System</h1>
              <p className="text-xs text-gray-500">Procurement</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <Button
                key={tab.id}
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onTabChange(tab.id)}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title={tab.description}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        {/* User Menu */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="relative">
            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-gray-700">S</span>
            </div>
          </Button>
        </div>
      </div>
    </nav>
  );
}