export type Friend = "You" | "Aarav" | "Meera";
export type TabId = "expenses" | "groups" | "add" | "debts" | "profile";

export type Expense = {
  id: number;
  title: string;
  paidBy: Friend;
  amount: number;
  note: string;
  splitWith: Friend[];
  settledBy: Friend[];
};

export type Balance = {
  from: Friend;
  to: Friend;
  amount: number;
};

export type ExpenseDraft = {
  title: string;
  amount: string;
  note: string;
  splitWith: Friend[];
};

export interface Group {
  id: string;
  name: string;
  description: string;
  members: string[];
  balance: number;
}


