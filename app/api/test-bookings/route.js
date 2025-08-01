export async function GET() {
  const url = 'http://ec2-3-68-193-86.eu-central-1.compute.amazonaws.com:3003/api/v1/bookings/company?page=1&limit=10';
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiMWQ4ZTcxYy02YjEzLTRiNzYtODg0Yi1lMGRlODk5NTQwZmUiLCJwaG9uZSI6Iis5NjQ3NzEyMzQ1MzMzIiwiZW1haWwiOiJhZG1pbjI1MGZkZjlAZXhhbXBsZS5jb20iLCJuYW1lIjoiQWRtaW4gVXNlciIsImNvbXBhbnlJZCI6IjI1MGZkZjliLTk4NWEtNGY2MC05N2NlLTgyNjFiOGQ5ZmI3MSIsInJvbGUiOiJjb21wYW55X2FkbWluIiwic3RhdHVzIjoiYWN0aXZlIiwiaWF0IjoxNzUyOTcxOTA5LCJleHAiOjE3NTM1NzY3MDksImF1ZCI6ImhvbWUtc2VydmljZXMtdXNlcnMiLCJpc3MiOiJob21lLXNlcnZpY2VzLXBsYXRmb3JtIn0.612S-WHGAlSZSNtCjMmYYaE1rUynK7XIK1hAzGVv0AY';

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'accept': '*/*',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return Response.json({ error: `HTTP error: ${response.status}` }, { status: response.status });
  }

  const data = await response.json();
  return Response.json(data);
}
