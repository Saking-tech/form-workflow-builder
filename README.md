# Matter Intake System - Drag-and-Drop Form Builder & Workflow Generator

A comprehensive web application for creating custom forms, building workflows, and executing multi-step processes. Built with Next.js, TypeScript, and modern web technologies.

## Features

### 🎯 Core Functionality
- **Drag-and-Drop Form Builder**: Create custom forms with various field types
- **Visual Workflow Designer**: Build workflows using React Flow
- **Multi-Step Request Creation**: Create requests with validation and progress tracking
- **Workflow Execution**: Execute workflows step-by-step with progress tracking
- **Dashboard Analytics**: View KPIs and trends

### 🎨 UI/UX Features
- Clean, modern interface inspired by professional legal systems
- Responsive design with Tailwind CSS
- Real-time form validation
- Progress indicators and status tracking
- Modal dialogs for workflow execution

### 📊 Form Field Types
- Text Input
- Text Area
- Dropdown/Select
- Date Picker
- File Upload
- Radio Buttons
- Checkboxes

### 🔄 Workflow Features
- Visual workflow designer with React Flow
- Form-to-workflow mapping
- Step-by-step execution
- Progress tracking
- Status management

## Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Drag & Drop**: @dnd-kit/core
- **Workflow Visualization**: @xyflow/react
- **Form Validation**: React Hook Form + Zod
- **Icons**: Lucide React

## Project Structure

```
form-workflow-builder/
├── app/                    # Next.js App Router pages
│   ├── create/            # Create request page
│   ├── forms/             # Form builder page
│   ├── requests/          # My requests page
│   └── page.tsx           # Dashboard
├── components/            # React components
│   ├── form-builder/      # Form builder components
│   ├── layout/           # Layout components
│   └── workflow-designer/ # Workflow designer components
├── stores/               # Zustand stores
├── types/                # TypeScript definitions
├── lib/                  # Utility functions
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd form-workflow-builder
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Guide

### 1. Dashboard
- View KPIs and analytics
- Monitor request statuses
- Access quick actions

### 2. Create Forms
1. Navigate to "Forms" in the sidebar
2. Click "Create New Form"
3. Drag field types from the left panel to the canvas
4. Configure field properties (label, validation, etc.)
5. Save your form

### 3. Create Requests
1. Navigate to "Create Request"
2. Fill out the multi-step form:
   - Step 1: Request Type & Agreement Information
   - Step 2: Document Upload
   - Step 3: Vendor Information & Approvals
3. Submit to create a workflow and request

### 4. Execute Workflows
1. Go to "My Requests"
2. Click "Execute" on any request
3. Follow the step-by-step workflow
4. Complete each form step
5. Track progress through the visual stepper

## Key Components

### Form Builder
- **FieldPalette**: Draggable field types
- **FormCanvas**: Drop zone for form building
- **FormFieldRenderer**: Individual field configuration

### Workflow Designer
- **WorkflowDesigner**: Main workflow canvas
- **FormNode**: Form nodes in workflow
- **StartNode/EndNode**: Workflow start/end nodes

### Request Management
- **CreateRequestPage**: Multi-step request creation
- **RequestsPage**: Request listing and execution
- **WorkflowExecution**: Step-by-step workflow execution

## State Management

The application uses Zustand for state management with three main stores:

- **FormStore**: Manages forms and form fields
- **WorkflowStore**: Manages workflows and workflow nodes
- **RequestStore**: Manages requests and execution state

## Data Models

### Form
```typescript
interface Form {
  id: string;
  name: string;
  description?: string;
  fields: FormField[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Workflow
```typescript
interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  connections: Array<{from: string; to: string}>;
  status: 'draft' | 'active' | 'completed';
  createdAt: Date;
}
```

### Request
```typescript
interface Request {
  id: string;
  title: string;
  workflowId: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  currentStep: number;
  formData: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
```

## Development

### Adding New Field Types
1. Add the field type to the `FormField` interface in `types/index.ts`
2. Add the field to `FIELD_TYPES` in `components/form-builder/FieldPalette.tsx`
3. Implement field rendering logic in `FormFieldRenderer`

### Adding New Workflow Node Types
1. Create a new node component in `components/workflow-designer/`
2. Add the node type to the `nodeTypes` object in `WorkflowDesigner.tsx`
3. Implement node-specific logic

### Styling
The application uses Tailwind CSS for styling. Custom styles can be added to `app/globals.css`.

## Deployment

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- UI inspiration from professional legal intake systems
- React Flow for workflow visualization
- @dnd-kit for drag-and-drop functionality
- Tailwind CSS for styling
- Lucide React for icons