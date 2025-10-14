import { Control, FieldPath, FieldValues } from 'react-hook-form';

// Base field props
export interface BaseFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  required?: boolean;
  placeholder?: string;
  description?: string;
  className?: string;
}

// Input field props
export interface InputFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  type: 'input';
  inputType?: 'text' | 'email' | 'password' | 'number' | 'date' | 'tel' | 'checkbox';
}

// Textarea field props
export interface TextareaFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  type: 'textarea';
  rows?: number;
}

// Select option
export interface SelectOption {
  value: string;
  label: string;
}

// Select field props
export interface SelectFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  type: 'select';
  options: SelectOption[];
}
