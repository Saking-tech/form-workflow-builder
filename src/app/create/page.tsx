'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormStore } from '@/stores/formStore';
import { useWorkflowStore } from '@/stores/workflowStore';
import { useRequestStore } from '@/stores/requestStore';
import { generateId, validateEmail } from '@/lib/utils';
import { 
  ChevronLeft, 
  FileText, 
  Upload, 
  CheckCircle,
  AlertCircle,
  Calendar,
  Building,
  User,
  Mail,
  Globe,
  DollarSign,
  Users,
  MessageSquare,
  Sparkles,
  ArrowUp,
  File,
  Check,
  ChevronDown
} from 'lucide-react';

interface FormData {
  // Step 1: Request Type
  requestType: string;
  
  // Step 2: Document Upload (AI Analysis)
  uploadedDocument: File | null;
  aiAnalysisComplete: boolean;
  
  // Step 3: Form Details
  title: string;
  natureOfAgreement: string[];
  isNewVendor: string;
  personalDataShared: string;
  involvesAI: string;
  customerLegalEntity: string;
  region: string;
  currency: string;
  agreementValue: string;
  startDate: string;
  endDate: string;
  dueDate: string;
  vendorLegalName: string;
  vendorCountry: string;
  vendorEmail: string;
  requesterName: string;
  department: string;
  approvals: string[];
  comments: string;
  confirmation: boolean;
}

const steps = [
  { id: 1, name: 'Request Type', icon: FileText, status: 'current' },
  { id: 2, name: 'Document Upload', icon: Upload, status: 'upcoming' },
  { id: 3, name: 'Form Details', icon: CheckCircle, status: 'upcoming' }
];

const requestTypes = [
  'Vendor Agreement',
  'NDA',
  'Termination Notice',
  'Advisory',
  'Other(s)'
];

export default function CreateRequestPage() {
  const router = useRouter();
  const { createFormFromTemplate } = useFormStore();
  const { addWorkflow } = useWorkflowStore();
  const { addRequest } = useRequestStore();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    requestType: '',
    uploadedDocument: null,
    aiAnalysisComplete: false,
    title: '',
    natureOfAgreement: [],
    isNewVendor: '',
    personalDataShared: '',
    involvesAI: '',
    customerLegalEntity: '',
    region: '',
    currency: '',
    agreementValue: '',
    startDate: '',
    endDate: '',
    dueDate: '',
    vendorLegalName: '',
    vendorCountry: '',
    vendorEmail: '',
    requesterName: '',
    department: '',
    approvals: [],
    comments: '',
    confirmation: false
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [showRequestTypeDropdown, setShowRequestTypeDropdown] = useState(false);

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<FormData> = {};

    if (step === 1) {
      if (!formData.requestType.trim()) {
        newErrors.requestType = 'Please select a request type';
      }
    }

    if (step === 2) {
      // Document upload is optional, so no validation needed
    }

    if (step === 3) {
      if (!formData.title.trim()) {
        newErrors.title = 'Please enter a title for this agreement request';
      }
      if (formData.natureOfAgreement.length === 0) {
        newErrors.natureOfAgreement = ['Please select at least one document type'];
      }
      if (!formData.isNewVendor) {
        newErrors.isNewVendor = 'Please select whether this is a new vendor';
      }
      if (!formData.personalDataShared) {
        newErrors.personalDataShared = 'Please select whether personal data will be shared';
      }
      if (!formData.involvesAI) {
        newErrors.involvesAI = 'Please select whether the product/service involves AI';
      }
      if (!formData.customerLegalEntity) {
        newErrors.customerLegalEntity = 'Please select a business unit';
      }
      if (!formData.region) {
        newErrors.region = 'Please select a region';
      }
      if (!formData.currency) {
        newErrors.currency = 'Please select a currency';
      }
      if (!formData.agreementValue) {
        newErrors.agreementValue = 'Please enter the agreement value';
      }
      if (!formData.startDate) {
        newErrors.startDate = 'Please select a start date';
      }
      if (!formData.endDate) {
        newErrors.endDate = 'Please select an end date';
      }
      if (!formData.dueDate) {
        newErrors.dueDate = 'Please select a due date';
      }
      if (!formData.vendorLegalName) {
        newErrors.vendorLegalName = 'Please enter the vendor legal name';
      }
      if (!formData.vendorCountry) {
        newErrors.vendorCountry = 'Please enter the vendor country';
      }
      if (!formData.vendorEmail) {
        newErrors.vendorEmail = 'Please enter a valid vendor email';
      } else {
        const emailValidation = validateEmail(formData.vendorEmail);
        if (!emailValidation.isValid) {
          newErrors.vendorEmail = emailValidation.error || 'Please enter a valid email address';
        }
      }
      if (!formData.requesterName) {
        newErrors.requesterName = 'Please enter the requester name';
      }
      if (!formData.department) {
        newErrors.department = 'Please select a department';
      }
      if (formData.approvals.length === 0) {
        newErrors.approvals = ['Please select at least one approval'];
      }
      if (!formData.confirmation) {
        newErrors.confirmation = true;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
        // Update step status
        steps[currentStep - 1].status = 'complete';
        steps[currentStep].status = 'current';
    } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Update step status
      steps[currentStep - 1].status = 'upcoming';
      steps[currentStep - 2].status = 'current';
    }
  };

  const handleSubmit = () => {
    // Create form from template
    const form = createFormFromTemplate('vendor-agreement');
    
    // Create workflow
    const workflowId = generateId();
    const workflow = {
      id: workflowId,
      name: 'Vendor Agreement Workflow',
      description: 'Standard vendor agreement workflow',
      nodes: [
        { id: generateId(), formId: form.id, position: { x: 100, y: 100 }, status: 'pending' as const }
      ],
      connections: [],
      status: 'active' as const,
      createdAt: new Date()
    };
    addWorkflow(workflow);
    
    // Create request
    const requestId = generateId();
    const request = {
      id: requestId,
      title: formData.title || 'Vendor Agreement Request',
      description: 'Vendor agreement request with form data',
      workflowId: workflowId,
      formId: form.id,
      status: 'pending' as const,
      currentStep: 0,
      formData: formData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    addRequest(request);
    
    router.push('/requests');
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      // Simulate AI analysis
      setTimeout(() => {
        updateFormData('uploadedDocument', file);
        updateFormData('aiAnalysisComplete', true);
        setIsUploading(false);
      }, 2000);
    }
  };

  const handleSkipDocumentUpload = () => {
    setCurrentStep(3);
    steps[1].status = 'complete';
    steps[2].status = 'current';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => router.back()}
          className="p-2 text-gray-700 hover:text-gray-900"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Create Legal Request</h1>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step.status === 'complete' ? 'bg-green-600 text-white' :
              step.status === 'current' ? 'bg-blue-600 text-white' :
              'bg-gray-300 text-gray-600'
            }`}>
              <step.icon className="w-5 h-5" />
            </div>
            <span className={`ml-2 text-sm font-medium ${
              step.status === 'complete' ? 'text-green-600' :
              step.status === 'current' ? 'text-blue-600' :
              'text-gray-500'
            }`}>
              {step.name}
            </span>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-4 ${
                step.status === 'complete' ? 'bg-green-600' : 'bg-gray-300'
              }`}></div>
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Request Type */}
      {currentStep === 1 && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center space-x-2 mb-6">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Step 1: Select Request Type</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Request Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowRequestTypeDropdown(!showRequestTypeDropdown)}
                    className={`w-full px-3 py-2 text-left border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.requestType ? 'border-red-500' : 'border-gray-300'
                    } ${formData.requestType ? 'text-gray-900' : 'text-gray-900'}`}
                  >
                    {formData.requestType || 'Choose the type of legal request'}
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-grey-900" />
                  </button>
                  
                  {showRequestTypeDropdown && (
                    <div className="absolute z-10 w-full text-gray-600 mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                      {requestTypes.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            updateFormData('requestType', type);
                            setShowRequestTypeDropdown(false);
                          }}
                          className="w-full px-3 py-2 text-left text-gray-900 hover:bg-gray-600 focus:bg-gray-900 focus:outline-none"
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {errors.requestType && (
                  <div className="flex items-center mt-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.requestType}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Document Upload */}
      {currentStep === 2 && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <File className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">AI Document Analysis</h2>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <Sparkles className="w-3 h-3 mr-1" />
                Smart Upload
              </span>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              {!formData.uploadedDocument ? (
                <div>
                  <ArrowUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Upload your legal document</h3>
                  <p className="text-gray-600 mb-6">
                    Our AI will analyze and auto-fill the form based on your document
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </label>
                  <p className="text-sm text-gray-500 mt-4">
                    Supports PDF, DOC, DOCX, TXT files
                  </p>
                </div>
              ) : (
                <div>
                  <Check className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Document Uploaded Successfully</h3>
                  <p className="text-gray-600 mb-4">
                    {formData.uploadedDocument?.name}
                  </p>
                  {formData.aiAnalysisComplete && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                      <p className="text-green-800 text-sm">
                        AI analysis complete! Form fields have been auto-filled based on your document.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-6">
              <button
                onClick={handleSkipDocumentUpload}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Skip Document Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Form Details */}
      {currentStep === 3 && (
    <div className="space-y-6">
      {/* Agreement Request Details */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Agreement Request Details</h2>
            <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title: <span className="text-red-500">Required</span>
          </label>
          <input
            type="text"
            value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
            placeholder="e.g., Master Agreement_Acme Corp_2025-01-18"
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.title && (
                  <div className="flex items-center mt-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.title}
                  </div>
                )}
              </div>
        </div>
      </div>

      {/* Nature of Agreement */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Nature of Agreement</h2>
            <div className="space-y-4">
              <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nature of Agreement(s) - Select Document Type(s): <span className="text-red-500">Required</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            {[
              'Master or Framework Agreement',
              'Order form',
              'Data Processing Agreement',
              'Amendment',
              'Statement of Work',
                    'AI Addendum',
                    'Other(s)'
            ].map((type) => (
                    <label key={type} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.natureOfAgreement.includes(type)}
                  onChange={(e) => {
                    if (e.target.checked) {
                            updateFormData('natureOfAgreement', [...formData.natureOfAgreement, type]);
                    } else {
                            updateFormData('natureOfAgreement', formData.natureOfAgreement.filter(t => t !== type));
                    }
                  }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{type}</span>
              </label>
            ))}
          </div>
                {errors.natureOfAgreement && (
                  <div className="flex items-center mt-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.natureOfAgreement}
                  </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                    Is this a New Vendor? <span className="text-red-500">Required</span>
            </label>
            <select
              value={formData.isNewVendor}
                    onChange={(e) => updateFormData('isNewVendor', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.isNewVendor ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select: Yes / No</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
                  {errors.isNewVendor && (
                    <div className="flex items-center mt-1 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.isNewVendor}
                  </div>
                  )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                    Will Personal Data be Shared with Vendor? <span className="text-red-500">Required</span>
            </label>
            <select
                    value={formData.personalDataShared}
                    onChange={(e) => updateFormData('personalDataShared', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.personalDataShared ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Yes / No</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
                  {errors.personalDataShared && (
                    <div className="flex items-center mt-1 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.personalDataShared}
                    </div>
                  )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                    Does the Product/Service Involve AI? <span className="text-red-500">Required</span>
            </label>
            <select
              value={formData.involvesAI}
                    onChange={(e) => updateFormData('involvesAI', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.involvesAI ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Yes / No</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
                  {errors.involvesAI && (
                    <div className="flex items-center mt-1 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.involvesAI}
                    </div>
                  )}
                </div>
          </div>
        </div>
      </div>

      {/* Agreement Information */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Agreement Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Legal Entity: <span className="text-red-500">Required</span>
            </label>
            <select
              value={formData.customerLegalEntity}
                  onChange={(e) => updateFormData('customerLegalEntity', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.customerLegalEntity ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select Business Unit</option>
                  <option value="bu_a">Business Unit A</option>
                  <option value="bu_b">Business Unit B</option>
                  <option value="bu_c">Business Unit C</option>
            </select>
                {errors.customerLegalEntity && (
                  <div className="flex items-center mt-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.customerLegalEntity}
                  </div>
                )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                  Region: <span className="text-red-500">Required</span>
            </label>
            <select
              value={formData.region}
                  onChange={(e) => updateFormData('region', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.region ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select Region</option>
                  <option value="na">North America</option>
                  <option value="eu">Europe</option>
                  <option value="ap">Asia Pacific</option>
                  <option value="la">Latin America</option>
            </select>
                {errors.region && (
                  <div className="flex items-center mt-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.region}
                  </div>
                )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency: <span className="text-red-500">Required</span>
            </label>
            <select
              value={formData.currency}
                  onChange={(e) => updateFormData('currency', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.currency ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select Currency</option>
              <option value="usd">USD</option>
              <option value="eur">EUR</option>
              <option value="gbp">GBP</option>
                  <option value="jpy">JPY</option>
            </select>
                {errors.currency && (
                  <div className="flex items-center mt-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.currency}
                  </div>
                )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Agreement Value: <span className="text-red-500">Required</span>
            </label>
            <input
              type="text"
                  value={formData.agreementValue}
                  onChange={(e) => updateFormData('agreementValue', e.target.value)}
              placeholder="Enter agreement value"
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.agreementValue ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.agreementValue && (
                  <div className="flex items-center mt-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.agreementValue}
                  </div>
                )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agreement Start Date: <span className="text-red-500">Required</span>
            </label>
            <input
              type="date"
                  value={formData.startDate}
                  onChange={(e) => updateFormData('startDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.startDate ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.startDate && (
                  <div className="flex items-center mt-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.startDate}
                  </div>
                )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agreement End Date: <span className="text-red-500">Required</span>
            </label>
            <input
              type="date"
                  value={formData.endDate}
                  onChange={(e) => updateFormData('endDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.endDate ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.endDate && (
                  <div className="flex items-center mt-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.endDate}
                  </div>
                )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date: <span className="text-red-500">Required</span>
            </label>
            <input
              type="date"
              value={formData.dueDate}
                  onChange={(e) => updateFormData('dueDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.dueDate ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.dueDate && (
                  <div className="flex items-center mt-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.dueDate}
          </div>
                )}
        </div>
      </div>
    </div>

      {/* Vendor Information */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Vendor Information</h2>
        <p className="text-sm text-gray-600 mb-4">Vendor details and contact information</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor Legal Name: <span className="text-red-500">Required</span>
            </label>
            <input
              type="text"
              value={formData.vendorLegalName}
                  onChange={(e) => updateFormData('vendorLegalName', e.target.value)}
              placeholder="Enter vendor legal name"
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.vendorLegalName ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.vendorLegalName && (
                  <div className="flex items-center mt-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.vendorLegalName}
                  </div>
                )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor Country: <span className="text-red-500">Required</span>
            </label>
            <input
              type="text"
              value={formData.vendorCountry}
                  onChange={(e) => updateFormData('vendorCountry', e.target.value)}
              placeholder="Enter vendor country"
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.vendorCountry ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.vendorCountry && (
                  <div className="flex items-center mt-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.vendorCountry}
                  </div>
                )}
          </div>

              <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor Email: <span className="text-red-500">Required</span>
            </label>
            <input
              type="email"
              value={formData.vendorEmail}
                  onChange={(e) => updateFormData('vendorEmail', e.target.value)}
              placeholder="Enter vendor email"
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.vendorEmail ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.vendorEmail && (
                  <div className="flex items-center mt-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.vendorEmail}
                  </div>
                )}
          </div>
        </div>
      </div>

      {/* Approvals */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Approvals</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requester Name: <span className="text-red-500">Required</span>
            </label>
            <input
              type="text"
              value={formData.requesterName}
                  onChange={(e) => updateFormData('requesterName', e.target.value)}
              placeholder="Enter requester name"
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.requesterName ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.requesterName && (
                  <div className="flex items-center mt-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.requesterName}
                  </div>
                )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department - Select one or more: <span className="text-red-500">Required</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['Product', 'IT', 'Marketing & Sales', 'Finance', 'HR', 'Operations', 'Legal', 'Other(s)'].map((dept) => (
                    <label key={dept} className="flex items-center space-x-2">
                  <input
                        type="radio"
                        name="department"
                        value={dept}
                        checked={formData.department === dept}
                        onChange={(e) => updateFormData('department', e.target.value)}
                        className="rounded-full border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{dept}</span>
                </label>
              ))}
            </div>
                {errors.department && (
                  <div className="flex items-center mt-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.department}
                  </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                  Approvals Received: <span className="text-red-500">Required</span>
            </label>
            <select
                  value={formData.approvals[0] || ''}
                  onChange={(e) => updateFormData('approvals', [e.target.value])}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.approvals ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select approvals...</option>
                  <option value="legal_review">Legal Review</option>
                  <option value="finance_approval">Finance Approval</option>
                  <option value="it_security">IT Security Review</option>
                  <option value="procurement">Procurement Approval</option>
            </select>
                {errors.approvals && (
                  <div className="flex items-center mt-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.approvals}
                  </div>
            )}
          </div>
        </div>
      </div>

      {/* Comments and Confirmations */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Comments and Confirmations</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Comments
            </label>
            <textarea
                  value={formData.comments}
                  onChange={(e) => updateFormData('comments', e.target.value)}
              placeholder="Enter any additional comments or special requirements..."
              rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
                <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.confirmation}
                    onChange={(e) => updateFormData('confirmation', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                I confirm that I&apos;ve read the full agreement and all information provided is accurate.
              </span>
            </label>
                {errors.confirmation && (
                  <div className="flex items-center mt-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.confirmation}
          </div>
                )}
              </div>
            </div>
        </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
          className={`px-4 py-2 rounded-md ${
            currentStep === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Back
          </button>
          <button
            onClick={handleNext}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
          {currentStep === 3 ? 'Submit Request' : 'Next'}
          </button>
      </div>
    </div>
  );
}