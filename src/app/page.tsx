'use client';

import React, { useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { FormBuilder } from '@/components/form-builder/FormBuilder';
import { WorkflowDesigner } from '@/components/workflow-designer/WorkflowDesigner';
import { WorkflowExecutionPage } from '@/components/workflow-execution/WorkflowExecutionPage';

type Page = 'forms' | 'workflows' | 'executions';

export default function Home() {
  const [currentPage, setCurrentPage] = useState<Page>('forms');

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