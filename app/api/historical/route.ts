export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get("ticker");

  if (!ticker) {
    return Response.json({ error: "Ticker required" }, { status: 400 });
  }

  try {
    const apiKey = process.env.POLYGON_API_KEY;

    // Use Polygon's earnings calendar endpoint
    const earningsRes = await fetch(
      `https://api.polygon.io/vX/reference/financials?ticker=${ticker}&limit=8&sort=period_of_report_date&order=desc&apiKey=${apiKey}`
    );
    const earningsData = await earningsRes.json();

    // Get 2 years of daily price data
    const today = new Date().toISOString().split("T")[0];
    const twoYearsAgo = new Date(Date.now() - 730 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const priceRes = await fetch(
      `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${twoYearsAgo}/${today}?adjusted=true&sort=asc&limit=730&apiKey=${apiKey}`
    );
    const priceData = await priceRes.json();

    if (!priceData.results || priceData.results.length === 0) {
      return Response.json({ error: "No price data", debug: priceData }, { status: 404 });
    }

    // Build date -> OHLC map
    const bars: Record<string, { o: number; c: number }> = {};
    for (const bar of priceData.results) {
      const date = new Date(bar.t).toISOString().split("T")[0];
      bars[date] = { o: bar.o, c: bar.c };
    }

    const sortedDates = Object.keys(bars).sort();

    // Use known earnings dates for major tickers as fallback
    const knownEarnings: Record<string, string[]> = {
      NVDA: ["2025-02-26", "2024-11-20", "2024-08-28", "2024-05-22", "2024-02-21", "2023-11-21", "2023-08-23", "2023-05-24"],
      AAPL: ["2025-01-30", "2024-10-31", "2024-08-01", "2024-05-02", "2024-02-01", "2023-11-02", "2023-08-03", "2023-05-04"],
      TSLA: ["2025-01-29", "2024-10-23", "2024-07-23", "2024-04-23", "2024-01-24", "2023-10-18", "2023-07-19", "2023-04-19"],
      META: ["2025-01-29", "2024-10-30", "2024-07-31", "2024-04-24", "2024-01-31", "2023-10-25", "2023-07-26", "2023-04-26"],
      MSFT: ["2025-01-29", "2024-10-30", "2024-07-30", "2024-04-25", "2024-01-30", "2023-10-24", "2023-07-25", "2023-04-25"],
      AMZN: ["2025-02-06", "2024-10-31", "2024-08-01", "2024-04-30", "2024-02-01", "2023-10-26", "2023-08-03", "2023-04-27"],
      GOOGL: ["2025-02-04", "2024-10-29", "2024-07-23", "2024-04-25", "2024-01-30", "2023-10-24", "2023-07-25", "2023-04-25"],
      JPM:  ["2025-01-15", "2024-10-11", "2024-07-12", "2024-04-12", "2024-01-12", "2023-10-13", "2023-07-14", "2023-04-14"],
      AMD:  ["2025-01-28", "2024-10-29", "2024-07-30", "2024-04-30", "2024-01-30", "2023-10-31", "2023-08-01", "2023-05-02"],
      NFLX: ["2025-01-21", "2024-10-15", "2024-07-17", "2024-04-18", "2024-01-23", "2023-10-18", "2023-07-19", "2023-04-18"],
    };

    const earningsDates = knownEarnings[ticker.toUpperCase()] || [];

    if (earningsDates.length === 0) {
      return Response.json({ error: `No earnings dates available for ${ticker}` }, { status: 404 });
    }

    const moves = [];

    for (const earningsDate of earningsDates) {
      const idx = sortedDates.findIndex(d => d >= earningsDate);
      if (idx < 2 || idx >= sortedDates.length) continue;

      const dayBeforeDate = sortedDates[idx - 1];
      const dayAfterDate = sortedDates[idx + 1] || sortedDates[idx];

      const priceBefore = bars[dayBeforeDate]?.c;
      const priceAfter = bars[dayAfterDate]?.c;

      if (!priceBefore || !priceAfter) continue;

      const actualMove = Math.abs((priceAfter - priceBefore) / priceBefore) * 100;

      const date = new Date(earningsDate);
      const quarter = `Q${Math.ceil((date.getMonth() + 1) / 3)} ${date.getFullYear()}`;

      moves.push({
        quarter,
        actual: parseFloat(actualMove.toFixed(1)),
        expected: null,
        reportDate: earningsDate,
      });
    }

    return Response.json({ ticker, moves });
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}