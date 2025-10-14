declare module 'react-number-format' {
  import * as React from 'react';

  export interface OnValueChangeProps {
    floatValue?: number | undefined;
    formattedValue?: string;
    value?: string | number;
  }

  export interface NumericFormatProps extends React.ComponentPropsWithoutRef<'input'> {
    thousandSeparator?: string | boolean;
    decimalSeparator?: string;
    allowNegative?: boolean;
    onValueChange?: (values: OnValueChangeProps) => void;
    customInput?: React.ElementType;
    suffix?: string;
  }

  export class NumericFormat extends React.Component<NumericFormatProps> {}

  export default NumericFormat;
}
