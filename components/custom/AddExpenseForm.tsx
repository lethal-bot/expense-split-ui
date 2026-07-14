import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface AddExpenseFormProps {
  members: string[];
  onAddExpense: (title: string, amount: number, paidBy: string) => void;
  onCancel: () => void;
}

export function AddExpenseForm({ members, onAddExpense, onCancel }: AddExpenseFormProps) {
  const [newExpenseTitle, setNewExpenseTitle] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const [newExpensePaidBy, setNewExpensePaidBy] = useState("You");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(newExpenseAmount);
    if (!newExpenseTitle.trim() || isNaN(amountNum) || amountNum <= 0) return;

    onAddExpense(newExpenseTitle, amountNum, newExpensePaidBy);
    
    // Reset Form
    setNewExpenseTitle("");
    setNewExpenseAmount("");
    setNewExpensePaidBy("You");
  };

  return (
    <Card className="border bg-card shadow-sm animate-in fade-in-50 slide-in-from-top-3 duration-250">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold">Add dynamic bill split</h3>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="h-7 w-7 rounded-full"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            required
            placeholder="Expense title (e.g. Dinner, Taxi)"
            value={newExpenseTitle}
            onChange={(e) => setNewExpenseTitle(e.target.value)}
            className="rounded-xl border-border bg-muted/20"
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              required
              type="number"
              step="0.01"
              placeholder="Amount (₹)"
              value={newExpenseAmount}
              onChange={(e) => setNewExpenseAmount(e.target.value)}
              className="rounded-xl border-border bg-muted/20"
            />
            <select
              value={newExpensePaidBy}
              onChange={(e) => setNewExpensePaidBy(e.target.value)}
              className="w-full rounded-xl border border-border bg-muted/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
            >
              {members.map((m) => (
                <option key={m} value={m}>
                  Paid by {m}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" className="w-full rounded-xl mt-1 py-5 text-xs font-semibold">
            Add Expense
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
