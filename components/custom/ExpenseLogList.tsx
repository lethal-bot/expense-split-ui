import { currency } from "@/utils/Constants";
import { ExpenseItem } from "@/utils/Types";

interface ExpenseLogListProps {
  expenses: ExpenseItem[];
  membersCount: number;
  onExpenseClick: (expense: ExpenseItem) => void;
}

export function ExpenseLogList({ expenses, membersCount, onExpenseClick }: ExpenseLogListProps) {
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
            onClick={() => onExpenseClick(exp)}
            className="flex items-center justify-between gap-3 p-4 border rounded-xl bg-card/60 shadow-sm hover:bg-muted/40 active:scale-[0.99] transition-all cursor-pointer"
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
                {exp.isCustomSplit ? (
                  <>
                    Custom Split (Your share:{" "}
                    {currency.format(exp.splits.find((s) => s.member === "You")?.amount || 0)}
                    )
                  </>
                ) : (
                  <>{currency.format(Math.round(exp.amount / Math.max(membersCount, 1)))} / person</>
                )}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
