export type Friend = "You" | "Aarav" | "Meera";
export type TabId = "expenses" | "groups" | "add" | "debts" | "profile";

export type ApiResponse<T> = {
  status: string;
  message: string;
  error: string;
  timeStamp: Date;
  data: T;
}

export type FilteredSearchUser = {
  name: string;
  email: string;
  id: string;
}

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

export interface ExpenseSplit {
  member: string;
  amount: number;
  status: "pending" | "paid" | "approved" | "rejected";
}

export interface ExpenseItem {
  id: string;
  title: string;
  description?: string;
  amount: number;
  paidBy: string;
  date: string;
  splits: ExpenseSplit[];
  isCustomSplit?: boolean;
}

export interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
}


