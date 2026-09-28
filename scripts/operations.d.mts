import type { z } from "zod";
export interface QueryDatabase {
  query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]>;
}
export interface Database extends QueryDatabase {
  transaction<T>(work: (tx: QueryDatabase) => Promise<T>): Promise<T>;
}
export interface Today {
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    priority: string;
    status: string;
    due_at: string | null;
    due_today: boolean;
  }>;
  briefings: Array<{ id: string; title: string; body: string; priority: string; read: boolean }>;
}
export type DashboardRangeId = "heute" | "7tage" | "30tage";

export interface DashboardCounts {
  open_inquiries: number;
  new_inquiries_today: number;
  stale_inquiries: number;
  oldest_new_inquiry_at: string | null;
  open_tasks: number;
  overdue_tasks: number;
  blocked_tasks: number;
  completed_tasks_today: number;
  active_staff: number;
}

export interface OccupancyToday {
  date: string;
  occupancy_rate: number;
  arrivals: number | null;
  departures: number | null;
  rooms_total: number;
  rooms_occupied: number;
  captured_at: string;
  source: string;
}

export interface DashboardSeriesPoint {
  date: string;
  value: number;
}

export interface DashboardInquiryPoint {
  bucket: string;
  ROOM: number;
  TABLE: number;
  OCCASION: number;
}

export interface DashboardRecentInquiry {
  request_id: string;
  type: string;
  status: string;
  created_at: string;
  guest_name: string;
  arrival: string | null;
  departure: string | null;
  guest_count: number;
  room: string | null;
  occasion: string | null;
  task_status: string | null;
  task_assignee: string | null;
}

export interface DashboardActionTask {
  id: string;
  title: string;
  department: string;
  priority: string;
  status: string;
  due_at: string | null;
  overdue: boolean;
  assignee_name: string | null;
}

export interface DashboardResponseBands {
  targetMinutes: number;
  warningMinutes: number;
  criticalMinutes: number;
}

export interface DashboardResponse {
  unanswered: number;
  beyond_target: number;
  beyond_warning: number;
  beyond_critical: number;
  oldest_unanswered_at: string | null;
  bands: DashboardResponseBands;
}

/** Data-quality facts per source; no rows cross the boundary. */
export interface DataHealthFacts {
  records: number;
  lastRecordAt: string | null;
  incomplete: number;
  inconsistent: number;
}

export interface Dashboard {
  generated_at: string;
  today: string;
  range: { id: DashboardRangeId; days: number };
  counts: DashboardCounts;
  occupancy_today: OccupancyToday | null;
  occupancy_series: DashboardSeriesPoint[];
  occupancy_compare: { current_avg: number | null; previous_avg: number | null };
  inquiry_series: {
    granularity: "hour" | "day";
    points: DashboardInquiryPoint[];
  };
  task_series: DashboardSeriesPoint[];
  recent_inquiries: DashboardRecentInquiry[];
  action_tasks: DashboardActionTask[];
  response: DashboardResponse;
  data_health: Record<string, DataHealthFacts>;
}
export interface InquiryTask {
  id: string;
  status: string;
  assignee_id: string | null;
  assignee_name: string | null;
  started: boolean;
}
export interface InquiryRow {
  id: string;
  type: "ROOM" | "TABLE" | "OCCASION";
  guest_name: string;
  email: string;
  phone: string | null;
  arrival: string | null;
  departure: string | null;
  guest_count: number;
  status: string;
  notes: string | null;
  room: string | null;
  occasion: string | null;
  time: string | null;
  created_at: string;
  task: InquiryTask | null;
}
export interface InquiriesPage {
  generated_at: string;
  counts: { total: number; unanswered: number; in_progress: number; other: number };
  unanswered: InquiryRow[];
  in_progress: InquiryRow[];
  other: InquiryRow[];
}
export interface TaskRow {
  id: string;
  title: string;
  description: string;
  department: string;
  priority: "NORMAL" | "IMPORTANT" | "URGENT";
  status: "OPEN" | "IN_PROGRESS" | "BLOCKED";
  assignee_id: string | null;
  assignee_name: string | null;
  due_at: string | null;
  created_at: string;
  source_type: string | null;
  source_id: string | null;
  overdue: boolean;
}
export interface TasksDoneRow {
  id: string;
  title: string;
  department: string;
  priority: "NORMAL" | "IMPORTANT" | "URGENT";
  assignee_name: string | null;
  completed_at: string;
}
export interface TasksPage {
  generated_at: string;
  today: string;
  counts: {
    open: number;
    overdue: number;
    in_progress: number;
    blocked: number;
    done_today: number;
  };
  overdue: TaskRow[];
  open: TaskRow[];
  in_progress: TaskRow[];
  blocked: TaskRow[];
  done_today: TasksDoneRow[];
}
export interface OccupancySnapshotRow {
  date: string;
  occupancy_rate: number;
  arrivals: number | null;
  departures: number | null;
  rooms_total: number;
  rooms_occupied: number;
  rooms_free: number;
  captured_at: string;
  source: string;
}
export interface OccupancyPage {
  generated_at: string;
  today: string;
  today_snapshot: OccupancySnapshotRow | null;
  latest_snapshot: OccupancySnapshotRow | null;
  /** Latest snapshot per Berlin day, ascending, last 30 days. */
  days: OccupancySnapshotRow[];
  compare: { current_avg: number | null; previous_avg: number | null };
}
export const departments: string[];
export const taskInput: z.ZodType;
export const briefingInput: z.ZodType;
export const occupancyInput: z.ZodType;
export function persistInquiry(db: Database, input: unknown): Promise<string>;
export function createTask(db: Database, actor: string, input: unknown): Promise<string>;
export function changeTask(db: Database, actor: string, input: unknown): Promise<void>;
export function publishBriefing(db: Database, actor: string, input: unknown): Promise<string>;
export function acknowledgeBriefing(db: Database, actor: string, id: string): Promise<void>;
export function recordOccupancy(db: Database, actor: string, input: unknown): Promise<string>;
export function readToday(db: Database, actor: string): Promise<Today>;
export function readDashboard(
  db: Database,
  actor: string,
  options?: {
    range?: DashboardRangeId;
    staleInquiryHours?: number;
    responseTargetMinutes?: number;
    responseWarningMinutes?: number;
    responseCriticalMinutes?: number;
  },
): Promise<Dashboard>;
export function readInquiries(db: Database, actor: string): Promise<InquiriesPage>;
export function changeInquiryStatus(db: Database, actor: string, input: unknown): Promise<void>;
export function readTasks(db: Database, actor: string): Promise<TasksPage>;
export function readOccupancy(db: Database, actor: string): Promise<OccupancyPage>;
export function changeStaff(db: Database, actor: string, input: unknown): Promise<void>;

export function event(
  tx: QueryDatabase,
  type: string,
  entityType: string,
  entityId: string,
  actorId: string | null,
  correlationId?: string,
  direction?: string,
): Promise<void>;
