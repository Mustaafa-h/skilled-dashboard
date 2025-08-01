export default async function handler(req, res) {
  // Get token from browser cookies
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token found in cookies" });
  }

  try {
    const backendRes = await fetch("http://ec2-3-68-193-86.eu-central-1.compute.amazonaws.com:3003/api/v1/bookings/company", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const data = await backendRes.json();

    return res.status(backendRes.status).json(data);
  } catch (err) {
    console.error(" Error fetching bookings:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
