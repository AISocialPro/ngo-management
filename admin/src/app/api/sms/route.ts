import { NextResponse } from "next/server";
import { sendSMS } from "@/lib/sms";

export async function POST(req: Request) {
  try {
    const { to, message } = await req.json();
    if (!to || !message)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const sid = await sendSMS(to, message);
    console.log("✅ SMS sent:", sid);
    return NextResponse.json({ success: true, sid });
  } catch (err: any) {
    console.error("Twilio error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
