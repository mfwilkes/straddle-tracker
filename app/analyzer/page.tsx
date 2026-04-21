"use client";
import { useState } from "react";

export default function Analyzer() {
  const [ticker, setTicker] = useState("");
  const [stockPrice, setStockPrice] = useState("");
  const [straddlePrice, setStraddlePrice] = useState("");
  const [historicalData, setHistoricalData] = useState<null | {
    quarter: string;
    actual: number;
    expected: number | null;
    reportDate: string;
  }[]>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [result, setResult] = useState<null | {
    expectedMove: number;
    expectedMovePct: number;
    upperBreakeven: number;
    lowerBreakeven: number;
    signal: string;
    signalColor: string;
    signalReason: string;
  }>(null);

  const fetchHistory = async (t: string) => {
    if (!t || t.length < 1) return;
    setLoadingHistory(true);
    setHistoryError("");
    setHistoricalData(null);
    try {
      const res = await fetch(`/api/historical?ticker=${t}`);
      const data = await res.json();
      if (data.error) {
        setHistoryError(data.error);
      } else {
        setHistoricalData(data.moves);
      }
    } catch {
      setHistoryError("Failed to fetch historical data");
    }
    setLoadingHistory(false);
  };

  const analyze = () => {
    const stock = parseFloat(stockPrice);
    const straddle = parseFloat(straddlePrice);
    if (!stock || !straddle) return;

    const expectedMovePct = (straddle / stock) * 100;
    const upperBreakeven = stock + straddle;
    const lowerBreakeven = stock - straddle;

    let signal = "";
    let signalColor = "";
    let signalReason = "";

    if (expectedMovePct < 4) {
      signal = "FAVORABLE";
      signalColor = "text-green-400";
      signalReason = "Low expected move — options are relatively cheap. Good straddle setup.";
    } else if (expectedMovePct < 8) {
      signal = "NEUTRAL";
      signalColor = "text-yellow-400";
      signalReason = "Moderate expected move — assess historical moves before entering.";
    } else {
      signal = "CAUTION";
      signalColor = "text-red-400";
      signalReason = "High expected move — options are expensive. Stock needs a very large move to profit.";
    }

    setResult({ expectedMove: straddle, expectedMovePct, upperBreakeven, lowerBreakeven, signal, signalColor, signalReason });
    fetchHistory(ticker);
  };

  const avgMove = historicalData && historicalData.length > 0
    ? historicalData.reduce((sum, q) => sum + q.actual, 0) / historicalData.length
    : null;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <a href="/" className="text-green-400 font-bold text-xl tracking-wide">StraddleTracker</a>
        <div className="flex gap-6">
          <a href="/calendar" className="text-gray-300 hover:text-green-400 transition-colors font-medium">Calendar</a>
          <a href="/analyzer" className="text-green-400 font-medium">Analyzer</a>
          <a href="/watchlist" className="text-gray-300 hover:text-green-400 transition-colors font-medium">Watchlist</a>
        </div>
      </nav>
      <div className="max-w-2xl mx-auto px-8 py-10">
        <h1 className="text-3xl font-bold mb-2">Straddle Analyzer</h1>
        <p className="text-gray-400 mb-8">Enter trade details to evaluate an earnings straddle</p>

        <div className="bg-gray-900 border border-white/10 rounded-xl p-6 space-y-4 mb-6">
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Ticker Symbol</label>
            <input
              className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-3 text-white uppercase focus:outline-none focus:border-green-400"
              placeholder="e.g. AAPL"
              value={ticker}
              onChange={e => setTicker(e.target.value.toUpperCase())}
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Current Stock Price ($)</label>
            <input
              className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-400"
              placeholder="e.g. 175.00"
              value={stockPrice}
              onChange={e => setStockPrice(e.target.value)}
              type="number"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1 block">ATM Straddle Price ($)</label>
            <input
              className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-400"
              placeholder="e.g. 8.50"
              value={straddlePrice}
              onChange={e => setStraddlePrice(e.target.value)}
              type="number"
            />
          </div>
          <button
            onClick={analyze}
            className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-lg transition-colors"
          >
            Analyze Play
          </button>
        </div>

        {result && (
          <div className="bg-gray-900 border border-white/10 rounded-xl p-6 space-y-4 mb-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-lg font-bold">{ticker} Analysis</span>
              <span className={`font-bold text-lg ${result.signalColor}`}>{result.signal}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-gray-400 text-xs mb-1">Expected Move</div>
                <div className="text-white font-bold text-lg">${result.expectedMove.toFixed(2)}</div>
                <div className="text-gray-400 text-sm">±{result.expectedMovePct.toFixed(1)}%</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-gray-400 text-xs mb-1">Upper Breakeven</div>
                <div className="text-green-400 font-bold text-lg">${result.upperBreakeven.toFixed(2)}</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-gray-400 text-xs mb-1">Lower Breakeven</div>
                <div className="text-red-400 font-bold text-lg">${result.lowerBreakeven.toFixed(2)}</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-gray-400 text-xs mb-1">Cost Basis</div>
                <div className="text-white font-bold text-lg">${(result.expectedMove * 100).toFixed(0)}</div>
                <div className="text-gray-400 text-sm">per contract</div>
              </div>
            </div>
            <div className={`text-sm ${result.signalColor} bg-gray-800 rounded-lg p-4`}>
              {result.signalReason}
            </div>
          </div>
        )}

        {loadingHistory && (
          <div className="bg-gray-900 border border-white/10 rounded-xl p-6 text-center text-gray-400">
            Loading historical data from Polygon...
          </div>
        )}

        {historyError && (
          <div className="bg-gray-900 border border-red-400/20 rounded-xl p-6 text-red-400 text-sm">
            {historyError}
          </div>
        )}

        {historicalData && historicalData.length > 0 && (
          <div className="bg-gray-900 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Historical Move Analysis</h2>
              {avgMove && (
                <span className="text-sm font-semibold px-3 py-1 rounded-full border text-green-400 bg-green-400/10 border-green-400/30">
                  Avg move: ±{avgMove.toFixed(1)}%
                </span>
              )}
            </div>
            <div className="space-y-3">
              {historicalData.map((q, i) => (
                <div key={i} className="bg-gray-800 rounded-lg px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-300 text-sm font-medium">{q.quarter}</span>
                    <span className="text-green-400 text-xs font-bold">
                      ±{q.actual}% actual move
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">{q.reportDate}</div>
                </div>
              ))}
            </div>
            <p className="text-gray-500 text-xs mt-4">
              Actual price moves around earnings dates via Polygon.io. Past performance does not guarantee future results.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}