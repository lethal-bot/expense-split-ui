import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpenseDraft, Friend } from "@/utils/Types";
import { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/custom/Field";
import { currency, friends } from "@/utils/Constants";
import { cn } from "@/lib/utils";
import { DetailItem } from "@/components/custom/DetailItem";
import { PlusCircle } from "lucide-react";



export function AddExpenseTab({
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
  return (
    <form className="space-y-4" onSubmit={addExpense}>
      <Card>
        <CardHeader>
          <CardTitle>Add Expense</CardTitle>
          <CardDescription>Paid by You</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Expense name">
            <input
              className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
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
              className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
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
              className="min-h-20 w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
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
                    className={cn(
                      "rounded-md border px-2 py-3 text-sm font-medium transition-colors",
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