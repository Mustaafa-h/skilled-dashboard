// app/api/bookings/[bookingId]/payment-status/route.js

export async function PUT(request, { params }) {
  const { bookingId } = params;

  if (!bookingId) {
    return Response.json({ error: "Missing booking ID" }, { status: 400 });
  }

  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlODFkNDE2NS03NzM2LTRmN2EtOTUzYy02NWZmMTA3YTRjOTkiLCJwaG9uZSI6Iis5NjQ3NzE1NTQ1Njc4IiwiZW1haWwiOiJhZG1pbnp6QGV4YW1wbGUuY29tIiwibmFtZSI6IkFkbWluIiwiY29tcGFueUlkIjoiMzY0YjUzYzgtMDA4NC00ODEwLTkwMmUtOGRjMGQxM2NkM2I3Iiwicm9sZSI6ImNvbXBhbnlfYWRtaW4iLCJzdGF0dXMiOiJhY3RpdmUiLCJpYXQiOjE3NTM4MjMxNjEsImV4cCI6MTc1NDQyNzk2MSwiYXVkIjoiaG9tZS1zZXJ2aWNlcy11c2VycyIsImlzcyI6ImhvbWUtc2VydmljZXMtcGxhdGZvcm0ifQ.joEce7y7eZJb5x94_OKw9xEKirVROf579NccGubXgZI';

  const body = await request.json();

  const url = `http://ec2-3-68-193-86.eu-central-1.compute.amazonaws.com:3003/api/v1/bookings/${bookingId}/payment-status`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Accept: "*/*",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    return Response.json({ error: `HTTP error! status: ${response.status}` }, { status: response.status });
  }

  const data = await response.json();
  return Response.json(data);
}
