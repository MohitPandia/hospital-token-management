import { type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

type ButtonProps = Readonly<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
    fullWidth?: boolean;
    loading?: boolean;
    children: React.ReactNode;
  }
>;

const variantClasses: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost:
    "rounded-xl font-semibold text-teal-700 hover:bg-teal-50 border-2 border-transparent hover:border-teal-200 min-h-[var(--touch-min)]",
};

export function Button({
  variant = "primary",
  fullWidth,
  loading,
  disabled,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base = "py-3 px-4 transition active:scale-[0.98] disabled:opacity-50";
  const width = fullWidth ? "w-full" : "";
  const combined = [
    base,
    variantClasses[variant],
    width,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={combined}
      disabled={disabled ?? loading}
      {...props}
    >
      {loading ? "…" : children}
    </button>
  );
}

export function SubmitButton({
  variant = "primary",
  fullWidth,
  loading,
  disabled,
  className = "",
  children,
  ...props
}: Readonly<Omit<ButtonProps, "type"> & { type?: "submit" }>) {
  const base = "py-3 px-4 transition active:scale-[0.98] disabled:opacity-50";
  const width = fullWidth ? "w-full" : "";
  const combined = [
    base,
    variantClasses[variant],
    width,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="submit"
      className={combined}
      disabled={disabled ?? loading}
      {...props}
    >
      {loading ? "…" : children}
    </button>
  );
}
