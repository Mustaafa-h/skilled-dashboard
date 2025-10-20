export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "13";

  const baseUrl = "http://ec2-3-68-193-86.eu-central-1.compute.amazonaws.com:3003";

  // Get token from incoming request headers
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return Response.json({ error: "Missing Authorization header" }, { status: 401 });
  }

  const res = await fetch(
    `${baseUrl}/api/v1/bookings/company?page=${page}&limit=${limit}`,
    {
      headers: {
        accept: "*/*",
        Authorization: authHeader, // forward the same token
      },
    }
  );

  if (!res.ok) {
    return Response.json(
      { error: `Upstream failed: ${res.status}` },
      { status: res.status }
    );
  }

  const data = await res.json();
  return Response.json(data);
}
