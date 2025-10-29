// ==============================
// SuperAdmin Single Booking Proxy
// File: app/api/superadmin/companies/[companyId]/bookings/[bookingId]/route.js
//
// This lets SuperAdmin fetch details of ONE booking that belongs to a company.
// It forwards the Bearer token to the backend and pipes back the JSON.
// No mutations here (GET only).
//
// Expected backend shape (example):
//   GET  {API_BASE}/bookings/{bookingId}?companyId=COMPANY_ID
//
// NOTE: Must have NEXT_PUBLIC_BOOKINGS_API_URL set in env.
// ==============================

import { NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_BOOKINGS_API_URL;

export async function GET(req, { params }) {
  try {
    const { companyId, bookingId } = params;

    if (!API_BASE) {
      return NextResponse.json(
        {
          error:
            "Missing backend base URL env (e.g. NEXT_PUBLIC_BOOKINGS_API_URL)",
        },
        { status: 500 }
      );
    }

    // Build upstream URL to your backend
    // We pass companyId so backend can enforce that this booking belongs to that company
    const targetUrl = `${API_BASE}/bookings/${encodeURIComponent(
      bookingId
    )}?companyId=${encodeURIComponent(companyId)}`;

    // Forward Authorization if present
    const headers = new Headers();
    const auth = req.headers.get("authorization");
    if (auth) headers.set("authorization", auth);

    // Call upstream
    const upstream = await fetch(targetUrl, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    // We stream the exact body/text through so shape stays identical
    const bodyText = await upstream.text();

    return new NextResponse(bodyText, {
      status: upstream.status,
      headers: {
        "content-type":
          upstream.headers.get("content-type") || "application/json",
      },
    });
  } catch (err) {
    console.error("[SA single booking proxy]", err);
    return NextResponse.json({ error: "Proxy error" }, { status: 500 });
  }
}
