import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: "div" | "section" | "article";
  children: React.ReactNode;
}

export function Card({
  as: Component = "div",
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <Component
      className={`card ${className}`.trim()}
      {...props}
    >
      {children}
    </Component>
  );
}
