import { FormEvent, ReactNode, useMemo, useState } from "react";
import { PlusCircle, ReceiptText, UserRound, WalletCards } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Friend, Expense, ExpenseDraft, TabId } from "@/utils/Types";

export const friends: Friend[] = ["You", "Aarav", "Meera"];

export const initialExpenses: Expense[] = [
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

export const emptyDraft: ExpenseDraft = {
  title: "",
  amount: "",
  note: "",
  splitWith: friends,
};

export const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const tabs: Array<{ id: TabId; label: string; icon: ReactNode }> = [
  {
    id: "expenses",
    label: "Expenses",
    icon: <ReceiptText className="h-5 w-5" />,
  },
  { id: "add", label: "Add", icon: <PlusCircle className="h-5 w-5" /> },
  { id: "debts", label: "Debts", icon: <WalletCards className="h-5 w-5" /> },
  { id: "profile", label: "Profile", icon: <UserRound className="h-5 w-5" /> },
];