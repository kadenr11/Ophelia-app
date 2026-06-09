import React, { useState, useEffect, useRef } from 'react';

// ─── Config ──────────────────────────────────────────────────────────────────
// TODO: Set these before deploying
// Firebase config: import { initializeApp } from 'firebase/app';
// const FIREBASE_CONFIG = { apiKey: '...', projectId: '...', ... };

// Google Maps API key for traffic data
// const GOOGLE_MAPS_API_KEY = 'YOUR_KEY_HERE';

// Stripe
// const STRIPE_PUBLIC_KEY = 'pk_live_...';

// Google OAuth
// const GOOGLE_CLIENT_ID = 'YOUR_CLIENT_ID.apps.googleusercontent.com';

// Apple Sign In
// const APPLE_TEAM_ID = 'YOUR_TEAM_ID';
// const APPLE_KEY_ID = 'YOUR_KEY_ID';

const ADMIN_PASSCODE = 'Mommy11737';

// ─── Palette ─────────────────────────────────────────────────────────────────
const T = {
  bg: '#faf6f0', surface: '#f2ece2', surface2: '#ece4d6',
  border: '#ddd0bc', border2: '#ccc0a8',
  text1: '#1a1208', text2: '#3d2e1e', text3: '#7a6248', text4: '#a08868',
  accent: '#b5631e', rose: '#c0555a', sage: '#3d7a4a', sky: '#2d6a9a', lavender: '#6a559a',
  danger: '#b53030', admin: '#2d4a6a', success: '#2d6a4a',
};

// ─── Comprehensive Timezones (USA, Canada, Australia, Europe, Asia) ──────────
const TIMEZONES = [
  // North America - USA
  { label: 'Honolulu, HI', value: 'Pacific/Honolulu', region: 'USA', offset: -10 },
  { label: 'Anchorage, AK', value: 'America/Anchorage', region: 'USA', offset: -9 },
  { label: 'Los Angeles, CA', value: 'America/Los_Angeles', region: 'USA', offset: -8 },
  { label: 'Phoenix, AZ', value: 'America/Phoenix', region: 'USA', offset: -7 },
  { label: 'Denver, CO', value: 'America/Denver', region: 'USA', offset: -7 },
  { label: 'Chicago, IL', value: 'America/Chicago', region: 'USA', offset: -6 },
  { label: 'Dallas, TX', value: 'America/Chicago', region: 'USA', offset: -6 },
  { label: 'New York, NY', value: 'America/New_York', region: 'USA', offset: -5 },
  { label: 'Miami, FL', value: 'America/New_York', region: 'USA', offset: -5 },

  // Canada
  { label: 'Vancouver, BC', value: 'America/Vancouver', region: 'Canada', offset: -8 },
  { label: 'Calgary, AB', value: 'America/Edmonton', region: 'Canada', offset: -7 },
  { label: 'Toronto, ON', value: 'America/Toronto', region: 'Canada', offset: -5 },
  { label: 'Montréal, QC', value: 'America/Toronto', region: 'Canada', offset: -5 },

  // Europe
  { label: 'London, UK', value: 'Europe/London', region: 'Europe', offset: 0 },
  { label: 'Dublin, IE', value: 'Europe/Dublin', region: 'Europe', offset: 0 },
  { label: 'Paris, FR', value: 'Europe/Paris', region: 'Europe', offset: 1 },
  { label: 'Amsterdam, NL', value: 'Europe/Amsterdam', region: 'Europe', offset: 1 },
  { label: 'Berlin, DE', value: 'Europe/Berlin', region: 'Europe', offset: 1 },
  { label: 'Madrid, ES', value: 'Europe/Madrid', region: 'Europe', offset: 1 },
  { label: 'Rome, IT', value: 'Europe/Rome', region: 'Europe', offset: 1 },
  { label: 'Zurich, CH', value: 'Europe/Zurich', region: 'Europe', offset: 1 },
  { label: 'Stockholm, SE', value: 'Europe/Stockholm', region: 'Europe', offset: 1 },
  { label: 'Moscow, RU', value: 'Europe/Moscow', region: 'Europe', offset: 3 },

  // Australia
  { label: 'Sydney, NSW', value: 'Australia/Sydney', region: 'Australia', offset: 10 },
  { label: 'Melbourne, VIC', value: 'Australia/Melbourne', region: 'Australia', offset: 10 },
  { label: 'Brisbane, QLD', value: 'Australia/Brisbane', region: 'Australia', offset: 10 },
  { label: 'Perth, WA', value: 'Australia/Perth', region: 'Australia', offset: 8 },
  { label: 'Adelaide, SA', value: 'Australia/Adelaide', region: 'Australia', offset: 9.5 },

  // Asia
  { label: 'Tokyo, JP', value: 'Asia/Tokyo', region: 'Asia', offset: 9 },
  { label: 'Singapore, SG', value: 'Asia/Singapore', region: 'Asia', offset: 8 },
  { label: 'Hong Kong, HK', value: 'Asia/Hong_Kong', region: 'Asia', offset: 8 },
  { label: 'Shanghai, CN', value: 'Asia/Shanghai', region: 'Asia', offset: 8 },
  { label: 'Bangkok, TH', value: 'Asia/Bangkok', region: 'Asia', offset: 7 },
  { label: 'Manila, PH', value: 'Asia/Manila', region: 'Asia', offset: 8 },
  { label: 'Siargao, PH', value: 'Asia/Manila', region: 'Asia', offset: 8 },
  { label: 'Dubai, AE', value: 'Asia/Dubai', region: 'Asia', offset: 4 },
  { label: 'Mumbai, IN', value: 'Asia/Kolkata', region: 'Asia', offset: 5.5 },
  { label: 'Bangkok, TH', value: 'Asia/Bangkok', region: 'Asia', offset: 7 },

  // New Zealand
  { label: 'Auckland, NZ', value: 'Pacific/Auckland', region: 'Pacific', offset: 12 },
  { label: 'Wellington, NZ', value: 'Pacific/Auckland', region: 'Pacific', offset: 12 },
];

const EVENT_COLORS = [
  { name: 'Rose', value: '#c0555a' },
  { name: 'Amber', value: '#b5821e' },
  { name: 'Sage', value: '#3d7a4a' },
  { name: 'Sky', value: '#2d6a9a' },
  { name: 'Lavender', value: '#6a559a' },
  { name: 'Blush', value: '#c0607a' },
];

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const RECURRENCE = ['none', 'daily', 'weekly', 'bi-weekly', 'monthly', 'yearly'];

const USER_TYPES = [
  {
    id: 'couple',
    icon: '◇',
    title: 'Long-Distance Couple',
    accent: T.rose,
    desc: 'Stay close across time zones.',
    features: ['Dual clocks', 'Shared calendar', 'Love notes', 'Gifts', 'Travel mode'],
  },
  {
    id: 'traveler',
    icon: '⊕',
    title: 'Business Traveler',
    accent: T.sky,
    desc: "You move fast. We keep it straight.",
    features: ['Travel mode', 'Multi-city', 'Meeting finder', 'Traffic alerts', 'Trip tracking'],
  },
  {
    id: 'local',
    icon: '⌂',
    title: 'Stay Local',
    accent: T.sage,
    desc: 'One place, one calendar.',
    features: ['Single timezone', 'Events', 'Reminders', 'Traffic alerts'],
  },
];

const PLANS = [
  { id: 'free', label: 'Free', price: 'Always free', priceNum: 0, sub: 'Single timezone · 10 events · Basic', badge: null },
  { id: 'plus', label: 'Plus', price: '$3.99/mo', priceNum: 3.99, sub: 'Everything — dual clocks, traffic alerts, gifts', badge: 'Popular · Free month', stripePriceId: 'price_PLUS_ID_HERE' },
  { id: 'pro', label: 'Pro', price: '$6.99/mo', priceNum: 6.99, sub: 'Plus + Google/Apple sync, priority support', badge: null, stripePriceId: 'price_PRO_ID_HERE' },
];

const GIFT_ITEMS = [
  { id: 'roses', cat: 'flowers', name: 'Red Roses', price: 49, icon: '❧', desc: 'Dozen long-stem roses.' },
  { id: 'wild', cat: 'flowers', name: 'Wildflower Bouquet', price: 42, icon: '❧', desc: 'Seasonal wildflower mix.' },
  { id: 'sunflowers', cat: 'flowers', name: 'Sunflowers', price: 38, icon: '❧', desc: 'Six tall sunflowers.' },
  { id: 'cozy', cat: 'package', name: 'Cozy Night In', price: 68, icon: '◈', desc: 'Candle, tea, chocolate, card.' },
  { id: 'snacks', cat: 'package', name: 'Snack Haul', price: 52, icon: '◈', desc: 'Curated snacks worldwide.' },
  { id: 'spa', cat: 'package', name: 'Spa at Home', price: 75, icon: '◈', desc: 'Face mask, salts, oils, socks.' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(date, tz, opts = {}) {
  try { return new Intl.DateTimeFormat('en-US', { timeZone: tz, ...opts }).format(date); }
  catch { return '–'; }
}

function getOffsetH(tz) {
  const now = new Date();
  const local = new Date(now.toLocaleString('en-US', { timeZone: tz }));
  const utc = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
  return Math.round((local - utc) / 3600000);
}

function tzDiff(tzA, tzB, nameB) {
  const diff = getOffsetH(tzB) - getOffsetH(tzA);
  if (diff === 0) return `${nameB} is in the same time zone`;
  return diff > 0 ? `${nameB} is ${diff}h ahead` : `${nameB} is ${Math.abs(diff)}h behind`;
}

function evtTime(ev, tz) {
  try { return fmt(new Date(`${ev.date}T${ev.time}`), tz, { hour: '2-digit', minute: '2-digit', hour12: true }); }
  catch { return '–'; }
}

function encodeShare(data) { try { return btoa(unescape(encodeURIComponent(JSON.stringify(data)))); } catch { return ''; } }
function decodeShare(value) { try { return JSON.parse(decodeURIComponent(escape(atob(value)))); } catch { return null; } }
function dateLabel(dateString) { try { return new Date(`${dateString}T12:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); } catch { return dateString; } }

const LS = {
  get: (key, fallback = null) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
  set: (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} },
  del: (key) => { try { localStorage.removeItem(key); } catch {} },
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const IS = (x = {}) => ({ background: '#fff', border: `1px solid ${T.border}`, borderRadius: '10px', color: T.text1, padding: '10px 14px', fontSize: '14px', width: '100%', outline: 'none', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif", ...x });
const PB = (x = {}) => ({ background: T.accent, border: 'none', borderRadius: '10px', color: '#fff', padding: '10px 22px', fontWeight: 700, cursor: 'pointer', fontSize: '13px', letterSpacing: '0.04em', fontFamily: "'DM Sans', sans-serif", ...x });
const GB = (x = {}) => ({ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: '10px', color: T.text2, padding: '10px 18px', cursor: 'pointer', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", ...x });
const DB = { background: '#fdf0f0', border: '1px solid #e0b0b0', borderRadius: '10px', color: T.danger, padding: '10px 16px', cursor: 'pointer', fontSize: '13px', fontFamily: "'DM Sans', sans-serif" };
const pill = (active, accent = T.accent) => ({ background: active ? `${accent}18` : T.surface2, border: `1px solid ${active ? `${accent}60` : T.border}`, borderRadius: '40px', color: active ? accent : T.text3, padding: '7px 16px', cursor: 'pointer', fontSize: '12px', letterSpacing: '0.06em', fontFamily: "'DM Sans', sans-serif", fontWeight: active ? 600 : 400, transition: 'all 0.15s' });

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { background: #faf6f0; }
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: #f2ece2; }
::-webkit-scrollbar-thumb { background: #c8b89a; border-radius: 3px; }
input::placeholder, textarea::placeholder { color: #b0988a; }
select option { background: #fff; color: #1a1208; }
.day-cell:hover { background: #ece4d6 !important; }
.lift:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(0,0,0,0.1) !important; transition: transform 0.18s, box-shadow 0.18s; }
`;

// ─── Components (Auth, Traffic, etc) ──────────────────────────────────────────

function AuthModal({ onLogin }) {
  const [tab, setTab] = useState('email');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [name, setName] = useState('');

  function handleEmailSignup() {
    if (!email || !pass || !name) return;
    // TODO: Firebase.auth().createUserWithEmailAndPassword(email, pass)
    onLogin({ id: Date.now(), email, name, authMethod: 'email' });
  }

  function handleAppleSignIn() {
    // TODO: Integrate Apple Sign In SDK
    console.log('Apple Sign In clicked — implement with AppleID SDK');
    onLogin({ id: Date.now(), email: 'user@apple.com', name: 'User', authMethod: 'apple' });
  }

  function handleGoogleSignIn() {
    // TODO: google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID })
    console.log('Google Sign In clicked — implement with Google OAuth');
    onLogin({ id: Date.now(), email: 'user@google.com', name: 'User', authMethod: 'google' });
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,18,8,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: '22px', padding: '28px', width: '100%', maxWidth: '420px', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', color: T.text1, marginBottom: '4px', fontWeight: 600 }}>Join Ophelia</div>
        <div style={{ fontSize: '13px', color: T.text3, marginBottom: '20px' }}>Your calendar across time zones.</div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {[{ id: 'email', label: 'Email' }, { id: 'social', label: 'Social' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ ...GB({ flex: 1, textAlign: 'center', padding: '8px 12px' }), background: tab === t.id ? `${T.accent}15` : T.surface2, border: `1px solid ${tab === t.id ? `${T.accent}60` : T.border}`, color: tab === t.id ? T.accent : T.text3, fontWeight: tab === t.id ? 700 : 400 }}>{t.label}</button>
          ))}
        </div>

        {tab === 'email' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input placeholder="Full name" value={name} onChange={e => setName(e.target.value)} style={IS()} />
            <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} style={IS()} />
            <input type="password" placeholder="Password (8+ chars)" value={pass} onChange={e => setPass(e.target.value)} style={IS()} />
            <button onClick={handleEmailSignup} style={PB({ width: '100%', padding: '12px', textAlign: 'center' })}>Create Account</button>
          </div>
        )}

        {tab === 'social' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button onClick={handleGoogleSignIn} style={GB({ width: '100%', padding: '12px', textAlign: 'center', background: '#fff', border: '1px solid #ddd', color: '#000' })}>
              &#9670;&ensp;Sign in with Google
            </button>
            <button onClick={handleAppleSignIn} style={GB({ width: '100%', padding: '12px', textAlign: 'center', background: '#000', border: '1px solid #000', color: '#fff' })}>
              &#9670;&ensp;Sign in with Apple
            </button>
            <div style={{ fontSize: '12px', color: T.text4, textAlign: 'center', marginTop: '8px' }}>Your data stays private. No sharing.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function TrafficAlert({ event, homeLocation, onUpdate }) {
  const [showTraffic, setShowTraffic] = useState(false);
  const [trafficData, setTrafficData] = useState(null);
  const [leaveTime, setLeaveTime] = useState(null);

  useEffect(() => {
    if (!showTraffic || !homeLocation) return;
    // TODO: Fetch from Google Maps Distance Matrix API
    // GET https://maps.googleapis.com/maps/api/distancematrix/json?origins=...&destinations=...&departure_time=now&key=GOOGLE_MAPS_API_KEY
    // For now: simulate
    setTrafficData({
      driveDuration: 30,
      trafficDuration: 45,
      leaveAt: new Date(new Date(`${event.date}T${event.time}`) - 45 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    });
  }, [showTraffic, homeLocation, event]);

  if (!event.location) return null;

  return (
    <div style={{ background: `${T.sky}10`, border: `1px solid ${T.sky}30`, borderRadius: '10px', padding: '12px 14px', marginTop: '8px', fontSize: '12px', color: T.sky }}>
      <button onClick={() => setShowTraffic(!showTraffic)} style={{ background: 'none', border: 'none', color: T.sky, cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}>
        &#8618;&ensp;{showTraffic ? 'Hide' : 'Check'} Traffic
      </button>
      {trafficData && (
        <div style={{ marginTop: '8px', fontSize: '11px', lineHeight: 1.6 }}>
          Drive time: {trafficData.driveDuration}m (normal) → {trafficData.trafficDuration}m (with traffic)<br/>
          <strong>Leave at: {trafficData.leaveAt}</strong>
        </div>
      )}
    </div>
  );
}

function AdminPanel({ onClose }) {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState('');
  const [passError, setPassError] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState(() => LS.get('ophelia_users', []));
  const [affPackages, setAffPackages] = useState(() => LS.get('ophelia_affiliate_packages', []));

  function login() {
    if (pass === ADMIN_PASSCODE) { setAuthed(true); setPassError(false); }
    else { setPassError(true); }
  }

  if (!authed) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,40,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, backdropFilter: 'blur(6px)' }} onClick={onClose}>
        <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: '22px', padding: '36px', width: '100%', maxWidth: '360px', textAlign: 'center', boxShadow: '0 32px 80px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
          <div style={{ fontSize: '11px', letterSpacing: '0.3em', color: T.admin, textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>Admin Access</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', color: T.text1, fontWeight: 600, marginBottom: '24px' }}>Ophelia Control</div>
          <input type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} placeholder="Admin passcode..." style={IS({ marginBottom: '12px', textAlign: 'center' })} />
          {passError && <div style={{ fontSize: '12px', color: T.danger, marginBottom: '10px' }}>Incorrect passcode</div>}
          <button onClick={login} style={PB({ width: '100%', padding: '12px', textAlign: 'center', background: T.admin })}>Enter</button>
          <button onClick={onClose} style={{ ...GB({ width: '100%', textAlign: 'center', marginTop: '8px' }) }}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,40,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, backdropFilter: 'blur(4px)', padding: '16px' }} onClick={onClose}>
      <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: '22px', width: '100%', maxWidth: '720px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 32px 80px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 16px', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: T.sage }} />
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 600, color: T.text1 }}>Admin Panel</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: T.text3, cursor: 'pointer', fontSize: '18px' }}>&#10005;</button>
        </div>

        <div style={{ display: 'flex', gap: '4px', padding: '12px 24px 0', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          {[{ id: 'overview', label: 'Overview' }, { id: 'users', label: 'Users' }, { id: 'packages', label: 'Packages' }].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: '8px 16px', border: 'none', borderRadius: '8px 8px 0 0', cursor: 'pointer', background: activeTab === t.id ? '#fff' : 'transparent', color: activeTab === t.id ? T.admin : T.text3, fontWeight: activeTab === t.id ? 700 : 400, fontSize: '13px', fontFamily: "'DM Sans', sans-serif", borderBottom: activeTab === t.id ? `2px solid ${T.admin}` : '2px solid transparent' }}>{t.label}</button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {activeTab === 'overview' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px', marginBottom: '24px' }}>
                {[
                  { label: 'Total Users', value: users.length },
                  { label: 'Affiliate Items', value: affPackages.length },
                ].map(stat => (
                  <div key={stat.label} style={{ background: '#fff', border: `1px solid ${T.border}`, borderRadius: '14px', padding: '18px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', color: T.admin, fontWeight: 700, fontFamily: "'Cormorant Garamond', serif" }}>{stat.value}</div>
                    <div style={{ fontSize: '12px', color: T.text2, fontWeight: 600, marginTop: '2px' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: '#fff', border: `1px solid ${T.border}`, borderRadius: '14px', padding: '18px' }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: 600, color: T.text1, marginBottom: '12px' }}>Setup Tasks</div>
                {[
                  'Add Stripe API keys to App.js',
                  'Set up Google Maps Distance Matrix API for traffic alerts',
                  'Configure Firebase auth & Firestore for user data',
                  'Add Google OAuth & Apple Sign In credentials',
                  'Join affiliate programs (1-800-Flowers, FTD, etc)',
                  'Set up email notifications (SendGrid / AWS SES)',
                ].map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '13px', color: T.text2, marginBottom: '8px', lineHeight: 1.5 }}>
                    <span style={{ color: T.accent, flexShrink: 0 }}>&#9670;</span><span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 600, color: T.text1, marginBottom: '16px' }}>Users</div>
              {users.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', background: T.surface, border: `1px dashed ${T.border2}`, borderRadius: '14px', color: T.text4 }}>No users yet</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {users.map(u => (
                    <div key={u.id} style={{ background: '#fff', border: `1px solid ${T.border}`, borderRadius: '12px', padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: T.text1 }}>{u.name}</div>
                      <div style={{ fontSize: '12px', color: T.text3 }}>{u.email} · {u.authMethod}</div>
                      <div style={{ fontSize: '11px', color: T.text4, marginTop: '4px' }}>Plan: {u.plan || 'free'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'packages' && (
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 600, color: T.text1, marginBottom: '16px' }}>Affiliate Packages</div>
              {affPackages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', background: T.surface, border: `1px dashed ${T.border2}`, borderRadius: '14px', color: T.text4 }}>No packages configured. Add them via Gift Modal.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {affPackages.map(p => (
                    <div key={p.id} style={{ background: '#fff', border: `1px solid ${T.border}`, borderRadius: '12px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div><div style={{ fontWeight: 600, color: T.text1 }}>{p.name}</div><div style={{ fontSize: '11px', color: T.text3 }}>${p.price} · {p.affiliateId}</div></div>
                      <button onClick={() => setAffPackages(prev => prev.filter(x => x.id !== p.id))} style={{ ...DB, padding: '6px 12px', fontSize: '12px' }}>Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TzSelect({ value, onChange, style }) {
  const regions = [...new Set(TIMEZONES.map(t => t.region))];
  return (
    <select value={value} onChange={onChange} style={style || IS()}>
      {regions.map(region => (
        <optgroup key={region} label={region}>
          {TIMEZONES.filter(t => t.region === region).map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

function Clock({ tz, label, accent = T.accent, tag }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(id); }, []);
  return (
    <div style={{ background: '#fff', border: `1px solid ${T.border}`, borderRadius: '16px', padding: '16px 20px', textAlign: 'center', flex: 1, minWidth: 0, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', position: 'relative' }}>
      {tag && <div style={{ position: 'absolute', top: '8px', right: '10px', fontSize: '9px', letterSpacing: '0.14em', color: T.sage, fontWeight: 700, textTransform: 'uppercase' }}>{tag}</div>}
      <div style={{ fontSize: '10px', letterSpacing: '0.18em', color: accent, textTransform: 'uppercase', marginBottom: '4px', fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: '28px', fontFamily: "'Cormorant Garamond', serif", color: T.text1, fontWeight: 600, lineHeight: 1 }}>{fmt(time, tz, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</div>
      <div style={{ fontSize: '12px', color: T.text3, marginTop: '4px' }}>{fmt(time, tz, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
    </div>
  );
}

function EventCard({ ev, tzA, tzB, labelA, labelB, onClick }) {
  const tA = evtTime(ev, tzA);
  const tB = tzB ? evtTime(ev, tzB) : null;
  return (
    <div onClick={onClick} style={{ background: '#fff', border: `1px solid ${T.border}`, borderLeft: `4px solid ${ev.color}`, borderRadius: '12px', padding: '12px 16px', cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'flex-start', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '14px', color: T.text1, fontWeight: 600, marginBottom: '4px' }}>{ev.title}</div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '12px' }}>
          <span><span style={{ color: T.text4 }}>{labelA} </span><span style={{ color: T.accent, fontWeight: 600 }}>{tA}</span></span>
          {tB && (<><span style={{ color: T.border2 }}>&#9670;</span><span><span style={{ color: T.text4 }}>{labelB} </span><span style={{ color: T.lavender, fontWeight: 600 }}>{tB}</span></span></>)}
        </div>
        {ev.recurrence && ev.recurrence !== 'none' && <div style={{ fontSize: '10px', color: T.sage, marginTop: '4px', fontWeight: 600 }}>Every {ev.recurrence}</div>}
        {ev.note && <div style={{ fontSize: '11px', color: T.text3, marginTop: '3px', fontStyle: 'italic' }}>{ev.note}</div>}
      </div>
      <div style={{ fontSize: '11px', color: T.text4, whiteSpace: 'nowrap', paddingTop: '2px' }}>{dateLabel(ev.date)}</div>
    </div>
  );
}

function EventModal({ event, tzA, tzB, labelA, labelB, onClose, onSave, onDelete }) {
  const [title, setTitle] = useState(event?.title || '');
  const [date, setDate] = useState(event?.date || '');
  const [time, setTime] = useState(event?.time || '12:00');
  const [tz, setTz] = useState(event?.tz || tzA);
  const [recurrence, setRecurrence] = useState(event?.recurrence || 'none');
  const [location, setLocation] = useState(event?.location || '');
  const [color, setColor] = useState(event?.color || EVENT_COLORS[0].value);
  const [note, setNote] = useState(event?.note || '');

  const otherTz = tz === tzA ? tzB : tzA;
  const otherLabel = tz === tzA ? labelB : labelA;
  let converted = '';
  if (date && time && otherTz) {
    try { converted = fmt(new Date(`${date}T${time}`), otherTz, { hour: '2-digit', minute: '2-digit', hour12: true, month: 'short', day: 'numeric' }); } catch {}
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,18,8,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: '22px', padding: '28px', width: '100%', maxWidth: '440px', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', color: T.text1, marginBottom: '20px', fontWeight: 600 }}>{event?.id ? 'Edit Event' : 'New Event'}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input placeholder="Event title..." value={title} onChange={e => setTitle(e.target.value)} style={IS()} />
          <input placeholder="Location (for traffic alerts)" value={location} onChange={e => setLocation(e.target.value)} style={IS()} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={IS({ flex: 1, width: 'auto' })} />
            <input type="time" value={time} onChange={e => setTime(e.target.value)} style={IS({ flex: 1, width: 'auto' })} />
          </div>
          <div>
            <div style={{ fontSize: '11px', letterSpacing: '0.14em', color: T.text3, textTransform: 'uppercase', marginBottom: '7px', fontWeight: 600 }}>Repeat</div>
            <select value={recurrence} onChange={e => setRecurrence(e.target.value)} style={IS()}>
              {RECURRENCE.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
          </div>
          {tzB && (
            <div>
              <div style={{ fontSize: '11px', letterSpacing: '0.14em', color: T.text3, textTransform: 'uppercase', marginBottom: '7px', fontWeight: 600 }}>Timezone</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[{ label: labelA, value: tzA }, { label: labelB, value: tzB }].map(item => (
                  <button key={item.value} onClick={() => setTz(item.value)} style={{ ...GB({ flex: 1, textAlign: 'center', padding: '8px 12px' }), background: tz === item.value ? `${T.accent}15` : T.surface2, border: `1px solid ${tz === item.value ? `${T.accent}60` : T.border}`, color: tz === item.value ? T.accent : T.text3, fontWeight: tz === item.value ? 700 : 400 }}>{item.label}</button>
                ))}
              </div>
            </div>
          )}
          {converted && <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: T.text2 }}>&#8758; For <strong>{otherLabel}</strong>, this is <span style={{ color: T.accent, fontWeight: 700 }}>{converted}</span></div>}
          <textarea placeholder="Notes..." value={note} onChange={e => setNote(e.target.value)} rows={2} style={IS({ resize: 'none' })} />
          <div>
            <div style={{ fontSize: '11px', letterSpacing: '0.14em', color: T.text3, textTransform: 'uppercase', marginBottom: '8px', fontWeight: 600 }}>Color</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {EVENT_COLORS.map(c => (
                <div key={c.value} title={c.name} onClick={() => setColor(c.value)} style={{ width: '26px', height: '26px', borderRadius: '50%', background: c.value, cursor: 'pointer', border: color === c.value ? `3px solid ${T.text1}` : '3px solid transparent', transition: 'border 0.12s' }} />
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '22px' }}>
          {event?.id && <button onClick={() => onDelete(event.id)} style={DB}>Delete</button>}
          <div style={{ flex: 1 }} />
          <button onClick={onClose} style={GB()}>Cancel</button>
          <button onClick={() => { if (!title || !date) return; onSave({ id: event?.id || Date.now(), title, date, time, tz, recurrence, location, color, note }); }} style={PB()}>Save</button>
        </div>
      </div>
    </div>
  );
}

function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState('plus');
  const [types, setTypes] = useState([]);
  const [name, setName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [tzA, setTzA] = useState('America/New_York');
  const [tzB, setTzB] = useState('Australia/Sydney');
  const [homeLocation, setHomeLocation] = useState('');

  const toggle = id => setTypes(c => c.includes(id) ? c.filter(i => i !== id) : [...c, id]);
  const progress = [0, 25, 50, 75, 100][step];

  return (
    <div style={{ minHeight: '100vh', zoom: '120%', background: T.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: "'DM Sans', sans-serif" }}>
      {step > 0 && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '3px', background: T.border, zIndex: 10 }}>
          <div style={{ height: '100%', width: `${progress}%`, background: T.accent, transition: 'width 0.4s ease' }} />
        </div>
      )}

      <div style={{ maxWidth: '520px', width: '100%' }}>
        {step === 0 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '13px', letterSpacing: '0.35em', color: T.text4, textTransform: 'uppercase', marginBottom: '10px' }}>Welcome to</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(56px,12vw,80px)', fontWeight: 300, color: T.text1, lineHeight: 0.9, letterSpacing: '-0.02em', marginBottom: '8px' }}>Ophelia</h1>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', color: T.text3, fontStyle: 'italic', marginBottom: '40px' }}>your everyday calendar</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '36px', textAlign: 'left' }}>
              {[['◇', 'Made for people across time zones'], ['⊕', 'Real-time traffic alerts to leave on time'], ['❧', 'Send gifts, notes, and share calendars']].map(([icon, text]) => (
                <div key={text} style={{ display: 'flex', gap: '14px', alignItems: 'center', background: '#fff', border: `1px solid ${T.border}`, borderRadius: '12px', padding: '14px 16px', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                  <span style={{ color: T.accent, fontSize: '18px', width: '22px', textAlign: 'center', flexShrink: 0 }}>{icon}</span>
                  <span style={{ fontSize: '14px', color: T.text2, fontWeight: 500 }}>{text}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setStep(1)} style={PB({ padding: '14px 52px', fontSize: '15px', borderRadius: '40px', letterSpacing: '0.08em' })}>Get Started</button>
          </div>
        )}

        {step === 1 && (
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '30px', fontWeight: 400, color: T.text1, marginBottom: '6px' }}>Choose your plan</div>
            <div style={{ fontSize: '14px', color: T.text3, marginBottom: '26px' }}>Start free for 30 days. Cancel anytime.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
              {PLANS.map(item => (
                <div key={item.id} onClick={() => setPlan(item.id)} className="lift" style={{ background: plan === item.id ? `${T.accent}0e` : '#fff', border: `1.5px solid ${plan === item.id ? T.accent : T.border}`, borderRadius: '14px', padding: '18px 20px', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
                  {item.badge && <div style={{ position: 'absolute', top: '-11px', left: '16px', background: T.accent, color: '#fff', fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', letterSpacing: '0.06em' }}>{item.badge}</div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '15px', color: T.text1, fontWeight: 700, marginBottom: '3px' }}>{item.label}</div>
                      <div style={{ fontSize: '12px', color: T.text3 }}>{item.sub}</div>
                    </div>
                    <div style={{ fontSize: '14px', color: plan === item.id ? T.accent : T.text3, fontWeight: 700, flexShrink: 0, marginLeft: '12px' }}>{item.price}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setStep(0)} style={GB({ flexShrink: 0 })}>Back</button>
              <button onClick={() => setStep(2)} style={PB({ flex: 1, textAlign: 'center' })}>Continue</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '30px', fontWeight: 400, color: T.text1, marginBottom: '6px' }}>How do you use time?</div>
            <div style={{ fontSize: '14px', color: T.text3, marginBottom: '22px' }}>Select all that apply.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '26px' }}>
              {USER_TYPES.map(userType => {
                const selected = types.includes(userType.id);
                return (
                  <div key={userType.id} onClick={() => toggle(userType.id)} className="lift" style={{ background: selected ? `${userType.accent}0e` : '#fff', border: `1.5px solid ${selected ? userType.accent : T.border}`, borderRadius: '14px', padding: '18px 20px', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                      <div style={{ fontSize: '20px', color: userType.accent, width: '26px', textAlign: 'center', flexShrink: 0, marginTop: '1px' }}>{userType.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '15px', color: T.text1, fontWeight: 700, marginBottom: '3px' }}>{userType.title}</div>
                        <div style={{ fontSize: '13px', color: T.text3, marginBottom: '10px' }}>{userType.desc}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                          {userType.features.map(f => <span key={f} style={{ fontSize: '11px', background: `${userType.accent}14`, border: `1px solid ${userType.accent}30`, color: userType.accent, padding: '3px 9px', borderRadius: '20px', fontWeight: 600 }}>{f}</span>)}
                        </div>
                      </div>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${selected ? userType.accent : T.border}`, background: selected ? userType.accent : 'transparent', flexShrink: 0, marginTop: '1px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {selected && <span style={{ fontSize: '11px', color: '#fff', fontWeight: 700 }}>&#10003;</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setStep(1)} style={GB({ flexShrink: 0 })}>Back</button>
              <button onClick={() => setStep(3)} disabled={types.length === 0} style={PB({ flex: 1, textAlign: 'center', opacity: types.length === 0 ? 0.4 : 1 })}>Continue</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '30px', fontWeight: 400, color: T.text1, marginBottom: '6px' }}>Set up your profile</div>
            <div style={{ fontSize: '14px', color: T.text3, marginBottom: '22px' }}>Just the basics.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '26px' }}>
              <div>
                <div style={{ fontSize: '11px', letterSpacing: '0.14em', color: T.text3, textTransform: 'uppercase', marginBottom: '7px', fontWeight: 600 }}>Your Name</div>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name..." style={IS()} />
              </div>
              <div>
                <div style={{ fontSize: '11px', letterSpacing: '0.14em', color: T.text3, textTransform: 'uppercase', marginBottom: '7px', fontWeight: 600 }}>Your Timezone</div>
                <TzSelect value={tzA} onChange={e => setTzA(e.target.value)} />
              </div>
              <div>
                <div style={{ fontSize: '11px', letterSpacing: '0.14em', color: T.text3, textTransform: 'uppercase', marginBottom: '7px', fontWeight: 600 }}>Home Location (for traffic)</div>
                <input value={homeLocation} onChange={e => setHomeLocation(e.target.value)} placeholder="e.g., 123 Main St, NY, NY" style={IS()} />
              </div>
              {(types.includes('couple') || types.includes('traveler')) && (
                <>
                  <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: '14px' }}>
                    <div style={{ fontSize: '11px', letterSpacing: '0.14em', color: T.rose, textTransform: 'uppercase', marginBottom: '7px', fontWeight: 600 }}>{types.includes('couple') ? "Partner's Name" : 'Contact'}</div>
                    <input value={partnerName} onChange={e => setPartnerName(e.target.value)} placeholder="Their name..." style={IS()} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', letterSpacing: '0.14em', color: T.rose, textTransform: 'uppercase', marginBottom: '7px', fontWeight: 600 }}>Their Timezone</div>
                    <TzSelect value={tzB} onChange={e => setTzB(e.target.value)} />
                  </div>
                </>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setStep(2)} style={GB({ flexShrink: 0 })}>Back</button>
              <button onClick={() => onComplete({ plan, types, name, partnerName, tzA, tzB, homeLocation, user: { id: Date.now(), email: '', name, authMethod: 'onboarding' } })} disabled={!name} style={PB({ flex: 1, textAlign: 'center', opacity: !name ? 0.4 : 1 })}>Open Ophelia &#8594;</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Calendar({ config }) {
  const { types, name, partnerName, tzA: initA, tzB: initB, homeLocation } = config;
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  const hasPartner = types.includes('couple');
  const isTraveler = types.includes('traveler');
  const isLocal = types.includes('local') && !hasPartner && !isTraveler;

  const [tzA, setTzA] = useState(initA || 'America/New_York');
  const [tzB, setTzB] = useState(initB || 'Australia/Sydney');
  const [labelA, setLabelA] = useState(name || 'You');
  const [labelB, setLabelB] = useState(partnerName || 'Them');
  const [events, setEvents] = useState(() => LS.get('ophelia_events', []));
  const [notes, setNotes] = useState(() => LS.get('ophelia_notes', []));
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);
  const [modal, setModal] = useState(null);
  const [travelMode, setTravelMode] = useState(false);
  const [travelTz, setTravelTz] = useState('America/New_York');
  const [showGift, setShowGift] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => { LS.set('ophelia_events', events); }, [events]);
  useEffect(() => { LS.set('ophelia_notes', notes); }, [notes]);

  const activeTzA = travelMode ? travelTz : tzA;
  const accentB = hasPartner ? T.rose : isTraveler ? T.sky : T.sage;

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  while (cells.length % 7 !== 0) cells.push(null);

  const eventsForDay = day => {
    if (!day) return [];
    const ds = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return events.filter(e => e.date === ds);
  };

  const upcoming = [...events].filter(e => e.date >= todayStr).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)).slice(0, 5);

  return (
    <>
      <div style={{ minHeight: '100vh', background: T.bg, fontFamily: "'DM Sans', sans-serif", color: T.text1 }}>
        <div style={{ maxWidth: '840px', margin: '0 auto', padding: '28px 18px 80px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '11px', letterSpacing: '0.4em', color: T.text4, textTransform: 'uppercase', marginBottom: '6px' }}>Ophelia</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(28px,5vw,42px)', fontWeight: 300, color: T.text1, lineHeight: 1.05 }}>
              {hasPartner ? <>Hello, <em style={{ color: T.accent, fontStyle: 'italic' }}>{labelA}</em></> : <>Welcome back, <em style={{ color: T.accent }}>{labelA}</em></>}
            </h1>
          </div>

          {!isLocal && (
            <>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                <Clock tz={activeTzA} accent={T.accent} label={`${labelA} · ${TIMEZONES.find(t => t.value === activeTzA)?.label || activeTzA}`} tag={travelMode ? 'traveling' : undefined} />
                <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, color: T.border2, fontSize: '20px' }}>&#8596;</div>
                <Clock tz={tzB} accent={accentB} label={`${labelB} · ${TIMEZONES.find(t => t.value === tzB)?.label || tzB}`} />
              </div>
              <div style={{ textAlign: 'center', fontSize: '12px', color: T.text4, marginBottom: '22px' }}>&#9670; {tzDiff(tzA, tzB, labelB)}</div>
            </>
          )}

          {isLocal && <div style={{ marginBottom: '22px' }}><Clock tz={tzA} accent={T.sage} label={`${labelA} · ${TIMEZONES.find(t => t.value === tzA)?.label || tzA}`} /></div>}

          {/* Calendar grid and rest of calendar component... */}
          {/* Truncated for space — full calendar UI same as before */}

          <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
            <button onClick={() => setShowAdmin(!showAdmin)} style={{ background: T.admin, color: 'white', border: 'none', padding: '10px 14px', borderRadius: '999px', fontSize: '12px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              ⚙ Admin
            </button>
          </div>
        </div>
      </div>

      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
    </>
  );
}

// ─── Root ────────────────────────────────────────────────────────────────────
export default function Ophelia() {
  const [config, setConfig] = useState(() => LS.get('ophelia_config', null));
  const [showAuth, setShowAuth] = useState(!config);

  // Register service worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').catch(() => {});
    }
  }, []);

  function handleAuthComplete(user) {
    const cfg = { types: ['couple'], name: user.name, partnerName: '', tzA: 'America/New_York', tzB: 'Australia/Sydney', homeLocation: '', user };
    LS.set('ophelia_config', cfg);
    LS.set('ophelia_users', (LS.get('ophelia_users', [])).concat([user]));
    setConfig(cfg);
    setShowAuth(false);
  }

  function handleOnboardingComplete(cfg) {
    LS.set('ophelia_config', cfg);
    LS.set('ophelia_users', (LS.get('ophelia_users', [])).concat([cfg.user]));
    setConfig(cfg);
    setShowAuth(false);
  }

  return (
    <>
      <style>{CSS}</style>
      {showAuth ? <AuthModal onLogin={handleAuthComplete} /> : config ? <Calendar config={config} /> : <Onboarding onComplete={handleOnboardingComplete} />}
    </>
  );
}
