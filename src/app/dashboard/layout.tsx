import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import Link from "next/link";
import { SignOutButton } from "./sign-out";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-teal-100 px-4 py-3 flex items-center justify-between min-h-[var(--touch-min)] gap-4">
        <Link
          href="/dashboard"
          className="font-semibold text-teal-900 truncate"
        >
          {session.user.name || "Dashboard"}
        </Link>
        <SignOutButton />
      </header>
      <div className="p-4 pb-[max(1.5rem,var(--safe-bottom))] max-w-2xl mx-auto">
        {children}
      </div>
    </div>
  );
}
