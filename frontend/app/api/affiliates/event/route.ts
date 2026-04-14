import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { affiliateEvents } from "@/lib/db/schema";
import { AffiliateEventPayload } from "@/lib/affiliates/types";

export async function POST(request: NextRequest) {
  try {
    const body: AffiliateEventPayload = await request.json();
    const {
      eventType,
      productId,
      page,
      position,
      intentLevel,
      userScore,
      abVariant,
      sessionId,
    } = body;

    // Validate required fields
    if (!eventType || !productId || !page || !position || !sessionId) {
      return NextResponse.json(
        { detail: "Missing required fields: eventType, productId, page, position, sessionId" },
        { status: 400 }
      );
    }

    // Insert event into database
    await db.insert(affiliateEvents).values({
      id: crypto.randomUUID(),
      eventType: String(eventType).slice(0, 20),
      productId: String(productId).slice(0, 100),
      page: String(page).slice(0, 50),
      position: String(position).slice(0, 20),
      intentLevel: intentLevel ? String(intentLevel).slice(0, 20) : null,
      userScore: typeof userScore === "number" ? Math.round(userScore) : null,
      abVariant: abVariant ? String(abVariant).slice(0, 5) : null,
      sessionId: String(sessionId).slice(0, 100),
      userId: null, // Will be populated in V2 when we have auth context
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[affiliate-event-error]", err);
    return NextResponse.json({ ok: false, error: "Tracking failed" }, { status: 500 });
  }
}
