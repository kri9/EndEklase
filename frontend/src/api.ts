import { store } from "./redux/store";

const BASE_URL =
  (typeof window !== 'undefined' && (window as any).APP_API_BASE_URL) ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) ||
  `${window.location.origin}/api`;

async function parseOkResponse(res: Response) {
  if (res.status === 204) return { ok: true };
  const text = await res.text().catch(() => '');
  if (!text) return { ok: true };
  try {
    return JSON.parse(text);
  } catch {
    return { ok: true, text };
  }
}


export async function fetchFromBackend(
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any,
  extraInit?: RequestInit
) {
  const init: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json', ...(extraInit?.headers || {}) },
    ...(body !== undefined ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}),
    ...extraInit,
  };

  const res = await fetch(`${BASE_URL}/${path}`, init);

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}${errText ? `: ${errText}` : ''}`);
  }

  return parseOkResponse(res);
}


export function getRequest<T>(endpoint: string): Promise<T> {
  const token = store.getState().auth.token;
  return fetchFromBackendWithAuth(endpoint, "GET", token);
}

export function postRequest<T>(endpoint: string, body: any): Promise<T> {
  const token = store.getState().auth.token;
  return fetchFromBackendWithAuth(endpoint, "POST", token, body);
}

export function filePostRequest<T>(endpoint: string, body: any): Promise<T> {
  const token = store.getState().auth.token;
  return fetchFromBackendWithAuth(endpoint, "POST", token, body, {
    Authorization: `Bearer ${token}`,
  });
}

export function putRequest<T>(endpoint: string, body: any): Promise<T> {
  const token = store.getState().auth.token;
  return fetchFromBackendWithAuth(endpoint, "PUT", token, body);
}

export function deleteRequest<T>(endpoint: string, body: any): Promise<T> {
  const token = store.getState().auth.token;
  return fetchFromBackendWithAuth(endpoint, "DELETE", token, body);
}

export const fetchFromBackendWithAuth = async (
  endpoint: string,
  method: string = 'GET',
  token: string | null,
  body: any = null,
  headers?: Record<string, string>,
) => {
  headers = headers || {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
  const options: RequestInit = { method, headers };

  if (body && headers['Content-Type'] === 'application/json') {
    options.body = JSON.stringify(body);
  } else if (body) {
    options.body = body;
  }

  const url = `${window.origin}/api/${endpoint}`; 
  const response = await fetch(url, options);

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Ошибка: ${response.status} ${response.statusText}${errText ? ` - ${errText}` : ''}`);
  }

  if (response.headers.get('Content-Disposition')?.includes('filename')) {
    return response.blob();
  }

  return parseOkResponse(response);
};

export const addChild = async (
  firstname: string,
  lastname: string,
  kindergartenId: string,
  groupId: string,
  userId: number,
) => {
  const token = store.getState().auth.token;
  const body = {
    firstname,
    lastname,
    kindergartenId,
    groupId,
    userId,
  };
  return await fetchFromBackendWithAuth("admin/children", "POST", token, body);
};

export const deleteChildren = async (childIds: number[]) => {
  const token = store.getState().auth.token;
  return await fetchFromBackendWithAuth(
    "admin/children",
    "DELETE",
    token,
    childIds,
  );
};

export const getKindergartens = async () => {
  const token = store.getState().auth.token;
  return await fetchFromBackendWithAuth("admin/kindergartens", "GET", token);
};

export const getGroupsByKindergarten = async (kindergartenId: string) => {
  const token = store.getState().auth.token;
  return await fetchFromBackendWithAuth(
    `admin/kindergartens/${kindergartenId}/groups`,
    "GET",
    token,
  );
};

export const getChildrenByGroup = async (groupId: string) => {
  return await fetchFromBackendWithAuth(
    `admin/groups/${groupId}/children`,
    "GET",
    store.getState().auth.token,
  );
};

export const addLesson = async (lesson: {
  topic: string;
  date: string;
  notes?: string;
  groupId: string;
}) => {
  const token = store.getState().auth.token;
  const body = {
    topic: lesson.topic,
    date: lesson.date,
    notes: lesson.notes,
    groupId: lesson.groupId,
  };
  return await fetchFromBackendWithAuth("admin/lesson", "POST", token, body);
};

export const getLessonsByGroup = async (groupId: string) => {
  const token = store.getState().auth.token;
  return await fetchFromBackendWithAuth(
    `admin/groups/${groupId}/lessons`,
    "GET",
    token,
  );
};

export const getLessonsByUser = async (userId: number) => {
  const token = store.getState().auth.token;
  return await fetchFromBackendWithAuth(
    `admin/user/${userId}/lessons`,
    "GET",
    token,
  );
};

export const getLessons = async () => {
  const token = store.getState().auth.token;
  return await fetchFromBackendWithAuth(
    "admin/lessons",
    "GET",
    token as string,
  );
};

export const updateAttendance = async (
  childId: string,
  lessonId: string,
  attended: boolean,
) => {
  const token = store.getState().auth.token;
  const body = {
    childId,
    lessonId,
    attended,
  };
  return await fetchFromBackendWithAuth(
    "admin/attendances",
    "PUT",
    token,
    body,
  );
};

export const getAttendanceByGroup = async (groupId: string) => {
  const token = store.getState().auth.token;
  return await fetchFromBackendWithAuth(
    `admin/groups/${groupId}/attendances`,
    "GET",
    token,
  );
};

export const getAttendanceByGroupAndMonth = async (
  groupId: string,
  month: string,
) => {
  const token = store.getState().auth.token;
  return await fetchFromBackendWithAuth(
    `admin/groups/${groupId}/attendances/${month}`,
    "GET",
    token,
  );
};

export const deleteInvoice = async (invoiceId: number) => {
  const token = store.getState().auth.token;
  return await fetchFromBackendWithAuth(
    `admin/invoice/${invoiceId}`,
    "DELETE",
    token,
  );
};

export const updateChildren = async (children: any) => {
  const token = store.getState().auth.token;
  return fetchFromBackendWithAuth("admin/children", "PATCH", token, children);
};

export const generateInvoices = async (data: {
  startDate: string;
  endDate: string;
}) => {
  const token = store.getState().auth.token;
  return await fetchFromBackendWithAuth("admin/invoices", "POST", token, data);
};

export const getInvoicesByUser = async () => {
  const token = store.getState().auth.token;
  return await fetchFromBackendWithAuth("user/invoices", "GET", token);
};

export const getAttendanceByUser = async () => {
  const token = store.getState().auth.token;
  return await fetchFromBackendWithAuth("user/attendances", "GET", token);
};

export const requestPasswordReset = async (email: string) => {
  return fetchFromBackend(`password/request?email=${encodeURIComponent(email)}`, 'POST');
};

export const resetPassword = async (token: string, password: string) => {
  return fetchFromBackend(
    `password/reset?token=${encodeURIComponent(token)}&password=${encodeURIComponent(password)}`,
    'POST'
  );
};
