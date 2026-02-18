import { createClient } from "@/lib/supabase/server";
import { AddBookmarkForm } from "./AddBookmarkForm";
import { BookmarkList } from "./BookmarkList";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("id, url, title, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-800">Your bookmarks</h1>
      <AddBookmarkForm />
      <BookmarkList initialBookmarks={bookmarks ?? []} />
    </div>
  );
}
