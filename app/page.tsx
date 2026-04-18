import Image from "next/image";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/background.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-green-400 font-bold text-xl tracking-wide">
            StraddleTracker
          </span>
        </div>
        <div className="flex gap-6">
          <a href="/calendar" className="text-gray-300 hover:text-green-400 transition-colors font-medium">
            Calendar
          </a>
          <a href="/analyzer" className="text-gray-300 hover:text-green-400 transition-colors font-medium">
            Analyzer
          </a>
          <a href="/watchlist" className="text-gray-300 hover:text-green-400 transition-colors font-medium">
            Watchlist
          </a>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-8 text-center">
        <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
          Trade Earnings <span className="text-green-400">Volatility</span>
        </h1>
        <p className="text-gray-300 text-xl max-w-xl mb-10">
          Track upcoming earnings, analyze straddle plays, and get SMS alerts before the market moves.
        </p>
        <div className="flex gap-4">
          <a href="/calendar" className="bg-green-500 hover:bg-green-400 text-black font-bold px-8 py-3 rounded-lg transition-colors">View Calendar</a>
          <a href="/analyzer" className="border border-white/20 hover:border-green-400 text-white font-medium px-8 py-3 rounded-lg transition-colors">Analyze a Play</a>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center py-4 text-gray-500 text-sm border-t border-white/10">
        For informational purposes only. Not financial advice.
      </div>
    </div>
  );
}