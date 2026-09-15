export type Mood = 1 | 2 | 3 | 4;
export type ItemValue = 0 | 1 | 2 | 3 | null;
export type SkillLevel = "INDEPENDENT" | "WITH_REMINDER" | "WITH_HELP" | "NOT_YET" | "NO_CHANCE_TO_OBSERVE";

export interface EnrollmentResponse {
  schoolName: string | null;
  startDate: string;
  groupName: string | null;
  hadPreviousSchool: string | null;
  dailyHours: string | null;
  focusAreas: string[];
  adaptationStartedOn: string | null;
}
export interface Child {
  id: string;
  nickname: string;
  birthDate: string;
  ageMonths: number;
  schoolDay: number | null;
  enrollment: EnrollmentResponse | null;
}
export interface Question { code: string; text: string; areaCode: string; optionLabels: string[]; }
export interface CheckIn {
  date: string;
  overallMood: Mood | null;
  items: Record<string, ItemValue>;
  note: string | null;
  source: "PARENT" | "TEACHER";
}
export interface TodayForm {
  date: string;
  schoolDay: number;
  phase: 1 | 2 | 3 | 4;
  inAdaptationProgram: boolean;
  questions: Question[];
  existing: CheckIn | null;
}
export interface Finding { kind: string; text: string; }
export interface AreaScore { areaCode: string; average: number; observationCount: number; }
export interface Trends {
  windowDays: number;
  findings: Finding[];
  buckets: { strong: AreaScore[]; emerging: AreaScore[]; supportable: AreaScore[] };
  referralHint: string | null;
}
export interface DevelopmentArea { code: string; name: string; }
export interface Skill { id: string; code: string; text: string; areaCode: string; }
export interface Activity {
  code: string; title: string; areaCode: string; goal: string;
  materials: string[]; durationMinutes: number; steps: string[]; parentTips: string[];
}
export interface TeacherCode { id: string; code: string; url: string; expiresAt: string; }

const BASE = import.meta.env.VITE_API_URL ?? "/api/v1";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

let accessToken: string | null = localStorage.getItem("kh_access");
let refreshToken: string | null = localStorage.getItem("kh_refresh");

export function getTokens() {
  return { accessToken, refreshToken };
}
export function setTokens(tokens: { accessToken: string; refreshToken: string } | null) {
  accessToken = tokens?.accessToken ?? null;
  refreshToken = tokens?.refreshToken ?? null;
  if (tokens) {
    localStorage.setItem("kh_access", tokens.accessToken);
    localStorage.setItem("kh_refresh", tokens.refreshToken);
  } else {
    localStorage.removeItem("kh_access");
    localStorage.removeItem("kh_refresh");
  }
}

async function raw<T>(path: string, init: RequestInit = {}, withAuth = true): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };
  if (withAuth && accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  if (res.status === 204) return undefined as T;
  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = body.message ?? message;
    } catch {
      /* ignore non-json error body */
    }
    throw new ApiError(res.status, message);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  try {
    return await raw<T>(path, init, true);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401 && refreshToken) {
      try {
        const tokens = await raw<{ accessToken: string; refreshToken: string }>(
          "/auth/refresh",
          { method: "POST", body: JSON.stringify({ refreshToken }) },
          false
        );
        setTokens(tokens);
        return await raw<T>(path, init, true);
      } catch {
        setTokens(null);
        throw err;
      }
    }
    throw err;
  }
}

export const api = {
  register: (email: string, password: string, displayName: string) =>
    call<{ accessToken: string; refreshToken: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, displayName }),
    }),
  login: (email: string, password: string) =>
    call<{ accessToken: string; refreshToken: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => call<{ id: string; email: string; displayName: string }>("/me"),
  deleteAccount: () => call<void>("/me", { method: "DELETE" }),

  children: () => call<Child[]>("/children"),
  createChild: (body: { nickname: string; birthDate: string; usesRealName: boolean }) =>
    call<Child>("/children", { method: "POST", body: JSON.stringify(body) }),
  child: (childId: string) => call<Child>(`/children/${childId}`),
  deleteChild: (childId: string) => call<void>(`/children/${childId}`, { method: "DELETE" }),
  saveEnrollment: (
    childId: string,
    body: {
      schoolName?: string; startDate: string; groupName?: string;
      hadPreviousSchool?: string; dailyHours?: string; focusAreas?: string[];
    }
  ) => call<EnrollmentResponse>(`/children/${childId}/enrollment`, { method: "POST", body: JSON.stringify(body) }),

  todayForm: (childId: string) => call<TodayForm>(`/children/${childId}/checkins/today`),
  saveCheckIn: (
    childId: string,
    body: { date: string; overallMood?: Mood; items?: Record<string, ItemValue>; note?: string }
  ) => call<CheckIn>(`/children/${childId}/checkins`, { method: "POST", body: JSON.stringify(body) }),
  history: (childId: string, from?: string, to?: string) => {
    const qs = new URLSearchParams();
    if (from) qs.set("from", from);
    if (to) qs.set("to", to);
    const suffix = qs.toString() ? `?${qs}` : "";
    return call<CheckIn[]>(`/children/${childId}/checkins${suffix}`);
  },

  trends: (childId: string, windowDays: 7 | 30 | 90 = 7) =>
    call<Trends>(`/children/${childId}/trends?window=${windowDays}`),
  comparison: (childId: string) =>
    call<{ items: unknown[]; note: string }>(`/children/${childId}/comparison`),

  developmentAreas: () => call<DevelopmentArea[]>("/development/areas"),
  skills: (childId: string) => call<Skill[]>(`/children/${childId}/development/skills`),
  observeSkill: (childId: string, body: { skillId: string; level: SkillLevel; observedOn?: string; note?: string }) =>
    call<{ status: string }>(`/children/${childId}/development/observations`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  developmentSummary: (childId: string) =>
    call<{ areas: Record<string, { average: number; observationCount: number }>; disclaimer: string }>(
      `/children/${childId}/development/summary`
    ),

  activities: (ageMonths: number, areaCode?: string) => {
    const qs = new URLSearchParams({ ageMonths: String(ageMonths) });
    if (areaCode) qs.set("areaCode", areaCode);
    return call<Activity[]>(`/activities?${qs}`);
  },
  suggestedActivities: (childId: string) => call<Activity[]>(`/children/${childId}/activities/suggested`),

  generateMonthlyReport: (childId: string) =>
    call<Record<string, unknown>>(`/children/${childId}/reports/monthly/generate`, { method: "POST" }),
  monthlyReports: (childId: string) =>
    call<{ periodStart: string; periodEnd: string; payload: Record<string, unknown> }[]>(
      `/children/${childId}/reports/monthly`
    ),
  exportData: (childId: string) => call<Record<string, unknown>>(`/children/${childId}/export`),

  createTeacherCode: (childId: string) =>
    call<TeacherCode>(`/children/${childId}/teacher-codes`, { method: "POST" }),
  revokeTeacherCode: (childId: string, codeId: string) =>
    call<void>(`/children/${childId}/teacher-codes/${codeId}`, { method: "DELETE" }),
};

export interface TeacherSession { childNickname: string; expiresAt: string }

export const teacherApi = {
  session: (codeId: string, code: string) =>
    raw<TeacherSession>(`/teacher/session?codeId=${encodeURIComponent(codeId)}`, { headers: { "X-Access-Code": code } }, false),
  submit: (
    codeId: string,
    code: string,
    body: { teacherAlias?: string; observedOn?: string; items?: Record<string, ItemValue>; note?: string }
  ) =>
    raw<{ status: string; observedOn: string }>(`/teacher/observations?codeId=${encodeURIComponent(codeId)}`, {
      method: "POST",
      headers: { "X-Access-Code": code },
      body: JSON.stringify(body),
    }, false),
};
