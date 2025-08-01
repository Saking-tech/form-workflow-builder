# FW Creator - Drag-and-Drop Form Builder & Workflow Generator

A comprehensive web application for creating custom forms, building workflows, and executing multi-step processes. Built with Next.js, TypeScript, and modern web technologies.

## Features

### 🎯 Core Functionality
- **Drag-and-Drop Form Builder**: Create custom forms with various field types
- **Visual Workflow Designer**: Build workflows using React Flow
- **Multi-Step Request Creation**: Create requests with validation and progress tracking
- **Workflow Execution**: Execute workflows step-by-step with progress tracking

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

### Frontend Technologies
- **Next.js 15**: Provides server-side rendering, routing, and optimized performance for modern web applications
- **React 18**: Enables component-based UI development with hooks and concurrent features
- **TypeScript**: Ensures type safety and better developer experience with compile-time error checking

### Styling & UI
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development and consistent design
- **Lucide React**: Modern icon library for clean, scalable icons

### State Management & Data Handling
- **Zustand**: Lightweight state management library for simple and efficient global state management
- **React Hook Form**: Performant form library with built-in validation
- **Zod**: TypeScript-first schema validation for runtime type checking

### Interactive Features
- **@dnd-kit/core**: Modern drag-and-drop library for form building functionality
- **@xyflow/react**: React Flow for visual workflow design and node-based interfaces

### Development Tools
- **ESLint**: Code linting for maintaining code quality
- **PostCSS**: CSS processing for Tailwind CSS optimization


## Project Structure

```
form-workflow-builder/
├── app/                    # Next.js App Router pages
│   ├── create/            # Create request page
│   ├── forms/             # Form builder page
│   ├── requests/          # Execution page
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
git clone https://github.com/Saking-tech/form-workflow-builder
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

### 1. Creator Resources
- Access to Form Creator
- Access to Workflow Creator
- Access quick actions

### 2. Form Creation Process

#### Step 1: Access Form Creator
1. Navigate to the dashboard
2. Click on "Form Creator" tab
3. Choose from three options:
   - **Create New Form**: Start from scratch
   - **Use Template**: Start with pre-built templates
   - **Import Form**: Import from external sources

#### Step 2: Create Form Structure
1. **From Scratch**:
   - Click "Create Form" button
   - Enter form name and description
   - Click "Create Form" to start building

2. **From Template**:
   - Click "Use Template" button
   - Select from available templates (Legal Intake, Client Information, etc.)
   - Click "Use This Template" to start with pre-built structure

#### Step 3: Build Your Form
1. **Drag and Drop Interface**:
   - Drag field types from the left panel to the canvas
   - Configure field properties (label, validation, required status)
   - Organize fields into sections

2. **Field Configuration**:
   - Set field labels and descriptions
   - Configure validation rules
   - Set required/optional status
   - Add field-specific options (dropdown choices, file types, etc.)

#### Step 4: Preview and Test
1. **Preview Form**: Click the eye icon to see how the form looks
2. **Test Form**: Click "Test" button to interact with the form with validation
3. **Save Form**: Click "Save Form" to store your creation

#### Step 5: Manage Forms
- **Edit**: Modify existing forms
- **Duplicate**: Create copies of forms
- **Delete**: Remove unwanted forms
- **Export**: Share forms with others


### 3. Workflows

#### Step 1: Access the Workflow Designer
1. Navigate to the "Workflows" section from the main dashboard.
2. Click the "Create Workflow" button to start a new workflow.

#### Step 2: Name and Describe the Workflow
1. Enter a unique name for your workflow in the "Workflow Name" field.
2. (Optional) Add a description to clarify the workflow’s purpose.

#### Step 3: Add Forms to the Workflow
1. Click "Add Form" or drag forms from the available list into the workflow canvas.
2. Select the forms you want to include as steps in your workflow.
3. Repeat to add multiple forms as needed.

#### Step 4: Connect Forms in Sequence
1. Arrange the forms in the desired order on the canvas.
2. Draw connections between forms to define the flow (e.g., drag from the end of one form to the start of the next).
3. Ensure there is a clear start and end to the workflow.

#### Step 5: Review and Save the Workflow
1. Double-check the workflow structure and connections.
2. Click the "Save Workflow" button to store your workflow.

#### Step 6: View and Manage Workflows
1. After saving, your workflow will appear in the "All Workflows" list.
2. From here, you can view, edit, duplicate, or delete workflows as needed.

### 4. Execute Workflows

1. Navigate to the **"Execute Workflows"** section from the main dashboard.
2. In the **"Available Workflows"** list, locate the workflow you want to run.
3. Click the **"Execute Workflow"** button for your chosen workflow.
4. In the **"Create New Request"** modal:
   - Enter a title for your request.
   - Select the workflow you want to execute (if not already selected).
   - Click **"Create Request"**.
5. The workflow execution will begin. For each step:
   - Complete the form fields as required.
   - Click **"Next"** or **"Submit"** to proceed to the next step.
   - Repeat until all steps are completed.
6. Track your progress using the visual stepper at the top of the page.
7. After completing all steps, review the summary and confirm completion.
8. Your workflow execution will be marked as **completed**. You can view details or re-execute by clicking the appropriate button in the request list.

## Key Components

### Form Builder
- **FieldPalette**: Draggable field types
- **FormSections**: Draggable form section
- **FormCanvas**: Drop zone for form building
- **FormFieldRenderer**: Individual field configuration

### Workflow Designer
- **WorkflowDesigner**: Main workflow canvas
- **FormNode**: Form nodes in workflow
- **StartNode/EndNode**: Workflow start/end nodes

### Workflow Execution
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

## Acknowledgments

- UI inspiration from professional legal intake systems
- React Flow for workflow visualization
- @dnd-kit for drag-and-drop functionality
- Tailwind CSS for styling
- Lucide React for icons
