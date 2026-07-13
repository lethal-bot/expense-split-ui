"use client";

import { useState, useEffect } from "react";
import { Plus, X, Users, Sun, Moon, Check, Landmark, Info, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { currency } from "@/utils/Constants";
import { SummaryTile } from "@/components/custom/SummaryTile";

interface Group {
  id: string;
  name: string;
  description: string;
  members: string[];
  balance: number; // Positive = You are owed, Negative = You owe
}

const initialGroups: Group[] = [
  { id: "1", name: "Trip to Goa", description: "Weekend getaway expenses", members: ["You", "Aarav", "Meera"], balance: 2400 },
  { id: "2", name: "Apartment 4B", description: "Rent and monthly groceries", members: ["You", "Aarav"], balance: -1200 },
  { id: "3", name: "Weekly Dinners", description: "Shared food outings", members: ["You", "Meera"], balance: 0 }
];

export default function GroupsPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [memberEmails, setMemberEmails] = useState<string[]>([""]);

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

  const handleEmailChange = (index: number, val: string) => {
    setMemberEmails((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleAddEmailField = () => {
    setMemberEmails((prev) => [...prev, ""]);
  };

  const handleRemoveEmailField = (index: number) => {
    setMemberEmails((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    // Filter out empty input fields
    const validEmails = memberEmails.filter((email) => email.trim() !== "");
    const newGroup: Group = {
      id: Date.now().toString(),
      name: groupName,
      description: groupDescription,
      members: ["You", ...validEmails],
      balance: 0 // Default to settled for new groups
    };

    setGroups((prev) => [newGroup, ...prev]);
    setIsModalOpen(false);

    // Reset Form
    setGroupName("");
    setGroupDescription("");
    setMemberEmails([""]);
  };

  // Stats calculation
  const totalOwed = groups.reduce((acc, g) => (g.balance > 0 ? acc + g.balance : acc), 0);
  const totalOwe = groups.reduce((acc, g) => (g.balance < 0 ? acc + Math.abs(g.balance) : acc), 0);

  // Get a colored gradient class based on name hash for beautiful mobile group icons
  const getAvatarGradient = (name: string) => {
    const gradients = [
      "from-rose-500 to-orange-500 text-white",
      "from-emerald-500 to-teal-500 text-white",
      "from-blue-500 to-indigo-500 text-white",
      "from-purple-500 to-pink-500 text-white",
      "from-amber-500 to-yellow-500 text-white"
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    return gradients[sum % gradients.length];
  };

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors pb-28">
      <div className="mx-auto flex w-full max-w-md flex-col px-4 pt-5 sm:max-w-2xl">
        {/* Header */}
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Manage your shares</p>
            <h1 className="text-3xl font-bold tracking-normal">Groups</h1>
          </div>
          <Button
            aria-label="Toggle dark mode"
            size="icon"
            variant="outline"
            onClick={toggleTheme}
            title="Toggle dark mode"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </header>

        {/* List of Groups */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Groups ({groups.length})
          </h2>
          {groups.length === 0 ? (
            <Card className="border-dashed bg-card/50">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <Users className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm font-medium text-muted-foreground">No groups yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Tap the plus button below to create one!</p>
              </CardContent>
            </Card>
          ) : (
            groups.map((group) => {
              const displayMembers = group.members.join(", ");
              const hasBalance = group.balance !== 0;

              return (
                <div
                  key={group.id}
                  className="flex items-center justify-between gap-3 rounded-xl border bg-card p-4 shadow-sm hover:bg-muted/40 transition-all active:scale-[0.99] cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-base font-bold shadow-inner",
                        getAvatarGradient(group.name)
                      )}
                    >
                      {group.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold">{group.name}</h3>
                      <p className="truncate text-xs text-muted-foreground mt-0.5">{group.description || "No description"}</p>
                      <p className="truncate text-[10px] text-muted-foreground/80 mt-1 flex items-center gap-1">
                        <Users className="h-3 w-3 inline" /> {displayMembers}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    {group.balance > 0 ? (
                      <div>
                        <p className="text-[10px] font-medium text-emerald-500/80">you are owed</p>
                        <p className="text-sm font-bold text-emerald-500">{currency.format(group.balance)}</p>
                      </div>
                    ) : group.balance < 0 ? (
                      <div>
                        <p className="text-[10px] font-medium text-orange-500/80">you owe</p>
                        <p className="text-sm font-bold text-orange-500">{currency.format(Math.abs(group.balance))}</p>
                      </div>
                    ) : (
                      <p className="text-xs font-semibold text-muted-foreground">settled up</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>

      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/95 transition-all active:scale-95 hover:scale-105 z-40"
        title="Create new group"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Bottom Sheet Modal Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300 pointer-events-none opacity-0",
          isModalOpen && "pointer-events-auto opacity-100"
        )}
        onClick={() => setIsModalOpen(false)}
      />

      {/* Slide-up Bottom Sheet */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 max-h-[85vh] bg-card rounded-t-2xl border-t border-border shadow-2xl p-6 z-[110] transform transition-transform duration-300 ease-out overflow-y-auto pb-12",
          isModalOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Drag handle decoration */}
        <div className="mx-auto w-12 h-1.5 rounded-full bg-muted mb-4 cursor-pointer" onClick={() => setIsModalOpen(false)} />

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">Create a new group</h2>
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => setIsModalOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleCreateGroup} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="groupName" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Group Name *
            </label>
            <Input
              id="groupName"
              placeholder="e.g. Goa Trip, Flatmates"
              required
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="rounded-xl border-border bg-muted/30 focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="groupDesc" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Description / Notes
            </label>
            <Input
              id="groupDesc"
              placeholder="e.g. Rent splitting, travel bills"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              className="rounded-xl border-border bg-muted/30 focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Group Members (Emails)
              </label>
              <button
                type="button"
                onClick={handleAddEmailField}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5"
              >
                <Plus className="h-3.5 w-3.5" /> Add Friend
              </button>
            </div>
            
            <div className="space-y-2">
              {/* Always include 'You' read-only indicator */}
              <div className="flex items-center gap-2">
                <Input
                  disabled
                  value="You (Group Creator)"
                  className="rounded-xl border-border bg-muted/50 text-muted-foreground cursor-not-allowed"
                />
              </div>

              {memberEmails.map((email, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    type="email"
                    placeholder="friend@example.com"
                    value={email}
                    onChange={(e) => handleEmailChange(idx, e.target.value)}
                    className="rounded-xl border-border bg-muted/30 focus-visible:ring-primary flex-1"
                  />
                  {memberEmails.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="rounded-xl h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={() => handleRemoveEmailField(idx)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full rounded-xl py-6 font-semibold shadow-md">
              Create Group
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}