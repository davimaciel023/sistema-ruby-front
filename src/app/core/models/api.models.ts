export interface MemberBrief {
  id: number;
  name: string;
  role: string;
  avatar_color: string;
}

export interface Member extends MemberBrief {
  email: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface TaskComment {
  id: number;
  text: string;
  created_at: string;
  author: MemberBrief;
}

export interface BandTask {
  id: number;
  title: string;
  description: string;
  due_at: string;
  priority: TaskPriority;
  status: TaskStatus;
  category: string;
  created_at: string;
  completed_at: string | null;
  assignee: MemberBrief;
  creator: MemberBrief;
  comments: TaskComment[];
}

export type EventType = 'show' | 'rehearsal' | 'reminder' | 'fixed';
export type Recurrence = 'none' | 'weekly' | 'biweekly' | 'monthly';
export type PaymentStatus = 'pending' | 'received';

export interface Payout {
  id: number;
  member: MemberBrief;
  amount: number;
  received: boolean;
  received_at: string | null;
}

export interface PayoutInput {
  member_id: number;
  amount: number;
}

export interface EventCost {
  id: number;
  description: string;
  amount: number;
  paid: boolean;
  paid_at: string | null;
}

export interface EventCostInput {
  description: string;
  amount: number;
}

export interface BandEvent {
  id: number;
  type: EventType;
  title: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  location: string;
  recurrence: Recurrence;
  notes: string;
  contractor: string;
  contractor_contact: string;
  fee: number | null;
  payment_status: PaymentStatus | null;
  payouts: Payout[];
  costs: EventCost[];
}

export type EntryType = 'income' | 'expense';

export interface FinanceEntry {
  id: number;
  type: EntryType;
  category: string;
  description: string;
  amount: number;
  date: string;
  event_id: number | null;
  created_by: MemberBrief;
}

export interface FinanceSummary {
  total_income: number;
  total_expense: number;
  balance: number;
  pending_fees: number;
  pending_payouts: number;
  pending_costs: number;
}

export type TimeLogCategory = 'work' | 'study';

export interface TimeLog {
  id: number;
  date: string;
  check_in: string;
  check_out: string | null;
  category: TimeLogCategory;
  description: string;
  duration_minutes: number | null;
  member: MemberBrief;
}

export interface DaySummary {
  date: string;
  total_minutes: number;
  goal_minutes: number;
  goal_met: boolean;
}

export interface MemberHoursReport {
  member: MemberBrief;
  days: DaySummary[];
  total_minutes: number;
}

export type MaterialType = 'link' | 'pdf' | 'video' | 'chord_chart';
export type MaterialStatus = 'to_study' | 'studying' | 'mastered';

export interface StudyMaterial {
  id: number;
  title: string;
  type: MaterialType;
  url: string;
  notes: string;
  status: MaterialStatus;
  created_at: string;
  owner: MemberBrief | null;
}

export type Platform = 'instagram' | 'tiktok' | 'youtube' | 'other';
export type PostStatus = 'idea' | 'producing' | 'scheduled' | 'posted';
export type VideoIdeaStatus = 'idea' | 'producing' | 'posted';

export interface ContentPost {
  id: number;
  platform: Platform;
  planned_date: string;
  theme: string;
  status: PostStatus;
  link: string;
  created_at: string;
  responsible: MemberBrief;
}

export interface AiIdea {
  title: string;
  format: string;
  hook: string;
  description: string;
  caption: string;
  hashtags: string[];
  best_time: string;
  why_it_works: string;
}

export interface VideoIdea {
  id: number;
  title: string;
  description: string;
  status: VideoIdeaStatus;
  created_at: string;
  responsible: MemberBrief | null;
}

export interface Song {
  id: number;
  title: string;
  original_artist: string;
  key: string;
  duration_seconds: number;
  bpm: number | null;
  lyrics: string;
  chords: string;
  notes: string;
  created_at: string;
}

export interface RepertoireItem {
  id: number;
  position: number;
  performed_key: string | null;
  song: Song;
}

export interface Repertoire {
  id: number;
  name: string;
  event_id: number | null;
  date: string | null;
  gap_seconds: number;
  notes: string;
  created_at: string;
  items: RepertoireItem[];
  total_seconds: number;
}

export type AlertLevel = 'overdue' | 'urgent' | 'warning';

export interface TaskAlert {
  task: BandTask;
  level: AlertLevel;
}

export interface Dashboard {
  alerts: TaskAlert[];
  my_pending_tasks: BandTask[];
  upcoming_events: BandEvent[];
}
