export default function Calendar() {
  const stocks = [
    { ticker: "AAPL", name: "Apple", date: "2025-05-01", daysOut: 14 },
    { ticker: "NVDA", name: "NVIDIA", date: "2025-05-28", daysOut: 41 },
    { ticker: "MSFT", name: "Microsoft", date: "2025-04-30", daysOut: 13 },
    { ticker: "AMZN", name: "Amazon", date: "2025-05-01", daysOut: 14 },
    { ticker: "META", name: "Meta", date: "2025-04-30", daysOut: 13 },
    { ticker: "TSLA", name: "Tesla", date: "2025-04-22", daysOut: 5 },
    { ticker: "GOOGL", name: "Alphabet", date: "2025-04-29", daysOut: 12 },
    { ticker: "JPM", name: "JP Morgan", date: "2025-04-11", daysOut: 0 },
  ];

  const getZone = (days: number) => {
    if (days <= 2) return { label: "Last Call", color: "text-red-400 bg-red-400/10 border-red-400/30" };
    if (days <= 10) return { label: "Enter Zone", color: "text-green-400 bg-green-400/10 border-green-400/30" };
    if (days <= 15) return { label: "Watch", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30" };
    return { label: "Too Early", color: "text-gray-400 bg-gray-400/10 border-gray-400/30" };
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <a href="/" className="text-green-400 font-bold text-xl tracking-wide">StraddleTracker</a>
        <div className="flex gap-6">
          <a href="/calendar" className="text-green-400 font-medium">Calendar</a>
          <a href="/analyzer" className="text-gray-300 hover:text-green-400 transition-colors font-medium">Analyzer</a>
          <a href="/watchlist" className="text-gray-300 hover:text-green-400 transition-colors font-medium">Watchlist</a>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto px-8 py-10">
        <h1 className="text-3xl font-bold mb-2">Earnings Calendar</h1>
        <p className="text-gray-400 mb-8">Large & mega-cap earnings with straddle play windows</p>
        <div className="space-y-3">
          {stocks.sort((a, b) => a.daysOut - b.daysOut).map((stock) => {
            const zone = getZone(stock.daysOut);
            return (
              <div key={stock.ticker} className="flex items-center justify-between bg-gray-900 border border-white/10 rounded-xl px-6 py-4 hover:border-green-400/30 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-green-400 font-bold text-lg w-16">{stock.ticker}</span>
                  <span className="text-gray-300">{stock.name}</span>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-gray-400 text-sm">{stock.date}</span>
                  <span className="text-gray-300 text-sm w-20 text-center">
                    {stock.daysOut === 0 ? "Today" : `${stock.daysOut}d out`}
                  </span>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${zone.color}`}>
                    {zone.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}