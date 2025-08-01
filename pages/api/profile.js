// pages/api/profile.js

export default async function handler(req, res) {
  const token = req.cookies.token; // read token from cookies (HttpOnly)

  if (!token) {
    return res.status(401).json({ success: false, message: "Missing token" });
  }

  try {
    const apiRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const data = await apiRes.json();

    if (!apiRes.ok) {
      return res.status(apiRes.status).json(data);
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
}
