import { useState, useEffect } from "react";
import { X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { currency } from "@/utils/Constants";

interface AddExpenseFormProps {
  members: string[];
  onAddExpense: (
    title: string,
    amount: number,
    paidBy: string,
    description: string,
    isCustomSplit: boolean,
    customSplits: Array<{ member: string; amount: number; included: boolean }>
  ) => void;
  onCancel: () => void;
}

export function AddExpenseForm({ members, onAddExpense, onCancel }: AddExpenseFormProps) {
  const [newExpenseTitle, setNewExpenseTitle] = useState("");
  const [newExpenseDescription, setNewExpenseDescription] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const [splitType, setSplitType] = useState<"equal" | "custom">("equal");
  const [searchQuery, setSearchQuery] = useState("");

  // Track inclusion and custom amount per member
  const [customSplits, setCustomSplits] = useState<
    Record<string, { included: boolean; amount: string }>
  >({});

  // Initialize splits state whenever members change
  useEffect(() => {
    const initial: Record<string, { included: boolean; amount: string }> = {};
    members.forEach((m) => {
      initial[m] = { included: true, amount: "" };
    });
    setCustomSplits(initial);
  }, [members]);

  const totalAmountNum = parseFloat(newExpenseAmount) || 0;

  // Calculate sum of custom splits
  const sumOfCustomAmounts = Object.entries(customSplits).reduce((sum, [member, split]) => {
    if (split.included) {
      const val = parseFloat(split.amount);
      return sum + (isNaN(val) ? 0 : val);
    }
    return sum;
  }, 0);

  const isSumMatching = Math.abs(sumOfCustomAmounts - totalAmountNum) < 0.01;

  // Filter members by search input
  const filteredMembers = members.filter((m) =>
    m.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(newExpenseAmount);
    if (!newExpenseTitle.trim() || isNaN(amountNum) || amountNum <= 0) return;

    if (splitType === "custom" && !isSumMatching) return;

    const mappedSplits = members.map((m) => {
      const splitConf = customSplits[m] || { included: true, amount: "" };
      return {
        member: m,
        amount: splitType === "custom"
          ? (splitConf.included ? (parseFloat(splitConf.amount) || 0) : 0)
          : Math.round(amountNum / Math.max(members.length, 1)),
        included: splitType === "custom" ? splitConf.included : true
      };
    });

    onAddExpense(
      newExpenseTitle,
      amountNum,
      "You", // paid by creator
      newExpenseDescription,
      splitType === "custom",
      mappedSplits
    );

    // Reset Form
    setNewExpenseTitle("");
    setNewExpenseDescription("");
    setNewExpenseAmount("");
    setSplitType("equal");
    setSearchQuery("");
  };

  const isFormValid =
    newExpenseTitle.trim() !== "" &&
    totalAmountNum > 0 &&
    (splitType === "equal" || isSumMatching);

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
          {/* Title */}
          <Input
            required
            placeholder="Expense title (e.g. Dinner, Taxi)"
            value={newExpenseTitle}
            onChange={(e) => setNewExpenseTitle(e.target.value)}
            className="rounded-xl border-border bg-muted/20"
          />

          {/* Description */}
          <Input
            placeholder="Description / notes (optional)"
            value={newExpenseDescription}
            onChange={(e) => setNewExpenseDescription(e.target.value)}
            className="rounded-xl border-border bg-muted/20 text-xs"
          />

          {/* Amount and Split Dropdown */}
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
              value={splitType}
              onChange={(e) => setSplitType(e.target.value as "equal" | "custom")}
              className="w-full rounded-xl border border-border bg-muted/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
            >
              <option value="equal">Split Equally</option>
              <option value="custom">Customize</option>
            </select>
          </div>

          {/* Custom Split Details (visible only when Customize is chosen) */}
          {splitType === "custom" && (
            <div className="border rounded-xl p-3 bg-muted/10 space-y-3 animate-in fade-in-50 duration-200">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 rounded-lg h-9 text-xs border-border bg-muted/30"
                />
              </div>

              <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1">
                {filteredMembers.length === 0 ? (
                  <p className="text-center text-[10px] text-muted-foreground py-2">
                    No members found.
                  </p>
                ) : (
                  filteredMembers.map((m) => {
                    const splitConf = customSplits[m] || { included: true, amount: "" };
                    return (
                      <div
                        key={m}
                        className="flex items-center justify-between gap-3 py-1.5 border-b border-border/30 last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={splitConf.included}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setCustomSplits((prev) => ({
                                ...prev,
                                [m]: { ...prev[m], included: checked }
                              }));
                            }}
                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20 bg-muted/30"
                          />
                          <span className="text-xs font-semibold">{m}</span>
                        </div>
                        <div className="flex items-center gap-1.5 w-24">
                          <span className="text-xs text-muted-foreground font-semibold">₹</span>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0"
                            disabled={!splitConf.included}
                            value={splitConf.amount}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCustomSplits((prev) => ({
                                ...prev,
                                [m]: { ...prev[m], amount: val }
                              }));
                            }}
                            className="h-8 rounded-lg text-xs bg-muted/10 border-border"
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Checksum details */}
              <div className="border-t pt-2 mt-1 text-[10px] flex items-center justify-between font-semibold">
                <span className="text-muted-foreground">
                  Logged sum: {currency.format(sumOfCustomAmounts)}
                </span>
                {isSumMatching ? (
                  <span className="text-emerald-500">✓ Matches total bill</span>
                ) : (
                  <span className="text-destructive">
                    Difference: {currency.format(totalAmountNum - sumOfCustomAmounts)}
                  </span>
                )}
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={!isFormValid}
            className="w-full rounded-xl mt-1 py-5 text-xs font-semibold shadow-sm"
          >
            Add Expense
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
