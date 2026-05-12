export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-950 text-white px-8 py-16 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-green-400">Terms and Conditions</h1>
      <p className="text-gray-400 text-sm mb-6">Last updated: May 2026</p>
      <div className="space-y-6 text-gray-300">
        <div>
          <h2 className="text-lg font-semibold text-white mb-2">Overview</h2>
          <p>StraddleTracker is a personal tool built and operated by Martin Wilkes for personal use only. It is not a commercial product or financial advisory service.</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white mb-2">SMS Program</h2>
          <p>The StraddleTracker SMS program sends earnings date alerts to the app owner only. The app owner opts in by entering their phone number in the Watchlist page at straddle-tracker.vercel.app. Message frequency varies. Message and data rates may apply. To opt out, remove your phone number from the Watchlist page.</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white mb-2">Not Financial Advice</h2>
          <p>Nothing in this application constitutes financial advice. All information is for informational purposes only. Always consult a qualified financial advisor before making investment decisions.</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white mb-2">Contact</h2>
          <p>For questions contact: martinwilkes@gmail.com</p>
        </div>
      </div>
    </div>
  );
}