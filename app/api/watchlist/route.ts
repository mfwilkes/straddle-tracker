import { createClient } from "redis";

const getClient = async () => {
  const client = createClient({ url: process.env.REDIS_URL });
  await client.connect();
  return client;
};

export async function GET() {
  try {
    const client = await getClient();
    const data = await client.get("watchlist");
    await client.disconnect();
    return Response.json(data ? JSON.parse(data) : { tickers: [], phone: "", alertDays: "5" });
  } catch (error) {
    console.error("Redis error:", error);
    return Response.json({ tickers: [], phone: "", alertDays: "5" });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const client = await getClient();
    await client.set("watchlist", JSON.stringify(body));
    await client.disconnect();
    return Response.json({ success: true });
  } catch (error) {
    console.error("Redis error:", error);
    return Response.json({ success: false }, { status: 500 });
  }
}