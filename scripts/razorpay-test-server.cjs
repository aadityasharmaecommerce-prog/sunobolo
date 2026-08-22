/**
 * SunoBolo — Razorpay Test Server
 * 
 * Standalone server for testing Razorpay payments locally.
 * Uses TEST keys — no real money charged.
 * 
 * Run: node scripts/razorpay-test-server.js
 * Open: http://localhost:3456
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ══════════════════════════════════════════════════
// RAZORPAY TEST KEYS — SAFE FOR TESTING
// ══════════════════════════════════════════════════
const RAZORPAY_KEY_ID = 'rzp_test_TSMNbCBrplNCWQ';
const RAZORPAY_KEY_SECRET = 'xsmTi5mSzY843o4lmHkA2SYV';

// ══════════════════════════════════════════════════
// PLAN CONFIGURATION
// ══════════════════════════════════════════════════
const PLANS = {
  three_month: { id: 'three_month', name: '3 Months', amount: 59900, durationMonths: 3 },
  six_month:   { id: 'six_month',   name: '6 Months', amount: 99900, durationMonths: 6 },
  one_year:    { id: 'one_year',    name: '1 Year',   amount: 170000, durationMonths: 12 },
};

const PORT = 3456;

// ══════════════════════════════════════════════════
// RAZORPAY API HELPERS
// ══════════════════════════════════════════════════

function razorpayRequest(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
    const postData = body ? JSON.stringify(body) : null;

    const options = {
      hostname: 'api.razorpay.com',
      path: urlPath,
      method: method,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject({ status: res.statusCode, ...json });
          } else {
            resolve(json);
          }
        } catch (e) {
          reject({ error: 'Invalid JSON', raw: data });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

function verifySignature(orderId, paymentId, signature) {
  const expected = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return expected === signature;
}

// ══════════════════════════════════════════════════
// TEST PAGE HTML
// ══════════════════════════════════════════════════

function getTestPageHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SunoBolo — Razorpay Test</title>
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; padding: 20px; min-height: 100vh; }
        .container { max-width: 520px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 24px; }
        .header h1 { font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #6366f1, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .header p { color: #94a3b8; font-size: 14px; margin-top: 4px; }
        .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 24px; margin-bottom: 16px; }
        .badge { display: inline-block; background: #f59e0b; color: #000; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; margin-bottom: 16px; }
        .plan { border: 2px solid #334155; padding: 16px; border-radius: 12px; margin-bottom: 12px; cursor: pointer; transition: all 0.2s; display: flex; justify-content: space-between; align-items: center; }
        .plan:hover { border-color: #6366f1; background: rgba(99,102,241,0.08); }
        .plan.selected { border-color: #6366f1; background: rgba(99,102,241,0.12); }
        .plan h3 { font-size: 16px; font-weight: 700; }
        .plan p { color: #94a3b8; font-size: 13px; margin-top: 2px; }
        .plan .price { font-size: 24px; font-weight: 800; color: #a855f7; }
        .btn { background: linear-gradient(135deg, #6366f1, #a855f7); color: white; border: none; padding: 14px 24px; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; width: 100%; margin-top: 8px; transition: all 0.2s; }
        .btn:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(99,102,241,0.4); }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
        .status { margin-top: 16px; padding: 14px; border-radius: 12px; font-size: 14px; display: none; }
        .status.show { display: block; }
        .status.success { background: rgba(34,197,94,0.15); border: 1px solid #22c55e; color: #4ade80; }
        .status.error { background: rgba(239,68,68,0.15); border: 1px solid #ef4444; color: #fca5a5; }
        .status.info { background: rgba(99,102,241,0.15); border: 1px solid #6366f1; color: #a5b4fc; }
        .test-info { background: #1a1a2e; border: 1px solid #334155; padding: 16px; border-radius: 12px; margin-top: 16px; }
        .test-info h3 { font-size: 14px; margin-bottom: 8px; color: #f59e0b; }
        .test-info table { width: 100%; font-size: 13px; }
        .test-info td { padding: 4px 0; color: #94a3b8; }
        .test-info td:first-child { color: #64748b; width: 100px; }
        .test-info td:last-child { color: #e2e8f0; font-family: monospace; }
        .log { margin-top: 16px; }
        .log-entry { padding: 10px 14px; border-bottom: 1px solid #1e293b; font-size: 13px; display: flex; gap: 10px; align-items: flex-start; }
        .log-entry:last-child { border-bottom: none; }
        .log-entry .icon { font-size: 16px; flex-shrink: 0; }
        .log-entry .text { color: #cbd5e1; line-height: 1.4; }
        .log-entry .time { color: #475569; font-size: 11px; font-family: monospace; flex-shrink: 0; }
        .key-display { background: #0f172a; padding: 8px 12px; border-radius: 8px; font-family: monospace; font-size: 12px; color: #6366f1; margin-top: 8px; word-break: break-all; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎙️ SunoBolo</h1>
            <p>Razorpay Payment Integration Test</p>
            <div class="badge">🧪 TEST MODE — No real money</div>
        </div>

        <div class="card">
            <h2 style="font-size: 18px; margin-bottom: 16px;">Select Plan</h2>
            
            <div class="plan selected" onclick="selectPlan('three_month')" id="plan-three_month">
                <div>
                    <h3>3 Months</h3>
                    <p>Full access to all courses</p>
                </div>
                <div class="price">₹599</div>
            </div>
            
            <div class="plan" onclick="selectPlan('six_month')" id="plan-six_month">
                <div>
                    <h3>6 Months</h3>
                    <p>Best value for learners</p>
                </div>
                <div class="price">₹999</div>
            </div>
            
            <div class="plan" onclick="selectPlan('one_year')" id="plan-one_year">
                <div>
                    <h3>1 Year</h3>
                    <p>Complete learning journey</p>
                </div>
                <div class="price">₹1,700</div>
            </div>

            <button class="btn" onclick="startPayment()" id="pay-btn">Pay ₹599 — Start 3 Months</button>
            
            <div class="status" id="status"></div>
        </div>

        <div class="card">
            <h2 style="font-size: 16px; margin-bottom: 12px;">🧪 Test Card Details</h2>
            <div class="test-info">
                <table>
                    <tr><td>Card</td><td>4111 1111 1111 1111</td></tr>
                    <tr><td>Expiry</td><td>Any future date (12/28)</td></tr>
                    <tr><td>CVV</td><td>Any 3 digits (123)</td></tr>
                    <tr><td>Name</td><td>Any name</td></tr>
                </table>
            </div>
            <div class="test-info" style="margin-top: 8px;">
                <h3>💳 UPI Test</h3>
                <table>
                    <tr><td>UPI ID</td><td>success@razorpay</td></tr>
                </table>
            </div>
        </div>

        <div class="card">
            <h2 style="font-size: 16px; margin-bottom: 4px;">📊 Test Log</h2>
            <div id="log" class="log">
                <div class="log-entry">
                    <span class="time">${new Date().toLocaleTimeString()}</span>
                    <span class="icon">🔑</span>
                    <span class="text">Test key: ${RAZORPAY_KEY_ID}</span>
                </div>
            </div>
        </div>
    </div>

    <script>
        let selectedPlan = 'three_month';

        const plans = {
            three_month: { name: '3 Months', amount: 59900, display: '₹599' },
            six_month: { name: '6 Months', amount: 99900, display: '₹999' },
            one_year: { name: '1 Year', amount: 170000, display: '₹1,700' },
        };

        function selectPlan(planId) {
            selectedPlan = planId;
            document.querySelectorAll('.plan').forEach(p => p.classList.remove('selected'));
            document.getElementById('plan-' + planId).classList.add('selected');
            document.getElementById('pay-btn').textContent = 'Pay ' + plans[planId].display + ' — Start ' + plans[planId].name;
        }

        function showStatus(type, msg) {
            const el = document.getElementById('status');
            el.className = 'status show ' + type;
            el.textContent = msg;
        }

        function addLog(icon, text) {
            const log = document.getElementById('log');
            const entry = document.createElement('div');
            entry.className = 'log-entry';
            entry.innerHTML = '<span class="time">' + new Date().toLocaleTimeString() + '</span><span class="icon">' + icon + '</span><span class="text">' + text + '</span>';
            log.appendChild(entry);
        }

        async function startPayment() {
            const btn = document.getElementById('pay-btn');
            btn.disabled = true;
            btn.textContent = 'Creating order...';
            showStatus('info', 'Creating Razorpay order...');
            addLog('⏳', 'Creating order for ' + plans[selectedPlan].name + '...');

            try {
                // 1. Create order on server
                const res = await fetch('/api/create-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ planId: selectedPlan }),
                });

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || 'Failed to create order');
                }

                const orderData = await res.json();
                addLog('✅', 'Order created: ' + orderData.orderId);
                showStatus('info', 'Order created! Opening Razorpay...');
                btn.textContent = 'Opening Razorpay...';

                // 2. Open Razorpay checkout
                const options = {
                    key: '${RAZORPAY_KEY_ID}',
                    amount: orderData.amount,
                    currency: 'INR',
                    name: 'SunoBolo English',
                    description: plans[selectedPlan].name + ' — Test Payment',
                    order_id: orderData.orderId,
                    handler: async function(response) {
                        addLog('💰', 'Payment ID: ' + response.razorpay_payment_id);
                        showStatus('info', 'Payment successful! Verifying...');
                        btn.textContent = 'Verifying...';

                        try {
                            // 3. Verify payment
                            const verifyRes = await fetch('/api/verify', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature,
                                    planId: selectedPlan,
                                }),
                            });

                            if (verifyRes.ok) {
                                const result = await verifyRes.json();
                                showStatus('success', '✅ Payment verified! Subscription active for ' + plans[selectedPlan].name);
                                addLog('🎉', 'Payment VERIFIED — Subscription activated!');
                                addLog('📅', 'Expires: ' + result.expiresAt);
                            } else {
                                const err = await verifyRes.json();
                                showStatus('error', '❌ Verification failed: ' + err.error);
                                addLog('❌', 'Verification failed: ' + err.error);
                            }
                        } catch (e) {
                            showStatus('error', '❌ Verification error: ' + e.message);
                            addLog('❌', 'Verification error: ' + e.message);
                        }
                        btn.disabled = false;
                        btn.textContent = 'Pay ' + plans[selectedPlan].display + ' — Start ' + plans[selectedPlan].name;
                    },
                    prefill: {
                        name: 'Test User',
                        email: 'test@sunobolo.com',
                    },
                    theme: {
                        color: '#6366f1',
                    },
                    modal: {
                        ondismiss: function() {
                            showStatus('info', 'Payment cancelled');
                            addLog('🚫', 'Payment modal closed by user');
                            btn.disabled = false;
                            btn.textContent = 'Pay ' + plans[selectedPlan].display + ' — Start ' + plans[selectedPlan].name;
                        }
                    }
                };

                const rzp = new Razorpay(options);
                rzp.on('payment.failed', function(response) {
                    showStatus('error', '❌ Payment failed: ' + response.error.description);
                    addLog('❌', 'Payment FAILED: ' + response.error.description);
                    btn.disabled = false;
                    btn.textContent = 'Pay ' + plans[selectedPlan].display + ' — Start ' + plans[selectedPlan].name;
                });
                rzp.open();

            } catch (error) {
                showStatus('error', '❌ Error: ' + error.message);
                addLog('❌', 'Error: ' + error.message);
                btn.disabled = false;
                btn.textContent = 'Pay ' + plans[selectedPlan].display + ' — Start ' + plans[selectedPlan].name;
            }
        }
    </script>
</body>
</html>`;
}

// ══════════════════════════════════════════════════
// HTTP SERVER
// ══════════════════════════════════════════════════

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // ── Serve test page ──
  if (url.pathname === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(getTestPageHTML());
    return;
  }

  // ── Health check ──
  if (url.pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, mode: 'test', keyId: RAZORPAY_KEY_ID }));
    return;
  }

  // ── Create order ──
  if (url.pathname === '/api/create-order' && req.method === 'POST') {
    try {
      const body = await readBody(req);
      const { planId } = JSON.parse(body);

      const plan = PLANS[planId];
      if (!plan) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid plan. Use: three_month, six_month, one_year' }));
        return;
      }

      console.log(`📋 Creating order: ${plan.name} (₹${plan.amount / 100})`);
      const order = await razorpayRequest('POST', '/v1/orders', {
        amount: plan.amount,
        currency: 'INR',
        receipt: `sb_test_${Date.now()}`,
      });

      console.log(`✅ Order created: ${order.id}`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        planId: plan.id,
      }));
    } catch (e) {
      console.error('❌ Create order error:', e);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.error?.description || e.message || 'Failed to create order' }));
    }
    return;
  }

  // ── Verify payment ──
  if (url.pathname === '/api/verify' && req.method === 'POST') {
    try {
      const body = await readBody(req);
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = JSON.parse(body);

      console.log(`🔍 Verifying payment: ${razorpay_payment_id}`);

      // 1. Verify signature locally
      const isValid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
      if (!isValid) {
        console.error('❌ Signature mismatch!');
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Payment signature verification failed' }));
        return;
      }
      console.log('✅ Signature verified');

      // 2. Fetch payment from Razorpay to confirm
      const payment = await razorpayRequest('GET', `/v1/payments/${razorpay_payment_id}`);
      console.log(`💳 Payment status: ${payment.status}, amount: ₹${payment.amount / 100}`);

      if (payment.status !== 'captured' && payment.status !== 'authorized') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Payment not captured: ' + payment.status }));
        return;
      }

      // 3. Calculate subscription expiry
      const plan = PLANS[planId];
      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setMonth(expiresAt.getMonth() + (plan ? plan.durationMonths : 3));

      console.log(`🎉 Payment verified! Subscription active until ${expiresAt.toISOString()}`);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        verified: true,
        planId: planId,
        expiresAt: expiresAt.toISOString(),
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        amount: payment.amount / 100,
      }));
    } catch (e) {
      console.error('❌ Verify error:', e);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.error?.description || e.message || 'Verification failed' }));
    }
    return;
  }

  // ── 404 ──
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

server.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║   🎙️  SunoBolo — Razorpay TEST Server          ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║   🌐 URL:  http://localhost:${PORT}                ║`);
  console.log(`║   🔑 Key:  ${RAZORPAY_KEY_ID}     ║`);
  console.log('║   ⚠️  MODE: TEST — No real money charged        ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log('║   Test Card: 4111 1111 1111 1111                ║');
  console.log('║   UPI:       success@razorpay                   ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
});
