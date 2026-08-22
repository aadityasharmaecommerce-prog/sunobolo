import { useNavigate } from 'react-router-dom';

export default function PaymentFailure() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-400 to-red-600 text-white flex items-center justify-center text-4xl mb-6">
        ✕
      </div>
      <h1 className="text-2xl font-extrabold text-white">Payment Not Completed</h1>
      <p className="text-white/50 text-sm mt-2 max-w-xs">
        Something went wrong. No money was charged.
      </p>
      <button
        onClick={() => navigate('/pricing')}
        className="mt-8 btn-premium btn-premium-gradient px-8 py-4 text-base rounded-xl"
      >
        Try Again
      </button>
      <button
        onClick={() => navigate('/')}
        className="mt-3 text-sm text-white/35 hover:text-white/60 transition-colors"
      >
        ← Back to Home
      </button>
    </div>
  );
}
