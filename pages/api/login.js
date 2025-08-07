// pages/api/login.js

import { serialize } from "cookie";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  const { email, password } = req.body;

  try {
    // 1️⃣ Call backend login
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );
    const result = await response.json();
    console.log("🔐 API login result:", result);

    const accessToken  = result?.data?.accessToken;
    const refreshToken = result?.data?.refreshToken;
    const user         = result?.data?.user;

    if (!accessToken || !refreshToken || !user) {
      console.error("🚫 Missing token or user in response.");
      return res
        .status(401)
        .json({ success: false, message: "Login failed: missing token or user." });
    }

    // 2️⃣ Set HttpOnly cookies
    const cookieOpts = {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "strict",
      path:     "/",
    };
    res.setHeader("Set-Cookie", [
      serialize("accessToken",  accessToken,  { ...cookieOpts, maxAge: result.data.accessExpiresIn }),
      serialize("refreshToken", refreshToken, { ...cookieOpts, maxAge: result.data.refreshExpiresIn }),
    ]);

    // 3️⃣ Return user + raw accessToken for localStorage
    return res.status(200).json({
      success:     true,
      user: {
        role:      user.role.toLowerCase(),
        companyId: user.companyId || null,
      },
      accessToken,
    });
  } catch (err) {
    console.error("🔥 Login API error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}
