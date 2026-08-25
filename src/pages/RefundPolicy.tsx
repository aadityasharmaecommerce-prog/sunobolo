import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Ban, XCircle } from 'lucide-react';

export default function RefundPolicy() {
  const navigate = useNavigate();

  return (
    <div className="space-y-5 animate-fade-in pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2">
          <Ban size={18} className="text-red-400" />
          <h1 className="text-lg font-extrabold text-white">Refund Policy</h1>
        </div>
      </div>

      <p className="text-[12px] text-white/30">Last updated: August 2026</p>

      {/* No Refund Banner */}
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 text-center">
        <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-3">
          <XCircle size={28} className="text-red-400" />
        </div>
        <h2 className="text-lg font-extrabold text-white mb-1">No Refunds</h2>
        <p className="text-sm text-red-300/80">All payments made on SunoBolo are final and non-refundable.</p>
      </div>

      <div className="dark-card p-6 space-y-6 text-[14px] text-white/60 leading-relaxed">
        {/* Section 1 */}
        <div>
          <h2 className="text-base font-extrabold text-white mb-2">1. No Refund Policy</h2>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-3">
            <p className="text-red-300 font-semibold text-sm">🚫 All Sales Are Final</p>
            <p className="mt-1">Once a payment is made for any SunoBolo subscription plan, <strong className="text-white/80">NO refund will be provided</strong> under any circumstances.</p>
          </div>
          <p className="mb-2">This includes but is not limited to:</p>
          <ul className="space-y-1.5 ml-4">
            <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">•</span> Change of mind after purchase</li>
            <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">•</span> Not using the app after payment</li>
            <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">•</span> dissatisfaction with content or features</li>
            <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">•</span> Technical issues on user's device</li>
            <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">•</span> Not achieving desired learning outcomes</li>
            <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">•</span> Accidental purchases</li>
          </ul>
        </div>

        {/* Section 2 */}
        <div>
          <h2 className="text-base font-extrabold text-white mb-2">2. Before You Buy</h2>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-3">
            <p className="text-emerald-300 font-semibold text-sm">✅ Free Trial Available</p>
            <p className="mt-1">We offer 25 free sentences as a trial. Try the app before you pay. This ensures you know exactly what you're getting.</p>
          </div>
          <p className="mb-2">We strongly recommend:</p>
          <ul className="space-y-1.5 ml-4">
            <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">•</span> Try the free 25 sentences first</li>
            <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">•</span> Check if the app works on your device</li>
            <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">•</span> Make sure you understand what's included</li>
            <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">•</span> Choose the shortest plan if you're unsure</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div>
          <h2 className="text-base font-extrabold text-white mb-2">3. Payment Terms</h2>
          <ul className="space-y-1.5 ml-4">
            <li className="flex items-start gap-2"><span className="text-brand-400 mt-0.5">•</span> All plans are <strong className="text-white/80">one-time payments</strong> — no recurring charges</li>
            <li className="flex items-start gap-2"><span className="text-brand-400 mt-0.5">•</span> No auto-renewal — you pay once, use for the plan duration</li>
            <li className="flex items-start gap-2"><span className="text-brand-400 mt-0.5">•</span> Payment is processed securely via Razorpay</li>
            <li className="flex items-start gap-2"><span className="text-brand-400 mt-0.5">•</span> Prices are inclusive of all applicable taxes</li>
          </ul>
        </div>

        {/* Section 4 */}
        <div>
          <h2 className="text-base font-extrabold text-white mb-2">4. Payment Failures</h2>
          <p>If your payment fails but amount is deducted, the amount will be automatically refunded by your bank/payment provider within 5-7 business days. SunoBolo does not process these refunds — they are handled by the payment gateway.</p>
        </div>

        {/* Section 5 */}
        <div>
          <h2 className="text-base font-extrabold text-white mb-2">5. Contact for Payment Issues</h2>
          <p>If you have any payment-related issues (failed transaction, duplicate charge), please contact us immediately:</p>
          <p className="mt-2 font-semibold text-white/80">Email: support@sunobolo.com</p>
          <p className="mt-1 text-[12px] text-white/35">We will respond within 48 hours.</p>
        </div>

        {/* Final Warning */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
          <p className="text-amber-300 font-semibold text-sm">⚠️ Please Note</p>
          <p className="mt-1">By making a payment on SunoBolo, you acknowledge and agree to this No Refund Policy.</p>
        </div>
      </div>
    </div>
  );
}
