import Link from "next/link";

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { message?: string };
}) {
  const { message } = searchParams;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 max-w-md text-center">
        <h1 className="text-xl font-semibold text-slate-800 mb-2">
          Sign in failed
        </h1>
        <p className="text-slate-600 mb-6">
          {message || "Something went wrong. Please try again."}
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
