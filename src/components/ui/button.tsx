import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import Link from 'next/link';
import * as React from 'react';

import { LoadingDots } from '@/components/LoadingDots';
import { cn } from '@/lib/utils';
import ToolTip from '../ToolTip';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer ring-offset-background border-2 border-foreground neo-shadow-sm transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 ',
        outline: 'bg-background hover:bg-primary hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground neo-shadow-none ring-0 border-0',
        link: 'text-primary underline-offset-4 hover:underline',
        text: 'text-accent !px-0 !border-none outline-none !bg-transparent !shadow-none',
        accent: 'bg-accent text-accent-foreground',
        white: 'bg-background text-foreground',
        success: 'bg-success text-success-foreground hover:bg-success/90',
        none: '',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  children?: React.ReactNode;
  label?: string;
  showTooltip?: boolean;
  shadow3d?: boolean;
  loadingDots?: boolean;
  textLoading?: string;
  dotColor?: string;
  href?: string;
  target?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      children,
      disabled,
      label,
      showTooltip,
      shadow3d,
      loadingDots,
      textLoading,
      dotColor = 'text-accent-foreground',
      href,
      target,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';

    const buttonContent = (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          disabled && 'opacity-50 cursor-not-allowed',
          shadow3d && 'border-2 border-foreground shadow-3d transition-all duration-200',
        )}
        ref={ref}
        disabled={disabled}
        onClick={disabled ? undefined : props.onClick}
        {...props}
      >
        <div className={cn('flex items-center', !loadingDots && 'gap-2')}>
          {!loadingDots && children}
          {loadingDots && (
            <>
              <span>{textLoading}</span>
              <LoadingDots notText dotColor={dotColor} animationSpeed="fast" />
            </>
          )}
        </div>
      </Comp>
    );

    // Wrap with tooltip if label is provided and showTooltip is true
    if (label && showTooltip) {
      return <ToolTip label={label}>{buttonContent}</ToolTip>;
    }

    if (href) {
      return (
        <Link target={target} href={href}>
          {buttonContent}
        </Link>
      );
    }

    return buttonContent;
  },
);

Button.displayName = 'Button';

export { Button, buttonVariants };
