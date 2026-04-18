import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { startTwilioVerification } from "@/lib/auth/otp";

const sendOtpSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "INVALID_PHONE"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = sendOtpSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { code: "INVALID_PHONE", message: result.error.issues[0].message },
        { status: 400 },
      );
    }

    const { phone } = result.data;

    // Start Twilio Verify process
    const status = "pending"; // DEVELOPMENT BYPASS: await startTwilioVerification(phone);

    return NextResponse.json({
      message: "OTP sent successfully.",
      status, // e.g. 'pending'
    });
  } catch (error) {
    console.error("[AUTH_SEND_OTP]", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Failed to send OTP" },
      { status: 500 },
    );
  }
}
