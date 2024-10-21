export const fetchFromBackend = async (
  endpoint: string,
  method: string = 'GET',
  body: any = null
) => {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
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
    return null;
  }
};

export const fetchFromBackendWithAuth = async (
  endpoint: string,
  method: string = 'GET',
  token: string,
  body: any = null
) => {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${window.origin}/api/${endpoint}`, options);
    const responseText = await response.text();
    console.log(`Response from ${endpoint}:`, responseText);

    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
    }

    return responseText ? JSON.parse(responseText) : { success: true };
  } catch (error) {
    console.error(`Ошибка при выполнении запроса к ${endpoint}:`, error);
    return null;
  }
};



export const addChild = async (
  token: string,
  firstname: string,
  lastname: string,
  kindergartenId: string,
  groupId: string
) => {
  const body = {
    firstname,
    lastname,
    kindergartenId,
    groupId,
  };
  return await fetchFromBackendWithAuth('admin/children', 'POST', token, body);
};

export const getKindergartens = async (token: string) => {
  return await fetchFromBackendWithAuth('admin/kindergartens', 'GET', token);
};

export const getGroupsByKindergarten = async (token: string, kindergartenId: string) => {
  return await fetchFromBackendWithAuth(`admin/kindergartens/${kindergartenId}/groups`, 'GET', token);
};

export const getChildrenByGroup = async (token: string, groupId: string) => {
  return await fetchFromBackendWithAuth(`admin/groups/${groupId}/children`, 'GET', token);
};
