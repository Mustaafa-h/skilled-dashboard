// app/api/bookings/[id]/assign-worker/route.js

export async function PUT(request, { params }) {
    const { bookingId } = params;


  console.log(bookingId)

  const authHeader = request.headers.get("authorization");

    if (!authHeader) {
    return Response.json({ error: "Missing Authorization header" }, { status: 401 });
  }

  const baseUrl = 'http://ec2-3-68-193-86.eu-central-1.compute.amazonaws.com:3003';

  const body = await request.json();

  const url = `${baseUrl}/api/v1/bookings/${bookingId}/assign-worker`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'accept': '*/*',
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    console.log("id===",bookingId)
  return Response.json(
    { error: `HTTP error! ${bookingId} ${response.status}` },
    { status: response.status }
  );
}

  const data = await response.json();
  return Response.json(data);
}
