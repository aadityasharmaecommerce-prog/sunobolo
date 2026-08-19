import { useNavigate } from 'react-router-dom';

export default function PaymentSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-success-400 to-emerald-600 text-white flex items-center justify-center text-4xl shadow-glow-success mb-6">
        🎉
      </div>
      <h1 className="text-2xl font-extrabold text-gray-900">Payment Successful!</h1>
      <p className="text-gray-500 text-sm mt-2 max-w-xs">
        Welcome to SunoBolo English. Your full access is now active.
      </p>
      <button
        onClick={() => navigate('/courses')}
        className="mt-8 btn-premium btn-premium-gradient px-8 py-4 text-base rounded-2xl"
      >
        Start Learning →
      </button>
    </div>
  );
}
