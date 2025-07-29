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
              <div className="space-y-4">
                {component.elements.map((element: FormElement) => (
                  <FormElementRenderer
                    key={element.id}
                    element={element}
                    register={register}
                    error={errors[element.id]}
                  />
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