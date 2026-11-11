export async function api(endpoint, data) {
  const token = document.cookie.split('; ').find((cookie) => cookie.startsWith('csrftoken='))?.split('=')[1];
  const options = data === undefined ? {} : {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': token || '' },
    body: JSON.stringify(data),
  };
  const response = await fetch('/djangoapp/' + endpoint, options);
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Request failed.');
  return result;
}
