import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPolicy() {
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
          <Shield size={18} className="text-brand-400" />
          <h1 className="text-lg font-extrabold text-white">Privacy Policy</h1>
        </div>
      </div>

      <p className="text-[12px] text-white/30">Last updated: August 2026</p>

      <div className="dark-card p-6 space-y-6 text-[14px] text-white/60 leading-relaxed">
        {/* Section 1 */}
        <div>
          <h2 className="text-base font-extrabold text-white mb-2">1. Information We Collect</h2>
          <p className="mb-2">When you use SunoBolo, we may collect:</p>
          <ul className="space-y-1.5 ml-4">
            <li className="flex items-start gap-2"><span className="text-brand-400 mt-0.5">•</span> Phone number or email (for account creation)</li>
            <li className="flex items-start gap-2"><span className="text-brand-400 mt-0.5">•</span> Name (for personalized experience)</li>
            <li className="flex items-start gap-2"><span className="text-brand-400 mt-0.5">•</span> Usage data (lessons completed, progress, streaks)</li>
            <li className="flex items-start gap-2"><span className="text-brand-400 mt-0.5">•</span> Device information (browser type, OS)</li>
          </ul>
        </div>

        {/* Section 2 */}
        <div>
          <h2 className="text-base font-extrabold text-white mb-2">2. How We Use Your Information</h2>
          <p className="mb-2">We use your data to:</p>
          <ul className="space-y-1.5 ml-4">
            <li className="flex items-start gap-2"><span className="text-brand-400 mt-0.5">•</span> Provide and improve the learning experience</li>
            <li className="flex items-start gap-2"><span className="text-brand-400 mt-0.5">•</span> Track your progress and learning streaks</li>
            <li className="flex items-start gap-2"><span className="text-brand-400 mt-0.5">•</span> Send important app updates and notifications</li>
            <li className="flex items-start gap-2"><span className="text-brand-400 mt-0.5">•</span> Process payments securely</li>
            <li className="flex items-start gap-2"><span className="text-brand-400 mt-0.5">•</span> Improve app performance and fix bugs</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div>
          <h2 className="text-base font-extrabold text-white mb-2">3. Data Security</h2>
          <p>Your data is stored securely using industry-standard encryption. We use secure servers and follow best practices to protect your personal information. We do NOT sell your data to any third parties.</p>
        </div>

        {/* Section 4 */}
        <div>
          <h2 className="text-base font-extrabold text-white mb-2">4. Third-Party Services</h2>
          <p className="mb-2">We use the following third-party services:</p>
          <ul className="space-y-1.5 ml-4">
            <li className="flex items-start gap-2"><span className="text-brand-400 mt-0.5">•</span> <strong className="text-white/80">Sarvam AI</strong> — for premium text-to-speech voice generation</li>
            <li className="flex items-start gap-2"><span className="text-brand-400 mt-0.5">•</span> <strong className="text-white/80">Razorpay</strong> — for secure payment processing</li>
            <li className="flex items-start gap-2"><span className="text-brand-400 mt-0.5">•</span> <strong className="text-white/80">Cloudflare</strong> — for hosting and security</li>
          </ul>
          <p className="mt-2">These services may collect data as per their own privacy policies.</p>
        </div>

        {/* Section 5 */}
        <div>
          <h2 className="text-base font-extrabold text-white mb-2">5. Your Rights</h2>
          <ul className="space-y-1.5 ml-4">
            <li className="flex items-start gap-2"><span className="text-brand-400 mt-0.5">•</span> You can request deletion of your account and data</li>
            <li className="flex items-start gap-2"><span className="text-brand-400 mt-0.5">•</span> You can opt out of non-essential notifications</li>
            <li className="flex items-start gap-2"><span className="text-brand-400 mt-0.5">•</span> You can request a copy of your data</li>
          </ul>
        </div>

        {/* Section 6 */}
        <div>
          <h2 className="text-base font-extrabold text-white mb-2">6. Children's Privacy</h2>
          <p>SunoBolo is suitable for users aged 13 and above. We do not knowingly collect personal information from children under 13.</p>
        </div>

        {/* Section 7 */}
        <div>
          <h2 className="text-base font-extrabold text-white mb-2">7. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of any significant changes through the app or email.</p>
        </div>

        {/* Section 8 */}
        <div>
          <h2 className="text-base font-extrabold text-white mb-2">8. Contact Us</h2>
          <p>For any privacy-related concerns, please contact us at:</p>
          <p className="mt-2 font-semibold text-white/80">Email: support@sunobolo.com</p>
        </div>
      </div>
    </div>
  );
}
