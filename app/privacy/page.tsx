export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-950 text-white px-8 py-16 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-green-400">Privacy Policy</h1>
      <p className="text-gray-400 text-sm mb-6">Last updated: May 2026</p>
      <div className="space-y-6 text-gray-300">
        <div>
          <h2 className="text-lg font-semibold text-white mb-2">Overview</h2>
          <p>StraddleTracker is a personal trading tool used solely by its owner, Martin Wilkes. This app does not collect, store, or share data from any third parties.</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white mb-2">Data We Collect</h2>
          <p>The only data stored is the app owner's phone number and watchlist preferences, used exclusively to send SMS alerts to the app owner.</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white mb-2">SMS Messaging</h2>
          <p>SMS alerts are sent only to the app owner's verified phone number. No third parties receive messages. Message frequency varies based on earnings calendar activity.</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white mb-2">Data Sharing</h2>
          <p>No personal data is shared with third parties. No data is sold or used for marketing purposes.</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white mb-2">Contact</h2>
          <p>For questions contact: martinwilkes@gmail.com</p>
        </div>
      </div>
    </div>
  );
}