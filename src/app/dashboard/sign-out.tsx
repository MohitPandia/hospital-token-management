"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-sm font-medium text-teal-600 hover:text-teal-800 py-2 px-3 rounded-lg hover:bg-teal-50 min-h-[44px] flex items-center"
    >
      Sign out
    </button>
  );
}
