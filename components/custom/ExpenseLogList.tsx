import { currency } from "@/utils/Constants";
import { ExpenseItem } from "@/utils/Types";

interface ExpenseLogListProps {
  expenses: ExpenseItem[];
  membersCount: number;
}

export function ExpenseLogList({ expenses, membersCount }: ExpenseLogListProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
        Expense Log ({expenses.length})
      </h2>
      {expenses.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No expenses logged yet.
        </p>
      ) : (
        expenses.map((exp) => (
          <div
            key={exp.id}
            className="flex items-center justify-between gap-3 p-4 border rounded-xl bg-card/60 shadow-sm"
          >
            <div className="min-w-0">
              <h4 className="text-sm font-semibold truncate">{exp.title}</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Paid by <span className="font-medium text-foreground/80">{exp.paidBy}</span> · {exp.date}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold text-foreground">{currency.format(exp.amount)}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {currency.format(Math.round(exp.amount / Math.max(membersCount, 1)))} / person
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
