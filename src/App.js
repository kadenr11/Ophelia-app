import React, { useState, useEffect, useRef } from 'react';

// ─── Palette ────────────────────────────────────────────────────────────────
const T = {
  bg: '#faf6f0',
  surface: '#f2ece2',
  surface2: '#ece4d6',
  border: '#ddd0bc',
  border2: '#ccc0a8',
  text1: '#1a1208',
  text2: '#3d2e1e',
  text3: '#7a6248',
  text4: '#a08868',
  accent: '#b5631e',
  rose: '#c0555a',
  sage: '#3d7a4a',
  sky: '#2d6a9a',
  lavender: '#6a559a',
  danger: '#b53030',
  admin: '#2d4a6a',
};

// ─── Timezones ───────────────────────────────────────────────────────────────
const TIMEZONES = [
  { label: 'Honolulu (Hawaii)', value: 'Pacific/Honolulu', region: 'USA' },
  { label: 'Anchorage (Alaska)', value: 'America/Anchorage', region: 'USA' },
  { label: 'Los Angeles', value: 'America/Los_Angeles', region: 'USA' },
  { label: 'Phoenix (Arizona)', value: 'America/Phoenix', region: 'USA' },
  { label: 'Denver', value: 'America/Denver', region: 'USA' },
  { label: 'Chicago', value: 'America/Chicago', region: 'USA' },
  { label: 'Miami / Tampa (Florida)', value: 'America/New_York', region: 'USA' },
  { label: 'New York', value: 'America/New_York', region: 'USA' },
  { label: 'Melbourne', value: 'Australia/Melbourne', region: 'Pacific' },
  { label: 'Sydney', value: 'Australia/Sydney', region: 'Pacific' },
  { label: 'Siargao / Manila', value: 'Asia/Manila', region: 'Asia' },
];

const EVENT_COLORS = [
  { name: 'Rose', value: '#c0555a' },
  { name: 'Amber', value: '#b5821e' },
  { name: 'Sage', value: '#3d7a4a' },
  { name: 'Sky', value: '#2d6a9a' },
  { name: 'Lavender', value: '#6a559a' },
  { name: 'Blush', value: '#c0607a' },
];

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const USER_TYPES = [
  {
    id: 'couple',
    icon: '◇',
    title: 'Long-Distance Couple',
    accent: T.rose,
    desc: 'Stay close across time zones. Two clocks, shared events, love notes and surprises.',
    features: ['Dual timezone clocks', 'Shared calendar', 'Best times to meet', 'Send flowers & gifts', 'Love note wall'],
  },
  {
    id: 'traveler',
    icon: '⊕',
    title: 'Business Traveler',
    accent: T.sky,
    desc: "You move fast. Ophelia keeps every city's time straight and your schedule clean.",
    features: ['Travel mode', 'Multi-city view', 'Meeting overlap finder', 'Trip date ranges', 'Flight note fields'],
  },
  {
    id: 'local',
    icon: '⌂',
    title: 'Stay in One Place',
    accent: T.sage,
    desc: 'Simple, beautiful, distraction-free. Just a great personal calendar.',
    features: ['Single-timezone calendar', 'Color-coded events', 'Daily agenda', 'Reminders', 'Calendar import'],
  },
];

const PLANS = [
  {
    id: 'free',
    label: 'Free',
    price: 'Always free',
    priceNum: 0,
    sub: 'Single timezone · Up to 10 events · Basic calendar',
    badge: null,
  },
  {
    id: 'plus',
    label: 'Ophelia Plus',
    price: '$3.99 / month',
    priceNum: 3.99,
    sub: 'Everything — dual clocks, sharing, gifts, love notes, travel mode',
    badge: 'Most Popular · 1 month free',
    // TODO: Replace with your Stripe Price ID for Plus subscription
    stripePriceId: 'price_PLUS_ID_HERE',
  },
  {
    id: 'pro',
    label: 'Ophelia Pro',
    price: '$6.99 / month',
    priceNum: 6.99,
    sub: 'Plus + Apple/Google Calendar sync, team scheduling, priority support',
    badge: null,
    // TODO: Replace with your Stripe Price ID for Pro subscription
    stripePriceId: 'price_PRO_ID_HERE',
  },
];

// TODO: Replace with your Stripe Publishable Key
// const STRIPE_PUBLIC_KEY = 'pk_live_YOUR_KEY_HERE';

const GIFT_ITEMS = [
  { id: 'roses',  cat: 'flowers',  name: 'Red Roses',          price: 49, icon: '❧', desc: 'A dozen long-stem red roses with a handwritten note.' },
  { id: 'wild',   cat: 'flowers',  name: 'Wildflower Bouquet', price: 42, icon: '❧', desc: 'A seasonal wildflower mix — bright, informal, joyful.' },
  { id: 'sun',    cat: 'flowers',  name: 'Sunflowers',         price: 38, icon: '❧', desc: 'Six tall sunflowers to brighten any room.' },
  { id: 'orchid', cat: 'flowers',  name: 'Orchid Plant',       price: 55, icon: '❧', desc: 'A living orchid — lasting weeks beyond cut flowers.' },
  { id: 'cozy',   cat: 'package',  name: 'Cozy Night In',      price: 68, icon: '◈', desc: 'Candle, herbal tea, chocolate, and a hand-written card.' },
  { id: 'snacks', cat: 'package',  name: 'Snack Haul',         price: 52, icon: '◈', desc: 'A curated box of favourite snacks from around the world.' },
  { id: 'spa',    cat: 'package',  name: 'Spa at Home',        price: 75, icon: '◈', desc: 'Face mask, bath salts, lavender oil, and cozy socks.' },
  { id: 'book',   cat: 'package',  name: 'Book & Coffee',      price: 44, icon: '◈', desc: 'A bestselling novel plus specialty coffee.' },
  { id: 'custom', cat: 'package',  name: 'Custom Box',         price: 90, icon: '◈', desc: 'You choose what goes in — we curate and ship it.' },
];

// ─── Affiliate Packages ───────────────────────────────────────────────────────
// Add partner packages here once affiliate programs are confirmed.
// Each entry: { id, affiliateId, cat, name, price, icon, desc, affiliateUrl, commission }
// Example structure:
// { id: 'aff_1800flowers_roses', affiliateId: '1800flowers', cat: 'affiliate',
//   name: 'Classic Dozen Roses', price: 59, icon: '❧',
//   desc: 'Via 1-800-Flowers affiliate partnership.',
//   affiliateUrl: 'https://...', commission: '8%' }
const AFFILIATE_PACKAGES = [
  // Populated once affiliate programs are joined — managed via Admin panel
];

// Admin credentials — change before deploying to production
const ADMIN_PASSCODE = 'ophelia2024';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(date, tz, opts = {}) {
  try { return new Intl.DateTimeFormat('en-US', { timeZone: tz, ...opts }).format(date); }
  catch { return '–'; }
}

function getOffsetH(tz) {
  const now = new Date();
  const local = new Date(now.toLocaleString('en-US', { timeZone: tz }));
  const utc   = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
  return Math.round((local - utc) / 3600000);
}

function tzDiff(tzA, tzB, nameB) {
  const diff = getOffsetH(tzB) - getOffsetH(tzA);
  if (diff === 0) return `${nameB} is in the same time zone`;
  return diff > 0 ? `${nameB} is ${diff}h ahead` : `${nameB} is ${Math.abs(diff)}h behind`;
}

function evtTime(ev, tz) {
  try {
    return fmt(new Date(`${ev.date}T${ev.time}`), tz, { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch { return '–'; }
}

function encodeShare(data) {
  try { return btoa(unescape(encodeURIComponent(JSON.stringify(data)))); }
  catch { return ''; }
}

function decodeShare(value) {
  try { return JSON.parse(decodeURIComponent(escape(atob(value)))); }
  catch { return null; }
}

function dateLabel(dateString) {
  try { return new Date(`${dateString}T12:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
  catch { return dateString; }
}

// ─── localStorage helpers ────────────────────────────────────────────────────
const LS = {
  get: (key, fallback = null) => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set: (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  },
  del: (key) => { try { localStorage.removeItem(key); } catch {} },
};

// ─── Style helpers ───────────────────────────────────────────────────────────
const IS = (x = {}) => ({
  background: '#fff',
  border: `1px solid ${T.border}`,
  borderRadius: '10px',
  color: T.text1,
  padding: '10px 14px',
  fontSize: '14px',
  width: '100%',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: "'DM Sans', sans-serif",
  ...x,
});

const PB = (x = {}) => ({
  background: T.accent,
  border: 'none',
  borderRadius: '10px',
  color: '#fff',
  padding: '10px 22px',
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: '13px',
  letterSpacing: '0.04em',
  fontFamily: "'DM Sans', sans-serif",
  ...x,
});

const GB = (x = {}) => ({
  background: T.surface2,
  border: `1px solid ${T.border}`,
  borderRadius: '10px',
  color: T.text2,
  padding: '10px 18px',
  cursor: 'pointer',
  fontSize: '13px',
  fontFamily: "'DM Sans', sans-serif",
  ...x,
});

const DB = {
  background: '#fdf0f0',
  border: '1px solid #e0b0b0',
  borderRadius: '10px',
  color: T.danger,
  padding: '10px 16px',
  cursor: 'pointer',
  fontSize: '13px',
  fontFamily: "'DM Sans', sans-serif",
};

function pill(active, accent = T.accent) {
  return {
    background: active ? `${accent}18` : T.surface2,
    border: `1px solid ${active ? `${accent}60` : T.border}`,
    borderRadius: '40px',
    color: active ? accent : T.text3,
    padding: '7px 16px',
    cursor: 'pointer',
    fontSize: '12px',
    letterSpacing: '0.06em',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: active ? 600 : 400,
    transition: 'all 0.15s',
  };
}

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

// ─── Section label ────────────────────────────────────────────────────────────
function SectionLabel({ children, color = T.text3 }) {
  return (
    <div style={{ fontSize: '11px', letterSpacing: '0.14em', color, textTransform: 'uppercase', marginBottom: '7px', fontWeight: 600 }}>
      {children}
    </div>
  );
}

// ─── Modal shell ──────────────────────────────────────────────────────────────
function ModalShell({ onClose, maxWidth = '460px', children, style = {} }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(26,18,8,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: '22px', padding: '28px', width: '100%', maxWidth, boxShadow: '0 24px 80px rgba(0,0,0,0.2)', ...style }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, sub, onClose }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: sub ? '4px' : '20px' }}>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', color: T.text1, fontWeight: 600 }}>{title}</div>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: T.text3, cursor: 'pointer', fontSize: '18px' }}>&#10005;</button>
    </div>
  );
}

// ─── TZ Select ───────────────────────────────────────────────────────────────
function TzSelect({ value, onChange, style }) {
  const regions = [...new Set(TIMEZONES.map(t => t.region))];
  return (
    <select value={value} onChange={onChange} style={style || IS()}>
      {regions.map(region => (
        <optgroup key={region} label={region}>
          {TIMEZONES.filter(t => t.region === region).map(t => (
            <option key={`${t.value}-${t.label}`} value={t.value}>{t.label}</option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

// ─── Love Note Splash ─────────────────────────────────────────────────────────
function LoveNoteSplash({ notes, labelA, labelB, onClose }) {
  const latest = notes.length > 0 ? notes[notes.length - 1] : null;
  if (!latest) return null;
  const fromName  = latest.from === 'A' ? labelA : labelB;
  const fromColor = latest.from === 'A' ? T.accent : T.rose;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,18,8,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '24px', backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: '24px', padding: '40px 36px', width: '100%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 32px 80px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: '32px', marginBottom: '16px', color: T.rose }}>❧</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '13px', letterSpacing: '0.25em', color: T.text4, textTransform: 'uppercase', marginBottom: '6px' }}>A note from</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 600, color: fromColor, marginBottom: '24px' }}>{fromName}</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontStyle: 'italic', color: T.text1, lineHeight: 1.6, marginBottom: '8px', padding: '0 8px' }}>"{latest.text}"</div>
        <div style={{ fontSize: '11px', color: T.text4, marginBottom: '28px' }}>{dateLabel(latest.date)}</div>
        <button onClick={onClose} style={PB({ padding: '11px 36px', borderRadius: '40px', background: fromColor })}>Open Ophelia</button>
      </div>
    </div>
  );
}

// ─── Notes Wall ───────────────────────────────────────────────────────────────
function NotesWall({ notes, labelA, labelB, onClose, onAdd, onDelete }) {
  const [text, setText] = useState('');
  const [from, setFrom] = useState('A');
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [notes.length]);

  function submit() {
    if (!text.trim()) return;
    onAdd({ id: Date.now(), text: text.trim(), from, date: new Date().toISOString().split('T')[0] });
    setText('');
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,18,8,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: '22px', width: '100%', maxWidth: '480px', maxHeight: '82vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '22px 24px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 600, color: T.text1 }}>Love Notes</div>
            <div style={{ fontSize: '12px', color: T.text3, marginTop: '2px' }}>{notes.length} note{notes.length !== 1 ? 's' : ''} saved</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: T.text3, cursor: 'pointer', fontSize: '20px', lineHeight: 1 }}>&#10005;</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notes.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: T.text4, fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontStyle: 'italic' }}>
              No notes yet — write the first one ❧
            </div>
          )}
          {notes.map(note => {
            const isA = note.from === 'A';
            const name = isA ? labelA : labelB;
            const color = isA ? T.accent : T.rose;
            return (
              <div key={note.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isA ? 'flex-start' : 'flex-end' }}>
                <div style={{ maxWidth: '80%', background: isA ? '#fff' : `${T.rose}0f`, border: `1px solid ${isA ? T.border : `${T.rose}30`}`, borderRadius: isA ? '4px 18px 18px 18px' : '18px 4px 18px 18px', padding: '14px 16px', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '16px', fontStyle: 'italic', color: T.text1, lineHeight: 1.55, marginBottom: '8px' }}>"{note.text}"</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '11px', color, fontWeight: 600 }}>{name}</div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <div style={{ fontSize: '11px', color: T.text4 }}>{dateLabel(note.date)}</div>
                      <button onClick={() => onDelete(note.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.border2, fontSize: '13px', lineHeight: 1, padding: 0 }}>&#10005;</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        <div style={{ padding: '14px 20px 18px', borderTop: `1px solid ${T.border}`, flexShrink: 0, background: T.surface }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            <div style={{ fontSize: '11px', color: T.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, alignSelf: 'center', marginRight: '4px' }}>From:</div>
            {[{ value: 'A', label: labelA, color: T.accent }, { value: 'B', label: labelB, color: T.rose }].map(item => (
              <button key={item.value} onClick={() => setFrom(item.value)} style={{ ...GB({ flex: 1, textAlign: 'center', padding: '7px 10px' }), background: from === item.value ? `${item.color}18` : T.surface2, border: `1px solid ${from === item.value ? `${item.color}55` : T.border}`, color: from === item.value ? item.color : T.text3, fontWeight: from === item.value ? 700 : 400 }}>{item.label}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <textarea value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }} placeholder="Write a little note..." rows={2} style={IS({ flex: 1, resize: 'none', fontSize: '14px', width: 'auto' })} />
            <button onClick={submit} disabled={!text.trim()} style={PB({ padding: '10px 16px', borderRadius: '10px', alignSelf: 'stretch', opacity: text.trim() ? 1 : 0.4, background: from === 'B' ? T.rose : T.accent })}>&#8593;</button>
          </div>
          <div style={{ fontSize: '11px', color: T.text4, marginTop: '6px' }}>Press Enter to send · Shift+Enter for new line</div>
        </div>
      </div>
    </div>
  );
}

// ─── Clock ────────────────────────────────────────────────────────────────────
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

// ─── Event Card ───────────────────────────────────────────────────────────────
function EventCard({ ev, tzA, tzB, labelA, labelB, onClick }) {
  const tA = evtTime(ev, tzA);
  const tB = tzB ? evtTime(ev, tzB) : null;
  return (
    <div onClick={onClick} style={{ background: '#fff', border: `1px solid ${T.border}`, borderLeft: `4px solid ${ev.color}`, borderRadius: '12px', padding: '12px 16px', cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'flex-start', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '14px', color: T.text1, fontWeight: 600, marginBottom: '4px' }}>{ev.title}</div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px' }}><span style={{ color: T.text4 }}>{labelA} </span><span style={{ color: T.accent, fontWeight: 600 }}>{tA}</span></span>
          {tB && (<><span style={{ fontSize: '11px', color: T.border2 }}>&#9670;</span><span style={{ fontSize: '12px' }}><span style={{ color: T.text4 }}>{labelB} </span><span style={{ color: T.lavender, fontWeight: 600 }}>{tB}</span></span></>)}
        </div>
        {ev.note && <div style={{ fontSize: '11px', color: T.text3, marginTop: '3px', fontStyle: 'italic' }}>{ev.note}</div>}
      </div>
      <div style={{ fontSize: '11px', color: T.text4, whiteSpace: 'nowrap', paddingTop: '2px' }}>{dateLabel(ev.date)}</div>
    </div>
  );
}

// ─── Event Modal ──────────────────────────────────────────────────────────────
function EventModal({ event, tzA, tzB, labelA, labelB, onClose, onSave, onDelete }) {
  const [title, setTitle] = useState(event?.title || '');
  const [date,  setDate]  = useState(event?.date  || '');
  const [time,  setTime]  = useState(event?.time  || '12:00');
  const [tz,    setTz]    = useState(event?.tz    || tzA);
  const [color, setColor] = useState(event?.color || EVENT_COLORS[0].value);
  const [note,  setNote]  = useState(event?.note  || '');

  const otherTz    = tz === tzA ? tzB : tzA;
  const otherLabel = tz === tzA ? labelB : labelA;
  let converted = '';
  if (date && time && otherTz) {
    try { converted = fmt(new Date(`${date}T${time}`), otherTz, { hour: '2-digit', minute: '2-digit', hour12: true, month: 'short', day: 'numeric' }); } catch {}
  }

  return (
    <ModalShell onClose={onClose} maxWidth="420px">
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', color: T.text1, marginBottom: '20px', fontWeight: 600 }}>{event?.id ? 'Edit Event' : 'New Event'}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input placeholder="Event title..." value={title} onChange={e => setTitle(e.target.value)} style={IS()} />
        <div style={{ display: 'flex', gap: '10px' }}>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={IS({ flex: 1, width: 'auto' })} />
          <input type="time" value={time} onChange={e => setTime(e.target.value)} style={IS({ flex: 1, width: 'auto' })} />
        </div>
        {tzB && (
          <div>
            <SectionLabel>Whose timezone?</SectionLabel>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[{ label: labelA, value: tzA }, { label: labelB, value: tzB }].map(item => (
                <button key={item.value} onClick={() => setTz(item.value)} style={{ ...GB({ flex: 1, textAlign: 'center', padding: '8px 12px' }), background: tz === item.value ? `${T.accent}15` : T.surface2, border: `1px solid ${tz === item.value ? `${T.accent}60` : T.border}`, color: tz === item.value ? T.accent : T.text3, fontWeight: tz === item.value ? 700 : 400 }}>{item.label}</button>
              ))}
            </div>
          </div>
        )}
        {converted && (
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: T.text2 }}>
            &#8758; For <strong>{otherLabel}</strong>, this is <span style={{ color: T.accent, fontWeight: 700 }}>{converted}</span>
          </div>
        )}
        <textarea placeholder="Note (optional)..." value={note} onChange={e => setNote(e.target.value)} rows={2} style={IS({ resize: 'none' })} />
        <div>
          <SectionLabel>Color</SectionLabel>
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
        <button onClick={() => { if (!title || !date) return; onSave({ id: event?.id || Date.now(), title, date, time, tz, color, note }); }} style={PB()}>Save</button>
      </div>
    </ModalShell>
  );
}

// ─── Meeting Finder ───────────────────────────────────────────────────────────
function MeetingFinder({ tzA, tzB, labelA, labelB, onClose }) {
  const offA = getOffsetH(tzA);
  const offB = getOffsetH(tzB);
  const slots = Array.from({ length: 24 }, (_, hour) => {
    const hB = (((hour - offA + offB) % 24) + 24) % 24;
    const sA = hour >= 9 && hour < 21 ? (hour >= 10 && hour < 20 ? 2 : 1) : 0;
    const sB = hB   >= 9 && hB   < 21 ? (hB   >= 10 && hB   < 20 ? 2 : 1) : 0;
    return { hA: hour, hB, total: sA + sB };
  });
  const best = slots.filter(s => s.total === 4);
  const good = slots.filter(s => s.total === 3);
  const ok   = slots.filter(s => s.total === 2);
  const fmtH = hour => { const d = new Date(); d.setHours(hour, 0, 0, 0); return d.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }); };

  function Row({ slot, quality }) {
    const color = quality === 'ideal' ? T.sage : quality === 'good' ? T.accent : T.text3;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: '#fff', border: `1px solid ${T.border}`, borderRadius: '10px', marginBottom: '6px' }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, flexShrink: 0 }} />
        <div style={{ flex: 1, fontSize: '13px', color: T.text2 }}>
          <span style={{ color: T.accent, fontWeight: 600 }}>{fmtH(slot.hA)}</span>
          <span style={{ color: T.text4, marginLeft: '4px', fontSize: '11px' }}>for {labelA}</span>
          <span style={{ color: T.border2, margin: '0 8px' }}>&#8644;</span>
          <span style={{ color: T.lavender, fontWeight: 600 }}>{fmtH(slot.hB)}</span>
          <span style={{ color: T.text4, marginLeft: '4px', fontSize: '11px' }}>for {labelB}</span>
        </div>
        <div style={{ fontSize: '10px', letterSpacing: '0.1em', color, textTransform: 'uppercase', fontWeight: 700 }}>{quality}</div>
      </div>
    );
  }

  return (
    <ModalShell onClose={onClose} maxWidth="450px" style={{ maxHeight: '78vh', overflowY: 'auto' }}>
      <ModalHeader title="Best Times to Meet" onClose={onClose} />
      {best.length > 0 && (<><div style={{ fontSize: '11px', letterSpacing: '0.14em', color: T.sage, textTransform: 'uppercase', fontWeight: 700, marginBottom: '9px' }}>&#9670; Ideal</div>{best.map((slot, i) => <Row key={i} slot={slot} quality="ideal" />)}</>)}
      {good.length > 0 && (<><div style={{ fontSize: '11px', letterSpacing: '0.14em', color: T.accent, textTransform: 'uppercase', fontWeight: 700, margin: '16px 0 9px' }}>&#9670; Good</div>{good.map((slot, i) => <Row key={i} slot={slot} quality="good" />)}</>)}
      {ok.length > 0   && (<><div style={{ fontSize: '11px', letterSpacing: '0.14em', color: T.text3, textTransform: 'uppercase', fontWeight: 700, margin: '16px 0 9px' }}>&#9670; Possible</div>{ok.slice(0, 5).map((slot, i) => <Row key={i} slot={slot} quality="ok" />)}</>)}
    </ModalShell>
  );
}

// ─── Share Modal ──────────────────────────────────────────────────────────────
function ShareModal({ tzA, tzB, labelA, labelB, events, onClose }) {
  const url = `${window.location.origin}${window.location.pathname}?cal=${encodeShare({ tzA, tzB, labelA, labelB, events })}`;
  const [copied, setCopied] = useState(false);
  async function copyLink() {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch { setCopied(false); }
  }
  return (
    <ModalShell onClose={onClose} maxWidth="430px">
      <ModalHeader title={`Share with ${labelB}`} onClose={onClose} />
      <div style={{ fontSize: '13px', color: T.text3, marginBottom: '20px' }}>This link carries all your events, timezones, and names.</div>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '12px', padding: '12px 14px', marginBottom: '18px' }}>
        <div style={{ fontSize: '11px', color: T.text4, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '5px', fontWeight: 600 }}>Link</div>
        <div style={{ fontSize: '12px', color: T.sky, wordBreak: 'break-all', lineHeight: 1.5 }}>{url.length > 90 ? `${url.slice(0, 70)}...` : url}</div>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={onClose} style={GB()}>Close</button>
        <button onClick={copyLink} style={PB({ flex: 1, textAlign: 'center', background: copied ? T.sage : T.sky })}>{copied ? 'Copied &#10003;' : 'Copy Link'}</button>
      </div>
    </ModalShell>
  );
}

// ─── Gift Modal ───────────────────────────────────────────────────────────────
function GiftModal({ partnerName, onClose, affiliatePackages = [] }) {
  const [tab, setTab] = useState('flowers');
  const [selected, setSelected] = useState(null);
  const [address, setAddress] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);

  const allItems = [...GIFT_ITEMS, ...affiliatePackages];
  const item  = allItems.find(g => g.id === selected);
  const items = tab === 'affiliate' ? affiliatePackages : GIFT_ITEMS.filter(g => g.cat === tab);

  const tabs = [
    { id: 'flowers',   label: '❧ Flowers' },
    { id: 'package',   label: '◈ Care Packages' },
    { id: 'affiliate', label: '&#9671; Partner Gifts' },
  ];

  if (sent) {
    return (
      <ModalShell onClose={onClose} maxWidth="380px">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', color: T.rose, marginBottom: '14px' }}>❧</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', color: T.text1, marginBottom: '8px', fontWeight: 600 }}>On its way to {partnerName}</div>
          <div style={{ fontSize: '13px', color: T.text2, marginBottom: '12px' }}>Your {item?.name.toLowerCase()} is scheduled for {date}.</div>
          <div style={{ fontSize: '13px', color: T.text3, fontStyle: 'italic', marginBottom: '24px', padding: '12px', background: T.surface, borderRadius: '10px' }}>"{note || 'Thinking of you.'}"</div>
          <button onClick={onClose} style={PB({ padding: '11px 32px', borderRadius: '40px' })}>Done</button>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell onClose={onClose} maxWidth="460px" style={{ maxHeight: '84vh', overflowY: 'auto' }}>
      <ModalHeader title="Send a Gift" onClose={onClose} />
      <div style={{ fontSize: '13px', color: T.text3, marginBottom: '20px' }}>Delivered directly to {partnerName}'s door.</div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '18px', flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setSelected(null); }} style={{ ...GB({ flex: 1, textAlign: 'center', padding: '9px 10px', minWidth: '90px' }), background: tab === t.id ? `${T.rose}15` : T.surface2, border: `1px solid ${tab === t.id ? `${T.rose}60` : T.border}`, color: tab === t.id ? T.rose : T.text3, fontWeight: tab === t.id ? 700 : 400 }} dangerouslySetInnerHTML={{ __html: t.label }} />
        ))}
      </div>

      {/* Affiliate placeholder */}
      {tab === 'affiliate' && affiliatePackages.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', background: T.surface, border: `1px dashed ${T.border2}`, borderRadius: '14px', marginBottom: '18px' }}>
          <div style={{ fontSize: '24px', color: T.border2, marginBottom: '10px' }}>&#9671;</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', color: T.text3, marginBottom: '6px' }}>Partner gifts coming soon</div>
          <div style={{ fontSize: '12px', color: T.text4, lineHeight: 1.6 }}>We're joining affiliate programs for curated flowers, gifts, and experiences. These will appear here once confirmed.</div>
        </div>
      )}

      {/* Gift grid */}
      {items.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '18px' }}>
          {items.map(gift => (
            <div key={gift.id} onClick={() => setSelected(gift.id)} className="lift" style={{ background: selected === gift.id ? `${T.rose}10` : '#fff', border: `1px solid ${selected === gift.id ? `${T.rose}50` : T.border}`, borderRadius: '12px', padding: '14px 12px', cursor: 'pointer', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '20px', color: T.rose, marginBottom: '6px' }}>{gift.icon}</div>
              <div style={{ fontSize: '13px', color: T.text1, fontWeight: 600, marginBottom: '3px' }}>{gift.name}</div>
              <div style={{ fontSize: '11px', color: T.text3, marginBottom: '7px', lineHeight: 1.4 }}>{gift.desc}</div>
              {gift.affiliateId && <div style={{ fontSize: '10px', color: T.text4, marginBottom: '3px' }}>via partner</div>}
              <div style={{ fontSize: '14px', color: selected === gift.id ? T.rose : T.text2, fontWeight: 700 }}>${gift.price}</div>
            </div>
          ))}
        </div>
      )}

      {/* Checkout */}
      {selected && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '11px', borderTop: `1px solid ${T.border}`, paddingTop: '18px' }}>
          <div><SectionLabel>Delivery Address</SectionLabel><input value={address} onChange={e => setAddress(e.target.value)} placeholder="Enter delivery address..." style={IS()} /></div>
          <div><SectionLabel>Deliver On</SectionLabel><input type="date" value={date} onChange={e => setDate(e.target.value)} style={IS()} /></div>
          <div><SectionLabel>Personal Note</SectionLabel><textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Write them a note..." rows={2} style={IS({ resize: 'none' })} /></div>
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: T.text2, fontWeight: 500 }}>Total</span>
              <span style={{ fontSize: '16px', color: T.accent, fontWeight: 700 }}>${item?.price} + delivery</span>
            </div>
            <div style={{ fontSize: '11px', color: T.text4, marginTop: '3px' }}>Processed securely via Stripe.</div>
          </div>
          <button onClick={() => { if (address && date) setSent(true); }} style={PB({ padding: '12px', textAlign: 'center', borderRadius: '12px', opacity: address && date ? 1 : 0.45, background: T.rose })}>
            Send {item?.name} to {partnerName} &#8594;
          </button>
        </div>
      )}
    </ModalShell>
  );
}

// ─── Payment Modal ────────────────────────────────────────────────────────────
// TODO: Integrate Stripe.js. Steps:
//   1. npm install @stripe/stripe-js @stripe/react-stripe-js
//   2. Import loadStripe, Elements, CardElement, useStripe, useElements
//   3. Replace the simulated form below with a real CardElement
//   4. On submit: stripe.createPaymentMethod() → send to your backend → confirm subscription
function PaymentModal({ plan, onSuccess, onClose }) {
  const [email, setEmail]     = useState('');
  const [card,  setCard]      = useState('');
  const [expiry, setExpiry]   = useState('');
  const [cvc,   setCvc]       = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const planObj = PLANS.find(p => p.id === plan);

  function handleSubmit(e) {
    e.preventDefault();
    if (!email || card.replace(/\s/g, '').length < 16 || expiry.length < 5 || cvc.length < 3) {
      setError('Please fill in all card details correctly.');
      return;
    }
    setError('');
    setLoading(true);
    // TODO: Replace this simulation with real Stripe.js payment processing
    // Example: const { paymentMethod, error } = await stripe.createPaymentMethod({ type: 'card', card: cardElement });
    // Then POST { paymentMethod.id, planId: planObj.stripePriceId } to your backend
    setTimeout(() => { setLoading(false); onSuccess(); }, 1800);
  }

  function formatCard(v) { return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim(); }
  function formatExpiry(v) { const d = v.replace(/\D/g, '').slice(0, 4); return d.length >= 3 ? `${d.slice(0,2)}/${d.slice(2)}` : d; }

  return (
    <ModalShell onClose={onClose} maxWidth="420px">
      <ModalHeader title="Subscribe" onClose={onClose} />
      <div style={{ background: `${T.accent}10`, border: `1px solid ${T.accent}30`, borderRadius: '12px', padding: '14px 16px', marginBottom: '22px' }}>
        <div style={{ fontSize: '15px', color: T.text1, fontWeight: 700 }}>{planObj?.label}</div>
        <div style={{ fontSize: '13px', color: T.accent, fontWeight: 700, marginTop: '2px' }}>{planObj?.price}</div>
        <div style={{ fontSize: '12px', color: T.text3, marginTop: '4px' }}>{planObj?.sub}</div>
        <div style={{ fontSize: '11px', color: T.sage, marginTop: '6px', fontWeight: 600 }}>&#10003;&ensp;First month free — cancel anytime</div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <SectionLabel>Email address</SectionLabel>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={IS()} required />
        </div>
        <div>
          <SectionLabel>Card number</SectionLabel>
          <input value={card} onChange={e => setCard(formatCard(e.target.value))} placeholder="1234 5678 9012 3456" style={IS()} maxLength={19} />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <SectionLabel>Expiry</SectionLabel>
            <input value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} placeholder="MM/YY" style={IS()} maxLength={5} />
          </div>
          <div style={{ flex: 1 }}>
            <SectionLabel>CVC</SectionLabel>
            <input value={cvc} onChange={e => setCvc(e.target.value.replace(/\D/g,'').slice(0,4))} placeholder="123" style={IS()} maxLength={4} />
          </div>
        </div>

        {error && <div style={{ fontSize: '12px', color: T.danger, background: '#fdf0f0', border: '1px solid #e0b0b0', borderRadius: '8px', padding: '8px 12px' }}>{error}</div>}

        <button type="submit" disabled={loading} style={PB({ padding: '13px', textAlign: 'center', borderRadius: '12px', marginTop: '4px', opacity: loading ? 0.7 : 1 })}>
          {loading ? '&#8230; Processing' : `Start Free Trial &#8594;`}
        </button>

        <div style={{ textAlign: 'center', fontSize: '11px', color: T.text4 }}>
          &#9632;&ensp;Secured by Stripe &ensp;&#183;&ensp; Cancel anytime
        </div>
      </form>
    </ModalShell>
  );
}

// ─── Admin Panel ──────────────────────────────────────────────────────────────
function AdminPanel({ onClose }) {
  const [authed,      setAuthed]      = useState(false);
  const [pass,        setPass]        = useState('');
  const [passError,   setPassError]   = useState(false);
  const [activeTab,   setActiveTab]   = useState('overview');
  const [affPackages, setAffPackages] = useState(() => LS.get('ophelia_affiliate_packages', []));
  const [newPkg,      setNewPkg]      = useState({ id: '', affiliateId: '', cat: 'affiliate', name: '', price: '', icon: '❧', desc: '', affiliateUrl: '', commission: '' });

  function login() {
    if (pass === ADMIN_PASSCODE) { setAuthed(true); setPassError(false); }
    else { setPassError(true); }
  }

  function savePackage() {
    if (!newPkg.name || !newPkg.price) return;
    const pkg = { ...newPkg, id: `aff_${Date.now()}`, price: Number(newPkg.price) };
    const updated = [...affPackages, pkg];
    setAffPackages(updated);
    LS.set('ophelia_affiliate_packages', updated);
    setNewPkg({ id: '', affiliateId: '', cat: 'affiliate', name: '', price: '', icon: '❧', desc: '', affiliateUrl: '', commission: '' });
  }

  function removePackage(id) {
    const updated = affPackages.filter(p => p.id !== id);
    setAffPackages(updated);
    LS.set('ophelia_affiliate_packages', updated);
  }

  const adminTabs = [
    { id: 'overview',   label: 'Overview' },
    { id: 'affiliate',  label: 'Affiliate Packages' },
    { id: 'gifts',      label: 'Gift Catalog' },
    { id: 'payments',   label: 'Payments' },
  ];

  if (!authed) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,40,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, backdropFilter: 'blur(6px)' }} onClick={onClose}>
        <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: '22px', padding: '36px', width: '100%', maxWidth: '360px', textAlign: 'center', boxShadow: '0 32px 80px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
          <div style={{ fontSize: '11px', letterSpacing: '0.3em', color: T.admin, textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>Ophelia Admin</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', color: T.text1, fontWeight: 600, marginBottom: '24px' }}>Access Required</div>
          <input type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} placeholder="Admin passcode..." style={IS({ marginBottom: '12px', textAlign: 'center' })} />
          {passError && <div style={{ fontSize: '12px', color: T.danger, marginBottom: '10px' }}>Incorrect passcode</div>}
          <button onClick={login} style={PB({ width: '100%', padding: '12px', textAlign: 'center', background: T.admin })}>Enter Admin</button>
          <button onClick={onClose} style={{ ...GB({ width: '100%', textAlign: 'center', marginTop: '8px' }) }}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,40,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, backdropFilter: 'blur(4px)', padding: '16px' }} onClick={onClose}>
      <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: '22px', width: '100%', maxWidth: '720px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 32px 80px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 16px', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: T.sage }} />
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 600, color: T.text1 }}>Admin Panel</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: T.text3, cursor: 'pointer', fontSize: '18px' }}>&#10005;</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', padding: '12px 24px 0', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          {adminTabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: '8px 16px', border: 'none', borderRadius: '8px 8px 0 0', cursor: 'pointer', background: activeTab === t.id ? '#fff' : 'transparent', color: activeTab === t.id ? T.admin : T.text3, fontWeight: activeTab === t.id ? 700 : 400, fontSize: '13px', fontFamily: "'DM Sans', sans-serif", borderBottom: activeTab === t.id ? `2px solid ${T.admin}` : '2px solid transparent' }}>{t.label}</button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

          {/* Overview */}
          {activeTab === 'overview' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '24px' }}>
                {[
                  { label: 'Active Users', value: '—', note: 'Requires backend' },
                  { label: 'Subscribers', value: '—', note: 'Requires Stripe' },
                  { label: 'Affiliate Items', value: affPackages.length, note: 'Configured locally' },
                ].map(stat => (
                  <div key={stat.label} style={{ background: '#fff', border: `1px solid ${T.border}`, borderRadius: '14px', padding: '18px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', color: T.admin, fontWeight: 700, fontFamily: "'Cormorant Garamond', serif" }}>{stat.value}</div>
                    <div style={{ fontSize: '12px', color: T.text2, fontWeight: 600, marginTop: '2px' }}>{stat.label}</div>
                    <div style={{ fontSize: '10px', color: T.text4, marginTop: '2px' }}>{stat.note}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: '#fff', border: `1px solid ${T.border}`, borderRadius: '14px', padding: '18px' }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: 600, color: T.text1, marginBottom: '12px' }}>Next steps</div>
                {[
                  ['&#9670;', 'Connect a backend (Supabase / Firebase) for real user data'],
                  ['&#9670;', 'Add your Stripe publishable key and Price IDs in App.js'],
                  ['&#9670;', 'Configure affiliate passcodes after joining programs'],
                  ['&#9670;', 'Change ADMIN_PASSCODE before deploying to production'],
                  ['&#9670;', 'Set up Stripe webhook to confirm subscription status'],
                ].map(([icon, text]) => (
                  <div key={text} style={{ display: 'flex', gap: '10px', fontSize: '13px', color: T.text2, marginBottom: '8px', lineHeight: 1.5 }}>
                    <span dangerouslySetInnerHTML={{ __html: icon }} style={{ color: T.accent, flexShrink: 0 }} />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Affiliate Packages */}
          {activeTab === 'affiliate' && (
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 600, color: T.text1, marginBottom: '4px' }}>Affiliate Packages</div>
              <div style={{ fontSize: '13px', color: T.text3, marginBottom: '20px' }}>Add partner gift items here once affiliate programs are confirmed. These appear in the "Partner Gifts" tab of the Send a Gift modal.</div>

              {/* Add new */}
              <div style={{ background: '#fff', border: `1px solid ${T.border}`, borderRadius: '14px', padding: '18px', marginBottom: '20px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: T.text1, marginBottom: '14px' }}>Add New Package</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div><SectionLabel>Package Name</SectionLabel><input value={newPkg.name} onChange={e => setNewPkg(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Classic Roses" style={IS()} /></div>
                  <div><SectionLabel>Affiliate ID</SectionLabel><input value={newPkg.affiliateId} onChange={e => setNewPkg(p => ({ ...p, affiliateId: e.target.value }))} placeholder="e.g. 1800flowers" style={IS()} /></div>
                  <div><SectionLabel>Price ($)</SectionLabel><input type="number" value={newPkg.price} onChange={e => setNewPkg(p => ({ ...p, price: e.target.value }))} placeholder="59" style={IS()} /></div>
                  <div><SectionLabel>Commission</SectionLabel><input value={newPkg.commission} onChange={e => setNewPkg(p => ({ ...p, commission: e.target.value }))} placeholder="e.g. 8%" style={IS()} /></div>
                </div>
                <div style={{ marginBottom: '10px' }}><SectionLabel>Description</SectionLabel><input value={newPkg.desc} onChange={e => setNewPkg(p => ({ ...p, desc: e.target.value }))} placeholder="Short description..." style={IS()} /></div>
                <div style={{ marginBottom: '12px' }}><SectionLabel>Affiliate URL</SectionLabel><input value={newPkg.affiliateUrl} onChange={e => setNewPkg(p => ({ ...p, affiliateUrl: e.target.value }))} placeholder="https://..." style={IS()} /></div>
                <button onClick={savePackage} style={PB({ padding: '10px 20px', background: T.admin })}>Add Package</button>
              </div>

              {/* Existing */}
              {affPackages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px', background: T.surface, border: `1px dashed ${T.border2}`, borderRadius: '14px', color: T.text4, fontSize: '13px' }}>No affiliate packages yet</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {affPackages.map(pkg => (
                    <div key={pkg.id} style={{ background: '#fff', border: `1px solid ${T.border}`, borderRadius: '12px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: T.text1, fontSize: '14px' }}>{pkg.name}</div>
                        <div style={{ fontSize: '12px', color: T.text3, marginTop: '2px' }}>{pkg.desc}</div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                          <span style={{ fontSize: '11px', color: T.accent, fontWeight: 700 }}>${pkg.price}</span>
                          <span style={{ fontSize: '11px', color: T.text4 }}>via {pkg.affiliateId}</span>
                          {pkg.commission && <span style={{ fontSize: '11px', color: T.sage }}>&#9670; {pkg.commission} commission</span>}
                        </div>
                      </div>
                      <button onClick={() => removePackage(pkg.id)} style={{ ...DB, padding: '6px 12px', fontSize: '12px', flexShrink: 0 }}>Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Gift Catalog */}
          {activeTab === 'gifts' && (
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 600, color: T.text1, marginBottom: '4px' }}>Gift Catalog</div>
              <div style={{ fontSize: '13px', color: T.text3, marginBottom: '20px' }}>Current built-in gifts. Edit GIFT_ITEMS in App.js to add or modify items.</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {GIFT_ITEMS.map(g => (
                  <div key={g.id} style={{ background: '#fff', border: `1px solid ${T.border}`, borderRadius: '12px', padding: '12px 16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ fontSize: '18px', color: T.rose }}>{g.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: T.text1, fontSize: '13px' }}>{g.name}</div>
                      <div style={{ fontSize: '11px', color: T.text3, marginTop: '2px' }}>{g.desc}</div>
                    </div>
                    <div style={{ fontSize: '14px', color: T.accent, fontWeight: 700 }}>${g.price}</div>
                    <div style={{ fontSize: '11px', color: T.text4, background: T.surface, border: `1px solid ${T.border}`, borderRadius: '20px', padding: '3px 10px' }}>{g.cat}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payments */}
          {activeTab === 'payments' && (
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 600, color: T.text1, marginBottom: '4px' }}>Payment Configuration</div>
              <div style={{ fontSize: '13px', color: T.text3, marginBottom: '20px' }}>Stripe integration setup. These values need to be configured in App.js.</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {PLANS.filter(p => p.priceNum > 0).map(plan => (
                  <div key={plan.id} style={{ background: '#fff', border: `1px solid ${T.border}`, borderRadius: '14px', padding: '16px 18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: T.text1, fontSize: '14px' }}>{plan.label}</div>
                        <div style={{ fontSize: '13px', color: T.accent, fontWeight: 600, marginTop: '2px' }}>{plan.price}</div>
                      </div>
                      <div style={{ fontSize: '11px', background: plan.badge ? `${T.accent}15` : T.surface, color: plan.badge ? T.accent : T.text4, border: `1px solid ${plan.badge ? `${T.accent}30` : T.border}`, borderRadius: '20px', padding: '3px 10px', fontWeight: 600 }}>{plan.id.toUpperCase()}</div>
                    </div>
                    <div>
                      <SectionLabel>Stripe Price ID</SectionLabel>
                      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '8px', padding: '9px 12px', fontSize: '12px', color: plan.stripePriceId?.includes('HERE') ? T.danger : T.sky, fontFamily: 'monospace' }}>
                        {plan.stripePriceId}
                      </div>
                      {plan.stripePriceId?.includes('HERE') && <div style={{ fontSize: '11px', color: T.danger, marginTop: '4px' }}>&#9670; Update this in App.js → PLANS array</div>}
                    </div>
                  </div>
                ))}
                <div style={{ background: `${T.admin}0a`, border: `1px solid ${T.admin}25`, borderRadius: '14px', padding: '16px 18px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: T.admin, marginBottom: '8px' }}>Integration Checklist</div>
                  {['Set STRIPE_PUBLIC_KEY in App.js', 'Install @stripe/stripe-js and @stripe/react-stripe-js', 'Build a backend endpoint to create Stripe subscriptions', 'Configure webhook to update user subscription status'].map(item => (
                    <div key={item} style={{ fontSize: '12px', color: T.text2, marginBottom: '5px', display: 'flex', gap: '8px' }}>
                      <span style={{ color: T.border2 }}>&#9671;</span><span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Onboarding ───────────────────────────────────────────────────────────────
function Onboarding({ onComplete }) {
  const [step,         setStep]        = useState(0);
  const [plan,         setPlan]        = useState('plus');
  const [types,        setTypes]       = useState([]);
  const [name,         setName]        = useState('');
  const [partnerName,  setPartnerName] = useState('');
  const [tzA,          setTzA]         = useState('Pacific/Honolulu');
  const [tzB,          setTzB]         = useState('Australia/Melbourne');
  const [showPayment,  setShowPayment] = useState(false);

  const toggle = id => setTypes(c => c.includes(id) ? c.filter(i => i !== id) : [...c, id]);
  const progress = [0, 25, 55, 82, 100][step];

  const selectedPlan = PLANS.find(p => p.id === plan);
  const isPaid = selectedPlan?.priceNum > 0;

  function handleFinish() {
    if (isPaid) { setShowPayment(true); }
    else { onComplete({ plan, types, name, partnerName, tzA, tzB }); }
  }

  return (
    <div style={{ minHeight: '100vh', zoom: '120%', background: T.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: "'DM Sans', sans-serif" }}>
      {step > 0 && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '3px', background: T.border, zIndex: 10 }}>
          <div style={{ height: '100%', width: `${progress}%`, background: T.accent, transition: 'width 0.4s ease', borderRadius: '0 2px 2px 0' }} />
        </div>
      )}

      <div style={{ maxWidth: '520px', width: '100%' }}>

        {/* Step 0 — Welcome */}
        {step === 0 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '13px', letterSpacing: '0.35em', color: T.text4, textTransform: 'uppercase', marginBottom: '10px' }}>Welcome to</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(56px,12vw,80px)', fontWeight: 300, color: T.text1, lineHeight: 0.9, letterSpacing: '-0.02em', marginBottom: '8px' }}>Ophelia</h1>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', color: T.text3, fontStyle: 'italic', marginBottom: '40px' }}>your everyday calendar</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '36px', textAlign: 'left' }}>
              {[
                ['◇', 'Made for people who live across time zones'],
                ['⊕', 'Always shows your time and their time, side by side'],
                ['❧', 'Send flowers, gifts, and love notes between cities'],
              ].map(([icon, text]) => (
                <div key={text} style={{ display: 'flex', gap: '14px', alignItems: 'center', background: '#fff', border: `1px solid ${T.border}`, borderRadius: '12px', padding: '14px 16px', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                  <span style={{ color: T.accent, fontSize: '18px', width: '22px', textAlign: 'center', flexShrink: 0 }}>{icon}</span>
                  <span style={{ fontSize: '14px', color: T.text2, fontWeight: 500 }}>{text}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setStep(1)} style={PB({ padding: '14px 52px', fontSize: '15px', borderRadius: '40px', letterSpacing: '0.08em', boxShadow: '0 6px 24px rgba(181,99,30,0.35)' })}>Get Started</button>
            <div style={{ fontSize: '12px', color: T.text4, marginTop: '12px' }}>1 month free &mdash; then $3.99 / month</div>
          </div>
        )}

        {/* Step 1 — Plan */}
        {step === 1 && (
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '30px', fontWeight: 400, color: T.text1, marginBottom: '6px' }}>Choose your plan</div>
            <div style={{ fontSize: '14px', color: T.text3, marginBottom: '26px' }}>Start free for 30 days. Cancel anytime.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
              {PLANS.map(item => (
                <div key={item.id} onClick={() => setPlan(item.id)} className="lift" style={{ background: plan === item.id ? `${T.accent}0e` : '#fff', border: `1.5px solid ${plan === item.id ? T.accent : T.border}`, borderRadius: '14px', padding: '18px 20px', cursor: 'pointer', position: 'relative', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
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

        {/* Step 2 — User type */}
        {step === 2 && (
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '30px', fontWeight: 400, color: T.text1, marginBottom: '6px' }}>How do you use your time?</div>
            <div style={{ fontSize: '14px', color: T.text3, marginBottom: '22px' }}>Select all that apply — Ophelia adapts to you.</div>
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

        {/* Step 3 — Profile */}
        {step === 3 && (
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '30px', fontWeight: 400, color: T.text1, marginBottom: '6px' }}>Set up your profile</div>
            <div style={{ fontSize: '14px', color: T.text3, marginBottom: '22px' }}>Just the basics to get started.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '26px' }}>
              <div><SectionLabel>Your Name</SectionLabel><input value={name} onChange={e => setName(e.target.value)} placeholder="Your name..." style={IS()} /></div>
              <div><SectionLabel>Your Timezone</SectionLabel><TzSelect value={tzA} onChange={e => setTzA(e.target.value)} /></div>
              {(types.includes('couple') || types.includes('traveler')) && (
                <>
                  <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: '14px' }}>
                    <SectionLabel color={T.rose}>{types.includes('couple') ? "Partner's Name" : 'Primary Contact'}</SectionLabel>
                    <input value={partnerName} onChange={e => setPartnerName(e.target.value)} placeholder="Their name..." style={IS()} />
                  </div>
                  <div><SectionLabel color={T.rose}>Their Timezone</SectionLabel><TzSelect value={tzB} onChange={e => setTzB(e.target.value)} /></div>
                </>
              )}
            </div>

            {isPaid && (
              <div style={{ background: `${T.accent}08`, border: `1px solid ${T.accent}25`, borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: T.text2 }}>
                &#9670;&ensp;You'll complete your <strong>{selectedPlan?.label}</strong> subscription on the next step — first month free.
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setStep(2)} style={GB({ flexShrink: 0 })}>Back</button>
              <button onClick={handleFinish} disabled={!name} style={PB({ flex: 1, textAlign: 'center', opacity: !name ? 0.4 : 1 })}>
                {isPaid ? 'Continue to Payment &#8594;' : 'Open Ophelia &#8594;'}
              </button>
            </div>
          </div>
        )}
      </div>

      {showPayment && (
        <PaymentModal
          plan={plan}
          onSuccess={() => { setShowPayment(false); onComplete({ plan, types, name, partnerName, tzA, tzB }); }}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  );
}

// ─── Calendar ─────────────────────────────────────────────────────────────────
function Calendar({ config }) {
  const { types, name, partnerName, tzA: initA, tzB: initB } = config;

  const today    = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  const hasPartner = types.includes('couple');
  const isTraveler = types.includes('traveler');
  const isLocal    = types.includes('local') && !hasPartner && !isTraveler;

  const [tzA,        setTzA]       = useState(initA || 'Pacific/Honolulu');
  const [tzB,        setTzB]       = useState(initB || 'Australia/Melbourne');
  const [labelA,     setLabelA]    = useState(name || 'You');
  const [labelB,     setLabelB]    = useState(partnerName || 'Them');

  const [events, setEvents] = useState(() =>
    LS.get('ophelia_events', [{ id: 1, title: 'Weekly video call', date: todayStr, time: '19:00', tz: initA || 'Pacific/Honolulu', color: T.rose, note: 'Our standing date night' }])
  );
  const [notes, setNotes] = useState(() =>
    LS.get('ophelia_notes', [{ id: 1, text: "Every distance is just a countdown until I'm with you again.", from: 'B', date: todayStr }])
  );
  const affPackages = LS.get('ophelia_affiliate_packages', []);

  // Persist events & notes
  useEffect(() => { LS.set('ophelia_events', events); }, [events]);
  useEffect(() => { LS.set('ophelia_notes', notes); },  [notes]);

  const [viewMonth,   setViewMonth]  = useState(today.getMonth());
  const [viewYear,    setViewYear]   = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);
  const [modal,       setModal]      = useState(null);
  const [panel,       setPanel]      = useState(null);
  const [travelMode,  setTravelMode] = useState(false);
  const [travelTz,    setTravelTz]   = useState('America/New_York');
  const [showGift,    setShowGift]   = useState(false);
  const [showNotes,   setShowNotes]  = useState(false);
  const [showSplash,  setShowSplash] = useState(hasPartner && notes.length > 0);

  const activeTzA = travelMode ? travelTz : tzA;
  const accentB   = hasPartner ? T.rose : isTraveler ? T.sky : T.sage;

  const firstDay     = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth  = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  while (cells.length % 7 !== 0) cells.push(null);

  const eventsForDay = day => {
    if (!day) return [];
    const ds = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return events.filter(e => e.date === ds);
  };

  const upcoming = [...events].filter(e => e.date >= todayStr).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)).slice(0, 5);

  const prevMonth = () => { setSelectedDay(null); if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { setSelectedDay(null); if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

  return (
    <>
      <div style={{ minHeight: '100vh', background: T.bg, fontFamily: "'DM Sans', sans-serif", color: T.text1 }}>
        <div style={{ maxWidth: '840px', margin: '0 auto', padding: '28px 18px 80px' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '11px', letterSpacing: '0.4em', color: T.text4, textTransform: 'uppercase', marginBottom: '6px' }}>Ophelia</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(28px,5vw,42px)', fontWeight: 300, color: T.text1, lineHeight: 1.05 }}>
              {hasPartner ? (<>Hello, <em style={{ color: T.accent, fontStyle: 'italic' }}>{labelA}</em></>) :
               isLocal   ? (<>Good {today.getHours() < 12 ? 'morning' : today.getHours() < 18 ? 'afternoon' : 'evening'}, <em style={{ color: T.accent }}>{labelA}</em></>) :
                           (<>Welcome back, <em style={{ color: T.accent }}>{labelA}</em></>)}
            </h1>
          </div>

          {/* Dual clocks */}
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

          {isLocal && (
            <div style={{ marginBottom: '22px' }}>
              <Clock tz={tzA} accent={T.sage} label={`${labelA} · ${TIMEZONES.find(t => t.value === tzA)?.label || tzA}`} />
            </div>
          )}

          {/* Action pills */}
          <div style={{ display: 'flex', gap: '7px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '22px' }}>
            <button style={pill(panel === 'settings')} onClick={() => setPanel(p => p === 'settings' ? null : 'settings')}>&#9965;&ensp;Settings</button>
            {(isTraveler || hasPartner) && <button style={pill(travelMode, T.sage)} onClick={() => setTravelMode(v => !v)}>&#8853;&ensp;Travel Mode</button>}
            {(hasPartner || isTraveler) && <button style={pill(panel === 'meeting', T.lavender)} onClick={() => setPanel(p => p === 'meeting' ? null : 'meeting')}>&#9737;&ensp;Best Times</button>}
            {(hasPartner || isTraveler) && <button style={pill(panel === 'share', T.sky)} onClick={() => setPanel(p => p === 'share' ? null : 'share')}>&#8618;&ensp;Share</button>}
            {hasPartner && <button style={pill(showGift, T.rose)} onClick={() => setShowGift(true)}>❧&ensp;Send a Gift</button>}
            {hasPartner && (
              <button style={pill(showNotes, T.lavender)} onClick={() => setShowNotes(true)}>
                &#9825;&ensp;Love Notes{notes.length > 0 && <span style={{ background: T.lavender, color: '#fff', borderRadius: '20px', padding: '1px 6px', fontSize: '10px', fontWeight: 700, marginLeft: '4px' }}>{notes.length}</span>}
              </button>
            )}
          </div>

          {/* Settings panel */}
          {panel === 'settings' && (
            <div style={{ background: '#fff', border: `1px solid ${T.border}`, borderRadius: '16px', padding: '20px 22px', marginBottom: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', color: T.text1, fontWeight: 600, marginBottom: '16px' }}>Settings</div>
              <div style={{ display: 'grid', gridTemplateColumns: isLocal ? '1fr' : '1fr 1fr', gap: '14px' }}>
                {[
                  { label: 'Your Name', value: labelA, set: setLabelA, tz: tzA, setTz: setTzA, color: T.accent },
                  ...(!isLocal ? [{ label: hasPartner ? 'Partner' : 'Contact', value: labelB, set: setLabelB, tz: tzB, setTz: setTzB, color: accentB }] : []),
                ].map((item, i) => (
                  <div key={i}>
                    <SectionLabel color={item.color}>{item.label}</SectionLabel>
                    <input value={item.value} onChange={e => item.set(e.target.value)} style={IS({ marginBottom: '8px' })} />
                    <TzSelect value={item.tz} onChange={e => item.setTz(e.target.value)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Travel mode */}
          {travelMode && (
            <div style={{ background: '#f0faf2', border: `1px solid ${T.sage}40`, borderRadius: '14px', padding: '14px 18px', marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', letterSpacing: '0.14em', color: T.sage, textTransform: 'uppercase', fontWeight: 700, marginBottom: '9px' }}>&#8853; Where are you right now?</div>
              <TzSelect value={travelTz} onChange={e => setTravelTz(e.target.value)} />
              <div style={{ fontSize: '12px', color: T.sage, marginTop: '8px' }}>Your clock updates to your travel city. Events still save in your home timezone.</div>
            </div>
          )}

          {/* Calendar grid */}
          <div style={{ background: '#fff', border: `1px solid ${T.border}`, borderRadius: '20px', overflow: 'hidden', marginBottom: '22px', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 14px', borderBottom: `1px solid ${T.border}` }}>
              <button onClick={prevMonth} style={{ background: 'none', border: 'none', color: T.text3, fontSize: '22px', cursor: 'pointer', padding: '2px 8px', lineHeight: 1 }}>&#8249;</button>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', color: T.text1, fontWeight: 600, letterSpacing: '0.02em' }}>{MONTHS[viewMonth]}&ensp;<span style={{ color: T.text4, fontWeight: 300 }}>{viewYear}</span></div>
              <button onClick={nextMonth} style={{ background: 'none', border: 'none', color: T.text3, fontSize: '22px', cursor: 'pointer', padding: '2px 8px', lineHeight: 1 }}>&#8250;</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '10px 12px 2px' }}>
              {DAYS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: '11px', letterSpacing: '0.1em', color: T.text4, textTransform: 'uppercase', fontWeight: 600 }}>{d}</div>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '2px', padding: '4px 10px 14px' }}>
              {cells.map((day, idx) => {
                const dayEvents = eventsForDay(day);
                const ds = day ? `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}` : '';
                const isToday    = ds === todayStr;
                const isSelected = selectedDay === day;
                return (
                  <div key={idx} className="day-cell" onClick={() => day && setSelectedDay(day === selectedDay ? null : day)} style={{ minHeight: '54px', padding: '5px 4px', borderRadius: '9px', cursor: day ? 'pointer' : 'default', background: isSelected ? `${T.accent}18` : isToday ? `${T.accent}0e` : 'transparent', border: isToday ? `1.5px solid ${T.accent}50` : '1.5px solid transparent', transition: 'background 0.12s' }}>
                    {day && (
                      <>
                        <div style={{ fontSize: '13px', color: isToday ? T.accent : T.text1, fontWeight: isToday ? 700 : 500, textAlign: 'center', marginBottom: '3px' }}>{day}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', justifyContent: 'center' }}>
                          {dayEvents.slice(0, 3).map(e => <div key={e.id} style={{ width: '6px', height: '6px', borderRadius: '50%', background: e.color }} />)}
                          {dayEvents.length > 3 && <span style={{ fontSize: '9px', color: T.text4 }}>+{dayEvents.length - 3}</span>}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Day detail */}
          {selectedDay && (() => {
            const dayEvents = eventsForDay(selectedDay);
            const ds = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(selectedDay).padStart(2,'0')}`;
            return (
              <div style={{ marginBottom: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', color: T.text1, fontWeight: 600 }}>{MONTHS[viewMonth]} {selectedDay}</div>
                  <button onClick={() => setModal({ date: ds })} style={PB({ padding: '8px 16px', fontSize: '12px' })}>&#43;&ensp;Add Event</button>
                </div>
                {dayEvents.length === 0 ? (
                  <div style={{ fontSize: '13px', color: T.text4, padding: '16px', textAlign: 'center', background: T.surface, border: `1px solid ${T.border}`, borderRadius: '12px' }}>Nothing planned yet &#9671;</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {dayEvents.map(e => <EventCard key={e.id} ev={e} tzA={activeTzA} tzB={isLocal ? null : tzB} labelA={labelA} labelB={labelB} onClick={() => setModal(e)} />)}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', color: T.text1, fontWeight: 600, marginBottom: '12px' }}>
                Coming up&ensp;<span style={{ fontStyle: 'italic', color: T.text3, fontWeight: 300 }}>{hasPartner ? 'for both of you' : 'for you'}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {upcoming.map(e => <EventCard key={e.id} ev={e} tzA={activeTzA} tzB={isLocal ? null : tzB} labelA={labelA} labelB={labelB} onClick={() => setModal(e)} />)}
              </div>
            </div>
          )}

          {/* Latest note teaser */}
          {hasPartner && notes.length > 0 && (
            <div onClick={() => setShowNotes(true)} style={{ background: '#fff', border: `1px solid ${T.lavender}30`, borderLeft: `4px solid ${T.lavender}`, borderRadius: '14px', padding: '16px 20px', marginBottom: '24px', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '11px', letterSpacing: '0.15em', color: T.lavender, textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>&#9825; Latest Note</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontStyle: 'italic', color: T.text1, lineHeight: 1.55, marginBottom: '6px' }}>"{notes[notes.length - 1].text}"</div>
              <div style={{ fontSize: '11px', color: T.text4 }}>from {notes[notes.length - 1].from === 'A' ? labelA : labelB} · {dateLabel(notes[notes.length - 1].date)} · <span style={{ color: T.lavender }}>See all {notes.length} notes &#8594;</span></div>
            </div>
          )}

          {/* New event CTA */}
          {!selectedDay && (
            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <button onClick={() => setModal({})} style={PB({ padding: '13px 40px', fontSize: '15px', borderRadius: '40px', letterSpacing: '0.06em', boxShadow: '0 6px 24px rgba(181,99,30,0.3)' })}>&#43;&ensp;New Event</button>
            </div>
          )}
        </div>
      </div>

      {modal !== null && (
        <EventModal event={modal} tzA={tzA} tzB={isLocal ? null : tzB} labelA={labelA} labelB={labelB}
          onClose={() => setModal(null)}
          onSave={ev => { setEvents(prev => { const exists = prev.find(i => i.id === ev.id); return exists ? prev.map(i => i.id === ev.id ? ev : i) : [...prev, ev]; }); setModal(null); }}
          onDelete={id => { setEvents(prev => prev.filter(e => e.id !== id)); setModal(null); }}
        />
      )}
      {panel === 'meeting' && <MeetingFinder tzA={activeTzA} tzB={tzB} labelA={labelA} labelB={labelB} onClose={() => setPanel(null)} />}
      {panel === 'share'   && <ShareModal tzA={tzA} tzB={tzB} labelA={labelA} labelB={labelB} events={events} onClose={() => setPanel(null)} />}
      {showGift  && <GiftModal partnerName={labelB} affiliatePackages={affPackages} onClose={() => setShowGift(false)} />}
      {showNotes && <NotesWall notes={notes} labelA={labelA} labelB={labelB} onClose={() => setShowNotes(false)} onAdd={note => setNotes(prev => [...prev, note])} onDelete={id => setNotes(prev => prev.filter(n => n.id !== id))} />}
      {showSplash && <LoveNoteSplash notes={notes} labelA={labelA} labelB={labelB} onClose={() => setShowSplash(false)} />}
    </>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function Ophelia() {
  const [config,      setConfig]     = useState(() => LS.get('ophelia_config', null));
  const [showAdmin,   setShowAdmin]  = useState(false);

  // Handle shared calendar URL
  useEffect(() => {
    const cal = new URLSearchParams(window.location.search).get('cal');
    if (!cal) return;
    const decoded = decodeShare(cal);
    if (!decoded) return;
    setConfig({ types: ['couple'], name: decoded.labelA || 'You', partnerName: decoded.labelB || 'Them', tzA: decoded.tzA, tzB: decoded.tzB, plan: 'plus' });
  }, []);

  // Admin shortcut: ?admin=1 in URL
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('admin') === '1') setShowAdmin(true);
  }, []);

  function handleComplete(cfg) {
    LS.set('ophelia_config', cfg);
    setConfig(cfg);
  }

  function handleReset() {
    LS.del('ophelia_config');
    LS.del('ophelia_events');
    LS.del('ophelia_notes');
    setConfig(null);
  }

  return (
    <>
      <style>{CSS}</style>

      {config ? <Calendar config={config} /> : <Onboarding onComplete={handleComplete} />}

      {/* Upgrade / Reset button */}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
        {config && (
          <button onClick={handleReset} style={{ background: T.surface2, color: T.text3, border: `1px solid ${T.border}`, padding: '8px 14px', borderRadius: '999px', fontSize: '12px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
            &#8635; Reset
          </button>
        )}
        {(!config || config?.plan === 'free') && (
          <button onClick={() => window.open('https://kadenrohatensky.gumroad.com/l/wonfe', '_blank')} style={{ background: T.accent, color: 'white', border: 'none', padding: '14px 20px', borderRadius: '999px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', fontFamily: "'DM Sans', sans-serif" }}>
            Upgrade to Plus
          </button>
        )}
      </div>

      {/* Admin panel */}
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
    </>
  );
}
