# Form Builder & Workflow Generator

A comprehensive drag-and-drop form builder with workflow automation capabilities, designed for business and legal processes.

## Features

### 🎯 Core Features
- **Drag-and-Drop Form Builder**: Intuitive visual form creation
- **Multi-Part Forms**: Create complex forms with multiple sections
- **Workflow Designer**: Visual workflow creation with React Flow
- **Workflow Execution**: Step-by-step form completion
- **Dashboard Analytics**: Real-time insights and metrics

### 🏢 Business Features
- **Company Information Fields**: Complete business entity details
- **Contact Information**: Comprehensive contact management
- **Address Management**: Full address input with validation
- **Agreement Types**: Pre-configured legal agreement templates
- **Terms & Conditions**: Built-in legal compliance

### 📊 Dashboard
- **Key Metrics**: Pending assignments, legal reviews, procurement status
- **Visual Charts**: Department and document type analytics
- **Trend Analysis**: Historical data visualization
- **Critical Matters**: Priority workflow monitoring

### 🔧 Technical Features
- **TypeScript**: Full type safety
- **React 18+**: Latest React features
- **Zustand**: Lightweight state management
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Modern component library
- **React Flow**: Professional workflow visualization
- **@dnd-kit**: Accessible drag-and-drop

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd form-workflow-builder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## Usage

### Creating Forms

1. **Navigate to Forms Tab**
   - Click on "Forms" in the navigation
   - View existing forms or create new ones

2. **Create New Form**
   - Click "Create New Form"
   - Choose between Single Form or Multi-Part Form
   - Set number of parts for multi-part forms

3. **Build Your Form**
   - Drag fields from the palette to the canvas
   - Use categorized field types:
     - **Basic**: Text, numbers, emails, dates
     - **Advanced**: Dropdowns, checkboxes, radio buttons
     - **Business**: Company info, contact details, addresses
     - **Legal**: Terms, agreement types
     - **Media**: File uploads, signatures
     - **Layout**: Headings, paragraphs, dividers

4. **Configure Fields**
   - Set labels, placeholders, validation rules
   - Configure field width and layout options
   - Add help text and conditional logic

### Creating Workflows

1. **Navigate to Workflows Tab**
   - Click on "Workflows" in the navigation
   - Create new workflow or select existing

2. **Design Workflow**
   - Add forms as workflow nodes
   - Connect nodes to create process flow
   - Configure node settings and conditions

3. **Execute Workflows**
   - Navigate to "Executions" tab
   - Select workflow to execute
   - Complete forms step-by-step

### Dashboard Analytics

1. **View Key Metrics**
   - Pending assignments
   - Legal and procurement status
   - Completion rates

2. **Analyze Trends**
   - Department-wise distribution
   - Document type analytics
   - Historical performance

## Field Types

### Basic Fields
- **Short Text**: Single line input
- **Long Text**: Multi-line text area
- **Number**: Numeric input with validation
- **Email**: Email address with format validation
- **Phone**: Phone number input
- **Date**: Date picker

### Advanced Fields
- **Dropdown**: Select from options
- **Checkbox**: Multiple choice selection
- **Radio Buttons**: Single choice selection

### Business Fields
- **Company Information**: Complete business details
- **Contact Information**: Person details
- **Address**: Full address with validation

### Legal Fields
- **Terms & Conditions**: Legal compliance section
- **Agreement Type**: Pre-configured templates

### Media Fields
- **File Upload**: Document attachment
- **Signature**: Digital signature capture

### Layout Fields
- **Heading**: Section titles
- **Paragraph**: Text content
- **Divider**: Visual separators

## Multi-Part Forms

Create complex forms with multiple sections:

1. **Choose Multi-Part Form**
   - Select "Multi-Part Form" when creating
   - Set number of parts (2-10)

2. **Organize Content**
   - Each part can contain multiple components
   - Use sections, rows, and grids for layout
   - Auto-save functionality per part

3. **Progressive Disclosure**
   - Show/hide parts based on conditions
   - Conditional field visibility
   - Part-specific validation

## Workflow Features

### Visual Designer
- **React Flow Integration**: Professional workflow editor
- **Node Types**: Form nodes with status indicators
- **Connection Management**: Visual process flow
- **Validation**: Prevent invalid connections

### Execution Engine
- **Step-by-Step**: Guided form completion
- **Progress Tracking**: Visual progress indicators
- **Data Persistence**: Save progress automatically
- **Conditional Logic**: Dynamic workflow paths

### Status Management
- **Pending**: Awaiting assignment
- **Active**: Currently in progress
- **Completed**: Successfully finished
- **Error**: Failed execution

## Architecture

### State Management
- **Zustand**: Lightweight, performant state
- **Persistent Storage**: Local storage integration
- **Type Safety**: Full TypeScript support

### Component Structure
```
src/
├── components/
│   ├── dashboard/          # Dashboard analytics
│   ├── form-builder/       # Form creation tools
│   ├── form-renderer/      # Form display
│   ├── workflow-designer/  # Workflow editor
│   ├── workflow-execution/ # Execution engine
│   ├── layout/            # Navigation and layout
│   └── ui/               # Reusable components
├── stores/               # State management
├── types/               # TypeScript definitions
├── lib/                 # Utilities and helpers
└── app/                 # Next.js app router
```

### Data Models

#### Form Structure
```typescript
interface Form {
  id: string;
  name: string;
  description?: string;
  components: FormComponent[];
  settings: {
    multiPart?: boolean;
    parts?: {
      total: number;
      current: number;
      titles: string[];
    };
  };
}
```

#### Workflow Structure
```typescript
interface Workflow {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  connections: Array<{from: string, to: string}>;
  status: 'draft' | 'active' | 'completed';
  settings?: {
    type: 'procurement' | 'vendor-agreement' | 'nda' | 'custom';
    priority: 'low' | 'medium' | 'high' | 'critical';
  };
}
```

## Customization

### Adding New Field Types
1. **Update Types**: Add to `FormElement['type']`
2. **Create Element**: Add to `createFormElement()`
3. **Render Component**: Add case to `FormElementRenderer`
4. **Update Palette**: Add to `fieldTypes` array

### Styling
- **Tailwind CSS**: Utility-first approach
- **shadcn/ui**: Consistent component library
- **Custom Themes**: Extensible design system

### Business Logic
- **Validation Rules**: Custom field validation
- **Conditional Logic**: Dynamic form behavior
- **Auto-Fill**: Smart field population
- **Integration**: API endpoints for data sync

## Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Variables
```env
NEXT_PUBLIC_API_URL=your-api-url
NEXT_PUBLIC_APP_NAME=Form Builder
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code examples

---

**Built with ❤️ using Next.js, React, TypeScript, and Tailwind CSS**
