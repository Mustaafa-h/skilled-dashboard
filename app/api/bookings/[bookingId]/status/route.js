export async function PUT(request, { params }) {
  const { bookingId } = params;
  const body = await request.json();

  console.log("Booking ID:", bookingId);
  console.log("Body:", body);

  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return Response.json({ error: "Missing Authorization header" }, { status: 401 });
  }

  const res = await fetch(`http://ec2-3-68-193-86.eu-central-1.compute.amazonaws.com:3003/api/v1/bookings/${bookingId}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "*/*",
      Authorization: authHeader,
    },
    body: JSON.stringify(body),
  });

  const resData = await res.json();
  console.log("Backend response:", resData);

  if (!res.ok) {
    return Response.json({ error: resData }, { status: res.status });
  }

  return Response.json(resData);
}
