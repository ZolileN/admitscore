import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { recordAnalyticsEvent } from "@/lib/analytics-server";

const eventSchema = z.object({
  eventName: z.enum([
    "page_view",
    "aps_calculated",
    "match_completed",
    "whatsapp_click",
    "mlk_cta_click",
    "pdf_export",
    "program_viewed",
    "share_whatsapp",
    "copy_results_link",
  ]),
  path: z.string().max(500).optional(),
  referrer: z.string().max(500).optional(),
  properties: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = eventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid event payload" }, { status: 400 });
    }

    await recordAnalyticsEvent(parsed.data.eventName, {
      path: parsed.data.path,
      referrer: parsed.data.referrer,
      properties: parsed.data.properties,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Analytics event error:", error);
    return NextResponse.json({ error: "Failed to record event" }, { status: 500 });
  }
}
