import { NextRequest, NextResponse } from "next/server";

function isAllowedNasaImageHost(hostname: string): boolean {
  const h = hostname.replace(/^www\./, "").toLowerCase();
  return (
    h === "apod.nasa.gov" ||
    h === "photojournal.jpl.nasa.gov" ||
    h.endsWith(".nasa.gov") ||
    h.endsWith("images.nasa.gov")
  );
}

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("url");
  if (!raw) {
    return NextResponse.json({ error: "Falta url" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return NextResponse.json({ error: "URL inválida" }, { status: 400 });
  }

  if (target.protocol !== "https:") {
    return NextResponse.json({ error: "Solo HTTPS" }, { status: 400 });
  }

  if (!isAllowedNasaImageHost(target.hostname)) {
    return NextResponse.json({ error: "Host no permitido" }, { status: 400 });
  }

  try {
    const res = await fetch(target.toString(), {
      headers: {
        "User-Agent": "studiapp-planetarium/1.0",
      },
      redirect: "follow",
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream ${res.status}` },
        { status: 502 }
      );
    }

    const ct = res.headers.get("content-type") || "image/jpeg";
    const buf = await res.arrayBuffer();

    return new Response(buf, {
      headers: {
        "Content-Type": ct,
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "fetch error" },
      { status: 502 }
    );
  }
}
