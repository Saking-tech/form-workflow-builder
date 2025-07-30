'use client';

import { useState } from 'react';
import { Form, FormField } from '@/types';
import { validateEmail } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

interface InteractiveFormProps {
  form: Form;
  onSubmit?: (data: Record<string, any>) => void;
  className?: string;
}

interface FormErrors {
  [fieldId: string]: string;
}

export default function InteractiveForm({ form, onSubmit, className = '' }: InteractiveFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<FormErrors>({});

  const handleFieldChange = (fieldId: string, value: any, field: FormField) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    
    // Clear existing error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }));
    }

    // Real-time validation for email fields
    if (field.type === 'email' && value) {
      const validation = validateEmail(value);
      if (!validation.isValid) {
        setErrors(prev => ({ ...prev, [fieldId]: validation.error || 'Invalid email' }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    form.sections.forEach(section => {
      section.fields.forEach(field => {
        const value = formData[field.id];

        // Check required fields
        if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
          newErrors[field.id] = `${field.label} is required`;
          isValid = false;
          return;
        }

        // Email validation
        if (field.type === 'email' && value) {
          const validation = validateEmail(value);
          if (!validation.isValid) {
            newErrors[field.id] = validation.error || 'Invalid email';
            isValid = false;
          }
        }

        // Number validation
        if (field.type === 'number' && value) {
          const numValue = parseFloat(value);
          if (isNaN(numValue)) {
            newErrors[field.id] = 'Please enter a valid number';
            isValid = false;
          }
          if (field.validation?.min !== undefined && numValue < field.validation.min) {
            newErrors[field.id] = `Value must be at least ${field.validation.min}`;
            isValid = false;
          }
          if (field.validation?.max !== undefined && numValue > field.validation.max) {
            newErrors[field.id] = `Value must be at most ${field.validation.max}`;
            isValid = false;
          }
        }

        // String length validation
        if ((field.type === 'text' || field.type === 'textarea') && value) {
          if (field.validation?.minLength && value.length < field.validation.minLength) {
            newErrors[field.id] = `Must be at least ${field.validation.minLength} characters`;
            isValid = false;
          }
          if (field.validation?.maxLength && value.length > field.validation.maxLength) {
            newErrors[field.id] = `Must be at most ${field.validation.maxLength} characters`;
            isValid = false;
          }
        }
      });
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm() && onSubmit) {
      onSubmit(formData);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.id] || '';
    const error = errors[field.id];

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : 'text'}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value, field)}
              placeholder={field.placeholder}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {error && (
              <div className="flex items-center mt-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {error}
              </div>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value, field)}
              placeholder={field.placeholder}
              rows={4}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {error && (
              <div className="flex items-center mt-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {error}
              </div>
            )}
          </div>
        );

      case 'dropdown':
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select 
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value, field)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">{field.placeholder || 'Select an option'}</option>
              {field.options?.map((option, index) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {error && (
              <div className="flex items-center mt-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {error}
              </div>
            )}
          </div>
        );

      case 'date':
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="date"
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value, field)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {error && (
              <div className="flex items-center mt-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {error}
              </div>
            )}
          </div>
        );

      case 'radio':
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="radio"
                    name={field.id}
                    value={option.value}
                    checked={value === option.value}
                    onChange={(e) => handleFieldChange(field.id, e.target.value, field)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
            {error && (
              <div className="flex items-center mt-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {error}
              </div>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="space-y-2">
            <div className="flex items-start">
              <input
                type="checkbox"
                checked={!!value}
                onChange={(e) => handleFieldChange(field.id, e.target.checked, field)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
              />
              <label className="ml-2 block text-sm text-gray-700">
                {field.options?.[0]?.label || field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            </div>
            {error && (
              <div className="flex items-center mt-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {error}
              </div>
            )}
          </div>
        );

      case 'file':
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="file"
              onChange={(e) => handleFieldChange(field.id, e.target.files?.[0] || null, field)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {error && (
              <div className="flex items-center mt-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {error}
              </div>
            )}
          </div>
        );

      default:
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value, field)}
              placeholder={field.placeholder}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {error && (
              <div className="flex items-center mt-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {error}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className={`bg-white ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {form.description && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">{form.description}</p>
          </div>
        )}

        {form.sections.map((section) => (
          <div key={section.id} className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{section.title}</h3>
            {section.subtitle && (
              <p className="text-sm text-gray-600 mb-4">{section.subtitle}</p>
            )}
            
            <div className="space-y-4">
              {section.fields.map((field) => renderField(field))}
            </div>
          </div>
        ))}

        {onSubmit && (
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Submit Form
            </button>
          </div>
        )}
      </form>
    </div>
  );
}