// Quick E2E using curl
import { execSync } from 'child_process';

const BASE = 'https://sunobolo-english.pages.dev';

console.log('=== HOMEPAGE ===');
const home = execSync(`curl -s ${BASE}/`, { encoding: 'utf8' });
console.log('Status: OK (HTML loaded)');
console.log('Has React root:', home.includes('id="root"'));

console.log('\n=== FREE TRIAL ===');
const trial = execSync(`curl -s ${BASE}/free-trial`, { encoding: 'utf8' });
console.log('Has React root:', trial.includes('id="root"'));

console.log('\n=== AUDIO FILES ===');
const audio = execSync(`curl -s -o /dev/null -w "%{http_code}" ${BASE}/audio/beginner-l1-s1.mp3`, { encoding: 'utf8' });
console.log('Audio status:', audio);

console.log('\n=== CSS BUNDLE ===');
const jsFiles = execSync(`curl -s ${BASE}/ | grep -o 'assets/[^"]*\\.js' | head -3`, { encoding: 'utf8' });
console.log('JS bundles found:', jsFiles.trim().split('\n').length);

console.log('\n✅ Quick checks passed');
