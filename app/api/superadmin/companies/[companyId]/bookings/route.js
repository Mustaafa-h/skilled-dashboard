//aap/api/superadmin/companies/[companyId]/bookings/route.js
import { NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_BOOKINGS_API_URL;

export async function GET(req, { params }) {
  try {
    const { companyId } = params;
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "13";

    if (!API_BASE) {
      return NextResponse.json(
        { error: "Missing backend base URL env (e.g., NEXT_PUBLIC_BOOKINGS_API_URL)" },
        { status: 500 }
      );
    }

    // include companyId so backend knows WHICH company you are inspecting
    const targetUrl = `${API_BASE}/bookings/company?companyId=${encodeURIComponent(
      companyId
    )}&page=${encodeURIComponent(page)}&limit=${encodeURIComponent(limit)}`;

    const headers = new Headers();
    const auth = req.headers.get("authorization");
    if (auth) headers.set("authorization", auth);

    const upstream = await fetch(targetUrl, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const bodyText = await upstream.text();

    return new NextResponse(bodyText, {
      status: upstream.status,
      headers: {
        "content-type":
          upstream.headers.get("content-type") || "application/json",
      },
    });
  } catch (err) {
    console.error("[SA bookings proxy]", err);
    return NextResponse.json({ error: "Proxy error" }, { status: 500 });
  }
}
