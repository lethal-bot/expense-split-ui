"use client";

import { FormEvent, ReactNode, useMemo, useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Check,
  CheckCircle2,
  CircleDollarSign,
  Moon,
  ReceiptText,
  RotateCcw,
  Sun,
  UsersRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Expense, Friend } from "@/utils/Types";
import { currency, emptyDraft, friends, initialExpenses, tabs } from "@/utils/Constants";
import { SummaryTile } from "@/components/custom/SummaryTile";
import { DetailItem } from "@/components/custom/DetailItem";


function getShare(expense: Expense) {
  return Math.round(expense.amount / Math.max(expense.splitWith.length, 1));
}


function HomeContent() {

  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const currentTheme = (document.documentElement.getAttribute("data-theme") || "light") as "light" | "dark";
    setTheme(currentTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };
  const [expenses, setExpenses] = useState(initialExpenses);
  const [selectedId, setSelectedId] = useState(initialExpenses[0].id);
  const [draft, setDraft] = useState(emptyDraft);

  const selectedExpense =
    expenses.find((expense) => expense.id === selectedId) ?? expenses[0];

  const myOpenContribution = expenses.reduce((total, expense) => {
    if (
      !expense.splitWith.includes("You") ||
      expense.paidBy === "You" ||
      expense.settledBy.includes("You")
    ) {
      return total;
    }

    return total + getShare(expense);
  }, 0);


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



  function resetDemo() {
    setExpenses(initialExpenses);
    setSelectedId(initialExpenses[0].id);
    setDraft(emptyDraft);
  }

  return (
    <>
      <main className="min-h-screen bg-background text-foreground">
        <section className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-24 pt-5 sm:max-w-2xl">
          <header className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Three friends
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-normal">
                Expense Split
              </h1>
            </div>
            <div className="flex gap-2">
              <Button
                aria-label="Toggle dark mode"
                size="icon"
                variant="outline"
                onClick={toggleTheme}
                title="Toggle dark mode"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              <Button
                aria-label="Reset demo"
                size="icon"
                variant="outline"
                onClick={resetDemo}
                title="Reset demo"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <ExpensesTab
            expenses={expenses}
            selectedExpense={selectedExpense}
            selectedId={selectedId}
            myOpenContribution={myOpenContribution}
            markContribution={markContribution}
            setSelectedId={setSelectedId}
          />
        </section>
      </main>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background text-foreground flex items-center justify-center">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}

function ExpensesTab({
  expenses,
  selectedExpense,
  selectedId,
  myOpenContribution,
  markContribution,
  setSelectedId,
}: {
  expenses: Expense[];
  selectedExpense: Expense;
  selectedId: number;
  myOpenContribution: number;
  markContribution: (expenseId: number, friend?: Friend) => void;
  setSelectedId: (id: number) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryTile
          icon={<CircleDollarSign className="h-4 w-4" />}
          label="My due"
          value={currency.format(myOpenContribution)}
        />
        <SummaryTile
          icon={<ReceiptText className="h-4 w-4" />}
          label="Expenses"
          value={String(expenses.length)}
        />
        <SummaryTile
          icon={<UsersRound className="h-4 w-4" />}
          label="Friends"
          value={String(friends.length)}
        />
      </div>

      <section className="grid gap-4 sm:grid-cols-[1fr_1.15fr]">
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">
            All Expenses
          </h2>
          {expenses.map((expense) => {
            const isSelected = selectedId === expense.id;
            const share = getShare(expense);
            const iPaid = expense.settledBy.includes("You");

            return (
              <button
                key={expense.id}
                className={cn(
                  "w-full rounded-lg border bg-card p-4 text-left shadow-sm transition-colors",
                  isSelected
                    ? "border-primary ring-2 ring-primary/15"
                    : "hover:bg-muted/60",
                )}
                onClick={() => setSelectedId(expense.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{expense.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Paid by {expense.paidBy} · {expense.splitWith.length}{" "}
                      split
                    </p>
                  </div>
                  <Badge variant={iPaid ? "success" : "secondary"}>
                    {iPaid ? "Saved" : currency.format(share)}
                  </Badge>
                </div>
              </button>
            );
          })}
        </div>

        <ExpenseDetail
          expense={selectedExpense}
          markContribution={markContribution}
        />
      </section>
    </div>
  );
}







function ExpenseDetail({
  expense,
  markContribution,
}: {
  expense: Expense;
  markContribution: (expenseId: number, friend?: Friend) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{expense.title}</CardTitle>
            <CardDescription>{expense.note}</CardDescription>
          </div>
          <div className="rounded-md bg-accent p-2 text-accent-foreground">
            <ReceiptText className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <DetailItem label="Total" value={currency.format(expense.amount)} />
          <DetailItem
            label="Each share"
            value={currency.format(getShare(expense))}
          />
          <DetailItem label="Paid by" value={expense.paidBy} />
          <DetailItem
            label="Split"
            value={`${expense.splitWith.length} people`}
          />
        </div>

        <div className="space-y-2">
          {expense.splitWith.map((friend) => {
            const settled = expense.settledBy.includes(friend);

            return (
              <div
                key={friend}
                className="flex items-center justify-between gap-3 rounded-md bg-muted px-3 py-2"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-background text-sm font-semibold">
                    {friend[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{friend}</p>
                    <p className="text-xs text-muted-foreground">
                      {friend === expense.paidBy
                        ? "Paid the bill"
                        : currency.format(getShare(expense))}
                    </p>
                  </div>
                </div>
                {settled ? (
                  <Badge variant="success">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Marked
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    variant={friend === "You" ? "default" : "outline"}
                    onClick={() => markContribution(expense.id, friend)}
                  >
                    <Check className="h-4 w-4" />
                    Mark
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}


