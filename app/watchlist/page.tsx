"use client";
import { useState, useEffect } from "react";

const STOCKS = [
  { ticker: "AAPL", name: "Apple", date: "2025-05-01", daysOut: 10 },
  { ticker: "NVDA", name: "NVIDIA", date: "2025-05-28", daysOut: 37 },
  { ticker: "MSFT", name: "Microsoft", date: "2025-04-30", daysOut: 9 },
  { ticker: "AMZN", name: "Amazon", date: "2025-05-01", daysOut: 10 },
  { ticker: "META", name: "Meta", date: "2025-04-30", daysOut: 9 },
  { ticker: "TSLA", name: "Tesla", date: "2025-04-22", daysOut: 1 },
  { ticker: "GOOGL", name: "Alphabet", date: "2025-04-29", daysOut: 8 },
  { ticker: "JPM", name: "JP Morgan", date: "2025-04-11", daysOut: 0 },
  { ticker: "NFLX", name: "Netflix", date: "2025-04-17", daysOut: 0 },
  { ticker: "AMD", name: "AMD", date: "2025-04-29", daysOut: 8 },
];

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [phone, setPhone] = useState("");
  const [alertDays, setAlertDays] = useState("5");
  const [saved, setSaved] = useState(false);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/watchlist")
      .then(res => res.json())
      .then(data => {
        if (data.tickers) setWatchlist(data.tickers);
        if (data.phone) setPhone(data.phone);
        if (data.alertDays) setAlertDays(data.alertDays);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggle = (ticker: string) => {
    setWatchlist(prev =>
      prev.includes(ticker) ? prev.filter(t => t !== ticker) : [...prev, ticker]
    );
  };

  const save = async () => {
    if (!phone) { setError("Please enter your phone number."); return; }
    if (watchlist.length === 0) { setError("Please select at least one ticker."); return; }
    setError("");
    setSending(true);

    await fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tickers: watchlist, phone, alertDays }),
    });

    const threshold = parseInt(alertDays);
    const toAlert = STOCKS.filter(s => watchlist.includes(s.ticker) && s.daysOut <= threshold && s.daysOut >= 0);

    for (const stock of toAlert) {
      await fetch("/api/send-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: phone, ticker: stock.ticker, daysOut: stock.daysOut, date: stock.date }),
      });
    }

    setSending(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const watched = STOCKS.filter(s => watchlist.includes(s.ticker));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-gray-400">Loading your watchlist...</p>
      </div>
    );
  }

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
        <p className="text-gray-400 mb-8">Your preferences are saved and checked every weekday at 8am ET</p>
        <div className="bg-gray-900 border border-white/10 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Select Tickers</h2>
          <div className="grid grid-cols-2 gap-3">
            {STOCKS.map(stock => (
              <button key={stock.ticker} onClick={() => toggle(stock.ticker)}
                className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-colors ${watchlist.includes(stock.ticker) ? "border-green-400 bg-green-400/10 text-green-400" : "border-white/10 bg-gray-800 text-gray-300 hover:border-white/30"}`}>
                <span className="font-bold">{stock.ticker}</span>
                <span className="text-xs opacity-70">{stock.daysOut}d</span>
              </button>
            ))}
          </div>
        </div>
        <div className="bg-gray-900 border border-white/10 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">SMS Alert Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Your Phone Number</label>
              <input className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-400"
                placeholder="+14045551234" value={phone} onChange={e => setPhone(e.target.value)} type="tel" />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Alert me when earnings are this many days away</label>
              <select className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-400"
                value={alertDays} onChange={e => setAlertDays(e.target.value)}>
                <option value="3">3 days before</option>
                <option value="5">5 days before</option>
                <option value="7">7 days before</option>
                <option value="10">10 days before</option>
              </select>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button onClick={save} disabled={sending}
              className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold py-3 rounded-lg transition-colors">
              {sending ? "Saving..." : saved ? "Saved!" : "Save Preferences"}
            </button>
          </div>
        </div>
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
            <p className="text-gray-500 text-xs mt-4">Daily alerts run at 8am ET on weekdays.</p>
          </div>
        )}
      </div>
    </div>
  );
}