"use client";

import { useMemo, useState } from "react";
import DebtsTab from "./DebtsTab";
import { Balance, Expense, Friend } from "@/utils/Types";
import { friends, initialExpenses } from "@/utils/Constants";

function getShare(expense: Expense) {
  return Math.round(expense.amount / Math.max(expense.splitWith.length, 1));
}

function getBalances(expenses: Expense[]): Balance[] {
  const totals = new Map<Friend, Map<Friend, number>>();

  friends.forEach((from) => {
    totals.set(from, new Map());
  });

  expenses.forEach((expense) => {
    const share = getShare(expense);

    expense.splitWith.forEach((friend) => {
      if (friend === expense.paidBy || expense.settledBy.includes(friend)) {
        return;
      }

      const current = totals.get(friend)?.get(expense.paidBy) ?? 0;
      totals.get(friend)?.set(expense.paidBy, current + share);
    });
  });

  const balances: Balance[] = [];

  friends.forEach((from) => {
    friends.forEach((to) => {
      if (from === to) {
        return;
      }

      const forward = totals.get(from)?.get(to) ?? 0;
      const reverse = totals.get(to)?.get(from) ?? 0;

      if (forward > reverse) {
        balances.push({ from, to, amount: forward - reverse });
      }
    });
  });

  return balances;
}

export default function DebtsPage() {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const balances = useMemo(() => getBalances(expenses), [expenses]);

  function markContribution(expenseId: number, friend: Friend = "You") {
    setExpenses((currentExpenses) =>
      currentExpenses.map((expense) => {
        if (expense.id !== expenseId || expense.settledBy.includes(friend)) {
          return expense;
        }

        return {
          ...expense,
          settledBy: [...expense.settledBy, friend],
        };
      }),
    );
  }

  return (
    <div className="mx-auto max-w-md p-4 pb-24 sm:max-w-2xl">
      <header className="mb-5">
        <p className="text-sm font-medium text-muted-foreground">Three friends</p>
        <h1 className="mt-1 text-3xl font-bold tracking-normal">Debts</h1>
      </header>
      <DebtsTab
        balances={balances}
        expenses={expenses}
        markContribution={markContribution}
      />
    </div>
  );
}
