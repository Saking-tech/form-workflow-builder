'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFormStore } from '@/stores/formStore';
import { useWorkflowStore } from '@/stores/workflowStore';
import { 
  BarChart3, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  TrendingUp,
  Users,
  FileText,
  GitBranch,
  Play,
  Plus,
  Bell,
  Calendar,
  Activity,
  Building2,
  Scale
} from 'lucide-react';

export function Dashboard() {
  const { forms } = useFormStore();
  const { workflows, executions } = useWorkflowStore();

  // Mock data for dashboard stats (in a real app, this would come from an API)
  const dashboardStats = {
    pendingAssignments: 1,
    withLegal: 0,
    withProcurement: 0,
    completedLast30Days: 0,
    cancelled: 0,
    activeMattersByDepartment: { 'Product': 1 },
    activeMattersByDocumentType: { 'Order form': 1 },
    criticalMatters: 0,
    mattersTrendline: [
      { month: 'Aug 2024', created: 0, completed: 0, active: 0 },
      { month: 'Sep 2024', created: 0, completed: 0, active: 0 },
      { month: 'Oct 2024', created: 0, completed: 0, active: 0 },
      { month: 'Nov 2024', created: 0, completed: 0, active: 0 },
      { month: 'Dec 2024', created: 0, completed: 0, active: 0 },
      { month: 'Jan 2025', created: 0, completed: 0, active: 0 },
      { month: 'Feb 2025', created: 0, completed: 0, active: 0 },
      { month: 'Mar 2025', created: 0, completed: 0, active: 0 },
      { month: 'Apr 2025', created: 0, completed: 0, active: 0 },
      { month: 'May 2025', created: 0, completed: 0, active: 0 },
      { month: 'Jun 2025', created: 0, completed: 0, active: 1 },
      { month: 'Jul 2025', created: 1, completed: 0, active: 1 },
    ]
  };

  const getMetricCard = (title: string, value: number, icon: React.ReactNode, color: string) => (
    <Card className="p-6 bg-white border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </Card>
  );

  const getDonutChart = (title: string, data: Record<string, number>, color: string) => (
    <Card className="p-6 bg-white border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <select className="text-sm border border-gray-300 rounded px-2 py-1">
          <option>All...</option>
        </select>
      </div>
      <div className="flex items-center justify-center">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-200"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className={color}
              strokeDasharray={`${Object.values(data)[0] * 176} 176`}
              strokeDashoffset="0"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-900">{Object.values(data)[0]}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${color.replace('text-', 'bg-')}`}></div>
              <span className="text-gray-700">{key}</span>
            </div>
            <span className="font-medium">{value}</span>
          </div>
        ))}
      </div>
    </Card>
  );

  return (
    <div className="h-full bg-gray-50 overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Procurement - Dashboard</h1>
            <p className="text-gray-600">Overview of your matter intake system</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Bell className="w-5 h-5" />
            </Button>
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">S</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {getMetricCard(
              'Pending Assignment',
              dashboardStats.pendingAssignments,
              <FileText className="w-6 h-6 text-white" />,
              'bg-yellow-500'
            )}
            {getMetricCard(
              'With Legal',
              dashboardStats.withLegal,
              <Scale className="w-6 h-6 text-white" />,
              'bg-orange-500'
            )}
            {getMetricCard(
              'With Procurement',
              dashboardStats.withProcurement,
              <Building2 className="w-6 h-6 text-white" />,
              'bg-purple-500'
            )}
            {getMetricCard(
              'Completed (Last 30 days)',
              dashboardStats.completedLast30Days,
              <CheckCircle className="w-6 h-6 text-white" />,
              'bg-green-500'
            )}
            {getMetricCard(
              'Cancelled',
              dashboardStats.cancelled,
              <XCircle className="w-6 h-6 text-white" />,
              'bg-red-500'
            )}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Matters By Department */}
            {getDonutChart(
              'Active Matters By Department',
              dashboardStats.activeMattersByDepartment,
              'text-blue-500'
            )}

            {/* Active Matters By Document Type */}
            {getDonutChart(
              'Active Matters By Document Type',
              dashboardStats.activeMattersByDocumentType,
              'text-green-500'
            )}

            {/* Critical Matters */}
            <Card className="p-6 bg-white border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Critical Matters</h3>
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No critical matters</p>
              </div>
            </Card>
          </div>

          {/* Matters Trendline */}
          <Card className="p-6 bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Matters Trendline</h3>
              <select className="text-sm border border-gray-300 rounded px-3 py-1">
                <option>All Agreement Types</option>
              </select>
            </div>
            
            {/* Chart */}
            <div className="h-64 flex items-end justify-between space-x-2">
              {dashboardStats.mattersTrendline.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center space-y-2">
                  {/* Created Bar */}
                  <div className="w-full bg-gray-300 rounded-t" style={{ height: `${item.created * 20}px` }}></div>
                  
                  {/* Active Line */}
                  <div className="w-full border-t-2 border-red-500 border-dashed" style={{ height: `${item.active * 20}px` }}></div>
                  
                  {/* Month Label */}
                  <span className="text-xs text-gray-500 text-center">{item.month}</span>
                </div>
              ))}
            </div>
            
            {/* Legend */}
            <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <span className="text-gray-600">Created</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-gray-600">Completed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-t-2 border-red-500 border-dashed"></div>
                <span className="text-gray-600">Active</span>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-white border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Forms</h3>
              </div>
              <p className="text-gray-600 mb-4">Create and manage your form templates</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Total Forms</span>
                  <span className="font-medium">{forms.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Multi-Part Forms</span>
                  <span className="font-medium">{forms.filter(f => f.settings?.multiPart).length}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <GitBranch className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Workflows</h3>
              </div>
              <p className="text-gray-600 mb-4">Design and manage workflow processes</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Total Workflows</span>
                  <span className="font-medium">{workflows.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Active Workflows</span>
                  <span className="font-medium">{workflows.filter(w => w.status === 'active').length}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Play className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Executions</h3>
              </div>
              <p className="text-gray-600 mb-4">Monitor workflow executions and progress</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Total Executions</span>
                  <span className="font-medium">{executions.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">In Progress</span>
                  <span className="font-medium">{executions.filter(e => e.status === 'in-progress').length}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}