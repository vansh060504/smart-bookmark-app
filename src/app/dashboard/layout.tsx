import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { signOut } from "../actions/auth";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="font-semibold text-slate-800">
            Smart Bookmark
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 truncate max-w-[180px]">
              {user.email}
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="text-sm text-slate-600 hover:text-slate-800"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
