'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { FormBuilder } from '@/components/form-builder/FormBuilder';
import { WorkflowDesigner } from '@/components/workflow-designer/WorkflowDesigner';
import { WorkflowExecutionPage } from '@/components/workflow-execution/WorkflowExecutionPage';

type Page = 'forms' | 'workflows' | 'executions';

export default function Home() {
  const [currentPage, setCurrentPage] = useState<Page>('forms');

  // Global zoom functionality
  useEffect(() => {
    const handleGlobalWheel = (event: WheelEvent) => {
      // Only handle zoom if Ctrl/Cmd is pressed and we're in a workflow or form builder
      if ((event.ctrlKey || event.metaKey) && (currentPage === 'forms' || currentPage === 'workflows')) {
        event.preventDefault();
      }
    };

    document.addEventListener('wheel', handleGlobalWheel, { passive: false });
    
    return () => {
      document.removeEventListener('wheel', handleGlobalWheel);
    };
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'forms':
        return <FormBuilder />;
      case 'workflows':
        return <WorkflowDesigner />;
      case 'executions':
        return <WorkflowExecutionPage />;
      default:
        return <FormBuilder />;
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <Navigation 
        activeTab={currentPage} 
        onTabChange={setCurrentPage} 
      />
      <main className="flex-1 overflow-hidden">
        {renderPage()}
      </main>
    </div>
  );
}