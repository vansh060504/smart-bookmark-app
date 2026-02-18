"use client";

import { addBookmark } from "@/app/actions/bookmarks";
import { useState } from "react";

export function AddBookmarkForm() {
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsPending(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const result = await addBookmark(formData);
    setIsPending(false);
    if (result.error) {
      setError(result.error);
    } else {
      form.reset();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="url"
          name="url"
          placeholder="https://example.com"
          required
          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 outline-none"
        />
        <input
          type="text"
          name="title"
          placeholder="Title"
          required
          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 outline-none"
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50"
        >
          {isPending ? "Adding…" : "Add bookmark"}
        </button>
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </form>
  );
}
