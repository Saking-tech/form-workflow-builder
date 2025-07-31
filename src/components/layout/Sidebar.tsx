'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  Plus,
  ChevronLeft,
  Scale,
  Settings,
  Workflow
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'My Requests', href: '/requests', icon: FileText },
  { name: 'Forms', href: '/forms', icon: Settings },
  { name: 'Workflows', href: '/workflows', icon: Workflow },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-gray-50 border-r border-gray-200">
      <div className="flex h-16 items-center px-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Scale className="h-6 w-6 text-orange-500" />
          <span className="text-lg font-semibold text-gray-900">
            Form-Workflow-Creator
          </span>
        </div>
        <button className="ml-auto p-1 rounded-md hover:bg-gray-200">
          <ChevronLeft className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-gray-200 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}