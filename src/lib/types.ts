export type Role = "admin" | "player";

export type Profile = {
  id: string;
  name: string;
  phone: string | null;
  role: Role;
  credit_balance: number;
  created_at: string;
};

export type Court = {
  id: string;
  name: string;
  location: string;
  hourly_rate: number;
  created_at: string;
};

export type Session = {
  id: string;
  court_id: string;
  date: string;
  start_time: string;
  end_time: string;
  total_cost: number;
  notes: string | null;
  created_at: string;
};

export type SessionPlayer = {
  id: string;
  session_id: string;
  player_id: string;
  fee: number;
  paid_from_credit: boolean;
  created_at: string;
};

export type CreditTransaction = {
  id: string;
  player_id: string;
  amount: number;
  description: string;
  created_by: string | null;
  created_at: string;
};
