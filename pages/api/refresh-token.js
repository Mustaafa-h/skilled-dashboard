// pages/api/refresh-token.js
import { serialize } from "cookie";

export default async function handler(req, res) {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token present" });
  }

  try {
    const backendRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh-token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      }
    );
    const result = await backendRes.json();

    if (!backendRes.ok || !result.data) {
      return res.status(backendRes.status).json(result);
    }

    const { accessToken, refreshToken: newRefresh, accessExpiresIn, refreshExpiresIn } =
      result.data;

    // rotate both cookies
    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    };
    res.setHeader("Set-Cookie", [
      serialize("accessToken", accessToken, { ...cookieOpts, maxAge: accessExpiresIn }),
      serialize("refreshToken", newRefresh, { ...cookieOpts, maxAge: refreshExpiresIn }),
    ]);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Refresh token error:", err);
    return res.status(500).json({ message: "Could not refresh token." });
  }
}
