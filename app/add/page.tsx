"use client";

import { useState } from "react";
import AddExpenseTab from "./AddExpenseTab";
import { ExpenseDraft, Friend } from "@/utils/Types";
import { emptyDraft } from "@/utils/Constants";

export default function AddExpensePage() {
  const [draft, setDraft] = useState<ExpenseDraft>(emptyDraft);
  const draftAmount = Number(draft.amount) || 0;
  const draftShare = draftAmount / Math.max(draft.splitWith.length, 1);

  function toggleSplitFriend(friend: Friend) {
    setDraft((currentDraft) => {
      const exists = currentDraft.splitWith.includes(friend);
      const splitWith = exists
        ? currentDraft.splitWith.filter((name) => name !== friend)
        : [...currentDraft.splitWith, friend];

      return {
        ...currentDraft,
        splitWith,
      };
    });
  }

  function addExpense(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    alert("Expense saved: " + JSON.stringify(draft));
    setDraft(emptyDraft);
  }

  return (
    <div className="mx-auto max-w-md p-4 pb-24">
      <AddExpenseTab
        draft={draft}
        draftShare={draftShare}
        setDraft={setDraft}
        toggleSplitFriend={toggleSplitFriend}
        addExpense={addExpense}
      />
    </div>
  );
}