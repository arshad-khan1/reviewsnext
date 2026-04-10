import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

const client = twilio(accountSid, authToken);

/**
 * Starts a Twilio Verify session, sending an OTP to the given phone number.
 */
export async function startTwilioVerification(phone: string) {
  if (!verifyServiceSid) {
    throw new Error("TWILIO_VERIFY_SERVICE_SID is not configured");
  }

  const verification = await client.verify.v2
    .services(verifyServiceSid)
    .verifications.create({ to: phone, channel: "sms" });

  return verification.status;
}

/**
 * Checks the given OTP code against the Twilio Verify session for the phone number.
 * Returns true if the status is "approved", false otherwise.
 */
export async function checkTwilioVerification(phone: string, code: string) {
  if (!verifyServiceSid) {
    throw new Error("TWILIO_VERIFY_SERVICE_SID is not configured");
  }

  try {
    const verificationCheck = await client.verify.v2
      .services(verifyServiceSid)
      .verificationChecks.create({ to: phone, code });

    return verificationCheck.status === "approved";
  } catch (error) {
    console.error("[Twilio Verify Check Error]", error);
    return false;
  }
}
