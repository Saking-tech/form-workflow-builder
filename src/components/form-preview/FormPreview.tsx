'use client';

import { Form, FormField } from '@/types';
import { X } from 'lucide-react';

interface FormPreviewProps {
  form: Form;
  onClose: () => void;
}

export default function FormPreview({ form, onClose }: FormPreviewProps) {
  const getGridSpan = (size: string) => {
    switch (size) {
      case '1x1': return 'col-span-1';
      case '1x2': return 'col-span-2';
      case '1x3': return 'col-span-3';
      default: return 'col-span-1';
    }
  };

  const renderField = (field: FormField) => {
    const fieldContent = (() => {
      switch (field.type) {
        case 'text':
        case 'email':
        case 'number':
          return (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                type={field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : 'text'}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled
              />
            </div>
          );

              case 'textarea':
          return (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <textarea
                placeholder={field.placeholder}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled
              />
            </div>
          );

        case 'dropdown':
          return (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" disabled>
                <option value="">{field.placeholder || 'Select an option'}</option>
                {field.options?.map((option, index) => (
                  <option key={index} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          );

        case 'date':
          return (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                type="date"
                placeholder={field.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled
              />
            </div>
          );

        case 'radio':
          return (
            <div className="space-y-2">
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
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      disabled
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          );

        case 'checkbox':
          return (
            <div className="space-y-2">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                  disabled
                />
                <label className="ml-2 block text-sm text-gray-700">
                  {field.options?.[0]?.label || field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
              </div>
            </div>
          );

        case 'file':
          return (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                type="file"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled
              />
            </div>
          );

        default:
          return (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                type="text"
                placeholder={field.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled
              />
            </div>
          );
      }
    })();

    return (
      <div key={field.id} className={`${getGridSpan(field.size)}`}>
        {fieldContent}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/50">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Form Preview</h2>
            <p className="text-sm text-gray-600">{form.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {form.description && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl p-4">
              <p className="text-blue-800">{form.description}</p>
            </div>
          )}

          {form.sections.map((section) => (
            <div key={section.id} className="bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{section.title}</h3>
              {section.subtitle && (
                <p className="text-sm text-gray-600 mb-4">{section.subtitle}</p>
              )}
              
              <div className="grid grid-cols-3 gap-4">
                {section.fields.map((field) => renderField(field))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 