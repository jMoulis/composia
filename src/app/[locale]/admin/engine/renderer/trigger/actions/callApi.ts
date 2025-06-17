import { interpolateParams } from "../interpolateParams";

export async function callApi(params: any) {
  const { url, method = 'GET', headers = {}, body } = params;
  if (!url) {
    console.warn('No URL provided for API call');
    return { success: false, error: 'No URL provided' };
  }
  const resolvedUrl = interpolateParams(url, params);
  const resolvedBody = body ? interpolateParams(body, params) : undefined;
  const resolvedHeaders = headers
    ? interpolateParams(headers, params)
    : undefined;

  try {
    const response = await fetch(resolvedUrl, {
      method,
      headers: resolvedHeaders,
      body: resolvedBody ? JSON.stringify(resolvedBody) : undefined
    });
    if (!response.ok) {
      console.warn(`[callApi] API error ${response.status}: ${resolvedUrl}`);
      throw new Error(
        `API call failed with status ${response.status}: ${response.statusText}`
      );
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(
      `API call failed: ${error instanceof Error ? error.message : String(error)
      }`
    );
  }
}