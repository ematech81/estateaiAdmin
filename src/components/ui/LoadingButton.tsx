import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'tertiary';

const VARIANT_CLASS: Record<Variant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  tertiary: 'btn-tertiary',
};

interface LoadingButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  loading?: boolean;
  /** Replaces children while loading (e.g. "Registering…"). Defaults to children unchanged. */
  loadingText?: ReactNode;
  variant?: Variant;
  className?: string;
  children: ReactNode;
}

// The one button every async action (form submits, "Generate draft",
// "Publish", search, etc.) should render through, so a click always gets
// the same immediate spinner feedback instead of each page inventing its
// own (or, worse, none at all — the point of this component).
export function LoadingButton({
  loading = false,
  loadingText,
  variant = 'primary',
  className = '',
  children,
  disabled,
  type = 'button',
  ...rest
}: LoadingButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`${VARIANT_CLASS[variant]} ${className}`}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {loading && loadingText !== undefined ? loadingText : children}
    </button>
  );
}
