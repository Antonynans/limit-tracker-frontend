export interface CategoryLimit {
  id: string;
  category: string;
  limit: number;
  createdAt: string;
}

export interface Activity {
  id: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  description: string;
  date: string;
}

export interface LimitSummary {
  limitId: string;
  category: string;
  limit: number;
  spent: number;
  percentage: number;
  status: 'On Track' | 'Warning' | 'Exceeded';
}

export interface LimitPayload {
  category: string;
  limit: number;
}

export interface ActivityPayload {
  categoryId: string;
  amount: number;
  description: string;
}
