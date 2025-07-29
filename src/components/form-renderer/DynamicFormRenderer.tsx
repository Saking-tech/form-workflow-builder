'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Form, FormComponent, FormElement } from '@/types';
import { Send, AlertCircle } from 'lucide-react';

interface DynamicFormRendererProps {
  form: Form;
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void;
  submitButtonText?: string;
  className?: string;
}

interface FormElementRendererProps {
  element: FormElement;
  register: any;
  error?: any;
}

function FormElementRenderer({ element, register, error }: FormElementRendererProps) {
  const renderElement = () => {
    switch (element.type) {
      case 'short-text':
        return (
          <Input
            {...register(element.id)}
            type="text"
            placeholder={element.placeholder}
            className={error ? 'border-red-500 focus:ring-red-500' : ''}
          />
        );
      
      case 'long-text':
        return (
          <textarea
            {...register(element.id)}
            placeholder={element.placeholder}
            rows={element.settings?.rows || 4}
            className={`w-full px-3 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical ${
              error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
            }`}
          />
        );
      
      case 'number':
        return (
          <Input
            {...register(element.id)}
            type="number"
            placeholder={element.placeholder}
            className={error ? 'border-red-500 focus:ring-red-500' : ''}
          />
        );
      
      case 'email':
        return (
          <Input
            {...register(element.id)}
            type="email"
            placeholder={element.placeholder}
            className={error ? 'border-red-500 focus:ring-red-500' : ''}
          />
        );
      
      case 'phone':
        return (
          <Input
            {...register(element.id)}
            type="tel"
            placeholder={element.placeholder}
            className={error ? 'border-red-500 focus:ring-red-500' : ''}
          />
        );
      
      case 'date':
        return (
          <Input
            {...register(element.id)}
            type="date"
            className={error ? 'border-red-500 focus:ring-red-500' : ''}
          />
        );
      
      case 'dropdown':
        return (
          <select
            {...register(element.id)}
            className={`w-full px-3 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select an option...</option>
            {element.options?.map((option: any, index: number) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'checkbox':
        return (
          <div className="space-y-2">
            {element.options?.map((option: any, index: number) => (
              <label key={index} className="flex items-center space-x-2">
                <input
                  {...register(element.id)}
                  type="checkbox"
                  value={option.value}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );
      
      case 'radio':
        return (
          <div className="space-y-2">
            {element.options?.map((option: any, index: number) => (
              <label key={index} className="flex items-center space-x-2">
                <input
                  {...register(element.id)}
                  type="radio"
                  value={option.value}
                  className="border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );
      
      case 'file-upload':
        return (
          <Input
            {...register(element.id)}
            type="file"
            accept={element.settings?.accept}
            multiple={element.settings?.multiple}
            className={error ? 'border-red-500 focus:ring-red-500' : ''}
          />
        );
      
      case 'signature':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-300 transition-colors">
            <div className="text-gray-500">
              <div className="text-2xl mb-2">✍️</div>
              <p className="text-sm">Click to add signature</p>
            </div>
          </div>
        );
      
      case 'heading':
        return (
          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-4">
            {element.label}
          </h3>
        );
      
      case 'paragraph':
        return (
          <p className="text-gray-600 mb-4">
            {element.placeholder}
          </p>
        );
      
      case 'divider':
        return (
          <hr className="my-6 border-gray-300" />
        );

      case 'company-info':
        return (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Company Name</Label>
                <Input
                  {...register(`${element.id}_companyName`)}
                  type="text"
                  placeholder="Enter company name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Tax ID</Label>
                <Input
                  {...register(`${element.id}_taxId`)}
                  type="text"
                  placeholder="Enter tax ID"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Industry</Label>
              <Input
                {...register(`${element.id}_industry`)}
                type="text"
                placeholder="Enter industry"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Website</Label>
              <Input
                {...register(`${element.id}_website`)}
                type="url"
                placeholder="https://example.com"
                className="mt-1"
              />
            </div>
          </div>
        );

      case 'contact-info':
        return (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">First Name</Label>
                <Input
                  {...register(`${element.id}_firstName`)}
                  type="text"
                  placeholder="Enter first name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Last Name</Label>
                <Input
                  {...register(`${element.id}_lastName`)}
                  type="text"
                  placeholder="Enter last name"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Email</Label>
                <Input
                  {...register(`${element.id}_email`)}
                  type="email"
                  placeholder="Enter email address"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Phone</Label>
                <Input
                  {...register(`${element.id}_phone`)}
                  type="tel"
                  placeholder="Enter phone number"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Job Title</Label>
              <Input
                {...register(`${element.id}_jobTitle`)}
                type="text"
                placeholder="Enter job title"
                className="mt-1"
              />
            </div>
          </div>
        );

      case 'address':
        return (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <Label className="text-sm font-medium text-gray-700">Street Address</Label>
              <Input
                {...register(`${element.id}_street`)}
                type="text"
                placeholder="Enter street address"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">City</Label>
                <Input
                  {...register(`${element.id}_city`)}
                  type="text"
                  placeholder="Enter city"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">State</Label>
                <Input
                  {...register(`${element.id}_state`)}
                  type="text"
                  placeholder="Enter state"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">ZIP Code</Label>
                <Input
                  {...register(`${element.id}_zip`)}
                  type="text"
                  placeholder="Enter ZIP code"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Country</Label>
              <Input
                {...register(`${element.id}_country`)}
                type="text"
                placeholder="Enter country"
                className="mt-1"
              />
            </div>
          </div>
        );

      case 'terms':
        return (
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start space-x-3">
              <div className="text-yellow-600 text-lg">⚖️</div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-2">Terms & Conditions</h4>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>By submitting this form, you agree to our terms and conditions.</p>
                  <p>All information provided will be kept confidential and used only for the intended purpose.</p>
                </div>
                <label className="flex items-center space-x-2 mt-3">
                  <input
                    {...register(`${element.id}_accepted`)}
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">I agree to the terms and conditions</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 'agreement-type':
        return (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Select Agreement Type</Label>
            <div className="grid grid-cols-2 gap-3">
              {element.options?.map((option: any, index: number) => (
                <label key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer">
                  <input
                    {...register(element.id)}
                    type="radio"
                    value={option.value}
                    className="border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-xs text-gray-500">Standard agreement template</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        );
      
      default:
        return (
          <div className="p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
            Unsupported element type: {element.type}
          </div>
        );
    }
  };

  // Don't render labels for layout elements
  if (element.type === 'heading' || element.type === 'paragraph' || element.type === 'divider') {
    return renderElement();
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={element.id} className="text-sm font-medium text-gray-700">
        {element.label}
        {element.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      {renderElement()}
      
      {error && (
        <div className="flex items-center space-x-1 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error.message}</span>
        </div>
      )}
      
      {element.helpText && (
        <p className="text-xs text-gray-500">{element.helpText}</p>
      )}
    </div>
  );
}

export function DynamicFormRenderer({
  form,
  initialData = {},
  onSubmit,
  submitButtonText = 'Submit',
  className = '',
}: DynamicFormRendererProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: initialData,
  });

  const handleFormSubmit = (data: Record<string, any>) => {
    onSubmit(data);
  };

  const getElementWidthClass = (width: string) => {
    switch (width) {
      case 'full':
        return 'col-span-2';
      case 'half':
        return 'col-span-1';
      case 'third':
        return 'col-span-1';
      case 'quarter':
        return 'col-span-1';
      default:
        return '';
    }
  };

  // Flatten all elements from all components
  const allElements = form.components.flatMap(component => component.elements);

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      <Card className="p-6">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Form Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{form.name}</h2>
            {form.description && (
              <p className="text-gray-600">{form.description}</p>
            )}
          </div>

          {/* Render Components */}
          {form.components.map((component: FormComponent) => (
            <div key={component.id} className="space-y-4">
              {/* Component Header */}
              <div className="border-b border-gray-200 pb-2">
                <h3 className="text-lg font-semibold text-gray-900">{component.title}</h3>
                {component.description && (
                  <p className="text-sm text-gray-600 mt-1">{component.description}</p>
                )}
              </div>

              {/* Render Elements */}
              <div className={`space-y-4 ${
                component.settings?.layout === 'side-by-side' 
                  ? 'grid grid-cols-2 gap-4' 
                  : ''
              }`}>
                {component.elements.map((element: FormElement) => (
                  <div
                    key={element.id}
                    className={`${
                      component.settings?.layout === 'side-by-side' 
                        ? getElementWidthClass(element.settings?.width || 'full')
                        : ''
                    }`}
                  >
                    <FormElementRenderer
                      element={element}
                      register={register}
                      error={errors[element.id]}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={() => reset()}
              disabled={isSubmitting}
              className=""
            >
              Reset
            </Button>
            <Button
              type="submit"
              variant="default"
              size="default"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Send className="w-4 h-4" />
                  <span>{submitButtonText}</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}