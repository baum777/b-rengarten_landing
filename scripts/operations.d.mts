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
export interface Dashboard {
  open_inquiries: number;
  new_inquiries_today: number;
  open_tasks: number;
  overdue_tasks: number;
  completed_tasks_today: number;
  active_staff: number;
  arrivals: number | null;
  departures: number | null;
  occupancy: number | null;
  inquiries: Array<{ request_id: string; type: string; status: string; created_at: string }>;
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
export function readDashboard(db: Database, actor: string): Promise<Dashboard>;
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
