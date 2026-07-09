"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DetailItem } from "@/components/custom/DetailItem";
import { currency, friends } from "@/utils/Constants";
import { Expense } from "@/utils/Types";
import { Sun, Moon } from "lucide-react";

export default function ProfileTab({
  theme,
  toggleTheme,
  expenses,
  myOpenContribution,
  receivableToMe,
  totalSpentByMe,
}: {
  theme: "light" | "dark";
  toggleTheme: () => void;
  expenses: Expense[];
  myOpenContribution: number;
  receivableToMe: number;
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
            <DetailItem
              label="I owe"
              value={currency.format(myOpenContribution)}
            />
            <DetailItem
              label="Owed to me"
              value={currency.format(receivableToMe)}
            />
            <DetailItem
              label="I spent"
              value={currency.format(totalSpentByMe)}
            />
            <DetailItem label="Friends" value={String(friends.length)} />
          </div>

          <Button
            className="w-full"
            variant="outline"
            onClick={toggleTheme}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            {theme === "dark" ? "Light mode" : "Dark mode"}
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
