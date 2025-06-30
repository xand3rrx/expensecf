export interface Expense {
  id: string;
  amount: number;
  description: string;
  paidBy: string;
  date: string;
  category: string;
}

export interface CoupleGroup {
  id: string;
  name: string;
  members: string[];
  expenses: Expense[];
}

export interface User {
  username: string;
  groupId: string | null;
} 