"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WalletCards } from "lucide-react";
import { currency } from "@/utils/Constants";
import { Balance, Expense, Friend } from "@/utils/Types";

function getShare(expense: Expense) {
  return Math.round(expense.amount / Math.max(expense.splitWith.length, 1));
}

export default function DebtsTab({
  balances,
  expenses,
  markContribution,
}: {
  balances: Balance[];
  expenses: Expense[];
  markContribution: (expenseId: number, friend?: Friend) => void;
}) {
  const pendingExpenses = expenses.filter(
    (expense) =>
      expense.splitWith.includes("You") &&
      expense.paidBy !== "You" &&
      !expense.settledBy.includes("You"),
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WalletCards className="h-5 w-5 text-primary" />
            Current Debts
          </CardTitle>
          <CardDescription>
            Balances update after marked payments.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {balances.length > 0 ? (
            balances.map((balance) => (
              <div
                key={`${balance.from}-${balance.to}`}
                className="flex items-center justify-between rounded-md border bg-background px-3 py-3"
              >
                <p className="text-sm">
                  <span className="font-semibold">{balance.from}</span> owes{" "}
                  {balance.to}
                </p>
                <span className="text-sm font-bold">
                  {currency.format(balance.amount)}
                </span>
              </div>
            ))
          ) : (
            <div className="rounded-md border bg-background px-3 py-4 text-sm text-muted-foreground">
              Everyone is settled.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Pending Shares</CardTitle>
          <CardDescription>Mark your payments from here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {pendingExpenses.length > 0 ? (
            pendingExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between gap-3 rounded-md bg-muted p-3"
              >
                <div>
                  <p className="text-sm font-semibold">{expense.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Owed to {expense.paidBy}
                  </p>
                </div>
                <Button size="sm" onClick={() => markContribution(expense.id)}>
                  {currency.format(getShare(expense))}
                </Button>
              </div>
            ))
          ) : (
            <div className="rounded-md bg-muted px-3 py-4 text-sm text-muted-foreground">
              No pending shares for you.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
