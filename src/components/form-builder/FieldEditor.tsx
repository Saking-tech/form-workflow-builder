'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useFormStore } from '@/stores/formStore';
import { FormField } from '@/types';
import { Plus, Trash2, Save, X } from 'lucide-react';

interface FieldEditorProps {
  field: FormField;
  formId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function FieldEditor({ field, formId, isOpen, onClose }: FieldEditorProps) {
  const { updateFieldInForm } = useFormStore();
  const [editedField, setEditedField] = useState<FormField>(field);

  useEffect(() => {
    setEditedField(field);
  }, [field]);

  const handleSave = () => {
    updateFieldInForm(formId, field.id, editedField);
    onClose();
  };

  const handleFieldChange = (updates: Partial<FormField>) => {
    setEditedField(prev => ({ ...prev, ...updates }));
  };

  const handleValidationChange = (updates: Partial<NonNullable<FormField['validation']>>) => {
    setEditedField(prev => ({
      ...prev,
      validation: { ...prev.validation, ...updates }
    }));
  };

  const addOption = () => {
    const newOption = {
      label: `Option ${(editedField.options?.length || 0) + 1}`,
      value: `option${(editedField.options?.length || 0) + 1}`
    };
    
    setEditedField(prev => ({
      ...prev,
      options: [...(prev.options || []), newOption]
    }));
  };

  const updateOption = (index: number, updates: { label?: string; value?: string }) => {
    setEditedField(prev => ({
      ...prev,
      options: prev.options?.map((option, i) => 
        i === index ? { ...option, ...updates } : option
      )
    }));
  };

  const removeOption = (index: number) => {
    setEditedField(prev => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span className="text-lg">{field.type === 'text' ? '📝' : field.type === 'select' ? '📋' : field.type === 'date' ? '📅' : '📎'}</span>
            <span>Edit {field.type === 'text' ? 'Text Input' : field.type === 'select' ? 'Dropdown' : field.type === 'date' ? 'Date Picker' : 'File Upload'}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Settings */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Basic Settings</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="field-label">Field Label</Label>
                <Input
                  id="field-label"
                  value={editedField.label}
                  onChange={(e) => handleFieldChange({ label: e.target.value })}
                  placeholder="Enter field label"
                />
              </div>

              {editedField.type === 'text' && (
                <div>
                  <Label htmlFor="field-placeholder">Placeholder</Label>
                  <Input
                    id="field-placeholder"
                    value={editedField.placeholder || ''}
                    onChange={(e) => handleFieldChange({ placeholder: e.target.value })}
                    placeholder="Enter placeholder text"
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="field-required"
                  checked={editedField.required}
                  onChange={(e) => handleFieldChange({ required: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="field-required">Required field</Label>
              </div>
            </div>
          </Card>

          {/* Validation Settings */}
          {editedField.type === 'text' && (
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Validation Rules</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="min-length">Minimum Length</Label>
                    <Input
                      id="min-length"
                      type="number"
                      value={editedField.validation?.minLength || ''}
                      onChange={(e) => handleValidationChange({ 
                        minLength: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-length">Maximum Length</Label>
                    <Input
                      id="max-length"
                      type="number"
                      value={editedField.validation?.maxLength || ''}
                      onChange={(e) => handleValidationChange({ 
                        maxLength: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                      placeholder="100"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="pattern">Pattern (Regex)</Label>
                  <Input
                    id="pattern"
                    value={editedField.validation?.pattern || ''}
                    onChange={(e) => handleValidationChange({ pattern: e.target.value })}
                    placeholder="^[a-zA-Z0-9]+$"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional regular expression pattern for validation
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Options Settings for Select Fields */}
          {editedField.type === 'select' && (
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Options</h3>
                <Button onClick={addOption} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Option
                </Button>
              </div>
              
              <div className="space-y-3">
                {editedField.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <Input
                        value={option.label}
                        onChange={(e) => updateOption(index, { label: e.target.value })}
                        placeholder="Option label"
                      />
                      <Input
                        value={option.value}
                        onChange={(e) => updateOption(index, { value: e.target.value })}
                        placeholder="Option value"
                      />
                    </div>
                    <Button
                      onClick={() => removeOption(index)}
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                
                {(!editedField.options || editedField.options.length === 0) && (
                  <p className="text-gray-500 text-sm py-4 text-center">
                    No options added yet. Click "Add Option" to get started.
                  </p>
                )}
              </div>
            </Card>
          )}

          {/* Preview */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Preview</h3>
            <div className="space-y-2">
              <Label>
                {editedField.label}
                {editedField.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              
              {editedField.type === 'text' && (
                <Input
                  placeholder={editedField.placeholder}
                  disabled
                />
              )}
              
              {editedField.type === 'select' && (
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md" disabled>
                  <option>Select an option...</option>
                  {editedField.options?.map((option, index) => (
                    <option key={index} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
              
              {editedField.type === 'date' && (
                <Input type="date" disabled />
              )}
              
              {editedField.type === 'file' && (
                <Input type="file" disabled />
              )}
            </div>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-1" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}