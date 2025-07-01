export interface Expense {
  id: string;
  amount: number;
  description: string;
  paidBy: string;
  date: string;
  category: string;
  type: 'expense' | 'addition';
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

export interface Analytics {
  totalExpenses: number;
  totalAdditions: number;
  netBalance: number;
  expensesByCategory: { [key: string]: number };
  expensesByMember: { [key: string]: number };
  additionsByMember: { [key: string]: number };
  recentTransactions: Expense[];
  monthlyTotals: {
    month: string;
    expenses: number;
    additions: number;
  }[];
} 