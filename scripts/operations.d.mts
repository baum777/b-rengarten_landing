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
