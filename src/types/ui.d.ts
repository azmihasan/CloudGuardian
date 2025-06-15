declare module '@/components/ui/card' {
  import { HTMLAttributes } from 'react';

  export interface CardProps extends HTMLAttributes<HTMLDivElement> { _placeholder?: boolean; }
  export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> { _placeholder?: boolean; }
  export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> { _placeholder?: boolean; }
  export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> { _placeholder?: boolean; }
  export interface CardContentProps extends HTMLAttributes<HTMLDivElement> { _placeholder?: boolean; }
  export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> { _placeholder?: boolean; }

  export const Card: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>;
  export const CardHeader: React.ForwardRefExoticComponent<CardHeaderProps & React.RefAttributes<HTMLDivElement>>;
  export const CardTitle: React.ForwardRefExoticComponent<CardTitleProps & React.RefAttributes<HTMLHeadingElement>>;
  export const CardDescription: React.ForwardRefExoticComponent<CardDescriptionProps & React.RefAttributes<HTMLParagraphElement>>;
  export const CardContent: React.ForwardRefExoticComponent<CardContentProps & React.RefAttributes<HTMLDivElement>>;
  export const CardFooter: React.ForwardRefExoticComponent<CardFooterProps & React.RefAttributes<HTMLDivElement>>;
}

declare module '@/components/ui/button' {
  import { ButtonHTMLAttributes } from 'react';
  import { VariantProps } from 'class-variance-authority';

  export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    asChild?: boolean;
  }

  export const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;
  export const buttonVariants: (props?: VariantProps<typeof buttonVariants>) => string;
}

declare module '@/components/ui/alert' {
  import { HTMLAttributes } from 'react';
  import { VariantProps } from 'class-variance-authority';

  export interface AlertProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> { _placeholder?: boolean; }
  export interface AlertTitleProps extends HTMLAttributes<HTMLHeadingElement> { _placeholder?: boolean; }
  export interface AlertDescriptionProps extends HTMLAttributes<HTMLParagraphElement> { _placeholder?: boolean; }

  export const Alert: React.ForwardRefExoticComponent<AlertProps & React.RefAttributes<HTMLDivElement>>;
  export const AlertTitle: React.ForwardRefExoticComponent<AlertTitleProps & React.RefAttributes<HTMLHeadingElement>>;
  export const AlertDescription: React.ForwardRefExoticComponent<AlertDescriptionProps & React.RefAttributes<HTMLParagraphElement>>;
} 