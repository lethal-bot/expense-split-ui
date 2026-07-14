"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Sun, Moon, ReceiptText, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Group, ExpenseItem, Message, ExpenseSplit } from "@/utils/Types";
import { GroupExpensesTab } from "@/components/custom/GroupExpensesTab";
import { GroupChatTab } from "@/components/custom/GroupChatTab";

// Mock Groups List
const initialGroups: Group[] = [
  { id: "1", name: "Trip to Goa", description: "Weekend getaway expenses", members: ["You", "Aarav", "Meera"], balance: 2400 },
  { id: "2", name: "Apartment 4B", description: "Rent and monthly groceries", members: ["You", "Aarav"], balance: -1200 },
  { id: "3", name: "Weekly Dinners", description: "Shared food outings", members: ["You", "Meera"], balance: 0 }
];

// Mock Expenses matching group IDs
const mockExpenses: Record<string, ExpenseItem[]> = {
  "1": [
    {
      id: "e1",
      title: "Airbnb Booking",
      amount: 15000,
      paidBy: "Aarav",
      date: "Jul 11",
      splits: [
        { member: "You", amount: 5000, status: "pending" },
        { member: "Aarav", amount: 5000, status: "approved" },
        { member: "Meera", amount: 5000, status: "paid" }
      ]
    },
    {
      id: "e2",
      title: "Dinner at Beach Shack",
      amount: 2400,
      paidBy: "You",
      date: "Jul 12",
      splits: [
        { member: "You", amount: 800, status: "approved" },
        { member: "Aarav", amount: 800, status: "paid" },
        { member: "Meera", amount: 800, status: "pending" }
      ]
    },
    {
      id: "e3",
      title: "Taxi fare",
      amount: 1200,
      paidBy: "Meera",
      date: "Jul 13",
      splits: [
        { member: "You", amount: 400, status: "pending" },
        { member: "Aarav", amount: 400, status: "approved" },
        { member: "Meera", amount: 400, status: "approved" }
      ]
    }
  ],
  "2": [
    {
      id: "e4",
      title: "Monthly Rent",
      amount: 20000,
      paidBy: "Aarav",
      date: "Jul 01",
      splits: [
        { member: "You", amount: 10000, status: "pending" },
        { member: "Aarav", amount: 10000, status: "approved" }
      ]
    },
    {
      id: "e5",
      title: "Groceries",
      amount: 4000,
      paidBy: "You",
      date: "Jul 05",
      splits: [
        { member: "You", amount: 2000, status: "approved" },
        { member: "Aarav", amount: 2000, status: "pending" }
      ]
    }
  ],
  "3": [
    {
      id: "e6",
      title: "Pizza Night",
      amount: 1800,
      paidBy: "Meera",
      date: "Jul 10",
      splits: [
        { member: "You", amount: 900, status: "pending" },
        { member: "Meera", amount: 900, status: "approved" }
      ]
    }
  ]
};

// Mock Messages matching group IDs
const mockMessages: Record<string, Message[]> = {
  "1": [
    { id: "m1", sender: "Aarav", text: "Hey! I booked the Airbnb for our Goa trip.", timestamp: "10:30 AM" },
    { id: "m2", sender: "Meera", text: "Awesome, thanks Aarav! How much was it?", timestamp: "10:32 AM" },
    { id: "m3", sender: "Aarav", text: "It was 15k total. Let's split it here.", timestamp: "10:33 AM" },
    { id: "m4", sender: "You", text: "Sounds good, I'll log it on the expenses tab.", timestamp: "10:35 AM" }
  ],
  "2": [
    { id: "m5", sender: "Aarav", text: "Did we pay the rent for this month?", timestamp: "09:00 AM" },
    { id: "m6", sender: "You", text: "Yes, I just transferred it. Checking now.", timestamp: "09:15 AM" }
  ],
  "3": [
    { id: "m7", sender: "Meera", text: "Let's go for dinner tonight!", timestamp: "04:00 PM" },
    { id: "m8", sender: "You", text: "Sure! Pizza?", timestamp: "04:05 PM" }
  ]
};

export default function GroupDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;

  // Local State
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [activeSection, setActiveSection] = useState<"expenses" | "chat">("expenses");

  // Dynamic Page Group Metadata
  const group = initialGroups.find((g) => g.id === groupId) || {
    id: groupId,
    name: "Unknown Group",
    description: "",
    members: ["You"],
    balance: 0
  };

  // Expenses & Messages States
  const [expenses, setExpenses] = useState<ExpenseItem[]>(mockExpenses[groupId] || []);
  const [messages, setMessages] = useState<Message[]>(mockMessages[groupId] || []);

  // Set initial theme
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

  const handleSendMessage = (text: string) => {
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: "You",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, newMsg]);
  };

  const handleAddExpense = (
    title: string,
    amount: number,
    paidBy: string,
    description: string,
    isCustomSplit: boolean,
    customSplits: Array<{ member: string; amount: number; included: boolean }>
  ) => {
    let splits: ExpenseSplit[] = [];

    if (isCustomSplit) {
      splits = customSplits
        .filter((cs) => cs.included)
        .map((cs) => ({
          member: cs.member,
          amount: cs.amount,
          status: cs.member === paidBy ? "approved" : "pending"
        }));
    } else {
      const share = Math.round(amount / Math.max(group.members.length, 1));
      splits = group.members.map((m) => ({
        member: m,
        amount: share,
        status: m === paidBy ? "approved" : "pending"
      }));
    }

    const newExpense: ExpenseItem = {
      id: Date.now().toString(),
      title,
      description: description || undefined,
      amount,
      paidBy,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      splits,
      isCustomSplit
    };

    setExpenses((prev) => [newExpense, ...prev]);
  };

  const handleUpdateExpense = (updatedExpense: ExpenseItem) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === updatedExpense.id ? updatedExpense : e))
    );
  };

  const handleDeleteExpense = (expenseId: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
  };

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors pb-28 relative flex flex-col">
      <div className="mx-auto flex w-full max-w-md flex-col px-4 pt-5 sm:max-w-2xl flex-1">
        {/* Detail Header */}
        <header className="mb-4 flex items-center justify-between gap-4 border-b pb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/groups")}
              className="rounded-xl shrink-0"
              title="Go back to groups"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight truncate">{group.name}</h1>
              <p className="text-xs text-muted-foreground truncate">
                {group.members.join(", ")}
              </p>
            </div>
          </div>
          <Button
            aria-label="Toggle dark mode"
            size="icon"
            variant="outline"
            onClick={toggleTheme}
            className="rounded-xl shrink-0"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </header>

        {/* Segmented Controller (Expenses / Chat) */}
        <div className="flex bg-muted p-1 rounded-xl mb-5 shrink-0 select-none">
          <button
            onClick={() => setActiveSection("expenses")}
            className={cn(
              "flex-grow flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-lg transition-all",
              activeSection === "expenses"
                ? "bg-card text-card-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ReceiptText className="h-3.5 w-3.5" />
            Expenses
          </button>
          <button
            onClick={() => setActiveSection("chat")}
            className={cn(
              "flex-grow flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-lg transition-all",
              activeSection === "chat"
                ? "bg-card text-card-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Chat
          </button>
        </div>

        {/* Dynamic Section Contents */}
        <div className="flex-1 flex flex-col min-h-0">
          {activeSection === "expenses" ? (
            <GroupExpensesTab
              members={group.members}
              expenses={expenses}
              onAddExpense={handleAddExpense}
              onUpdateExpense={handleUpdateExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          ) : (
            <GroupChatTab messages={messages} onSendMessage={handleSendMessage} />
          )}
        </div>
      </div>
    </main>
  );
}
