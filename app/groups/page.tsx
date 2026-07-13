"use client";

import { useState, useEffect } from "react";
import { Plus, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Group } from "@/utils/Types";
import { GroupList } from "@/components/custom/GroupList";
import { CreateGroupBottomSheet } from "@/components/custom/CreateGroupBottomSheet";

const initialGroups: Group[] = [
  { id: "1", name: "Trip to Goa", description: "Weekend getaway expenses", members: ["You", "Aarav", "Meera"], balance: 2400 },
  { id: "2", name: "Apartment 4B", description: "Rent and monthly groceries", members: ["You", "Aarav"], balance: -1200 },
  { id: "3", name: "Weekly Dinners", description: "Shared food outings", members: ["You", "Meera"], balance: 0 }
];

export default function GroupsPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleCreateGroup = (name: string, description: string, emails: string[]) => {
    const newGroup: Group = {
      id: Date.now().toString(),
      name,
      description,
      members: ["You", ...emails],
      balance: 0 // Default to settled for new groups
    };

    setGroups((prev) => [newGroup, ...prev]);
    setIsModalOpen(false);
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
          <GroupList groups={groups} />
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

      {/* Slide-up Create Group Bottom Sheet */}
      <CreateGroupBottomSheet
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateGroup={handleCreateGroup}
      />
    </main>
  );
}