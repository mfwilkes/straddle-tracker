import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(request: Request) {
  try {
    const { to, ticker, daysOut, date } = await request.json();

    const message = await client.messages.create({
      body: `StraddleTracker Alert: ${ticker} reports earnings in ${daysOut} day${daysOut === 1 ? "" : "s"} on ${date}. Time to evaluate your straddle play.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
    });

    return Response.json({ success: true, sid: message.sid });
  } catch (error) {
    console.error("Twilio error:", error);
    return Response.json({ success: false, error: "Failed to send SMS" }, { status: 500 });
  }
}