"use client";

import { FormEvent, ReactNode, useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  CircleDollarSign,
  Moon,
  PlusCircle,
  ReceiptText,
  RotateCcw,
  Sun,
  UserRound,
  UsersRound,
  WalletCards,
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

type Friend = "You" | "Aarav" | "Meera";
type TabId = "expenses" | "add" | "debts" | "profile";

type Expense = {
  id: number;
  title: string;
  paidBy: Friend;
  amount: number;
  note: string;
  splitWith: Friend[];
  settledBy: Friend[];
};

type Balance = {
  from: Friend;
  to: Friend;
  amount: number;
};

type ExpenseDraft = {
  title: string;
  amount: string;
  note: string;
  splitWith: Friend[];
};

const friends: Friend[] = ["You", "Aarav", "Meera"];

const initialExpenses: Expense[] = [
  {
    id: 1,
    title: "Dinner",
    paidBy: "Aarav",
    amount: 2400,
    note: "Shared equally after movie night",
    splitWith: ["You", "Aarav", "Meera"],
    settledBy: ["Aarav"],
  },
  {
    id: 2,
    title: "Groceries",
    paidBy: "You",
    amount: 1500,
    note: "Weekend breakfast and snacks",
    splitWith: ["You", "Aarav", "Meera"],
    settledBy: ["You", "Meera"],
  },
  {
    id: 3,
    title: "Cab",
    paidBy: "Meera",
    amount: 900,
    note: "Airport pickup",
    splitWith: ["You", "Meera"],
    settledBy: ["Meera"],
  },
];

const emptyDraft: ExpenseDraft = {
  title: "",
  amount: "",
  note: "",
  splitWith: friends,
};

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const tabs: Array<{ id: TabId; label: string; icon: ReactNode }> = [
  { id: "expenses", label: "Expenses", icon: <ReceiptText className="h-5 w-5" /> },
  { id: "add", label: "Add", icon: <PlusCircle className="h-5 w-5" /> },
  { id: "debts", label: "Debts", icon: <WalletCards className="h-5 w-5" /> },
  { id: "profile", label: "Profile", icon: <UserRound className="h-5 w-5" /> },
];

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

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("expenses");
  const [darkMode, setDarkMode] = useState(false);
  const [expenses, setExpenses] = useState(initialExpenses);
  const [selectedId, setSelectedId] = useState(initialExpenses[0].id);
  const [draft, setDraft] = useState(emptyDraft);

  const selectedExpense =
    expenses.find((expense) => expense.id === selectedId) ?? expenses[0];

  const balances = useMemo(() => getBalances(expenses), [expenses]);
  const draftAmount = Number(draft.amount) || 0;
  const draftShare = draftAmount / Math.max(draft.splitWith.length, 1);

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

  const totalSpentByMe = expenses.reduce((total, expense) => {
    return expense.paidBy === "You" ? total + expense.amount : total;
  }, 0);

  const receivableToMe = balances
    .filter((balance) => balance.to === "You")
    .reduce((total, balance) => total + balance.amount, 0);

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

  function toggleSplitFriend(friend: Friend) {
    setDraft((currentDraft) => {
      const exists = currentDraft.splitWith.includes(friend);
      const splitWith = exists
        ? currentDraft.splitWith.filter((name) => name !== friend)
        : [...currentDraft.splitWith, friend];

      return {
        ...currentDraft,
        splitWith,
      };
    });
  }

  function addExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const amount = Math.round(Number(draft.amount));
    const title = draft.title.trim();

    if (!title || amount <= 0 || draft.splitWith.length === 0) {
      return;
    }

    const nextExpense: Expense = {
      id: Date.now(),
      title,
      amount,
      paidBy: "You",
      note: draft.note.trim() || "Added by you",
      splitWith: draft.splitWith,
      settledBy: draft.splitWith.includes("You") ? ["You"] : [],
    };

    setExpenses((currentExpenses) => [nextExpense, ...currentExpenses]);
    setSelectedId(nextExpense.id);
    setDraft(emptyDraft);
    setActiveTab("expenses");
  }

  function resetDemo() {
    setExpenses(initialExpenses);
    setSelectedId(initialExpenses[0].id);
    setDraft(emptyDraft);
    setActiveTab("expenses");
  }

  return (
    <div className={cn(darkMode && "dark")}>
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
                onClick={() => setDarkMode((value) => !value)}
                title="Toggle dark mode"
              >
                {darkMode ? (
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

          {activeTab === "expenses" && (
            <ExpensesTab
              expenses={expenses}
              selectedExpense={selectedExpense}
              selectedId={selectedId}
              myOpenContribution={myOpenContribution}
              markContribution={markContribution}
              setSelectedId={setSelectedId}
            />
          )}

          {activeTab === "add" && (
            <AddExpenseTab
              draft={draft}
              draftShare={draftShare}
              setDraft={setDraft}
              toggleSplitFriend={toggleSplitFriend}
              addExpense={addExpense}
            />
          )}

          {activeTab === "debts" && (
            <DebtsTab
              balances={balances}
              expenses={expenses}
              markContribution={markContribution}
            />
          )}

          {activeTab === "profile" && (
            <ProfileTab
              darkMode={darkMode}
              expenses={expenses}
              myOpenContribution={myOpenContribution}
              receivableToMe={receivableToMe}
              setDarkMode={setDarkMode}
              totalSpentByMe={totalSpentByMe}
            />
          )}
        </section>

        <nav className="fixed inset-x-0 bottom-0 border-t bg-card/95 px-3 py-2 text-card-foreground backdrop-blur">
          <div className="mx-auto grid max-w-md grid-cols-4 gap-1 sm:max-w-2xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 rounded-md px-1 text-xs font-medium text-muted-foreground transition-colors",
                  activeTab === tab.id && "bg-primary text-primary-foreground",
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </main>
    </div>
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
                      Paid by {expense.paidBy} · {expense.splitWith.length} split
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

function AddExpenseTab({
  draft,
  draftShare,
  setDraft,
  toggleSplitFriend,
  addExpense,
}: {
  draft: ExpenseDraft;
  draftShare: number;
  setDraft: React.Dispatch<React.SetStateAction<ExpenseDraft>>;
  toggleSplitFriend: (friend: Friend) => void;
  addExpense: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="space-y-4" onSubmit={addExpense}>
      <Card>
        <CardHeader>
          <CardTitle>Add Expense</CardTitle>
          <CardDescription>Paid by You</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Expense name">
            <input
              className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
              placeholder="Lunch, cab, tickets"
              value={draft.title}
              onChange={(event) =>
                setDraft((currentDraft) => ({
                  ...currentDraft,
                  title: event.target.value,
                }))
              }
            />
          </Field>

          <Field label="Amount">
            <input
              className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
              inputMode="numeric"
              min="1"
              placeholder="1200"
              type="number"
              value={draft.amount}
              onChange={(event) =>
                setDraft((currentDraft) => ({
                  ...currentDraft,
                  amount: event.target.value,
                }))
              }
            />
          </Field>

          <Field label="Note">
            <textarea
              className="min-h-20 w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
              placeholder="Short detail"
              value={draft.note}
              onChange={(event) =>
                setDraft((currentDraft) => ({
                  ...currentDraft,
                  note: event.target.value,
                }))
              }
            />
          </Field>

          <div className="space-y-2">
            <p className="text-sm font-medium">Split with</p>
            <div className="grid grid-cols-3 gap-2">
              {friends.map((friend) => {
                const selected = draft.splitWith.includes(friend);

                return (
                  <button
                    key={friend}
                    className={cn(
                      "rounded-md border px-2 py-3 text-sm font-medium transition-colors",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground",
                    )}
                    type="button"
                    onClick={() => toggleSplitFriend(friend)}
                  >
                    {friend}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DetailItem label="People" value={String(draft.splitWith.length)} />
            <DetailItem
              label="Each share"
              value={currency.format(draftShare)}
            />
          </div>

          <Button
            className="w-full"
            disabled={
              !draft.title.trim() ||
              Number(draft.amount) <= 0 ||
              draft.splitWith.length === 0
            }
            type="submit"
          >
            <PlusCircle className="h-4 w-4" />
            Save expense
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}

function DebtsTab({
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
          <CardDescription>Balances update after marked payments.</CardDescription>
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

function ProfileTab({
  darkMode,
  expenses,
  myOpenContribution,
  receivableToMe,
  setDarkMode,
  totalSpentByMe,
}: {
  darkMode: boolean;
  expenses: Expense[];
  myOpenContribution: number;
  receivableToMe: number;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  totalSpentByMe: number;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-primary text-2xl font-bold text-primary-foreground">
            Y
          </div>
          <div className="min-w-0">
            <p className="text-xl font-bold">You</p>
            <p className="text-sm text-muted-foreground">
              Group member · {expenses.length} expenses
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Personal split summary</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <DetailItem label="I owe" value={currency.format(myOpenContribution)} />
            <DetailItem label="Owed to me" value={currency.format(receivableToMe)} />
            <DetailItem label="I spent" value={currency.format(totalSpentByMe)} />
            <DetailItem label="Friends" value={String(friends.length)} />
          </div>

          <Button
            className="w-full"
            variant="outline"
            onClick={() => setDarkMode((value) => !value)}
          >
            {darkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            {darkMode ? "Light mode" : "Dark mode"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Group</CardTitle>
          <CardDescription>Friends in this split</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {friends.map((friend) => (
            <div
              key={friend}
              className="flex items-center justify-between rounded-md bg-muted px-3 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-background font-semibold">
                  {friend[0]}
                </div>
                <p className="text-sm font-medium">{friend}</p>
              </div>
              <Badge variant={friend === "You" ? "default" : "secondary"}>
                {friend === "You" ? "Me" : "Friend"}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
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
          <DetailItem label="Each share" value={currency.format(getShare(expense))} />
          <DetailItem label="Paid by" value={expense.paidBy} />
          <DetailItem label="Split" value={`${expense.splitWith.length} people`} />
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

function SummaryTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-xl font-bold">{value}</p>
        </div>
        <div className="rounded-md bg-primary/10 p-2 text-primary">{icon}</div>
      </CardContent>
    </Card>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-background p-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function Field({ children, label }: { children: ReactNode; label: string }) {
  return (
    <label className="space-y-2">
      <span className="block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
