import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 pb-[max(1.5rem,var(--safe-bottom))] max-w-lg mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-teal-900 mb-2">
          Hospital Token
        </h1>
        <p className="text-teal-700 text-base sm:text-lg">
          See when to visit. Manage your queue.
        </p>
      </div>
      <div className="w-full space-y-4">
        <Link
          href="/patient"
          className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-lg"
        >
          <span aria-hidden>📋</span>
          Check my token
        </Link>
        <p className="text-center text-sm text-teal-600">
          Enter your code to see your number and estimated visit time.
        </p>
        <Link
          href="/login"
          className="btn-secondary w-full flex items-center justify-center gap-2 py-4 text-lg"
        >
          <span aria-hidden>🏥</span>
          Hospital login
        </Link>
        <p className="text-center text-sm text-teal-600">
          For hospital staff: manage doctors and token queue.
        </p>
      </div>
    </main>
  );
}
