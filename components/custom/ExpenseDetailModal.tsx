import { X, Check, AlertCircle, Ban, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { currency } from "@/utils/Constants";
import { ExpenseItem, ExpenseSplit } from "@/utils/Types";

interface ExpenseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: ExpenseItem | null;
  onUpdateExpense: (expense: ExpenseItem) => void;
  onDeleteExpense: (expenseId: string) => void;
}

export function ExpenseDetailModal({
  isOpen,
  onClose,
  expense,
  onUpdateExpense,
  onDeleteExpense
}: ExpenseDetailModalProps) {
  if (!expense) return null;

  const isCreator = expense.paidBy === "You";
  const userSplit = expense.splits.find((s) => s.member === "You");
  const showMarkAsPaid = !isCreator && userSplit && (userSplit.status === "pending" || userSplit.status === "rejected");
  const shareAmount = Math.round(expense.amount / Math.max(expense.splits.length, 1));

  // Avatar generation helper
  const getAvatarColor = (name: string) => {
    const bgColors = ["bg-rose-500", "bg-emerald-500", "bg-blue-500", "bg-purple-500", "bg-amber-500"];
    let sum = 0;
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return bgColors[sum % bgColors.length];
  };

  const handleStatusChange = (member: string, newStatus: "paid" | "approved" | "rejected") => {
    const updatedSplits = expense.splits.map((s) =>
      s.member === member ? { ...s, status: newStatus } : s
    );
    onUpdateExpense({
      ...expense,
      splits: updatedSplits
    });
  };

  const handleMarkAsPaid = () => {
    handleStatusChange("You", "paid");
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${expense.title}"?`)) {
      onDeleteExpense(expense.id);
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300 pointer-events-none opacity-0",
          isOpen && "pointer-events-auto opacity-100"
        )}
        onClick={onClose}
      />

      {/* Slide-up sheet */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 max-h-[85vh] bg-card rounded-t-2xl border-t border-border shadow-2xl p-6 z-[110] transform transition-transform duration-300 ease-out overflow-y-auto pb-12",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Drag handle */}
        <div className="mx-auto w-12 h-1.5 rounded-full bg-muted mb-4 cursor-pointer" onClick={onClose} />

        <div className="flex items-start justify-between mb-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold truncate">{expense.title}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Paid by <span className="font-semibold text-foreground/80">{expense.paidBy}</span> · {expense.date}
            </p>
            {expense.description && (
              <p className="text-xs text-muted-foreground bg-muted/20 border border-dashed rounded-lg p-2.5 mt-2 italic leading-relaxed">
                Note: {expense.description}
              </p>
            )}
          </div>
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 shrink-0 ml-2" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Amount highlights */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-muted/30 border border-border/50 mb-5">
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Total Bill</p>
            <p className="text-xl font-black text-foreground mt-0.5">{currency.format(expense.amount)}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              {expense.isCustomSplit ? "Your Share" : "Each Share"}
            </p>
            <p className="text-xl font-black text-primary mt-0.5">
              {expense.isCustomSplit
                ? currency.format(expense.splits.find((s) => s.member === "You")?.amount || 0)
                : currency.format(shareAmount)}
            </p>
          </div>
        </div>

        {/* Splits Details */}
        <div className="space-y-3 mb-6">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Split status</h3>
          <div className="space-y-2.5">
            {expense.splits.map((split) => {
              const isPayerSelf = split.member === "You";
              return (
                <div
                  key={split.member}
                  className="flex items-center justify-between gap-3 p-3 bg-muted/20 border border-border/30 rounded-xl"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white shadow-inner",
                        getAvatarColor(split.member)
                      )}
                    >
                      {split.member.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {split.member} {isPayerSelf && <span className="text-xs font-normal text-muted-foreground/80">(You)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Share: {currency.format(split.amount)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Status Pill Badge */}
                    <Badge
                      variant={
                        split.status === "approved"
                          ? "success"
                          : split.status === "paid"
                          ? "default"
                          : split.status === "rejected"
                          ? "destructive"
                          : "secondary"
                      }
                      className={cn(
                        "px-2.5 py-1 text-[10px] font-medium rounded-full",
                        split.status === "pending" && "bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-500",
                        split.status === "paid" && "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
                        split.status === "approved" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
                      )}
                    >
                      {split.status === "paid"
                        ? "Paid (Awaiting Approval)"
                        : split.status.charAt(0).toUpperCase() + split.status.slice(1)}
                    </Badge>

                    {/* Creator Actions (Approve / Reject) */}
                    {isCreator && split.status === "paid" && (
                      <div className="flex items-center gap-1.5 ml-1">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleStatusChange(split.member, "approved")}
                          className="h-8 w-8 rounded-lg border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-600 shrink-0"
                          title="Approve payment"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleStatusChange(split.member, "rejected")}
                          className="h-8 w-8 rounded-lg border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                          title="Reject payment"
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="space-y-2.5 pt-2">
          {showMarkAsPaid && (
            <Button
              onClick={handleMarkAsPaid}
              className="w-full rounded-xl py-6 font-bold shadow-md bg-primary hover:bg-primary/95 text-xs text-primary-foreground gap-1.5 flex items-center justify-center"
            >
              <Check className="h-4 w-4" /> Mark as Paid
            </Button>
          )}

          {isCreator && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="w-full rounded-xl py-6 font-bold shadow-sm gap-1.5 flex items-center justify-center"
            >
              <Trash2 className="h-4 w-4" /> Delete Expense
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
