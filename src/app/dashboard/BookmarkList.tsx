"use client";

import { deleteBookmark } from "@/app/actions/bookmarks";
import { createClient } from "@/lib/supabase/client";
import { useCallback, useEffect, useMemo, useState } from "react";

export type Bookmark = {
  id: string;
  url: string;
  title: string;
  created_at: string;
};

export function BookmarkList({ initialBookmarks }: { initialBookmarks: Bookmark[] }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const supabase = useMemo(() => createClient(), []);

  const refreshBookmarks = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("bookmarks")
      .select("id, url, title, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setBookmarks(data);
  }, [supabase]);

  useEffect(() => {
    const channel = supabase
      .channel("bookmarks-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
        },
        () => {
          refreshBookmarks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, refreshBookmarks]);

  // Sync with server-rendered initial list when it changes (e.g. after navigation)
  useEffect(() => {
    setBookmarks(initialBookmarks);
  }, [initialBookmarks]);

  async function handleDelete(id: string) {
    await deleteBookmark(id);
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }

  if (bookmarks.length === 0) {
    return (
      <p className="text-slate-500 text-sm">
        No bookmarks yet. Add one above.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {bookmarks.map((b) => (
        <li
          key={b.id}
          className="flex items-center justify-between gap-2 p-3 bg-white border border-slate-200 rounded-lg hover:border-slate-300"
        >
          <a
            href={b.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-0"
          >
            <span className="font-medium text-slate-800 block truncate">
              {b.title}
            </span>
            <span className="text-sm text-slate-500 truncate block">{b.url}</span>
          </a>
          <button
            type="button"
            onClick={() => handleDelete(b.id)}
            className="shrink-0 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
            title="Delete"
            aria-label="Delete bookmark"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </li>
      ))}
    </ul>
  );
}
