import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpenseItem } from "@/utils/Types";
import { AddExpenseForm } from "./AddExpenseForm";
import { ExpenseLogList } from "./ExpenseLogList";

interface GroupExpensesTabProps {
  members: string[];
  expenses: ExpenseItem[];
  onAddExpense: (title: string, amount: number, paidBy: string) => void;
}

export function GroupExpensesTab({ members, expenses, onAddExpense }: GroupExpensesTabProps) {
  const [isAddingExpense, setIsAddingExpense] = useState(false);

  const handleAddExpenseSubmit = (title: string, amount: number, paidBy: string) => {
    onAddExpense(title, amount, paidBy);
    setIsAddingExpense(false);
  };

  return (
    <div className="space-y-4 flex-1">
      {/* Expandable Add Expense Card */}
      {isAddingExpense ? (
        <AddExpenseForm
          members={members}
          onAddExpense={handleAddExpenseSubmit}
          onCancel={() => setIsAddingExpense(false)}
        />
      ) : (
        <Button
          onClick={() => setIsAddingExpense(true)}
          className="w-full rounded-xl border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary py-6 text-xs font-semibold gap-1.5 flex items-center justify-center transition-colors"
        >
          <Plus className="h-4 w-4" /> Add split expense
        </Button>
      )}

      {/* List of Group Expenses */}
      <ExpenseLogList expenses={expenses} membersCount={members.length} />
    </div>
  );
}
