export async function GET(request, { params }) {
  const { bookingId } = params;

  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return Response.json({ error: "Missing Authorization header" }, { status: 401 });
  }
  try {
    const res = await fetch(
      `http://ec2-3-68-193-86.eu-central-1.compute.amazonaws.com:3003/api/v1/bookings/${bookingId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
      }
    );

    const data = await res.json();
    if (!res.ok) {
      return Response.json({ error: data }, { status: res.status });
    }

    return Response.json(data);
  } catch (error) {
    console.error('Error fetching booking:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
