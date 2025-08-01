export async function PUT(request, { params }) {
  const { bookingId } = params;

    const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return Response.json({ error: "Missing Authorization header" }, { status: 401 });
  }

  try {
    const baseUrl = 'http://ec2-3-68-193-86.eu-central-1.compute.amazonaws.com:3003';

    const res = await fetch(`${baseUrl}/api/v1/bookings/${bookingId}/mark-cash-paid`, {
      method: "PUT",
      headers: {
        Authorization: authHeader,
        accept: "*/*",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return Response.json({ error: data.message || "Failed to mark cash paid" }, { status: res.status });
    }

    return Response.json(data);
  } catch (error) {
    console.error("mark-cash-paid error:", error);
    return Response.json({ error: "Server error while marking cash paid" }, { status: 500 });
  }
}
