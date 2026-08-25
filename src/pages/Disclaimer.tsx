import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

export default function Disclaimer() {
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
          <AlertTriangle size={18} className="text-amber-400" />
          <h1 className="text-lg font-extrabold text-white">Disclaimer</h1>
        </div>
      </div>

      <p className="text-[12px] text-white/30">Last updated: August 2026</p>

      <div className="dark-card p-6 space-y-6 text-[14px] text-white/60 leading-relaxed">
        {/* Section 1 */}
        <div>
          <h2 className="text-base font-extrabold text-white mb-2">1. General Information</h2>
          <p>SunoBolo is an English learning application designed to help Hindi-speaking users improve their English speaking, listening, and reading skills. The content provided in the app is for educational purposes only.</p>
        </div>

        {/* Section 2 */}
        <div>
          <h2 className="text-base font-extrabold text-white mb-2">2. No Guarantee of Results</h2>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-3">
            <p className="text-amber-300 font-semibold text-sm">⚠️ Important Notice</p>
            <p className="mt-1">SunoBolo does NOT guarantee specific results such as fluency, job placement, exam success, or any particular level of English proficiency.</p>
          </div>
          <p className="mb-2">Learning outcomes depend on various factors including:</p>
          <ul className="space-y-1.5 ml-4">
            <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">•</span> Individual effort and consistency</li>
            <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">•</span> Time spent practicing daily</li>
            <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">•</span> Prior knowledge and learning pace</li>
            <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">•</span> External practice and real-world usage</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div>
          <h2 className="text-base font-extrabold text-white mb-2">3. Audio & Voice</h2>
          <p>The premium voice feature uses Sarvam AI text-to-speech technology. While we strive for natural-sounding audio, voice quality may vary based on device, browser, and internet connection.</p>
        </div>

        {/* Section 4 */}
        <div>
          <h2 className="text-base font-extrabold text-white mb-2">4. Testimonials</h2>
          <p>Testimonials and reviews shown in the app represent individual experiences. Results may vary from person to person. Testimonials are not guarantees of future results.</p>
        </div>

        {/* Section 5 */}
        <div>
          <h2 className="text-base font-extrabold text-white mb-2">5. External Links</h2>
          <p>SunoBolo may contain links to external websites or services. We are not responsible for the content, privacy practices, or availability of these external sites.</p>
        </div>

        {/* Section 6 */}
        <div>
          <h2 className="text-base font-extrabold text-white mb-2">6. Intellectual Property</h2>
          <p>All content, design, code, audio, and branding of SunoBolo are the intellectual property of SunoBolo. Users may not copy, distribute, or reproduce any content without written permission.</p>
        </div>

        {/* Section 7 */}
        <div>
          <h2 className="text-base font-extrabold text-white mb-2">7. Limitation of Liability</h2>
          <p>SunoBolo shall not be held liable for any direct, indirect, incidental, or consequential damages arising from the use of the app. The app is provided "as is" without warranties of any kind.</p>
        </div>

        {/* Section 8 */}
        <div>
          <h2 className="text-base font-extrabold text-white mb-2">8. Contact</h2>
          <p>For questions about this disclaimer, contact us at:</p>
          <p className="mt-2 font-semibold text-white/80">Email: support@sunobolo.com</p>
        </div>
      </div>
    </div>
  );
}
