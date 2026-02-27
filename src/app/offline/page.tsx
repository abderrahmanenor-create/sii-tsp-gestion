export default function Offline() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#002E5D] to-[#001a36] p-4">
      <div className="text-center text-white">
        <div className="mb-6">
          <svg
            className="w-24 h-24 mx-auto text-white/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M5.636 18.364l3.536-3.536m0-5.656l-3.536-3.536M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-2">Mode Hors Ligne</h1>
        <p className="text-white/70 mb-6">
          Vous êtes actuellement hors ligne. Vérifiez votre connexion internet.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-white text-[#002E5D] rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          Réessayer
        </button>
      </div>
    </div>
  )
}
