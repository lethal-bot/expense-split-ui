"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpenseDraft, Friend } from "@/utils/Types";
import { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/custom/Field";
import { currency, friends } from "@/utils/Constants";
import { cn } from "@/lib/utils";
import { DetailItem } from "@/components/custom/DetailItem";
import { PlusCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AddExpenseTab({
  draft,
  draftShare,
  setDraft,
  toggleSplitFriend,
  addExpense,
}: {
  draft: ExpenseDraft;
  draftShare: number;
  setDraft: React.Dispatch<React.SetStateAction<ExpenseDraft>>;
  toggleSplitFriend: (friend: Friend) => void;
  addExpense: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const [selectedGroup, setSelectedGroup] = useState<string>("");

  return (
    <form className="space-y-4" onSubmit={addExpense}>
      <Card>
        <CardHeader>
          <CardTitle>Add Expense</CardTitle>
          <CardDescription>Paid by You</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Select Group">
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring">
                <SelectValue placeholder="Select a group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trip">Trip to Paris</SelectItem>
                <SelectItem value="rent">Flat Rent</SelectItem>
                <SelectItem value="office">Office Outing</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Expense name">
            <input
              disabled={!selectedGroup}
              className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Lunch, cab, tickets"
              value={draft.title}
              onChange={(event) =>
                setDraft((currentDraft) => ({
                  ...currentDraft,
                  title: event.target.value,
                }))
              }
            />
          </Field>

          <Field label="Amount">
            <input
              disabled={!selectedGroup}
              className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
              inputMode="numeric"
              min="1"
              placeholder="1200"
              type="number"
              value={draft.amount}
              onChange={(event) =>
                setDraft((currentDraft) => ({
                  ...currentDraft,
                  amount: event.target.value,
                }))
              }
            />
          </Field>

          <Field label="Note">
            <textarea
              disabled={!selectedGroup}
              className="min-h-20 w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Short detail"
              value={draft.note}
              onChange={(event) =>
                setDraft((currentDraft) => ({
                  ...currentDraft,
                  note: event.target.value,
                }))
              }
            />
          </Field>

          <div className="space-y-2">
            <p className="text-sm font-medium">Split with</p>
            <div className="grid grid-cols-3 gap-2">
              {friends.map((friend) => {
                const selected = draft.splitWith.includes(friend);

                return (
                  <button
                    key={friend}
                    disabled={!selectedGroup}
                    className={cn(
                      "rounded-md border px-2 py-3 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground",
                    )}
                    type="button"
                    onClick={() => toggleSplitFriend(friend)}
                  >
                    {friend}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DetailItem label="People" value={String(draft.splitWith.length)} />
            <DetailItem
              label="Each share"
              value={currency.format(draftShare)}
            />
          </div>

          <Button
            className="w-full"
            disabled={
              !selectedGroup ||
              !draft.title.trim() ||
              Number(draft.amount) <= 0 ||
              draft.splitWith.length === 0
            }
            type="submit"
          >
            <PlusCircle className="h-4 w-4" />
            Save expense
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
