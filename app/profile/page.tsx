"use client";

import { useMemo, useState, useEffect } from "react";
import ProfileTab from "./ProfileTab";
import { Balance, Expense, Friend } from "@/utils/Types";
import { friends, initialExpenses } from "@/utils/Constants";
import { cn } from "@/lib/utils";

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

export default function ProfilePage() {
  const [expenses] = useState<Expense[]>(initialExpenses);
  const [darkMode, setDarkMode] = useState(false);

  const balances = useMemo(() => getBalances(expenses), [expenses]);

  const myOpenContribution = useMemo(() => {
    return expenses.reduce((total, expense) => {
      if (
        !expense.splitWith.includes("You") ||
        expense.paidBy === "You" ||
        expense.settledBy.includes("You")
      ) {
        return total;
      }

      return total + getShare(expense);
    }, 0);
  }, [expenses]);

  const receivableToMe = useMemo(() => {
    return balances
      .filter((balance) => balance.to === "You")
      .reduce((total, balance) => total + balance.amount, 0);
  }, [balances]);

  const totalSpentByMe = useMemo(() => {
    return expenses.reduce((total, expense) => {
      return expense.paidBy === "You" ? total + expense.amount : total;
    }, 0);
  }, [expenses]);

  // Sync dark mode class on html/body element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <main className={cn("min-h-screen bg-background text-foreground pb-24", darkMode && "dark")}>
      <div className="mx-auto max-w-md p-4 sm:max-w-2xl">
        <header className="mb-5">
          <p className="text-sm font-medium text-muted-foreground">Three friends</p>
          <h1 className="mt-1 text-3xl font-bold tracking-normal">Profile</h1>
        </header>
        <ProfileTab
          darkMode={darkMode}
          expenses={expenses}
          myOpenContribution={myOpenContribution}
          receivableToMe={receivableToMe}
          setDarkMode={setDarkMode}
          totalSpentByMe={totalSpentByMe}
        />
      </div>
    </main>
  );
}
