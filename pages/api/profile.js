// pages/api/profile.js

import { serialize } from "cookie";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
const cookieOpts = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === "production",
  sameSite: "strict",
  path:     "/",
};

async function fetchProfile(token) {
  return fetch(`${API_BASE}/auth/profile`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
}

async function callRefresh(refreshToken) {
  return fetch(`${API_BASE}/auth/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
}

export default async function handler(req, res) {
  let { accessToken, refreshToken } = req.cookies;

  if (!accessToken) {
    return res
      .status(401)
      .json({ success: false, message: "Missing access token." });
  }

  // 1️⃣ Attempt profile fetch
  let backendRes  = await fetchProfile(accessToken);
  let backendJson = await backendRes.json();
  let profileData = backendJson.data; // <-- unwrap here

  let newAccessToken = null;

  // 2️⃣ If expired, refresh & retry
  if (backendRes.status === 401 && refreshToken) {
    console.log("🔄 Access token expired, attempting refresh…");

    const refreshRes  = await callRefresh(refreshToken);
    const refreshJson = await refreshRes.json();

    if (refreshRes.ok && refreshJson.data) {
      const { accessToken: a, refreshToken: r, accessExpiresIn, refreshExpiresIn } = refreshJson.data;
      newAccessToken = a;

      // 3️⃣ Rotate cookies
      res.setHeader("Set-Cookie", [
        serialize("accessToken",  a, { ...cookieOpts, maxAge: accessExpiresIn }),
        serialize("refreshToken", r, { ...cookieOpts, maxAge: refreshExpiresIn }),
      ]);

      // 4️⃣ Retry profile with new token
      backendRes  = await fetchProfile(a);
      backendJson = await backendRes.json();
      profileData = backendJson.data;
    } else {
      return res
        .status(refreshRes.status)
        .json({ success: false, ...refreshJson });
    }
  }

  // 5️⃣ Final error check
  if (!backendRes.ok) {
    return res
      .status(backendRes.status)
      .json({ success: false, ...backendJson });
  }

  // 6️⃣ Success: return unwrapped profile + optional newAccessToken
  const payload = { success: true, data: profileData };
  if (newAccessToken) payload.newAccessToken = newAccessToken;
  return res.status(200).json(payload);
}
