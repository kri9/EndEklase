import { store } from "./redux/store";

export const fetchFromBackend = async (
  endpoint: string,
  method: string = "GET",
  body: any = null,
) => {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${window.origin}/api/${endpoint}`, options);
    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Ошибка при выполнении запроса к ${endpoint}:`, error);
    throw new Error(`Ошибка при выполнении запроса к ${endpoint}: ${error} zz`);
  }
};

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
  method: string = "GET",
  token: string | null,
  body: any = null,
  headers?: any,
) => {
  headers = headers || {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
  const options: RequestInit = {
    method,
    headers,
  };

  if (body && headers["Content-Type"] === "application/json") {
    options.body = JSON.stringify(body);
  } else {
    options.body = body;
  }

  try {
    const response = await fetch(`${window.origin}/api/${endpoint}`, options);

    if (!response.ok) {
      throw new Error(
        `Ошибка: ${response.status} ${response.statusText} - ${response.text()}`,
      );
    }
    if (response.headers.get("Content-Disposition")?.includes("filename")) {
      console.log("Blob response received");
      return response.blob();
    }
    const responseText = await response.text();
    //console.debug(`Response from ${endpoint}:`, responseText);
    return responseText ? JSON.parse(responseText) : { success: true };
  } catch (error) {
    console.error(`Ошибка при выполнении запроса к ${endpoint}:`, error);
    throw new Error(`Ошибка при выполнении запроса к ${endpoint}: ${error}`);
  }
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
  return await fetchFromBackend(
    `password/request?email=${encodeURIComponent(email)}`,
    "POST",
  );
};

export const resetPassword = async (token: string, password: string) => {
  return await fetchFromBackend(
    `password/reset?token=${token}&password=${password}`,
    "POST",
  );
};
