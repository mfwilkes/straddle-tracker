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

  const allTickers = Array.from(new Set([...DEFAULT_TICKERS, ...extraTickers]));
  const finnhubKey = process.env.FINNHUB_API_KEY;
  const alphaKey = process.env.ALPHAVANTAGE_API_KEY;

  try {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const futureStr = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    // Fetch from Finnhub
    const finnhubRes = await fetch(
      `https://finnhub.io/api/v1/calendar/earnings?from=${todayStr}&to=${futureStr}&token=${finnhubKey}`
    );
    const finnhubData = await finnhubRes.json();

    const earningsMap: Record<string, string> = {};
    if (finnhubData.earningsCalendar) {
      for (const item of finnhubData.earningsCalendar) {
        if (item.symbol && item.date && !earningsMap[item.symbol]) {
          earningsMap[item.symbol] = item.date;
        }
      }
    }

    // Find tickers still missing dates
    const missingTickers = allTickers.filter(t => !earningsMap[t]);

    // Fetch Alpha Vantage earnings calendar for missing tickers
    if (missingTickers.length > 0 && alphaKey) {
      try {
        const avRes = await fetch(
          `https://www.alphavantage.co/query?function=EARNINGS_CALENDAR&horizon=3month&apikey=${alphaKey}`
        );
        const csvText = await avRes.text();
        const lines = csvText.split("\n").slice(1); // skip header
        for (const line of lines) {
          const [symbol, , reportDate] = line.split(",");
          if (symbol && reportDate && missingTickers.includes(symbol.trim()) && !earningsMap[symbol.trim()]) {
            const days = getDaysOut(reportDate.trim());
            if (days >= 0) {
              earningsMap[symbol.trim()] = reportDate.trim();
            }
          }
        }
      } catch (e) {
        console.error("Alpha Vantage error:", e);
      }
    }

    // Build results
    const stocks = await Promise.all(allTickers.map(async (ticker) => {
      let name = COMPANY_NAMES[ticker] || ticker;
      const date = earningsMap[ticker] || "TBD";
      const daysOut = getDaysOut(date);

      if (!COMPANY_NAMES[ticker]) {
        try {
          const r = await fetch(
            `https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${finnhubKey}`
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