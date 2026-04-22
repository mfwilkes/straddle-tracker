import { createClient } from "redis";
import twilio from "twilio";

const STOCKS: Record<string, { name: string; date: string; daysOut: number }> = {
  AAPL: { name: "Apple", date: "2025-05-01", daysOut: 10 },
  NVDA: { name: "NVIDIA", date: "2025-05-28", daysOut: 37 },
  MSFT: { name: "Microsoft", date: "2025-04-30", daysOut: 9 },
  AMZN: { name: "Amazon", date: "2025-05-01", daysOut: 10 },
  META: { name: "Meta", date: "2025-04-30", daysOut: 9 },
  TSLA: { name: "Tesla", date: "2025-04-22", daysOut: 1 },
  GOOGL: { name: "Alphabet", date: "2025-04-29", daysOut: 8 },
  JPM: { name: "JP Morgan", date: "2025-04-11", daysOut: 0 },
  NFLX: { name: "Netflix", date: "2025-04-17", daysOut: 0 },
  AMD: { name: "AMD", date: "2025-04-29", daysOut: 8 },
};

export async function GET(request: Request) {
  // Verify this is called by Vercel cron
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Load watchlist from Redis
    const redisClient = createClient({ url: process.env.REDIS_URL });
    await redisClient.connect();
    const data = await redisClient.get("watchlist");
    await redisClient.disconnect();

    if (!data) {
      return Response.json({ message: "No watchlist found" });
    }

    const { tickers, phone, alertDays } = JSON.parse(data);
    const threshold = parseInt(alertDays || "5");

    if (!phone || !tickers || tickers.length === 0) {
      return Response.json({ message: "No phone or tickers configured" });
    }

    // Find stocks in alert window
    const toAlert = tickers
      .map((t: string) => STOCKS[t])
      .filter((s: typeof STOCKS[string]) => s && s.daysOut <= threshold && s.daysOut >= 0);

    if (toAlert.length === 0) {
      return Response.json({ message: "No alerts to send today" });
    }

    // Send SMS via Twilio
    const twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const results = [];
    for (const stock of toAlert) {
      const msg = await twilioClient.messages.create({
        body: `StraddleTracker: ${stock.name} reports earnings in ${stock.daysOut} day${stock.daysOut === 1 ? "" : "s"} on ${stock.date}. Time to evaluate your straddle play.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
      });
      results.push({ ticker: stock.name, sid: msg.sid });
    }

    return Response.json({ success: true, sent: results });
  } catch (error) {
    console.error("Cron error:", error);
    return Response.json({ error: "Cron failed" }, { status: 500 });
  }
}