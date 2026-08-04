"use client";

import { useState, useEffect } from "react";
import { Plus, Sun, Moon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Group, ApiResponse } from "@/utils/Types";
import { GroupList } from "@/components/custom/GroupList";
import { CreateGroupBottomSheet } from "@/components/custom/CreateGroupBottomSheet";
import { useApi } from "@/hooks/useApi";
import { API } from "@/utils/Api";
import { getToken } from "@/utils/Helper";


interface ApiGroup {
  groupId: number;
  name: string;
  adminId: number;
  description: string | null;
  isActive: string;
  createdDate: string;
  modifiedDate: string;
  memberCount: number;
  memberDetails: Array<{ email: string; name: string; userId: number }>;
}

export default function GroupsPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [groups, setGroups] = useState<Group[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const createGroupApi = useApi<ApiResponse<ApiGroup>>(API.createGroup);
  const myGroupsApi = useApi<ApiResponse<ApiGroup[]>>(API.myGroups);

  const mapApiGroupToGroup = (g: ApiGroup): Group => ({
    id: g.groupId.toString(),
    name: g.name,
    description: g.description || "",
    members: g.memberDetails.map((m) => ({
      name: m.name,
      email: m.email,
      userId: m.userId.toString()
    })),
    balance: 0 // "i will add the amount later"
  });

  useEffect(() => {
    const currentTheme = (document.documentElement.getAttribute("data-theme") || "light") as "light" | "dark";
    setTheme(currentTheme);

    const fetchGroups = async () => {
      try {
        const token = getToken();
        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        const res = await myGroupsApi.execute({
          method: "GET",
          headers
        });
        if (res && res.status === "SUCCESS") {
          setGroups(res.data.map(mapApiGroupToGroup));
        }
      } catch (err) {
        console.error("Failed to fetch groups:", err);
      }
    };
    fetchGroups();
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  const handleCreateGroup = async (name: string, description: string, userIds: string[]) => {
    try {
      const token = getToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await createGroupApi.execute({
        method: "POST",
        headers,
        body: {
          name,
          description,
          requestUsersToAdd: userIds
        }
      });

      if (res && res.status === "SUCCESS") {
        setGroups((prev) => [mapApiGroupToGroup(res.data), ...prev]);
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error("Failed to create group:", err);
    }
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
          {myGroupsApi.loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-2">
              <span className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-xs text-muted-foreground">Loading groups...</p>
            </div>
          ) : (
            <GroupList
              groups={groups}
              onGroupClick={(group) => router.push(`/groups/${group.id}`)}
            />
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

      {/* Slide-up Create Group Bottom Sheet */}
      <CreateGroupBottomSheet
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateGroup={handleCreateGroup}
        isLoading={createGroupApi.loading}
      />
    </main>
  );
}