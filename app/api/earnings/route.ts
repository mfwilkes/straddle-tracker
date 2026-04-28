const COMPANY_NAMES: Record<string, string> = {
  AAPL: "Apple", NVDA: "NVIDIA", MSFT: "Microsoft", AMZN: "Amazon",
  META: "Meta", TSLA: "Tesla", GOOGL: "Alphabet", JPM: "JP Morgan",
  NFLX: "Netflix", AMD: "AMD", GS: "Goldman Sachs", MS: "Morgan Stanley",
  UBER: "Uber", SHOP: "Shopify", COIN: "Coinbase", PLTR: "Palantir",
};

function getDaysOut(dateStr: string): number {
  if (!dateStr || dateStr === "TBD") return 999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const extraTickers = searchParams.get("extra")?.split(",").filter(Boolean) || [];

  const DEFAULT_TICKERS = [
    "AAPL", "NVDA", "MSFT", "AMZN", "META", "TSLA", "GOOGL",
    "JPM", "NFLX", "AMD", "GS", "MS", "UBER", "SHOP", "COIN", "PLTR"
  ];

  const allTickers = [...new Set([...DEFAULT_TICKERS, ...extraTickers])];
  const apiKey = process.env.FINNHUB_API_KEY;

  try {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const futureDate = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);
    const futureStr = futureDate.toISOString().split("T")[0];

    // Fetch earnings calendar from Finnhub
    const res = await fetch(
      `https://finnhub.io/api/v1/calendar/earnings?from=${todayStr}&to=${futureStr}&token=${apiKey}`
    );
    const data = await res.json();

    // Build map of ticker -> earnings date
    const earningsMap: Record<string, string> = {};
    if (data.earningsCalendar) {
      for (const item of data.earningsCalendar) {
        if (item.symbol && item.date && !earningsMap[item.symbol]) {
          earningsMap[item.symbol] = item.date;
        }
      }
    }

    // Build results
    const stocks = await Promise.all(allTickers.map(async (ticker) => {
      let name = COMPANY_NAMES[ticker] || ticker;
      let date = earningsMap[ticker] || "TBD";
      let daysOut = getDaysOut(date);

      // For custom tickers not in COMPANY_NAMES, fetch name from Finnhub
      if (!COMPANY_NAMES[ticker]) {
        try {
          const r = await fetch(
            `https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${apiKey}`
          );
          const d = await r.json();
          if (d.name) name = d.name;
        } catch {
          name = ticker;
        }
      }

      return { ticker, name, date, daysOut };
    }));

    return Response.json({ stocks });
  } catch (error) {
    console.error("Earnings error:", error);
    return Response.json({ error: "Failed to fetch" }, { status: 500 });
  }
}