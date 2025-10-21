// ==============================
// File ONLY: app/api/superadmin/companies/[companyId]/bookings/route.js
// (Superadmin-scoped proxy; response shape matches company Orders list)
// ==============================

import { NextResponse } from "next/server";

// Resolve your backend base URL from env (pick one you already use in company pages)
const API_BASE =
  process.env.NEXT_PUBLIC_BOOKINGS_API_URL

export async function GET(req, { params }) {
  try {
    const { companyId } = params;
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "13";

    if (!API_BASE) {
      return NextResponse.json(
        { error: "Missing backend base URL env (e.g., NEXT_PUBLIC_API_BASE_URL)" },
        { status: 500 }
      );
    }

    // If your upstream path differs, adjust here to keep the page logic identical.
    const targetUrl = `${API_BASE}/bookings?companyId=${encodeURIComponent(
      companyId
    )}&page=${encodeURIComponent(page)}&limit=${encodeURIComponent(limit)}`;

    const headers = new Headers();
    // Forward Authorization to preserve user identity/permissions
    const auth = req.headers.get("authorization");
    if (auth) headers.set("authorization", auth);

    const upstream = await fetch(targetUrl, { method: "GET", headers, cache: "no-store" });

    // Pass through body & content-type so the list page parses identically to company
    const bodyText = await upstream.text();
    return new NextResponse(bodyText, {
      status: upstream.status,
      headers: { "content-type": upstream.headers.get("content-type") || "application/json" },
    });
  } catch (err) {
    console.error("[SA bookings proxy]", err);
    return NextResponse.json({ error: "Proxy error" }, { status: 500 });
  }
}
