// /pages/api/login.js (for pages router)
import { serialize } from "cookie";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, password } = req.body;

  try {
    const response = await fetch("http://ec2-3-68-193-86.eu-central-1.compute.amazonaws.com/api/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    const token = result?.data?.access_token || result?.data?.accessToken;
    const user = result?.data.user;


    console.log("🔐 API login result:", result);
    console.log(user,"=user==")

    if (!token || !user) {
      console.error("🚫 Missing token or user in response.");
      return res.status(401).json({ message: "Login failed. Missing token or user." });
    }

    //  Set token as httpOnly cookie
    res.setHeader("Set-Cookie", serialize("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    }));

    //  Send back needed info for routing
    return res.status(200).json({
      success: true,
      data: {
        role: user.role,
        company: user.companyId || null,
        token: token
      }
    });
  } catch (error) {
    console.error("🔥 Login API error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
