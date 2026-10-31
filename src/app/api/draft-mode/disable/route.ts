import { draftMode } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

/** Sale de la vista previa y vuelve a la página donde estaba. */
export async function GET(req: NextRequest) {
  (await draftMode()).disable();
  const back = req.nextUrl.searchParams.get("volver") ?? "/";
  const safe = back.startsWith("/") && !back.startsWith("//") ? back : "/";
  return NextResponse.redirect(new URL(safe, req.url));
}
