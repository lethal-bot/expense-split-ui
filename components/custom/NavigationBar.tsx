"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { tabs } from "@/utils/Constants";
import { TabId } from "@/utils/Types";
import { Suspense } from "react";

function NavigationBarContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Determine active tab based on route and query param
  let activeTab: TabId = "expenses";
  if (pathname === "/add") {
    activeTab = "add";
  } else if (pathname === "/debts") {
    activeTab = "debts";
  } else if (pathname === "/profile") {
    activeTab = "profile";
  } else if (pathname === "/") {
    const tabQuery = searchParams.get("tab") as TabId;
    if (tabQuery && ["expenses"].includes(tabQuery)) {
      activeTab = tabQuery;
    }
  }

  const handleTabClick = (tabId: TabId) => {
    if (tabId === "add") {
      router.push("/add");
    } else if (tabId === "debts") {
      router.push("/debts");
    } else if (tabId === "profile") {
      router.push("/profile");
    } else if (tabId === "expenses") {
      router.push("/");
    } else {
      router.push(`/?tab=${tabId}`);
    }
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 border-t bg-card/95 px-3 py-2 text-card-foreground backdrop-blur z-50">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1 sm:max-w-2xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={cn(
              "flex min-h-14 flex-col items-center justify-center gap-1 rounded-md px-1 text-xs font-medium text-muted-foreground transition-colors",
              activeTab === tab.id && "bg-primary text-primary-foreground",
            )}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

export default function NavigationBar() {
  return (
    <Suspense fallback={
      <nav className="fixed inset-x-0 bottom-0 border-t bg-card/95 px-3 py-2 text-card-foreground backdrop-blur z-50">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-1 sm:max-w-2xl min-h-14"></div>
      </nav>
    }>
      <NavigationBarContent />
    </Suspense>
  );
}
