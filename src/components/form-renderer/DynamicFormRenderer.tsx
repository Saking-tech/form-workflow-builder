'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { createFormValidationSchema } from '@/lib/formUtils';
import { Form } from '@/types';
import { Send, AlertCircle } from 'lucide-react';

interface DynamicFormRendererProps {
  form: Form;
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void;
  submitButtonText?: string;
  className?: string;
}

interface FormFieldRendererProps {
  field: any;
  register: any;
  error?: any;
}

function FormFieldRenderer({ field, register, error }: FormFieldRendererProps) {
  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            {...register(field.id)}
            type="text"
            placeholder={field.placeholder}
            className={error ? 'border-red-500 focus:ring-red-500' : ''}
          />
        );
      
      case 'select':
        return (
          <select
            {...register(field.id)}
            className={`w-full px-3 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select an option...</option>
            {field.options?.map((option: any, index: number) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'date':
        return (
          <Input
            {...register(field.id)}
            type="date"
            className={error ? 'border-red-500 focus:ring-red-500' : ''}
          />
        );
      
      case 'file':
        return (
          <Input
            {...register(field.id)}
            type="file"
            className={error ? 'border-red-500 focus:ring-red-500' : ''}
          />
        );
      
      default:
        return (
          <div className="p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
            Unsupported field type: {field.type}
          </div>
        );
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={field.id} className="text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      {renderField()}
      
      {error && (
        <div className="flex items-center space-x-1 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error.message}</span>
        </div>
      )}
      
      {field.validation?.pattern && !error && (
        <p className="text-xs text-gray-500">
          Pattern: {field.validation.pattern}
        </p>
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
  const validationSchema = createFormValidationSchema(form);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: initialData,
    mode: 'onChange',
  });

  const watchedValues = watch();

  const handleFormSubmit = (data: Record<string, any>) => {
    // Process file inputs
    const processedData = { ...data };
    
    form.fields.forEach(field => {
      if (field.type === 'file' && processedData[field.id]) {
        const fileList = processedData[field.id] as FileList;
        if (fileList && fileList.length > 0) {
          processedData[field.id] = {
            name: fileList[0].name,
            size: fileList[0].size,
            type: fileList[0].type,
          };
        }
      }
    });
    
    onSubmit(processedData);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Form Fields */}
        <div className="space-y-4">
          {form.fields.map((field) => (
            <FormFieldRenderer
              key={field.id}
              field={field}
              register={register}
              error={errors[field.id]}
            />
          ))}
        </div>

        {/* Form Summary */}
        {form.fields.length > 0 && (
          <Card className="p-4 bg-gray-50">
            <h4 className="font-medium text-gray-700 mb-3">Form Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Fields:</span>
                <span className="font-medium">{form.fields.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Required Fields:</span>
                <span className="font-medium">
                  {form.fields.filter(f => f.required).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completed Fields:</span>
                <span className="font-medium">
                  {Object.values(watchedValues).filter(value => 
                    value !== '' && value !== null && value !== undefined
                  ).length}
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Validation Errors Summary */}
        {Object.keys(errors).length > 0 && (
          <Card className="p-4 border-red-200 bg-red-50">
            <div className="flex items-center space-x-2 mb-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h4 className="font-medium text-red-800">Please fix the following errors:</h4>
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
              {Object.entries(errors).map(([fieldId, error]) => {
                const field = form.fields.find(f => f.id === fieldId);
                return (
                  <li key={fieldId}>
                    <strong>{field?.label || fieldId}:</strong> {(error as any)?.message}
                  </li>
                );
              })}
            </ul>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            size="default"
            className=""
            onClick={() => reset()}
            disabled={isSubmitting}
          >
            Reset Form
          </Button>
          
          <Button
            type="submit"
            variant="default"
            size="default"
            disabled={isSubmitting || !isValid}
            className="min-w-[120px]"
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

      {/* Debug Information (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="p-4 bg-gray-50 border-dashed">
          <h4 className="font-medium text-gray-700 mb-2">Debug Info</h4>
          <div className="space-y-2 text-xs">
            <div>
              <strong>Form Values:</strong>
              <pre className="mt-1 p-2 bg-white rounded border overflow-auto">
                {JSON.stringify(watchedValues, null, 2)}
              </pre>
            </div>
            <div>
              <strong>Validation Errors:</strong>
              <pre className="mt-1 p-2 bg-white rounded border overflow-auto">
                {JSON.stringify(errors, null, 2)}
              </pre>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}