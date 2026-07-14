"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, Sun, Moon, ReceiptText, MessageSquare, Plus, ArrowUpRight, ArrowDownLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { currency } from "@/utils/Constants";
import { Group } from "@/utils/Types";

// Mock Groups List
const initialGroups: Group[] = [
  { id: "1", name: "Trip to Goa", description: "Weekend getaway expenses", members: ["You", "Aarav", "Meera"], balance: 2400 },
  { id: "2", name: "Apartment 4B", description: "Rent and monthly groceries", members: ["You", "Aarav"], balance: -1200 },
  { id: "3", name: "Weekly Dinners", description: "Shared food outings", members: ["You", "Meera"], balance: 0 }
];

// Mock Expenses matching group IDs
interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  paidBy: string;
  date: string;
}

const mockExpenses: Record<string, ExpenseItem[]> = {
  "1": [
    { id: "e1", title: "Airbnb Booking", amount: 15000, paidBy: "Aarav", date: "Jul 11" },
    { id: "e2", title: "Dinner at Beach Shack", amount: 2400, paidBy: "You", date: "Jul 12" },
    { id: "e3", title: "Taxi fare", amount: 1200, paidBy: "Meera", date: "Jul 13" }
  ],
  "2": [
    { id: "e4", title: "Monthly Rent", amount: 20000, paidBy: "Aarav", date: "Jul 01" },
    { id: "e5", title: "Groceries", amount: 4000, paidBy: "You", date: "Jul 05" }
  ],
  "3": [
    { id: "e6", title: "Pizza Night", amount: 1800, paidBy: "Meera", date: "Jul 10" }
  ]
};

// Mock Messages matching group IDs
interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
}

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
  
  // Chat input
  const [typedMessage, setTypedMessage] = useState("");
  
  // Expense creation states
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [newExpenseTitle, setNewExpenseTitle] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const [newExpensePaidBy, setNewExpensePaidBy] = useState("You");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

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

  // Auto-scroll chat window when new message arrives or switching tabs
  useEffect(() => {
    if (activeSection === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeSection]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: "You",
      text: typedMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, newMsg]);
    setTypedMessage("");
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(newExpenseAmount);
    if (!newExpenseTitle.trim() || isNaN(amountNum) || amountNum <= 0) return;

    const newExpense: ExpenseItem = {
      id: Date.now().toString(),
      title: newExpenseTitle,
      amount: amountNum,
      paidBy: newExpensePaidBy,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })
    };

    setExpenses((prev) => [newExpense, ...prev]);
    setIsAddingExpense(false);

    // Reset Form
    setNewExpenseTitle("");
    setNewExpenseAmount("");
    setNewExpensePaidBy("You");
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
            <div className="space-y-4 flex-1">
              {/* Expandable Add Expense Card */}
              {isAddingExpense ? (
                <Card className="border bg-card shadow-sm animate-in fade-in-50 slide-in-from-top-3 duration-250">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold">Add dynamic bill split</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsAddingExpense(false)}
                        className="h-7 w-7 rounded-full"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <form onSubmit={handleAddExpense} className="space-y-3">
                      <Input
                        required
                        placeholder="Expense title (e.g. Dinner, Taxi)"
                        value={newExpenseTitle}
                        onChange={(e) => setNewExpenseTitle(e.target.value)}
                        className="rounded-xl border-border bg-muted/20"
                      />
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
                          value={newExpensePaidBy}
                          onChange={(e) => setNewExpensePaidBy(e.target.value)}
                          className="w-full rounded-xl border border-border bg-muted/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                        >
                          {group.members.map((m) => (
                            <option key={m} value={m}>
                              Paid by {m}
                            </option>
                          ))}
                        </select>
                      </div>
                      <Button type="submit" className="w-full rounded-xl mt-1 py-5 text-xs font-semibold">
                        Add Expense
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <Button
                  onClick={() => setIsAddingExpense(true)}
                  className="w-full rounded-xl border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary py-6 text-xs font-semibold gap-1.5 flex items-center justify-center transition-colors"
                >
                  <Plus className="h-4 w-4" /> Add split expense
                </Button>
              )}

              {/* List of Group Expenses */}
              <div className="space-y-3">
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Expense Log ({expenses.length})
                </h2>
                {expenses.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No expenses logged yet.</p>
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
                          {currency.format(Math.round(exp.amount / group.members.length))} / person
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            // Chat Tab Component
            <div className="flex-1 flex flex-col min-h-0 border rounded-2xl bg-card/50 overflow-hidden shadow-inner h-[55vh]">
              {/* Scrollable messages area */}
              <div className="flex-grow p-4 overflow-y-auto space-y-3.5 flex flex-col">
                {messages.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-center">
                    <p className="text-xs text-muted-foreground">No chat history. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender === "You";
                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex flex-col max-w-[75%] gap-0.5",
                          isMe ? "self-end items-end" : "self-start items-start"
                        )}
                      >
                        {!isMe && (
                          <span className="text-[10px] font-bold text-muted-foreground px-1">
                            {msg.sender}
                          </span>
                        )}
                        <div
                          className={cn(
                            "rounded-2xl px-4 py-2.5 text-sm shadow-sm leading-relaxed",
                            isMe
                              ? "bg-primary text-primary-foreground rounded-br-sm"
                              : "bg-muted text-foreground rounded-bl-sm"
                          )}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[9px] text-muted-foreground/60 px-1 mt-0.5">
                          {msg.timestamp}
                        </span>
                      </div>
                    );
                  })
                )}
                {/* Scroll Anchor */}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} className="p-3 border-t bg-card flex gap-2 items-center">
                <Input
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="rounded-xl border-border bg-muted/30 focus-visible:ring-primary flex-grow text-sm py-5"
                />
                <Button type="submit" size="icon" className="rounded-xl h-10 w-10 shrink-0 shadow-md">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
