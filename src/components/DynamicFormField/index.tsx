import React from 'react';
import { FieldValues } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { SearchableSelect, type SearchableSelectOption } from '@/components/ui/searchable-select';
import { NumericFormat } from 'react-number-format';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  InputFieldProps,
  SelectFieldProps,
  TextareaFieldProps,
  RadioFieldProps,
} from '@/types/TForm';

type DynamicFormFieldProps<T extends FieldValues> = (
  | SelectFieldProps<T>
  | InputFieldProps<T>
  | TextareaFieldProps<T>
  | RadioFieldProps<T>
) & {
  disabled?: boolean;
};

export function DynamicFormField<T extends FieldValues>(props: DynamicFormFieldProps<T>) {
  const {
    control,
    name,
    label,
    required = false,
    placeholder,
    description,
    className = '',
    disabled = false,
  } = props;

  // If control is provided, use FormField to wire into RHF. Otherwise render a
  // non-RHF version that reads `value` and `onChange` from props.
  const renderWithField = (
    field: {
      value: unknown;
      onChange: (v: unknown) => void;
      onBlur?: () => void;
      ref?: React.Ref<HTMLElement>;
      name?: string | number;
    },
    error?: unknown,
  ) => {
    const hasError = !!error;
    const commonProps: {
      placeholder?: string;
      className: string;
      'aria-invalid': boolean;
      disabled: boolean;
    } = {
      placeholder,
      className: `${hasError ? 'border-destructive ' : ''}${className}`,
      'aria-invalid': !!hasError,
      disabled, // Thêm prop disabled vào các input
    };

    const computeDisplayedValue = (raw: unknown) => {
      const inputProps = props as InputFieldProps<FieldValues>;
      if (typeof inputProps.displayValue === 'string') return inputProps.displayValue;
      if (typeof inputProps.displayFormatter === 'function')
        return inputProps.displayFormatter(raw);
      return raw == null ? '' : String(raw);
    };

    const renderInput = () => {
      switch (props.type) {
        case 'radio':
          return (
            <div className={`flex ${props.layout === 'vertical' ? 'flex-col' : 'flex-row'} gap-4`}>
              {props.options.map((option) => (
                <label className="flex items-center gap-2" key={option.value}>
                  <input
                    type="radio"
                    name={String(field.name)}
                    value={option.value}
                    checked={field.value === option.value}
                    onChange={() => {
                      field.onChange(option.value);
                      if (typeof (props as RadioFieldProps<T>).onValueChange === 'function') {
                        (props as RadioFieldProps<T>).onValueChange!(option.value);
                      }
                    }}
                    disabled={disabled}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          );

        case 'select': {
          const selectProps = props as SelectFieldProps<T>;
          if (selectProps.widget === 'searchable') {
            return (
              <SearchableSelect
                options={selectProps.options as SearchableSelectOption[]}
                value={(field.value as string) ?? ''}
                onChange={(v: string) => {
                  field.onChange(v);
                  if (typeof selectProps.onValueChange === 'function') selectProps.onValueChange(v);
                }}
                placeholder={placeholder}
                searchPlaceholder={selectProps.searchPlaceholder}
                emptyMessage={selectProps.emptyMessage}
                className={commonProps.className}
                disabled={disabled}
              />
            );
          }

          const selectDefault =
            typeof field.value === 'number'
              ? String(field.value)
              : (field.value as string | undefined);

          return (
            <Select onValueChange={field.onChange} defaultValue={selectDefault} disabled={disabled}>
              <SelectTrigger {...commonProps}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {props.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }

        case 'textarea':
          return (
            <Textarea
              {...commonProps}
              rows={props.rows}
              value={(field.value as string) ?? ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                field.onChange(e.target.value)
              }
            />
          );

        case 'input': {
          const inputProps = props as InputFieldProps<FieldValues>;
          if (props.inputType === 'number' && inputProps.numericFormat) {
            const opts = inputProps.numericFormatOptions ?? {};
            return (
              <NumericFormat
                value={(field.value as string | number | undefined) ?? ''}
                thousandSeparator={opts.thousandSeparator ?? '.'}
                decimalSeparator={opts.decimalSeparator ?? ','}
                allowNegative={opts.allowNegative ?? false}
                suffix={opts.suffix ?? ''}
                customInput={Input}
                className={`${commonProps.className || ''}`}
                onValueChange={(values: { floatValue?: number | undefined }) => {
                  const parsed = values.floatValue ?? undefined;
                  field.onChange(parsed);
                  if (typeof inputProps.onValueChange === 'function') {
                    inputProps.onValueChange(parsed);
                  }
                }}
                disabled={disabled}
                aria-invalid={commonProps['aria-invalid']}
              />
            );
          }

          if (props.inputType === 'checkbox') {
            return (
              <Input
                {...(commonProps as Record<string, unknown>)}
                type="checkbox"
                checked={!!field.value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  field.onChange(e.target.checked)
                }
              />
            );
          }

          return (
            <Input
              {...commonProps}
              type={props.inputType || 'text'}
              value={computeDisplayedValue(field.value)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const val = e.target.value;
                field.onChange(val);
                if (typeof (props as InputFieldProps<T>).onValueChange === 'function') {
                  (props as InputFieldProps<T>).onValueChange!(val);
                }
              }}
            />
          );
        }

        default:
          return <></>;
      }
    };

    return (
      <FormItem>
        <FormLabel className={disabled ? 'opacity-70' : ''}>
          {' '}
          {/* Giảm opacity khi disabled */}
          {label}
          {required && <span className="text-destructive">*</span>}
        </FormLabel>
        <FormControl>{renderInput()}</FormControl>
        {description && (
          <p className={`text-sm text-muted-foreground ${disabled ? 'opacity-70' : ''}`}>
            {description}
          </p>
        )}
        {/* Non-RHF render won't have FormMessage binding; skip showing error here */}
      </FormItem>
    );
  };

  if (control) {
    return (
      <FormField
        control={control}
        name={name}
        render={({ field, fieldState: { error } }) => renderWithField(field, error)}
      />
    );
  }

  // No control provided – build a fake field using props.value/onChange
  const fakeField = {
    value: (props as unknown as { value?: unknown }).value,
    onChange: (v: unknown) => {
      const cb = (props as unknown as { onChange?: (v: unknown) => void }).onChange;
      if (typeof cb === 'function') cb(v);
    },
    name,
  };

  return renderWithField(fakeField);
}
