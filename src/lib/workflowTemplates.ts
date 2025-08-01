import { WorkflowTemplate, WorkflowNode } from '@/types';
import { generateId } from './utils';

// Helper function to create workflow nodes
const createNode = (
  formId: string,
  position: { x: number; y: number },
  status: 'pending' | 'completed' | 'active' = 'pending'
): WorkflowNode => ({
  id: generateId(),
  formId,
  position,
  status
});

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'vendor-onboarding',
    name: 'Vendor Onboarding Workflow',
    description: 'Complete vendor onboarding process with legal review and approvals',
    nodes: [
      createNode('vendor-agreement', { x: 100, y: 100 }),
      createNode('legal-request', { x: 400, y: 100 }),
      createNode('approval-form', { x: 700, y: 100 })
    ],
    connections: [
      { from: 'vendor-agreement', to: 'legal-request' },
      { from: 'legal-request', to: 'approval-form' }
    ]
  },
  
  {
    id: 'client-intake',
    name: 'Client Intake Workflow',
    description: 'Multi-step client intake process with information gathering and review',
    nodes: [
      createNode('client-information', { x: 100, y: 100 }),
      createNode('legal-assessment', { x: 400, y: 100 }),
      createNode('document-review', { x: 700, y: 100 }),
      createNode('final-approval', { x: 1000, y: 100 })
    ],
    connections: [
      { from: 'client-information', to: 'legal-assessment' },
      { from: 'legal-assessment', to: 'document-review' },
      { from: 'document-review', to: 'final-approval' }
    ]
  },
  
  {
    id: 'contract-review',
    name: 'Contract Review Workflow',
    description: 'Standard contract review process with legal and business approvals',
    nodes: [
      createNode('contract-submission', { x: 100, y: 100 }),
      createNode('legal-review', { x: 400, y: 100 }),
      createNode('business-approval', { x: 700, y: 100 }),
      createNode('final-signature', { x: 1000, y: 100 })
    ],
    connections: [
      { from: 'contract-submission', to: 'legal-review' },
      { from: 'legal-review', to: 'business-approval' },
      { from: 'business-approval', to: 'final-signature' }
    ]
  },
  
  {
    id: 'simple-approval',
    name: 'Simple Approval Workflow',
    description: 'Basic two-step approval process for simple requests',
    nodes: [
      createNode('request-form', { x: 100, y: 100 }),
      createNode('approval-form', { x: 400, y: 100 })
    ],
    connections: [
      { from: 'request-form', to: 'approval-form' }
    ]
  }
]; 