'use client';

import { useFormStore } from '@/stores/formStore';
import { useWorkflowStore } from '@/stores/workflowStore';
import { useRequestStore } from '@/stores/requestStore';
import { getStatusColor, getStatusIcon } from '@/lib/utils';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Building,
  FileText,
  TrendingUp
} from 'lucide-react';

export default function Dashboard() {
  const { forms } = useFormStore();
  const { workflows } = useWorkflowStore();
  const { requests } = useRequestStore();

  const pendingRequests = requests.filter(r => r.status === 'pending').length;
  const inProgressRequests = requests.filter(r => r.status === 'in-progress').length;
  const completedRequests = requests.filter(r => r.status === 'completed').length;
  const cancelledRequests = requests.filter(r => r.status === 'cancelled').length;

  const departmentStats = {
    'Product': 1,
    'IT': 0,
    'Marketing & Sales': 0,
    'Finance': 0,
    'HR': 0,
    'Operations': 0,
    'Legal': 0
  };

  const documentTypeStats = {
    'Order form': 1,
    'Master Agreement': 0,
    'Amendment': 0,
    'Statement of Work': 0,
    'Data Processing Agreement': 0,
    'AI Addendum': 0
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Procurement - Dashboard</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-lg border-l-4 border-yellow-400 shadow-sm">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Assignment</p>
              <p className="text-2xl font-bold text-gray-900">{pendingRequests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border-l-4 border-orange-400 shadow-sm">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">With Legal</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border-l-4 border-purple-400 shadow-sm">
          <div className="flex items-center">
            <Building className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">With Procurement</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border-l-4 border-green-400 shadow-sm">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed (Last 30 days)</p>
              <p className="text-2xl font-bold text-gray-900">{completedRequests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border-l-4 border-red-400 shadow-sm">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-gray-900">{cancelledRequests}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Matters By Department */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Active Matters</h3>
              <p className="text-sm text-gray-600">By Department</p>
            </div>
            <select className="text-sm border border-gray-300 rounded-md px-2 py-1">
              <option>All...</option>
            </select>
          </div>
          
          <div className="flex items-center justify-center h-48">
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 rounded-full border-8 border-blue-500"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">1</span>
              </div>
            </div>
            <div className="ml-6">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Product</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Matters By Document Type */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Active Matters</h3>
              <p className="text-sm text-gray-600">By Document Type</p>
            </div>
            <select className="text-sm border border-gray-300 rounded-md px-2 py-1">
              <option>All...</option>
            </select>
          </div>
          
          <div className="flex items-center justify-center h-48">
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 rounded-full border-8 border-green-500"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-900">Order form: 1</span>
              </div>
            </div>
            <div className="ml-6">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Order form</span>
              </div>
            </div>
          </div>
        </div>

        {/* Critical Matters */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Critical Matters</h3>
          </div>
          
          <div className="flex flex-col items-center justify-center h-48 text-gray-500">
            <Clock className="h-12 w-12 mb-2" />
            <p className="text-sm">No critical matters</p>
          </div>
        </div>
      </div>

      {/* Matters Trendline */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Matters Trendline</h3>
          <select className="text-sm border border-gray-300 rounded-md px-2 py-1">
            <option>All Agreement Types</option>
          </select>
        </div>
        
        <div className="h-64 flex items-end justify-center space-x-4">
          {['Aug 2024', 'Sep 2024', 'Oct 2024', 'Nov 2024', 'Dec 2024', 'Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025', 'May 2025', 'Jun 2025', 'Jul 2025'].map((month, index) => (
            <div key={month} className="flex flex-col items-center">
              <div className="w-8 bg-gray-300 rounded-t-sm mb-2" style={{ height: index === 11 ? '20px' : '4px' }}></div>
              <span className="text-xs text-gray-500 rotate-45 origin-left">{month}</span>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center space-x-4 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-300 rounded-sm"></div>
            <span className="text-sm text-gray-600">Created</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-400 rounded-sm"></div>
            <span className="text-sm text-gray-600">Completed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-red-500 border-dashed"></div>
            <span className="text-sm text-gray-600">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}