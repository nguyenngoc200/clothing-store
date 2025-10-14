import { FieldValues } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { InputFieldProps, SelectFieldProps, TextareaFieldProps } from '@/types/TForm';

type DynamicFormFieldProps<T extends FieldValues> = (
  | SelectFieldProps<T>
  | InputFieldProps<T>
  | TextareaFieldProps<T>
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

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => {
        const commonProps = {
          placeholder,
          className: `${error ? 'border-destructive ' : ''}${className}`,
          'aria-invalid': !!error,
          disabled, // Thêm prop disabled vào các input
        };

        const renderInput = () => {
          switch (props.type) {
            case 'select':
              return (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={disabled} // Thêm disabled cho Select
                >
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

            case 'textarea':
              return <Textarea {...field} {...commonProps} rows={props.rows} />;

            case 'input':
              // If the input is numeric, coerce the string value to a number
              if (props.inputType === 'number') {
                return (
                  <Input
                    {...commonProps}
                    type="number"
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      // empty string -> undefined to allow optional numbers
                      field.onChange(v === '' ? undefined : Number(v));
                    }}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                );
              }

              // If the input is a checkbox, map checked -> boolean
              if (props.inputType === 'checkbox') {
                return (
                  <Input
                    {...commonProps}
                    type="checkbox"
                    checked={!!field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                );
              }

              return <Input {...field} {...commonProps} type={props.inputType || 'text'} />;

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
            <FormMessage className="text-destructive text-sm font-medium">
              {error?.message}
            </FormMessage>
          </FormItem>
        );
      }}
    />
  );
}
