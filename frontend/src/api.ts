export const fetchFromBackend = async (
  endpoint: string,
  method: string = "GET",
  body: any = null
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
    return null;
  }
};
