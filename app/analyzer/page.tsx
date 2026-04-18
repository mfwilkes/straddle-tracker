"use client";
import { useState } from "react";

export default function Analyzer() {
  const [ticker, setTicker] = useState("");
  const [stockPrice, setStockPrice] = useState("");
  const [straddlePrice, setStraddlePrice] = useState("");
  const [result, setResult] = useState<null | {
    expectedMove: number;
    expectedMovePct: number;
    upperBreakeven: number;
    lowerBreakeven: number;
    signal: string;
    signalColor: string;
    signalReason: string;
  }>(null);

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
  };

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
          <div className="bg-gray-900 border border-white/10 rounded-xl p-6 space-y-4">
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
      </div>
    </div>
  );
}