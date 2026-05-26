port React, { useState, useEffect, useRef } from 'react';
// - Palette -
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
};

// - Timezones -
const TIMEZONES = [
  { label: 'Honolulu (Hawaii)', value: 'Pacific/Honolulu', region: 'USA' },
  { label: 'Anchorage (Alaska)', value: 'America/Anchorage', region: 'USA' },
  { label: 'Los Angeles', value: 'America/Los_Angeles', region: 'USA' },
  { label: 'Phoenix (Arizona)', value: 'America/Phoenix', region: 'USA' },
  { label: 'Denver', value: 'America/Denver', region: 'USA' },
  { label: 'Chicago', value: 'America/Chicago', region: 'USA' },
  {
    label: 'Miami / Tampa (Florida)',
    value: 'America/New_York',
    region: 'USA',
  },
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
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const USER_TYPES = [
  {
    id: 'couple',
    icon: '◇',
    title: 'Long-Distance Couple',
    accent: T.rose,
    desc: 'Stay close across time zones. Two clocks, shared events, love notes and surprises.',
    features: [
      'Dual timezone clocks',
      'Shared calendar',
      'Best times to meet',
      'Send flowers & gifts',
      'Love note wall',
    ],
  },
  {
    id: 'traveler',
    icon: '⊕',
    title: 'Business Traveler',
    accent: T.sky,
    desc: "You move fast. Ophelia keeps every city's time straight and your schedule clean.",
    features: [
      'Travel mode',
      'Multi-city view',
      'Meeting overlap finder',
      'Trip date ranges',
      'Flight note fields',
    ],
  },
  {
    id: 'local',
    icon: '⌂',
    title: 'Stay in One Place',
    accent: T.sage,
    desc: 'Simple, beautiful, distraction-free. Just a great personal calendar.',
    features: [
      'Single-timezone calendar',
      'Color-coded events',
      'Daily agenda',
      'Reminders',
      'Calendar import',
    ],
  },
];
const GUMROAD_LINKS = {
  plus: 'https://kadenrohatensky.gumroad.com/l/wonfe',
  pro: 'https://kadenrohatensky.gumroad.com/l/wonfe',
};

const GIFT_ITEMS = [
  {
    id: 'roses',
    cat: 'flowers',
    name: 'Red Roses',
    price: 49,
    icon: '❧',
    desc: 'A dozen long-stem red roses with a handwritten note.',
  },
  {
    id: 'wild',
    cat: 'flowers',
    name: 'Wildflower Bouquet',
    price: 42,
    icon: '❧',
    desc: 'A seasonal wildflower mix — bright, informal, joyful.',
  },
  {
    id: 'sun',
    cat: 'flowers',
    name: 'Sunflowers',
    price: 38,
    icon: '❧',
    desc: 'Six tall sunflowers to brighten any room.',
  },
  {
    id: 'orchid',
    cat: 'flowers',
    name: 'Orchid Plant',
    price: 55,
    icon: '❧',
    desc: 'A living orchid — lasting weeks beyond cut flowers.',
  },
  {
    id: 'cozy',
    cat: 'package',
    name: 'Cozy Night In',
    price: 68,
    icon: '◈',
    desc: 'Candle, herbal tea, chocolate, and a hand-written card.',
  },
  {
    id: 'snacks',
    cat: 'package',
    name: 'Snack Haul',
    price: 52,
    icon: '◈',
    desc: 'A curated box of favourite snacks from around the world.',
  },
  {
    id: 'spa',
    cat: 'package',
    name: 'Spa at Home',
    price: 75,
    icon: '◈',
    desc: 'Face mask, bath salts, lavender oil, and cozy socks.',
  },
  {
    id: 'book',
    cat: 'package',
    name: 'Book & Coffee',
    price: 44,
    icon: '◈',
    desc: 'A bestselling novel plus specialty coffee.',
  },
  {
    id: 'custom',
    cat: 'package',
    name: 'Custom Box',
    price: 90,
    icon: '◈',
    desc: 'You choose what goes in — we curate and ship it.',
  },
];

// - Helpers -
function fmt(date, tz, opts = {}) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      ...opts,
    }).format(date);
  } catch {
    return '–';
  }
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
  return diff > 0
    ? `${nameB} is ${diff}h ahead`
    : `${nameB} is ${Math.abs(diff)}h behind`;
}

function evtTime(ev, tz) {
  try {
    return fmt(new Date(`${ev.date}T${ev.time}`), tz, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '–';
  }
}

function encodeShare(data) {
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  } catch {
    return '';
  }
}

function decodeShare(value) {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(value))));
  } catch {
    return null;
  }
}

function dateLabel(dateString) {
  try {
    return new Date(`${dateString}T12:00`).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

// - Styles -
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

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  background: #faf6f0;
}

::-webkit-scrollbar {
  width: 5px;
}

::-webkit-scrollbar-track {
  background: #f2ece2;
}

::-webkit-scrollbar-thumb {
  background: #c8b89a;
  border-radius: 3px;
}

input::placeholder,
textarea::placeholder {
  color: #b0988a;
}

select option {
  background: #fff;
  color: #1a1208;
}

.day-cell:hover {
  background: #ece4d6 !important;
}

.lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0,0,0,0.1) !important;
  transition: transform 0.18s, box-shadow 0.18s;
}
`;

// - TZ Select -
function TzSelect({ value, onChange, style }) {
  const regions = [...new Set(TIMEZONES.map((t) => t.region))];

  return (
    <select value={value} onChange={onChange} style={style || IS()}>
      {regions.map((region) => (
        <optgroup key={region} label={region}>
          {TIMEZONES.filter((t) => t.region === region).map((t) => (
            <option key={`${t.value}-${t.label}`} value={t.value}>
              {t.label}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

// - Love Note Splash -
function LoveNoteSplash({ notes, labelA, labelB, onClose }) {
  const latest = notes.length > 0 ? notes[notes.length - 1] : null;
  if (!latest) return null;

  const fromName = latest.from === 'A' ? labelA : labelB;
  const fromColor = latest.from === 'A' ? T.accent : T.rose;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(26,18,8,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 300,
        padding: '24px',
        backdropFilter: 'blur(6px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: T.bg,
          border: `1px solid ${T.border}`,
          borderRadius: '24px',
          padding: '40px 36px',
          width: '100%',
          maxWidth: '400px',
          textAlign: 'center',
          boxShadow: '0 32px 80px rgba(0,0,0,0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: '32px', marginBottom: '16px' }}>❧</div>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '13px',
            letterSpacing: '0.25em',
            color: T.text4,
            textTransform: 'uppercase',
            marginBottom: '6px',
          }}
        >
          A note from
        </div>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '22px',
            fontWeight: 600,
            color: fromColor,
            marginBottom: '24px',
          }}
        >
          {fromName}
        </div>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '20px',
            fontStyle: 'italic',
            color: T.text1,
            lineHeight: 1.6,
            marginBottom: '8px',
            padding: '0 8px',
          }}
        >
          "{latest.text}"
        </div>
        <div style={{ fontSize: '11px', color: T.text4, marginBottom: '28px' }}>
          {dateLabel(latest.date)}
        </div>
        <button
          onClick={onClose}
          style={PB({
            padding: '11px 36px',
            borderRadius: '40px',
            background: fromColor,
          })}
        >
          Open Ophelia
        </button>
      </div>
    </div>
  );
}

// - Notes Wall Modal -
function NotesWall({ notes, labelA, labelB, onClose, onAdd, onDelete }) {
  const [text, setText] = useState('');
  const [from, setFrom] = useState('A');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [notes.length]);

  function submit() {
    if (!text.trim()) return;

    onAdd({
      id: Date.now(),
      text: text.trim(),
      from,
      date: new Date().toISOString().split('T')[0],
    });

    setText('');
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(26,18,8,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: '20px',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: T.bg,
          border: `1px solid ${T.border}`,
          borderRadius: '22px',
          width: '100%',
          maxWidth: '480px',
          maxHeight: '82vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '22px 24px 16px',
            borderBottom: `1px solid ${T.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '22px',
                fontWeight: 600,
                color: T.text1,
              }}
            >
              Love Notes
            </div>
            <div style={{ fontSize: '12px', color: T.text3, marginTop: '2px' }}>
              {notes.length} note{notes.length !== 1 ? 's' : ''} saved
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: T.text3,
              cursor: 'pointer',
              fontSize: '20px',
              lineHeight: 1,
            }}
          >
            &#10005;
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {notes.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: T.text4,
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '17px',
                fontStyle: 'italic',
              }}
            >
              No notes yet -- write the first one ❧
            </div>
          )}

          {notes.map((note) => {
            const isA = note.from === 'A';
            const name = isA ? labelA : labelB;
            const color = isA ? T.accent : T.rose;

            return (
              <div
                key={note.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isA ? 'flex-start' : 'flex-end',
                }}
              >
                <div
                  style={{
                    maxWidth: '80%',
                    background: isA ? '#fff' : `${T.rose}0f`,
                    border: `1px solid ${isA ? T.border : `${T.rose}30`}`,
                    borderRadius: isA
                      ? '4px 18px 18px 18px'
                      : '18px 4px 18px 18px',
                    padding: '14px 16px',
                    boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: '16px',
                      fontStyle: 'italic',
                      color: T.text1,
                      lineHeight: 1.55,
                      marginBottom: '8px',
                    }}
                  >
                    "{note.text}"
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '16px',
                    }}
                  >
                    <div style={{ fontSize: '11px', color, fontWeight: 600 }}>
                      {name}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ fontSize: '11px', color: T.text4 }}>
                        {dateLabel(note.date)}
                      </div>
                      <button
                        onClick={() => onDelete(note.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: T.border2,
                          fontSize: '13px',
                          lineHeight: 1,
                          padding: 0,
                        }}
                      >
                        &#10005;
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={endRef} />
        </div>

        <div
          style={{
            padding: '14px 20px 18px',
            borderTop: `1px solid ${T.border}`,
            flexShrink: 0,
            background: T.surface,
          }}
        >
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            <div
              style={{
                fontSize: '11px',
                color: T.text3,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: 600,
                alignSelf: 'center',
                marginRight: '4px',
              }}
            >
              From:
            </div>
            {[
              { value: 'A', label: labelA, color: T.accent },
              { value: 'B', label: labelB, color: T.rose },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setFrom(item.value)}
                style={{
                  ...GB({ flex: 1, textAlign: 'center', padding: '7px 10px' }),
                  background:
                    from === item.value ? `${item.color}18` : T.surface2,
                  border: `1px solid ${
                    from === item.value ? `${item.color}55` : T.border
                  }`,
                  color: from === item.value ? item.color : T.text3,
                  fontWeight: from === item.value ? 700 : 400,
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder="Write a little note..."
              rows={2}
              style={IS({
                flex: 1,
                resize: 'none',
                fontSize: '14px',
                width: 'auto',
              })}
            />
            <button
              onClick={submit}
              disabled={!text.trim()}
              style={PB({
                padding: '10px 16px',
                borderRadius: '10px',
                alignSelf: 'stretch',
                opacity: text.trim() ? 1 : 0.4,
                background: from === 'B' ? T.rose : T.accent,
              })}
            >
              &#8593;
            </button>
          </div>

          <div style={{ fontSize: '11px', color: T.text4, marginTop: '6px' }}>
            Press Enter to send · Shift+Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
}

// - Clock -
function Clock({ tz, label, accent = T.accent, tag }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        background: '#fff',
        border: `1px solid ${T.border}`,
        borderRadius: '16px',
        padding: '16px 20px',
        textAlign: 'center',
        flex: 1,
        minWidth: 0,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        position: 'relative',
      }}
    >
      {tag && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '10px',
            fontSize: '9px',
            letterSpacing: '0.14em',
            color: T.sage,
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
        >
          {tag}
        </div>
      )}
      <div
        style={{
          fontSize: '10px',
          letterSpacing: '0.18em',
          color: accent,
          textTransform: 'uppercase',
          marginBottom: '4px',
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: '28px',
          fontFamily: "'Cormorant Garamond', serif",
          color: T.text1,
          fontWeight: 600,
          lineHeight: 1,
        }}
      >
        {fmt(time, tz, {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })}
      </div>
      <div style={{ fontSize: '12px', color: T.text3, marginTop: '4px' }}>
        {fmt(time, tz, { weekday: 'short', month: 'short', day: 'numeric' })}
      </div>
    </div>
  );
}

// - Event Card -
function EventCard({ ev, tzA, tzB, labelA, labelB, onClick }) {
  const tA = evtTime(ev, tzA);
  const tB = tzB ? evtTime(ev, tzB) : null;

  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff',
        border: `1px solid ${T.border}`,
        borderLeft: `4px solid ${ev.color}`,
        borderRadius: '12px',
        padding: '12px 16px',
        cursor: 'pointer',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
        boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '14px',
            color: T.text1,
            fontWeight: 600,
            marginBottom: '4px',
          }}
        >
          {ev.title}
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px' }}>
            <span style={{ color: T.text4 }}>{labelA} </span>
            <span style={{ color: T.accent, fontWeight: 600 }}>{tA}</span>
          </span>
          {tB && (
            <>
              <span style={{ fontSize: '11px', color: T.border2 }}>◆</span>
              <span style={{ fontSize: '12px' }}>
                <span style={{ color: T.text4 }}>{labelB} </span>
                <span style={{ color: T.lavender, fontWeight: 600 }}>{tB}</span>
              </span>
            </>
          )}
        </div>
        {ev.note && (
          <div
            style={{
              fontSize: '11px',
              color: T.text3,
              marginTop: '3px',
              fontStyle: 'italic',
            }}
          >
            {ev.note}
          </div>
        )}
      </div>
      <div
        style={{
          fontSize: '11px',
          color: T.text4,
          whiteSpace: 'nowrap',
          paddingTop: '2px',
        }}
      >
        {dateLabel(ev.date)}
      </div>
    </div>
  );
}

// - Event Modal -
function EventModal({
  event,
  tzA,
  tzB,
  labelA,
  labelB,
  onClose,
  onSave,
  onDelete,
}) {
  const [title, setTitle] = useState(event?.title || '');
  const [date, setDate] = useState(event?.date || '');
  const [time, setTime] = useState(event?.time || '12:00');
  const [tz, setTz] = useState(event?.tz || tzA);
  const [color, setColor] = useState(event?.color || EVENT_COLORS[0].value);
  const [note, setNote] = useState(event?.note || '');

  const otherTz = tz === tzA ? tzB : tzA;
  const otherLabel = tz === tzA ? labelB : labelA;

  let converted = '';
  if (date && time && otherTz) {
    try {
      converted = fmt(new Date(`${date}T${time}`), otherTz, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        month: 'short',
        day: 'numeric',
      });
    } catch {
      converted = '';
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(26,18,8,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: '20px',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: T.bg,
          border: `1px solid ${T.border}`,
          borderRadius: '22px',
          padding: '28px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '22px',
            color: T.text1,
            marginBottom: '20px',
            fontWeight: 600,
          }}
        >
          {event?.id ? 'Edit Event' : 'New Event'}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            placeholder="Event title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={IS()}
          />

          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={IS({ flex: 1, width: 'auto' })}
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              style={IS({ flex: 1, width: 'auto' })}
            />
          </div>

          {tzB && (
            <div>
              <div
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.12em',
                  color: T.text3,
                  textTransform: 'uppercase',
                  marginBottom: '7px',
                  fontWeight: 600,
                }}
              >
                Whose timezone?
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { label: labelA, value: tzA },
                  { label: labelB, value: tzB },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setTz(item.value)}
                    style={{
                      ...GB({
                        flex: 1,
                        textAlign: 'center',
                        padding: '8px 12px',
                      }),
                      background:
                        tz === item.value ? `${T.accent}15` : T.surface2,
                      border: `1px solid ${
                        tz === item.value ? `${T.accent}60` : T.border
                      }`,
                      color: tz === item.value ? T.accent : T.text3,
                      fontWeight: tz === item.value ? 700 : 400,
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {converted && (
            <div
              style={{
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: '10px',
                padding: '10px 14px',
                fontSize: '13px',
                color: T.text2,
              }}
            >
              ∺ For <strong>{otherLabel}</strong>, this is{' '}
              <span style={{ color: T.accent, fontWeight: 700 }}>
                {converted}
              </span>
            </div>
          )}

          <textarea
            placeholder="Note (optional)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            style={IS({ resize: 'none' })}
          />

          <div>
            <div
              style={{
                fontSize: '11px',
                letterSpacing: '0.12em',
                color: T.text3,
                textTransform: 'uppercase',
                marginBottom: '8px',
                fontWeight: 600,
              }}
            >
              Color
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {EVENT_COLORS.map((c) => (
                <div
                  key={c.value}
                  title={c.name}
                  onClick={() => setColor(c.value)}
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: c.value,
                    cursor: 'pointer',
                    border:
                      color === c.value
                        ? `3px solid ${T.text1}`
                        : '3px solid transparent',
                    transition: 'border 0.12s',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '22px' }}>
          {event?.id && (
            <button onClick={() => onDelete(event.id)} style={DB}>
              Delete
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button onClick={onClose} style={GB()}>
            Cancel
          </button>
          <button
            onClick={() => {
              if (!title || !date) return;
              onSave({
                id: event?.id || Date.now(),
                title,
                date,
                time,
                tz,
                color,
                note,
              });
            }}
            style={PB()}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// - Meeting Finder -
function MeetingFinder({ tzA, tzB, labelA, labelB, onClose }) {
  const offA = getOffsetH(tzA);
  const offB = getOffsetH(tzB);

  const slots = Array.from({ length: 24 }, (_, hour) => {
    const hB = (((hour - offA + offB) % 24) + 24) % 24;
    const sA = hour >= 9 && hour < 21 ? (hour >= 10 && hour < 20 ? 2 : 1) : 0;
    const sB = hB >= 9 && hB < 21 ? (hB >= 10 && hB < 20 ? 2 : 1) : 0;
    return { hA: hour, hB, total: sA + sB };
  });

  const best = slots.filter((s) => s.total === 4);
  const good = slots.filter((s) => s.total === 3);
  const ok = slots.filter((s) => s.total === 2);

  const fmtH = (hour) => {
    const d = new Date();
    d.setHours(hour, 0, 0, 0);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
  };

  function Row({ slot, quality }) {
    const color =
      quality === 'ideal' ? T.sage : quality === 'good' ? T.accent : T.text3;

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 14px',
          background: '#fff',
          border: `1px solid ${T.border}`,
          borderRadius: '10px',
          marginBottom: '6px',
        }}
      >
        <div
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: color,
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1, fontSize: '13px', color: T.text2 }}>
          <span style={{ color: T.accent, fontWeight: 600 }}>
            {fmtH(slot.hA)}
          </span>
          <span style={{ color: T.text4, marginLeft: '4px', fontSize: '11px' }}>
            for {labelA}
          </span>
          <span style={{ color: T.border2, margin: '0 8px' }}>⇄</span>
          <span style={{ color: T.lavender, fontWeight: 600 }}>
            {fmtH(slot.hB)}
          </span>
          <span style={{ color: T.text4, marginLeft: '4px', fontSize: '11px' }}>
            for {labelB}
          </span>
        </div>
        <div
          style={{
            fontSize: '10px',
            letterSpacing: '0.1em',
            color,
            textTransform: 'uppercase',
            fontWeight: 700,
          }}
        >
          {quality}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(26,18,8,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: '20px',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: T.bg,
          border: `1px solid ${T.border}`,
          borderRadius: '22px',
          padding: '28px',
          width: '100%',
          maxWidth: '450px',
          maxHeight: '78vh',
          overflowY: 'auto',
          boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '18px',
          }}
        >
          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '22px',
              color: T.text1,
              fontWeight: 600,
            }}
          >
            Best Times to Meet
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: T.text3,
              cursor: 'pointer',
              fontSize: '18px',
            }}
          >
            ✕
          </button>
        </div>

        {best.length > 0 && (
          <>
            <div
              style={{
                fontSize: '11px',
                letterSpacing: '0.14em',
                color: T.sage,
                textTransform: 'uppercase',
                fontWeight: 700,
                marginBottom: '9px',
              }}
            >
              ◆ Ideal
            </div>
            {best.map((slot, index) => (
              <Row key={`best-${index}`} slot={slot} quality="ideal" />
            ))}
          </>
        )}

        {good.length > 0 && (
          <>
            <div
              style={{
                fontSize: '11px',
                letterSpacing: '0.14em',
                color: T.accent,
                textTransform: 'uppercase',
                fontWeight: 700,
                margin: '16px 0 9px',
              }}
            >
              ◆ Good
            </div>
            {good.map((slot, index) => (
              <Row key={`good-${index}`} slot={slot} quality="good" />
            ))}
          </>
        )}

        {ok.length > 0 && (
          <>
            <div
              style={{
                fontSize: '11px',
                letterSpacing: '0.14em',
                color: T.text3,
                textTransform: 'uppercase',
                fontWeight: 700,
                margin: '16px 0 9px',
              }}
            >
              ◆ Possible
            </div>
            {ok.slice(0, 5).map((slot, index) => (
              <Row key={`ok-${index}`} slot={slot} quality="ok" />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// - Share Modal -
function ShareModal({ tzA, tzB, labelA, labelB, events, onClose }) {
  const url = `${window.location.origin}${
    window.location.pathname
  }?cal=${encodeShare({
    tzA,
    tzB,
    labelA,
    labelB,
    events,
  })}`;

  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(26,18,8,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: '20px',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: T.bg,
          border: `1px solid ${T.border}`,
          borderRadius: '22px',
          padding: '28px',
          width: '100%',
          maxWidth: '430px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '6px',
          }}
        >
          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '22px',
              color: T.text1,
              fontWeight: 600,
            }}
          >
            Share with {labelB}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: T.text3,
              cursor: 'pointer',
              fontSize: '18px',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ fontSize: '13px', color: T.text3, marginBottom: '20px' }}>
          This link carries all your events, timezones, and names.
        </div>

        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: '12px',
            padding: '12px 14px',
            marginBottom: '18px',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              color: T.text4,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '5px',
              fontWeight: 600,
            }}
          >
            Link
          </div>
          <div
            style={{
              fontSize: '12px',
              color: T.sky,
              wordBreak: 'break-all',
              lineHeight: 1.5,
            }}
          >
            {url.length > 90 ? `${url.slice(0, 70)}...` : url}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onClose} style={GB()}>
            Close
          </button>
          <button
            onClick={copyLink}
            style={PB({
              flex: 1,
              textAlign: 'center',
              background: copied ? T.sage : T.sky,
            })}
          >
            {copied ? 'Copied ✓' : 'Copy Link'}
          </button>
        </div>
      </div>
    </div>
  );
}

// - Gift Modal -
function GiftModal({ partnerName, onClose }) {
  const [tab, setTab] = useState('flowers');
  const [selected, setSelected] = useState(null);
  const [address, setAddress] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);

  const item = GIFT_ITEMS.find((gift) => gift.id === selected);
  const items = GIFT_ITEMS.filter((gift) => gift.cat === tab);

  if (sent) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(26,18,8,0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          padding: '20px',
          backdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      >
        <div
          style={{
            background: T.bg,
            border: `1px solid ${T.border}`,
            borderRadius: '22px',
            padding: '36px',
            width: '100%',
            maxWidth: '380px',
            textAlign: 'center',
            boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{ fontSize: '36px', color: T.rose, marginBottom: '14px' }}
          >
            ❧
          </div>
          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '24px',
              color: T.text1,
              marginBottom: '8px',
              fontWeight: 600,
            }}
          >
            On its way to {partnerName}
          </div>
          <div
            style={{ fontSize: '13px', color: T.text2, marginBottom: '12px' }}
          >
            Your {item?.name.toLowerCase()} is scheduled for {date}.
          </div>
          <div
            style={{
              fontSize: '13px',
              color: T.text3,
              fontStyle: 'italic',
              marginBottom: '24px',
              padding: '12px',
              background: T.surface,
              borderRadius: '10px',
            }}
          >
            "{note || 'Thinking of you.'}"
          </div>
          <button
            onClick={onClose}
            style={PB({ padding: '11px 32px', borderRadius: '40px' })}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(26,18,8,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: '20px',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: T.bg,
          border: `1px solid ${T.border}`,
          borderRadius: '22px',
          padding: '28px',
          width: '100%',
          maxWidth: '460px',
          maxHeight: '84vh',
          overflowY: 'auto',
          boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '4px',
          }}
        >
          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '22px',
              color: T.text1,
              fontWeight: 600,
            }}
          >
            Send a Gift
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: T.text3,
              cursor: 'pointer',
              fontSize: '18px',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ fontSize: '13px', color: T.text3, marginBottom: '20px' }}>
          Delivered directly to {partnerName}'s door.
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
          {[
            { id: 'flowers', label: '❧ Flowers' },
            { id: 'package', label: '◈ Care Packages' },
          ].map((itemTab) => (
            <button
              key={itemTab.id}
              onClick={() => setTab(itemTab.id)}
              style={{
                ...GB({ flex: 1, textAlign: 'center', padding: '9px 12px' }),
                background: tab === itemTab.id ? `${T.rose}15` : T.surface2,
                border: `1px solid ${
                  tab === itemTab.id ? `${T.rose}60` : T.border
                }`,
                color: tab === itemTab.id ? T.rose : T.text3,
                fontWeight: tab === itemTab.id ? 700 : 400,
              }}
            >
              {itemTab.label}
            </button>
          ))}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            marginBottom: '18px',
          }}
        >
          {items.map((gift) => (
            <div
              key={gift.id}
              onClick={() => setSelected(gift.id)}
              className="lift"
              style={{
                background: selected === gift.id ? `${T.rose}10` : '#fff',
                border: `1px solid ${
                  selected === gift.id ? `${T.rose}50` : T.border
                }`,
                borderRadius: '12px',
                padding: '14px 12px',
                cursor: 'pointer',
                boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
              }}
            >
              <div
                style={{ fontSize: '20px', color: T.rose, marginBottom: '6px' }}
              >
                {gift.icon}
              </div>
              <div
                style={{
                  fontSize: '13px',
                  color: T.text1,
                  fontWeight: 600,
                  marginBottom: '3px',
                }}
              >
                {gift.name}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: T.text3,
                  marginBottom: '7px',
                  lineHeight: 1.4,
                }}
              >
                {gift.desc}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: selected === gift.id ? T.rose : T.text2,
                  fontWeight: 700,
                }}
              >
                ${gift.price}
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '11px',
              borderTop: `1px solid ${T.border}`,
              paddingTop: '18px',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.12em',
                  color: T.text3,
                  textTransform: 'uppercase',
                  marginBottom: '7px',
                  fontWeight: 600,
                }}
              >
                Delivery Address
              </div>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter delivery address..."
                style={IS()}
              />
            </div>

            <div>
              <div
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.12em',
                  color: T.text3,
                  textTransform: 'uppercase',
                  marginBottom: '7px',
                  fontWeight: 600,
                }}
              >
                Deliver On
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={IS()}
              />
            </div>

            <div>
              <div
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.12em',
                  color: T.text3,
                  textTransform: 'uppercase',
                  marginBottom: '7px',
                  fontWeight: 600,
                }}
              >
                Personal Note
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Write them a note..."
                rows={2}
                style={IS({ resize: 'none' })}
              />
            </div>

            <div
              style={{
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: '10px',
                padding: '12px 14px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{ fontSize: '13px', color: T.text2, fontWeight: 500 }}
                >
                  Total
                </span>
                <span
                  style={{ fontSize: '16px', color: T.accent, fontWeight: 700 }}
                >
                  ${item?.price} + delivery
                </span>
              </div>
              <div
                style={{ fontSize: '11px', color: T.text4, marginTop: '3px' }}
              >
                Processed securely via Stripe.
              </div>
            </div>

            <button
              onClick={() => {
                if (address && date) setSent(true);
              }}
              style={PB({
                padding: '12px',
                textAlign: 'center',
                borderRadius: '12px',
                opacity: address && date ? 1 : 0.45,
                background: T.rose,
              })}
            >
              Send {item?.name} to {partnerName} →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// - Onboarding -
function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState('plus');
  const [types, setTypes] = useState([]);
  const [name, setName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [tzA, setTzA] = useState('Pacific/Honolulu');
  const [tzB, setTzB] = useState('Australia/Melbourne');

  const toggle = (id) =>
    setTypes((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );

  const progress = [0, 25, 55, 82, 100][step];

  return (
    <div
      style={{
        minHeight: '100vh',
        zoom:"120%",
        background: T.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {step > 0 && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: T.border,
            zIndex: 10,
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: T.accent,
              transition: 'width 0.4s ease',
              borderRadius: '0 2px 2px 0',
            }}
          />
        </div>
      )}

      <div style={{ maxWidth: '520px', width: '100%' }}>
        {step === 0 && (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '13px',
                letterSpacing: '0.35em',
                color: T.text4,
                textTransform: 'uppercase',
                marginBottom: '10px',
              }}
            >
              Welcome to
            </div>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(56px,12vw,80px)',
                fontWeight: 300,
                color: T.text1,
                lineHeight: 0.9,
                letterSpacing: '-0.02em',
                marginBottom: '8px',
              }}
            >
              Ophelia
            </h1>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '17px',
                color: T.text3,
                fontStyle: 'italic',
                marginBottom: '40px',
              }}
            >
              your everyday calendar
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                marginBottom: '36px',
                textAlign: 'left',
              }}
            >
              {[
                ['◇', 'Made for people who live across time zones'],
                ['⊕', 'Always shows your time and their time, side by side'],
                ['❧', 'Send flowers, gifts, and love notes between cities'],
              ].map(([icon, text]) => (
                <div
                  key={text}
                  style={{
                    display: 'flex',
                    gap: '14px',
                    alignItems: 'center',
                    background: '#fff',
                    border: `1px solid ${T.border}`,
                    borderRadius: '12px',
                    padding: '14px 16px',
                    boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
                  }}
                >
                  <span
                    style={{
                      color: T.accent,
                      fontSize: '18px',
                      width: '22px',
                      textAlign: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {icon}
                  </span>
                  <span
                    style={{
                      fontSize: '14px',
                      color: T.text2,
                      fontWeight: 500,
                    }}
                  >
                    {text}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep(1)}
              style={PB({
                padding: '14px 52px',
                fontSize: '15px',
                borderRadius: '40px',
                letterSpacing: '0.08em',
                boxShadow: '0 6px 24px rgba(181,99,30,0.35)',
              })}
            >
              Get Started
            </button>
            <div
              style={{ fontSize: '12px', color: T.text4, marginTop: '12px' }}
            >
              1 month free &mdash; then $3.99 / month
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '30px',
                fontWeight: 400,
                color: T.text1,
                marginBottom: '6px',
              }}
            >
              Choose your plan
            </div>
            <div
              style={{ fontSize: '14px', color: T.text3, marginBottom: '26px' }}
            >
              Start free for 30 days. Cancel anytime.
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                marginBottom: '28px',
              }}
            >
              {[
                {
                  id: 'free',
                  label: 'Free',
                  price: 'Always free',
                  sub: 'Single timezone · Up to 10 events · Basic calendar',
                  badge: null,
                },
                {
                  id: 'plus',
                  label: 'Ophelia Plus',
                  price: '$3.99 / month',
                  sub: 'Everything -- dual clocks, sharing, gifts, love notes, travel mode',
                  badge: 'Most Popular · 1 month free',
                },
                {
                  id: 'pro',
                  label: 'Ophelia Pro',
                  price: '$6.99 / month',
                  sub: 'Plus + Apple/Google Calendar sync, team scheduling, priority support',
                  badge: null,
                },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => setPlan(item.id)}
                  className="lift"
                  style={{
                    background: plan === item.id ? `${T.accent}0e` : '#fff',
                    border: `1.5px solid ${
                      plan === item.id ? T.accent : T.border
                    }`,
                    borderRadius: '14px',
                    padding: '18px 20px',
                    cursor: 'pointer',
                    position: 'relative',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                  }}
                >
                  {item.badge && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-11px',
                        left: '16px',
                        background: T.accent,
                        color: '#fff',
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '20px',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {item.badge}
                    </div>
                  )}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: '15px',
                          color: T.text1,
                          fontWeight: 700,
                          marginBottom: '3px',
                        }}
                      >
                        {item.label}
                      </div>
                      <div style={{ fontSize: '12px', color: T.text3 }}>
                        {item.sub}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: '14px',
                        color: plan === item.id ? T.accent : T.text3,
                        fontWeight: 700,
                        flexShrink: 0,
                        marginLeft: '12px',
                      }}
                    >
                      {item.price}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setStep(0)} style={GB({ flexShrink: 0 })}>
                Back
              </button>
              <button
                onClick={() => setStep(2)}
                style={PB({ flex: 1, textAlign: 'center' })}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '30px',
                fontWeight: 400,
                color: T.text1,
                marginBottom: '6px',
              }}
            >
              How do you use your time?
            </div>
            <div
              style={{ fontSize: '14px', color: T.text3, marginBottom: '22px' }}
            >
              Select all that apply -- Ophelia adapts to you.
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                marginBottom: '26px',
              }}
            >
              {USER_TYPES.map((userType) => {
                const selected = types.includes(userType.id);
                return (
                  <div
                    key={userType.id}
                    onClick={() => toggle(userType.id)}
                    className="lift"
                    style={{
                      background: selected ? `${userType.accent}0e` : '#fff',
                      border: `1.5px solid ${
                        selected ? userType.accent : T.border
                      }`,
                      borderRadius: '14px',
                      padding: '18px 20px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        gap: '14px',
                        alignItems: 'flex-start',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '20px',
                          color: userType.accent,
                          width: '26px',
                          textAlign: 'center',
                          flexShrink: 0,
                          marginTop: '1px',
                        }}
                      >
                        {userType.icon}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: '15px',
                            color: T.text1,
                            fontWeight: 700,
                            marginBottom: '3px',
                          }}
                        >
                          {userType.title}
                        </div>
                        <div
                          style={{
                            fontSize: '13px',
                            color: T.text3,
                            marginBottom: '10px',
                          }}
                        >
                          {userType.desc}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '5px',
                          }}
                        >
                          {userType.features.map((feature) => (
                            <span
                              key={feature}
                              style={{
                                fontSize: '11px',
                                background: `${userType.accent}14`,
                                border: `1px solid ${userType.accent}30`,
                                color: userType.accent,
                                padding: '3px 9px',
                                borderRadius: '20px',
                                fontWeight: 600,
                              }}
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: `2px solid ${
                            selected ? userType.accent : T.border
                          }`,
                          background: selected
                            ? userType.accent
                            : 'transparent',
                          flexShrink: 0,
                          marginTop: '1px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {selected && (
                          <span
                            style={{
                              fontSize: '11px',
                              color: '#fff',
                              fontWeight: 700,
                            }}
                          >
                            ✓
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setStep(1)} style={GB({ flexShrink: 0 })}>
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={types.length === 0}
                style={PB({
                  flex: 1,
                  textAlign: 'center',
                  opacity: types.length === 0 ? 0.4 : 1,
                })}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '30px',
                fontWeight: 400,
                color: T.text1,
                marginBottom: '6px',
              }}
            >
              Set up your profile
            </div>
            <div
              style={{ fontSize: '14px', color: T.text3, marginBottom: '22px' }}
            >
              Just the basics to get started.
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                marginBottom: '26px',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    letterSpacing: '0.14em',
                    color: T.text3,
                    textTransform: 'uppercase',
                    marginBottom: '7px',
                    fontWeight: 600,
                  }}
                >
                  Your Name
                </div>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name..."
                  style={IS()}
                />
              </div>

              <div>
                <div
                  style={{
                    fontSize: '11px',
                    letterSpacing: '0.14em',
                    color: T.text3,
                    textTransform: 'uppercase',
                    marginBottom: '7px',
                    fontWeight: 600,
                  }}
                >
                  Your Timezone
                </div>
                <TzSelect
                  value={tzA}
                  onChange={(e) => setTzA(e.target.value)}
                />
              </div>

              {(types.includes('couple') || types.includes('traveler')) && (
                <>
                  <div
                    style={{
                      borderTop: `1px solid ${T.border}`,
                      paddingTop: '14px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '11px',
                        letterSpacing: '0.14em',
                        color: T.rose,
                        textTransform: 'uppercase',
                        marginBottom: '7px',
                        fontWeight: 600,
                      }}
                    >
                      {types.includes('couple')
                        ? "Partner's Name"
                        : 'Primary Contact'}
                    </div>
                    <input
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      placeholder="Their name..."
                      style={IS()}
                    />
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: '11px',
                        letterSpacing: '0.14em',
                        color: T.rose,
                        textTransform: 'uppercase',
                        marginBottom: '7px',
                        fontWeight: 600,
                      }}
                    >
                      Their Timezone
                    </div>
                    <TzSelect
                      value={tzB}
                      onChange={(e) => setTzB(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setStep(2)} style={GB({ flexShrink: 0 })}>
                Back
              </button>
              <button
                onClick={() =>
                  onComplete({ plan, types, name, partnerName, tzA, tzB })
                }
                disabled={!name}
                style={PB({
                  flex: 1,
                  textAlign: 'center',
                  opacity: !name ? 0.4 : 1,
                })}
              >
                Open Ophelia &#8594;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// - Main Calendar -
function Calendar({ config }) {
  const { types, name, partnerName, tzA: initA, tzB: initB } = config;

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const hasPartner = types.includes('couple');
  const isTraveler = types.includes('traveler');
  const isLocal = types.includes('local') && !hasPartner && !isTraveler;

  const [tzA, setTzA] = useState(initA || 'Pacific/Honolulu');
  const [tzB, setTzB] = useState(initB || 'Australia/Melbourne');
  const [labelA, setLabelA] = useState(name || 'You');
  const [labelB, setLabelB] = useState(partnerName || 'Them');
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Weekly video call',
      date: todayStr,
      time: '19:00',
      tz: initA || 'Pacific/Honolulu',
      color: T.rose,
      note: 'Our standing date night',
    },
  ]);
  const [notes, setNotes] = useState([
    {
      id: 1,
      text: "Every distance is just a countdown until I'm with you again.",
      from: 'B',
      date: todayStr,
    },
  ]);
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);
  const [modal, setModal] = useState(null);
  const [panel, setPanel] = useState(null);
  const [travelMode, setTravelMode] = useState(false);
  const [travelTz, setTravelTz] = useState('America/New_York');
  const [showGift, setShowGift] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showSplash, setShowSplash] = useState(hasPartner && notes.length > 0);

  const activeTzA = travelMode ? travelTz : tzA;
  const accentB = hasPartner ? T.rose : isTraveler ? T.sky : T.sage;

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = Array(firstDay)
    .fill(null)
    .concat(Array.from({ length: daysInMonth }, (_, index) => index + 1));

  while (cells.length % 7 !== 0) cells.push(null);

  const eventsForDay = (day) => {
    if (!day) return [];
    const dateString = `${viewYear}-${String(viewMonth + 1).padStart(
      2,
      '0'
    )}-${String(day).padStart(2, '0')}`;
    return events.filter((event) => event.date === dateString);
  };

  const upcoming = [...events]
    .filter((event) => event.date >= todayStr)
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
    .slice(0, 5);

  const prevMonth = () => {
    setSelectedDay(null);
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((year) => year - 1);
    } else {
      setViewMonth((month) => month - 1);
    }
  };

  const nextMonth = () => {
    setSelectedDay(null);
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((year) => year + 1);
    } else {
      setViewMonth((month) => month + 1);
    }
  };

  return (
    <>
      <div
        style={{
          minHeight: '100vh',
          background: T.bg,
          fontFamily: "'DM Sans', sans-serif",
          color: T.text1,
        }}
      >
        <div
          style={{
            maxWidth: '840px',
            margin: '0 auto',
            padding: '28px 18px 80px',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '11px',
                letterSpacing: '0.4em',
                color: T.text4,
                textTransform: 'uppercase',
                marginBottom: '6px',
              }}
            >
              Ophelia
            </div>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(28px,5vw,42px)',
                fontWeight: 300,
                color: T.text1,
                lineHeight: 1.05,
              }}
            >
              {hasPartner ? (
                <>
                  Hello,{' '}
                  <em style={{ color: T.accent, fontStyle: 'italic' }}>
                    {labelA}
                  </em>
                </>
              ) : isLocal ? (
                <>
                  Good{' '}
                  {today.getHours() < 12
                    ? 'morning'
                    : today.getHours() < 18
                    ? 'afternoon'
                    : 'evening'}
                  , <em style={{ color: T.accent }}>{labelA}</em>
                </>
              ) : (
                <>
                  Welcome back, <em style={{ color: T.accent }}>{labelA}</em>
                </>
              )}
            </h1>
          </div>

          {!isLocal && (
            <>
              <div
                style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}
              >
                <Clock
                  tz={activeTzA}
                  accent={T.accent}
                  label={`${labelA} · ${
                    TIMEZONES.find((t) => t.value === activeTzA)?.label ||
                    activeTzA
                  }`}
                  tag={travelMode ? 'traveling' : undefined}
                />
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexShrink: 0,
                    color: T.border2,
                    fontSize: '20px',
                  }}
                >
                  &#8596;
                </div>
                <Clock
                  tz={tzB}
                  accent={accentB}
                  label={`${labelB} · ${
                    TIMEZONES.find((t) => t.value === tzB)?.label || tzB
                  }`}
                />
              </div>
              <div
                style={{
                  textAlign: 'center',
                  fontSize: '12px',
                  color: T.text4,
                  marginBottom: '22px',
                }}
              >
                &#9670; {tzDiff(tzA, tzB, labelB)}
              </div>
            </>
          )}

          {isLocal && (
            <div style={{ marginBottom: '22px' }}>
              <Clock
                tz={tzA}
                accent={T.sage}
                label={`${labelA} · ${
                  TIMEZONES.find((t) => t.value === tzA)?.label || tzA
                }`}
              />
            </div>
          )}

          <div
            style={{
              display: 'flex',
              gap: '7px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '22px',
            }}
          >
            <button
              style={pill(panel === 'settings')}
              onClick={() =>
                setPanel((p) => (p === 'settings' ? null : 'settings'))
              }
            >
              &#9965;&ensp;Settings
            </button>
            {(isTraveler || hasPartner) && (
              <button
                style={pill(travelMode, T.sage)}
                onClick={() => setTravelMode((value) => !value)}
              >
                &#8853;&ensp;Travel Mode
              </button>
            )}
            {(hasPartner || isTraveler) && (
              <button
                style={pill(panel === 'meeting', T.lavender)}
                onClick={() =>
                  setPanel((p) => (p === 'meeting' ? null : 'meeting'))
                }
              >
                &#9737;&ensp;Best Times
              </button>
            )}
            {(hasPartner || isTraveler) && (
              <button
                style={pill(panel === 'share', T.sky)}
                onClick={() =>
                  setPanel((p) => (p === 'share' ? null : 'share'))
                }
              >
                &#8618;&ensp;Share
              </button>
            )}
            {hasPartner && (
              <button
                style={pill(showGift, T.rose)}
                onClick={() => setShowGift(true)}
              >
                ❧&ensp;Send a Gift
              </button>
            )}
            {hasPartner && (
              <button
                style={pill(showNotes, T.lavender)}
                onClick={() => setShowNotes(true)}
              >
                &#9825;&ensp;Love Notes{' '}
                {notes.length > 0 && (
                  <span
                    style={{
                      background: T.lavender,
                      color: '#fff',
                      borderRadius: '20px',
                      padding: '1px 6px',
                      fontSize: '10px',
                      fontWeight: 700,
                      marginLeft: '4px',
                    }}
                  >
                    {notes.length}
                  </span>
                )}
              </button>
            )}
          </div>

          {panel === 'settings' && (
            <div
              style={{
                background: '#fff',
                border: `1px solid ${T.border}`,
                borderRadius: '16px',
                padding: '20px 22px',
                marginBottom: '20px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              }}
            >
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '18px',
                  color: T.text1,
                  fontWeight: 600,
                  marginBottom: '16px',
                }}
              >
                Settings
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isLocal ? '1fr' : '1fr 1fr',
                  gap: '14px',
                }}
              >
                {[
                  {
                    label: 'Your Name',
                    value: labelA,
                    set: setLabelA,
                    tz: tzA,
                    setTz: setTzA,
                    color: T.accent,
                  },
                  ...(!isLocal
                    ? [
                        {
                          label: hasPartner ? 'Partner' : 'Contact',
                          value: labelB,
                          set: setLabelB,
                          tz: tzB,
                          setTz: setTzB,
                          color: accentB,
                        },
                      ]
                    : []),
                ].map((item, index) => (
                  <div key={index}>
                    <div
                      style={{
                        fontSize: '11px',
                        letterSpacing: '0.14em',
                        color: item.color,
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        marginBottom: '7px',
                      }}
                    >
                      {item.label}
                    </div>
                    <input
                      value={item.value}
                      onChange={(e) => item.set(e.target.value)}
                      style={IS({ marginBottom: '8px' })}
                    />
                    <TzSelect
                      value={item.tz}
                      onChange={(e) => item.setTz(e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {travelMode && (
            <div
              style={{
                background: '#f0faf2',
                border: `1px solid ${T.sage}40`,
                borderRadius: '14px',
                padding: '14px 18px',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.14em',
                  color: T.sage,
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  marginBottom: '9px',
                }}
              >
                &#8853; Where are you right now?
              </div>
              <TzSelect
                value={travelTz}
                onChange={(e) => setTravelTz(e.target.value)}
              />
              <div
                style={{ fontSize: '12px', color: T.sage, marginTop: '8px' }}
              >
                Your clock updates to your travel city. Events still save in
                your home timezone.
              </div>
            </div>
          )}

          <div
            style={{
              background: '#fff',
              border: `1px solid ${T.border}`,
              borderRadius: '20px',
              overflow: 'hidden',
              marginBottom: '22px',
              boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px 14px',
                borderBottom: `1px solid ${T.border}`,
              }}
            >
              <button
                onClick={prevMonth}
                style={{
                  background: 'none',
                  border: 'none',
                  color: T.text3,
                  fontSize: '22px',
                  cursor: 'pointer',
                  padding: '2px 8px',
                  lineHeight: 1,
                }}
              >
                &#8249;
              </button>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '22px',
                  color: T.text1,
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                }}
              >
                {MONTHS[viewMonth]}&ensp;
                <span style={{ color: T.text4, fontWeight: 300 }}>
                  {viewYear}
                </span>
              </div>
              <button
                onClick={nextMonth}
                style={{
                  background: 'none',
                  border: 'none',
                  color: T.text3,
                  fontSize: '22px',
                  cursor: 'pointer',
                  padding: '2px 8px',
                  lineHeight: 1,
                }}
              >
                &#8250;
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7,1fr)',
                padding: '10px 12px 2px',
              }}
            >
              {DAYS.map((day) => (
                <div
                  key={day}
                  style={{
                    textAlign: 'center',
                    fontSize: '11px',
                    letterSpacing: '0.1em',
                    color: T.text4,
                    textTransform: 'uppercase',
                    fontWeight: 600,
                  }}
                >
                  {day}
                </div>
              ))}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7,1fr)',
                gap: '2px',
                padding: '4px 10px 14px',
              }}
            >
              {cells.map((day, index) => {
                const dayEvents = eventsForDay(day);
                const dateString = day
                  ? `${viewYear}-${String(viewMonth + 1).padStart(
                      2,
                      '0'
                    )}-${String(day).padStart(2, '0')}`
                  : '';
                const isToday = dateString === todayStr;
                const isSelected = selectedDay === day;

                return (
                  <div
                    key={index}
                    className="day-cell"
                    onClick={() =>
                      day && setSelectedDay(day === selectedDay ? null : day)
                    }
                    style={{
                      minHeight: '54px',
                      padding: '5px 4px',
                      borderRadius: '9px',
                      cursor: day ? 'pointer' : 'default',
                      background: isSelected
                        ? `${T.accent}18`
                        : isToday
                        ? `${T.accent}0e`
                        : 'transparent',
                      border: isToday
                        ? `1.5px solid ${T.accent}50`
                        : '1.5px solid transparent',
                      transition: 'background 0.12s',
                    }}
                  >
                    {day && (
                      <>
                        <div
                          style={{
                            fontSize: '13px',
                            color: isToday ? T.accent : T.text1,
                            fontWeight: isToday ? 700 : 500,
                            textAlign: 'center',
                            marginBottom: '3px',
                          }}
                        >
                          {day}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '2px',
                            justifyContent: 'center',
                          }}
                        >
                          {dayEvents.slice(0, 3).map((event) => (
                            <div
                              key={event.id}
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: event.color,
                              }}
                            />
                          ))}
                          {dayEvents.length > 3 && (
                            <span style={{ fontSize: '9px', color: T.text4 }}>
                              +{dayEvents.length - 3}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {selectedDay &&
            (() => {
              const dayEvents = eventsForDay(selectedDay);
              const dateString = `${viewYear}-${String(viewMonth + 1).padStart(
                2,
                '0'
              )}-${String(selectedDay).padStart(2, '0')}`;

              return (
                <div style={{ marginBottom: '22px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '12px',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '20px',
                        color: T.text1,
                        fontWeight: 600,
                      }}
                    >
                      {MONTHS[viewMonth]} {selectedDay}
                    </div>
                    <button
                      onClick={() => setModal({ date: dateString })}
                      style={PB({ padding: '8px 16px', fontSize: '12px' })}
                    >
                      &#43;&ensp;Add Event
                    </button>
                  </div>

                  {dayEvents.length === 0 ? (
                    <div
                      style={{
                        fontSize: '13px',
                        color: T.text4,
                        padding: '16px',
                        textAlign: 'center',
                        background: T.surface,
                        border: `1px solid ${T.border}`,
                        borderRadius: '12px',
                      }}
                    >
                      Nothing planned yet &#9671;
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      {dayEvents.map((event) => (
                        <EventCard
                          key={event.id}
                          ev={event}
                          tzA={activeTzA}
                          tzB={isLocal ? null : tzB}
                          labelA={labelA}
                          labelB={labelB}
                          onClick={() => setModal(event)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

          {upcoming.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '20px',
                  color: T.text1,
                  fontWeight: 600,
                  marginBottom: '12px',
                }}
              >
                Coming up&ensp;
                <span
                  style={{
                    fontStyle: 'italic',
                    color: T.text3,
                    fontWeight: 300,
                  }}
                >
                  {hasPartner ? 'for both of you' : 'for you'}
                </span>
              </div>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
              >
                {upcoming.map((event) => (
                  <EventCard
                    key={event.id}
                    ev={event}
                    tzA={activeTzA}
                    tzB={isLocal ? null : tzB}
                    labelA={labelA}
                    labelB={labelB}
                    onClick={() => setModal(event)}
                  />
                ))}
              </div>
            </div>
          )}

          {hasPartner && notes.length > 0 && (
            <div
              onClick={() => setShowNotes(true)}
              style={{
                background: '#fff',
                border: `1px solid ${T.lavender}30`,
                borderLeft: `4px solid ${T.lavender}`,
                borderRadius: '14px',
                padding: '16px 20px',
                marginBottom: '24px',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.15em',
                  color: T.lavender,
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  marginBottom: '8px',
                }}
              >
                &#9825; Latest Note
              </div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '17px',
                  fontStyle: 'italic',
                  color: T.text1,
                  lineHeight: 1.55,
                  marginBottom: '6px',
                }}
              >
                "{notes[notes.length - 1].text}"
              </div>
              <div style={{ fontSize: '11px', color: T.text4 }}>
                from {notes[notes.length - 1].from === 'A' ? labelA : labelB} ·{' '}
                {dateLabel(notes[notes.length - 1].date)} ·{' '}
                <span style={{ color: T.lavender }}>
                  See all {notes.length} notes &#8594;
                </span>
              </div>
            </div>
          )}

          {!selectedDay && (
            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <button
                onClick={() => setModal({})}
                style={PB({
                  padding: '13px 40px',
                  fontSize: '15px',
                  borderRadius: '40px',
                  letterSpacing: '0.06em',
                  boxShadow: '0 6px 24px rgba(181,99,30,0.3)',
                })}
              >
                &#43;&ensp;New Event
              </button>
            </div>
          )}
        </div>
      </div>

      {modal !== null && (
        <EventModal
          event={modal}
          tzA={tzA}
          tzB={isLocal ? null : tzB}
          labelA={labelA}
          labelB={labelB}
          onClose={() => setModal(null)}
          onSave={(event) => {
            setEvents((prev) => {
              const exists = prev.find((item) => item.id === event.id);
              return exists
                ? prev.map((item) => (item.id === event.id ? event : item))
                : [...prev, event];
            });
            setModal(null);
          }}
          onDelete={(id) => {
            setEvents((prev) => prev.filter((event) => event.id !== id));
            setModal(null);
          }}
        />
      )}

      {panel === 'meeting' && (
        <MeetingFinder
          tzA={activeTzA}
          tzB={tzB}
          labelA={labelA}
          labelB={labelB}
          onClose={() => setPanel(null)}
        />
      )}

      {panel === 'share' && (
        <ShareModal
          tzA={tzA}
          tzB={tzB}
          labelA={labelA}
          labelB={labelB}
          events={events}
          onClose={() => setPanel(null)}
        />
      )}

      {showGift && (
        <GiftModal partnerName={labelB} onClose={() => setShowGift(false)} />
      )}

      {showNotes && (
        <NotesWall
          notes={notes}
          labelA={labelA}
          labelB={labelB}
          onClose={() => setShowNotes(false)}
          onAdd={(note) => setNotes((prev) => [...prev, note])}
          onDelete={(id) =>
            setNotes((prev) => prev.filter((note) => note.id !== id))
          }
        />
      )}

      {showSplash && (
        <LoveNoteSplash
          notes={notes}
          labelA={labelA}
          labelB={labelB}
          onClose={() => setShowSplash(false)}
        />
      )}
    </>
  );
}

// - Root -
export default function Ophelia() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const cal = new URLSearchParams(window.location.search).get('cal');
    if (!cal) return;

    const decoded = decodeShare(cal);
    if (!decoded) return;

    setConfig({
      types: ['couple'],
      name: decoded.labelA || 'You',
      partnerName: decoded.labelB || 'Them',
      tzA: decoded.tzA,
      tzB: decoded.tzB,
      plan: 'plus',
    });
  }, []);

  return (
    <>
      <style>{CSS}</style>
      {config ? (
        <Calendar config={config} />
      ) : (
        <Onboarding onComplete={(cfg) => setConfig(cfg)} />
      )}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999,
        }}
      >
        <button
          onClick={() => window.open(GUMROAD_LINKS.plus, '_blank')}
          style={{
            background: '#b5631e',
            color: 'white',
            border: 'none',
            padding: '14px 20px',
            borderRadius: '999px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          }}
        >
          Upgrade to Plus
        </button>
      </div>
    </>
  );
}
