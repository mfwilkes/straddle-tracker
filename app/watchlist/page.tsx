"use client";
import { useState } from "react";

const STOCKS = [
  { ticker: "AAPL", name: "Apple", date: "2025-05-01", daysOut: 14 },
  { ticker: "NVDA", name: "NVIDIA", date: "2025-05-28", daysOut: 41 },
  { ticker: "MSFT", name: "Microsoft", date: "2025-04-30", daysOut: 13 },
  { ticker: "AMZN", name: "Amazon", date: "2025-05-01", daysOut: 14 },
  { ticker: "META", name: "Meta", date: "2025-04-30", daysOut: 13 },
  { ticker: "TSLA", name: "Tesla", date: "2025-04-22", daysOut: 5 },
  { ticker: "GOOGL", name: "Alphabet", date: "2025-04-29", daysOut: 12 },
  { ticker: "JPM", name: "JP Morgan", date: "2025-04-11", daysOut: 0 },
  { ticker: "NFLX", name: "Netflix", date: "2025-04-17", daysOut: 0 },
  { ticker: "AMD", name: "AMD", date: "2025-04-29", daysOut: 12 },
];

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [phone, setPhone] = useState("");
  const [alertDays, setAlertDays] = useState("5");
  const [saved, setSaved] = useState(false);

  const toggle = (ticker: string) => {
    setWatchlist(prev =>
      prev.includes(ticker) ? prev.filter(t => t !== ticker) : [...prev, ticker]
    );
  };

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const watched = STOCKS.filter(s => watchlist.includes(s.ticker));

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <a href="/" className="text-green-400 font-bold text-xl tracking-wide">StraddleTracker</a>
        <div className="flex gap-6">
          <a href="/calendar" className="text-gray-300 hover:text-green-400 transition-colors font-medium">Calendar</a>
          <a href="/analyzer" className="text-gray-300 hover:text-green-400 transition-colors font-medium">Analyzer</a>
          <a href="/watchlist" className="text-green-400 font-medium">Watchlist</a>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-8 py-10">
        <h1 className="text-3xl font-bold mb-2">Watchlist</h1>
        <p className="text-gray-400 mb-8">Select tickers to watch and set your SMS alert preferences</p>

        {/* Stock Selection */}
        <div className="bg-gray-900 border border-white/10 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Select Tickers</h2>
          <div className="grid grid-cols-2 gap-3">
            {STOCKS.map(stock => (
              <button
                key={stock.ticker}
                onClick={() => toggle(stock.ticker)}
                className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-colors ${
                  watchlist.includes(stock.ticker)
                    ? "border-green-400 bg-green-400/10 text-green-400"
                    : "border-white/10 bg-gray-800 text-gray-300 hover:border-white/30"
                }`}
              >
                <span className="font-bold">{stock.ticker}</span>
                <span className="text-xs opacity-70">{stock.daysOut}d</span>
              </button>
            ))}
          </div>
        </div>

        {/* Alert Settings */}
        <div className="bg-gray-900 border border-white/10 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">SMS Alert Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Your Phone Number</label>
              <input
                className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-400"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                type="tel"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Alert me when earnings are this many days away</label>
              <select
                className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-400"
                value={alertDays}
                onChange={e => setAlertDays(e.target.value)}
              >
                <option value="3">3 days before</option>
                <option value="5">5 days before</option>
                <option value="7">7 days before</option>
                <option value="10">10 days before</option>
              </select>
            </div>
            <button
              onClick={save}
              className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-lg transition-colors"
            >
              {saved ? "✓ Saved!" : "Save Alert Preferences"}
            </button>
          </div>
        </div>

        {/* Active Watchlist */}
        {watched.length > 0 && (
          <div className="bg-gray-900 border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Your Watchlist</h2>
            <div className="space-y-3">
              {watched.map(stock => (
                <div key={stock.ticker} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
                  <div>
                    <span className="text-green-400 font-bold mr-3">{stock.ticker}</span>
                    <span className="text-gray-300 text-sm">{stock.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 text-sm">{stock.date}</span>
                    <span className="text-gray-300 text-sm">{stock.daysOut}d out</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}