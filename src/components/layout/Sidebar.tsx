'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  ChevronLeft,
  ChevronRight,
  Wrench,
  Settings,
  Workflow,
  Menu,
  X
} from 'lucide-react';

const navigation = [
  { name: 'Creator Resource', href: '/', icon: LayoutDashboard },
  { name: 'Execute Workflow', href: '/requests', icon: FileText },
  { name: 'Forms', href: '/forms', icon: Settings },
  { name: 'Workflows', href: '/workflows', icon: Workflow },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleMobileMenu}
          className="p-2.5 rounded-xl bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200/50 hover:bg-white transition-all duration-200"
        >
          {isMobileOpen ? (
            <X className="h-5 w-5 text-gray-600" />
          ) : (
            <Menu className="h-5 w-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed md:relative z-50 h-full transition-all duration-300",
        // Mobile styles
        "md:hidden",
        isMobileOpen ? "translate-x-0" : "-translate-x-full",
        // Desktop styles
        "md:block md:translate-x-0",
        isCollapsed ? "w-16" : "w-64"
      )}>
        <div className="h-full bg-gradient-to-r from-blue-100 to-indigo-100  backdrop-blur-sm border-r border-gray-200/50 shadow-sm">
          {/* Header */}
          <div className="flex h-16 items-center px-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-700 to-indigo-500 shadow-sm">
                <Wrench className="h-5 w-5 text-white" />
              </div>
              {!isCollapsed && (
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">FW Creator</h1>
                  <p className="text-xs text-gray-500">Form & Workflow</p>
                </div>
              )}
            </div>
            <button 
              onClick={toggleSidebar}
              className="ml-auto p-1.5 rounded-lg hover:bg-gray-100 transition-colors hidden md:block"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronLeft className="h-4 w-4 text-gray-500" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4">
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200',
                      isActive
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200/50 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <div className={cn(
                      'p-1.5 rounded-lg transition-colors',
                      isActive 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'text-gray-500'
                    )}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    {!isCollapsed && (
                      <span className="ml-3">{item.name}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          {!isCollapsed && (
            <div className="px-3 py-4 border-t border-gray-100">
              <div className="px-3 py-2 rounded-lg bg-gradient-to-r from-gray-50 to-blue-50/50">
                <p className="text-xs text-gray-500">Version 1.0.0</p>
                <p className="text-xs text-gray-400">Form Workflow Builder</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}