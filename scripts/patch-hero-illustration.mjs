import fs from 'fs';

const file = 'src/pages/HomePage.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldRight = `          {/* RIGHT — Phone mockup + girl illustration + sticky notes */}
          <div className="hero-v2__right">
            <div className="hero-v2__visual">
              {/* Phone Mockup */}
              <div className="hero-v2__phone">
                <div className="hero-v2__phone-notch" />
                <div className="hero-v2__phone-screen">
                  <div className="hero-v2__phone-counter">1 of 25</div>
                  <div className="hero-v2__phone-progress">
                    <div className="hero-v2__phone-progress-fill" />
                  </div>
                  <p className="hero-v2__phone-label">English Sentence</p>
                  <div className="hero-v2__phone-sentence">
                    <span>I'm going to be a little late.</span>
                    <span className="hero-v2__phone-speaker">🔊</span>
                  </div>
                  <p className="hero-v2__phone-label">Hindi Meaning</p>
                  <div className="hero-v2__phone-hindi">
                    मुझे थोड़ी देर हो जाएगी।
                  </div>
                  <div className="hero-v2__phone-listen">
                    <p>Listen 3 Times</p>
                    <div className="hero-v2__phone-dots">
                      <span className="hero-v2__phone-dot hero-v2__phone-dot--active">🔊 1</span>
                      <span className="hero-v2__phone-dot">🔊 2</span>
                      <span className="hero-v2__phone-dot">🔊 3</span>
                    </div>
                  </div>
                  <div className="hero-v2__phone-speak">
                    <p>Speak 3 Times</p>
                    <div className="hero-v2__phone-dots">
                      <span className="hero-v2__phone-dot hero-v2__phone-dot--active">🎤 1</span>
                      <span className="hero-v2__phone-dot">🎤 2</span>
                      <span className="hero-v2__phone-dot">🎤 3</span>
                    </div>
                  </div>
                  <div className="hero-v2__phone-done">✓ Sentence Complete</div>
                  <div className="hero-v2__phone-next">Next Sentence →</div>
                </div>
              </div>

              {/* Girl illustration (CSS) */}
              <div className="hero-v2__girl">
                <div className="hero-v2__girl-head" />
                <div className="hero-v2__girl-body" />
                <div className="hero-v2__girl-book hero-v2__girl-book--1" />
                <div className="hero-v2__girl-book hero-v2__girl-book--2" />
              </div>

              {/* Sticky notes */}
              <div className="hero-v2__sticky hero-v2__sticky--1">
                Aaj Ka<br />Ek Sentence,<br />Kal Ki Ek<br />Confident<br />Conversation.
              </div>
              <div className="hero-v2__sticky hero-v2__sticky--2">
                Perfect hone ka wait mat kijiye, practice aaj se shuru kijiye. 😊
              </div>
            </div>
          </div>`;

const newRight = `          {/* RIGHT — Hero illustration */}
          <div className="hero-v2__right">
            <img
              src="/hero-illustration.svg"
              alt="SunoBolo English — Suno, Bolo, Repeat. Phone mockup showing practice interface with girl learning."
              className="hero-v2__illustration"
              width={500}
              height={500}
              loading="eager"
            />
          </div>`;

if (code.includes(oldRight)) {
  code = code.replace(oldRight, newRight);
  fs.writeFileSync(file, code, 'utf8');
  console.log('✅ Hero right column replaced with SVG illustration');
} else {
  console.log('❌ Could not find the old right column — manual edit needed');
}
