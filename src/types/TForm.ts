import { Control, FieldPath, FieldValues } from 'react-hook-form';

// Base field props
export interface BaseFieldProps<T extends FieldValues> {
  // React Hook Form control. Optional to allow using this component without RHF
  control?: Control<T>;
  name: FieldPath<T>;
  label: string;
  required?: boolean;
  placeholder?: string;
  description?: string;
  className?: string;
  // When not using RHF, you can pass value and onChange directly
  value?: unknown;
  onChange?: (value: unknown) => void;
}

// Input field props
export interface InputFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  type: 'input';
  inputType?: 'text' | 'email' | 'password' | 'number' | 'date' | 'tel' | 'checkbox';
  // optional callback when value changes (useful for triggering side-effects)
  onValueChange?: (value: unknown) => void;
  // optional display formatter for read-only / presentation purposes
  displayFormatter?: (value: unknown) => string;
  // optional explicit display value (overrides formatter), useful when the
  // displayed string comes from derived state rather than the bound field value
  displayValue?: string;
  // Use react-number-format formatting for numeric inputs when true
  numericFormat?: boolean;
  // Options forwarded to NumericFormat when numericFormat is true
  numericFormatOptions?: {
    thousandSeparator?: string | boolean;
    decimalSeparator?: string;
    allowNegative?: boolean;
    suffix?: string;
  };
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
  // allow using a searchable/select-with-search widget instead of the default select
  widget?: 'searchable';
  // placeholders/messages for searchable widget
  searchPlaceholder?: string;
  emptyMessage?: string;
  // optional callback when value changes
  onValueChange?: (value: string) => void;
}

// Radio / choice field
export interface RadioFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  type: 'radio';
  options: SelectOption[];
  layout?: 'horizontal' | 'vertical';
  // optional callback when value changes (useful for clearing related fields)
  onValueChange?: (value: string) => void;
}
