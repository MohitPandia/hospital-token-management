import Link from "next/link";

interface BackLinkProps {
  href: string;
  children: React.ReactNode;
}

export function BackLink({ href, children }: BackLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-teal-700 font-medium min-h-[var(--touch-min)]"
    >
      {children}
    </Link>
  );
}
