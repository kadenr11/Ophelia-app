import React, { useState, useEffect, useRef } from 'react';
import {
  auth, db, googleProvider, appleProvider, IS_CONFIGURED,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signInWithPopup, updateProfile, onAuthStateChanged,
  doc, collection, setDoc, deleteDoc, onSnapshot, query, orderBy,
} from './firebase';

// ─── API Config (fill in before deploying) ───────────────────────────────────
// Firebase:  import { initializeApp } from 'firebase/app'; const FIREBASE_CONFIG = { apiKey: '...', projectId: '...' };
// Maps:      const GOOGLE_MAPS_API_KEY = 'YOUR_KEY_HERE';
// Stripe:    const STRIPE_PUBLIC_KEY   = 'pk_live_...';
// Google OAuth: const GOOGLE_CLIENT_ID = 'YOUR_CLIENT_ID.apps.googleusercontent.com';
// Apple:     const APPLE_TEAM_ID = 'YOUR_TEAM_ID';

const ADMIN_PASSCODE = 'Mommy11737';

// ─── Palette ─────────────────────────────────────────────────────────────────
const T = {
  bg:'#faf6f0', surface:'#f2ece2', surface2:'#ece4d6',
  border:'#ddd0bc', border2:'#ccc0a8',
  text1:'#1a1208', text2:'#3d2e1e', text3:'#7a6248', text4:'#a08868',
  accent:'#b5631e', rose:'#c0555a', sage:'#3d7a4a', sky:'#2d6a9a',
  lavender:'#6a559a', danger:'#b53030', admin:'#2d4a6a',
};

// ─── Timezones — worldwide cities ────────────────────────────────────────────
const TIMEZONES = [
  // USA
  { label:'Honolulu, HI',          value:'Pacific/Honolulu',             region:'USA' },
  { label:'Anchorage, AK',         value:'America/Anchorage',            region:'USA' },
  { label:'Los Angeles, CA',       value:'America/Los_Angeles',          region:'USA' },
  { label:'San Francisco, CA',     value:'America/Los_Angeles',          region:'USA' },
  { label:'Seattle, WA',           value:'America/Los_Angeles',          region:'USA' },
  { label:'Las Vegas, NV',         value:'America/Los_Angeles',          region:'USA' },
  { label:'Phoenix, AZ',           value:'America/Phoenix',              region:'USA' },
  { label:'Denver, CO',            value:'America/Denver',               region:'USA' },
  { label:'Salt Lake City, UT',    value:'America/Denver',               region:'USA' },
  { label:'Albuquerque, NM',       value:'America/Denver',               region:'USA' },
  { label:'Chicago, IL',           value:'America/Chicago',              region:'USA' },
  { label:'Dallas, TX',            value:'America/Chicago',              region:'USA' },
  { label:'Houston, TX',           value:'America/Chicago',              region:'USA' },
  { label:'New Orleans, LA',       value:'America/Chicago',              region:'USA' },
  { label:'Minneapolis, MN',       value:'America/Chicago',              region:'USA' },
  { label:'Nashville, TN',         value:'America/Chicago',              region:'USA' },
  { label:'New York, NY',          value:'America/New_York',             region:'USA' },
  { label:'Miami, FL',             value:'America/New_York',             region:'USA' },
  { label:'Tampa, FL',             value:'America/New_York',             region:'USA' },
  { label:'Orlando, FL',           value:'America/New_York',             region:'USA' },
  { label:'Atlanta, GA',           value:'America/New_York',             region:'USA' },
  { label:'Boston, MA',            value:'America/New_York',             region:'USA' },
  { label:'Washington DC',         value:'America/New_York',             region:'USA' },
  { label:'Philadelphia, PA',      value:'America/New_York',             region:'USA' },
  { label:'Detroit, MI',           value:'America/Detroit',              region:'USA' },
  // Canada
  { label:'Vancouver, BC',         value:'America/Vancouver',            region:'Canada' },
  { label:'Calgary, AB',           value:'America/Edmonton',             region:'Canada' },
  { label:'Edmonton, AB',          value:'America/Edmonton',             region:'Canada' },
  { label:'Winnipeg, MB',          value:'America/Winnipeg',             region:'Canada' },
  { label:'Toronto, ON',           value:'America/Toronto',              region:'Canada' },
  { label:'Ottawa, ON',            value:'America/Toronto',              region:'Canada' },
  { label:'Montréal, QC',          value:'America/Toronto',              region:'Canada' },
  { label:'Halifax, NS',           value:'America/Halifax',              region:'Canada' },
  { label:"St. John's, NL",        value:'America/St_Johns',             region:'Canada' },
  // Latin America
  { label:'Mexico City, MX',       value:'America/Mexico_City',          region:'Latin America' },
  { label:'Bogotá, CO',            value:'America/Bogota',               region:'Latin America' },
  { label:'Lima, PE',              value:'America/Lima',                 region:'Latin America' },
  { label:'Santiago, CL',          value:'America/Santiago',             region:'Latin America' },
  { label:'São Paulo, BR',         value:'America/Sao_Paulo',            region:'Latin America' },
  { label:'Buenos Aires, AR',      value:'America/Argentina/Buenos_Aires',region:'Latin America' },
  // Europe
  { label:'London, UK',            value:'Europe/London',                region:'Europe' },
  { label:'Dublin, IE',            value:'Europe/Dublin',                region:'Europe' },
  { label:'Lisbon, PT',            value:'Europe/Lisbon',                region:'Europe' },
  { label:'Paris, FR',             value:'Europe/Paris',                 region:'Europe' },
  { label:'Brussels, BE',          value:'Europe/Brussels',              region:'Europe' },
  { label:'Amsterdam, NL',         value:'Europe/Amsterdam',             region:'Europe' },
  { label:'Berlin, DE',            value:'Europe/Berlin',                region:'Europe' },
  { label:'Frankfurt, DE',         value:'Europe/Berlin',                region:'Europe' },
  { label:'Zurich, CH',            value:'Europe/Zurich',                region:'Europe' },
  { label:'Vienna, AT',            value:'Europe/Vienna',                region:'Europe' },
  { label:'Madrid, ES',            value:'Europe/Madrid',                region:'Europe' },
  { label:'Barcelona, ES',         value:'Europe/Madrid',                region:'Europe' },
  { label:'Rome, IT',              value:'Europe/Rome',                  region:'Europe' },
  { label:'Milan, IT',             value:'Europe/Rome',                  region:'Europe' },
  { label:'Stockholm, SE',         value:'Europe/Stockholm',             region:'Europe' },
  { label:'Oslo, NO',              value:'Europe/Oslo',                  region:'Europe' },
  { label:'Copenhagen, DK',        value:'Europe/Copenhagen',            region:'Europe' },
  { label:'Helsinki, FI',          value:'Europe/Helsinki',              region:'Europe' },
  { label:'Warsaw, PL',            value:'Europe/Warsaw',                region:'Europe' },
  { label:'Prague, CZ',            value:'Europe/Prague',                region:'Europe' },
  { label:'Budapest, HU',          value:'Europe/Budapest',              region:'Europe' },
  { label:'Athens, GR',            value:'Europe/Athens',                region:'Europe' },
  { label:'Istanbul, TR',          value:'Europe/Istanbul',              region:'Europe' },
  { label:'Moscow, RU',            value:'Europe/Moscow',                region:'Europe' },
  // Middle East / Africa
  { label:'Dubai, AE',             value:'Asia/Dubai',                   region:'Middle East' },
  { label:'Abu Dhabi, AE',         value:'Asia/Dubai',                   region:'Middle East' },
  { label:'Riyadh, SA',            value:'Asia/Riyadh',                  region:'Middle East' },
  { label:'Tel Aviv, IL',          value:'Asia/Jerusalem',               region:'Middle East' },
  { label:'Cairo, EG',             value:'Africa/Cairo',                 region:'Middle East' },
  { label:'Nairobi, KE',           value:'Africa/Nairobi',               region:'Africa' },
  { label:'Lagos, NG',             value:'Africa/Lagos',                 region:'Africa' },
  { label:'Johannesburg, ZA',      value:'Africa/Johannesburg',          region:'Africa' },
  { label:'Cape Town, ZA',         value:'Africa/Johannesburg',          region:'Africa' },
  // South Asia
  { label:'Mumbai, IN',            value:'Asia/Kolkata',                 region:'Asia' },
  { label:'Delhi, IN',             value:'Asia/Kolkata',                 region:'Asia' },
  { label:'Kolkata, IN',           value:'Asia/Kolkata',                 region:'Asia' },
  { label:'Karachi, PK',           value:'Asia/Karachi',                 region:'Asia' },
  { label:'Dhaka, BD',             value:'Asia/Dhaka',                   region:'Asia' },
  { label:'Colombo, LK',           value:'Asia/Colombo',                 region:'Asia' },
  // Southeast Asia
  { label:'Bangkok, TH',           value:'Asia/Bangkok',                 region:'Asia' },
  { label:'Ho Chi Minh City, VN',  value:'Asia/Ho_Chi_Minh',             region:'Asia' },
  { label:'Hanoi, VN',             value:'Asia/Bangkok',                 region:'Asia' },
  { label:'Kuala Lumpur, MY',      value:'Asia/Kuala_Lumpur',            region:'Asia' },
  { label:'Singapore, SG',         value:'Asia/Singapore',               region:'Asia' },
  { label:'Manila, PH',            value:'Asia/Manila',                  region:'Asia' },
  { label:'Siargao, PH',           value:'Asia/Manila',                  region:'Asia' },
  { label:'Cebu, PH',              value:'Asia/Manila',                  region:'Asia' },
  { label:'Jakarta, ID',           value:'Asia/Jakarta',                 region:'Asia' },
  { label:'Bali, ID',              value:'Asia/Makassar',                region:'Asia' },
  // East Asia
  { label:'Beijing, CN',           value:'Asia/Shanghai',                region:'Asia' },
  { label:'Shanghai, CN',          value:'Asia/Shanghai',                region:'Asia' },
  { label:'Shenzhen, CN',          value:'Asia/Shanghai',                region:'Asia' },
  { label:'Hong Kong, HK',         value:'Asia/Hong_Kong',               region:'Asia' },
  { label:'Taipei, TW',            value:'Asia/Taipei',                  region:'Asia' },
  { label:'Seoul, KR',             value:'Asia/Seoul',                   region:'Asia' },
  { label:'Tokyo, JP',             value:'Asia/Tokyo',                   region:'Asia' },
  { label:'Osaka, JP',             value:'Asia/Tokyo',                   region:'Asia' },
  // Oceania
  { label:'Perth, WA',             value:'Australia/Perth',              region:'Australia' },
  { label:'Darwin, NT',            value:'Australia/Darwin',             region:'Australia' },
  { label:'Adelaide, SA',          value:'Australia/Adelaide',           region:'Australia' },
  { label:'Brisbane, QLD',         value:'Australia/Brisbane',           region:'Australia' },
  { label:'Sydney, NSW',           value:'Australia/Sydney',             region:'Australia' },
  { label:'Canberra, ACT',         value:'Australia/Sydney',             region:'Australia' },
  { label:'Melbourne, VIC',        value:'Australia/Melbourne',          region:'Australia' },
  { label:'Hobart, TAS',           value:'Australia/Hobart',             region:'Australia' },
  { label:'Auckland, NZ',          value:'Pacific/Auckland',             region:'Pacific' },
  { label:'Wellington, NZ',        value:'Pacific/Auckland',             region:'Pacific' },
  { label:'Suva, FJ',              value:'Pacific/Fiji',                 region:'Pacific' },
];

const EVENT_COLORS = [
  { name:'Rose',     value:'#c0555a' },
  { name:'Amber',    value:'#b5821e' },
  { name:'Sage',     value:'#3d7a4a' },
  { name:'Sky',      value:'#2d6a9a' },
  { name:'Lavender', value:'#6a559a' },
  { name:'Blush',    value:'#c0607a' },
];

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa'];
const RECURRENCE_OPTIONS = ['none','daily','weekdays','weekends','weekly','bi-weekly','monthly','yearly'];
const RECURRENCE_LABELS  = {none:'None',daily:'Daily',weekdays:'Every Weekday (Mon–Fri)',weekends:'Weekends (Sat–Sun)',weekly:'Weekly','bi-weekly':'Every 2 Weeks',monthly:'Monthly',yearly:'Yearly'};

const USER_TYPES = [
  { id:'couple',   icon:'◇', title:'Long-Distance Couple',  accent:T.rose,     desc:'Stay close across time zones.',    features:['Dual clocks','Shared calendar','Love notes','Gifts','Travel mode'] },
  { id:'traveler', icon:'⊕', title:'Business Traveler',     accent:T.sky,      desc:'You move fast. We keep it clear.', features:['Travel mode','Multi-city','Meeting finder','Traffic alerts'] },
  { id:'local',    icon:'⌂', title:'Stay Local',            accent:T.sage,     desc:'One place, one calendar.',         features:['Single timezone','Color events','Reminders','Traffic alerts'] },
];

const PLANS = [
  { id:'free', label:'Free',         price:'Always free', priceNum:0,    sub:'1 timezone · 10 events · Basic calendar only',                                                     badge:null,            stripePriceId:null },
  { id:'plus', label:'Ophelia Plus', price:'$2.99/mo',    priceNum:2.99, sub:'Unlimited events · Shared calendar (1 person) · 2 timezones · Traffic alerts · Notes · Gifts',     badge:'Most Popular',  stripePriceId:'price_PLUS_ID_HERE' },
  { id:'pro',  label:'Ophelia Pro',  price:'$5.99/mo',    priceNum:5.99, sub:'Everything in Plus · Up to 5 shared people · Google & Apple calendar sync · Priority support',     badge:null,            stripePriceId:'price_PRO_ID_HERE'  },
];

// ─── Affiliate partners (populate after joining programs) ────────────────────
// Recommended programs to join:
//  US/CA: 1-800-Flowers (CJ Affiliate), FTD (Impact), Teleflora (ShareASale), ProFlowers
//  AU:    Interflora AU, Flowers for Everyone, Amazing Graze Flowers
//  EU/UK: Bloom & Wild (Awin), Interflora UK, FloraQueen (international)
//  Asia:  Interflora International, local florists via Rakuten Advertising
//  Gifts: UncommonGoods (ShareASale), Not On The High Street (UK), Minted
// Add items here once affiliate IDs are confirmed — they appear under "Partner Gifts" in the Send a Gift modal.
const AFFILIATE_PACKAGES = [];   // managed via Admin panel at runtime too

const GIFT_ITEMS = [
  { id:'roses',      cat:'flowers', name:'Red Roses',          price:49, icon:'✦', desc:'A dozen long-stem red roses.' },
  { id:'wild',       cat:'flowers', name:'Wildflower Bouquet', price:42, icon:'✦', desc:'Seasonal wildflower mix.' },
  { id:'sunflowers', cat:'flowers', name:'Sunflowers',         price:38, icon:'✦', desc:'Six tall sunflowers.' },
  { id:'orchid',     cat:'flowers', name:'Orchid Plant',       price:55, icon:'✦', desc:'Living orchid — lasts for weeks.' },
  { id:'cozy',       cat:'package', name:'Cozy Night In',      price:68, icon:'◆', desc:'Candle, herbal tea, chocolate, card.' },
  { id:'snacks',     cat:'package', name:'Snack Haul',         price:52, icon:'◆', desc:'Curated snacks from around the world.' },
  { id:'spa',        cat:'package', name:'Spa at Home',        price:75, icon:'◆', desc:'Face mask, bath salts, oils, socks.' },
  { id:'book',       cat:'package', name:'Book & Coffee',      price:44, icon:'◆', desc:'Bestselling novel + specialty coffee.' },
  { id:'custom',     cat:'package', name:'Custom Box',         price:90, icon:'◆', desc:'You choose — we curate and ship.' },
];

// ─── Beta promo codes (give to friends for free Plus access) ─────────────────
const BETA_CODES = [
  'OPHELIA-BETA1','OPHELIA-BETA2','OPHELIA-BETA3','OPHELIA-BETA4','OPHELIA-BETA5',
  'OPHELIA-BETA6','OPHELIA-BETA7','OPHELIA-BETA8','OPHELIA-BETA9','OPHELIA-BETA10',
  'OPHELIA-BETA11','OPHELIA-BETA12','OPHELIA-BETA13','OPHELIA-BETA14','OPHELIA-BETA15',
  'OPHELIA-BETA16','OPHELIA-BETA17','OPHELIA-BETA18','OPHELIA-BETA19','OPHELIA-BETA20',
  'OPHELIA-BETA21','OPHELIA-BETA22','OPHELIA-BETA23','OPHELIA-BETA24','OPHELIA-BETA25',
];
function checkBetaCode(code){ return BETA_CODES.includes(code?.trim().toUpperCase()); }

// ─── Simple password hash (not cryptographic — replace with Firebase auth in prod) ─
function hashPass(p){ let h=0;for(let i=0;i<p.length;i++){h=Math.imul(31,h)+p.charCodeAt(i)|0;}return h.toString(36); }
function fmt(date, tz, opts={}) {
  try   { return new Intl.DateTimeFormat('en-US',{timeZone:tz,...opts}).format(date); }
  catch { return '–'; }
}
function getOffsetH(tz) {
  const now=new Date(), local=new Date(now.toLocaleString('en-US',{timeZone:tz})), utc=new Date(now.toLocaleString('en-US',{timeZone:'UTC'}));
  return Math.round((local-utc)/3600000);
}
function tzDiff(tzA,tzB,nameB) {
  const diff=getOffsetH(tzB)-getOffsetH(tzA);
  if(diff===0) return `${nameB} is in the same time zone`;
  return diff>0?`${nameB} is ${diff}h ahead`:`${nameB} is ${Math.abs(diff)}h behind`;
}
function evtTime(ev,tz) {
  try   { return fmt(new Date(`${ev.date}T${ev.time}`),tz,{hour:'2-digit',minute:'2-digit',hour12:true}); }
  catch { return '–'; }
}
function encodeShare(d) { try{return btoa(unescape(encodeURIComponent(JSON.stringify(d))));}catch{return '';} }
function decodeShare(v) { try{return JSON.parse(decodeURIComponent(escape(atob(v))));}catch{return null;} }
function dateLabel(ds)  { try{return new Date(`${ds}T12:00`).toLocaleDateString('en-US',{month:'short',day:'numeric'});}catch{return ds;} }

// ─── Notification helpers ─────────────────────────────────────────────────────
async function requestNotifPermission() {
  if(!('Notification' in window)) return false;
  if(Notification.permission==='granted') return true;
  const result = await Notification.requestPermission();
  return result==='granted';
}
function getSW() {
  if(!('serviceWorker' in navigator)) return null;
  return navigator.serviceWorker.controller;
}
function scheduleEventNotif(ev, minutesBefore) {
  const sw = getSW();
  if(!sw||Notification.permission!=='granted') return;
  sw.postMessage({type:'schedule',event:ev,minutesBefore,label:'Ophelia reminder'});
}
function cancelEventNotif(eventId) {
  const sw = getSW();
  if(sw) sw.postMessage({type:'cancel',eventId});
}
function sendImmediateNotif(title, body, tag='ophelia') {
  const sw = getSW();
  if(!sw||Notification.permission!=='granted') return;
  sw.postMessage({type:'notify',title,body,tag});
}

const LS = {
  get:(k,fb=null)=>{
    try{
      const v=localStorage.getItem(k);
      if(!v) return fb;
      const parsed=JSON.parse(v);
      // If fallback is an array, ensure we return an array
      if(Array.isArray(fb)&&!Array.isArray(parsed)) return fb;
      return parsed??fb;
    }catch{return fb;}
  },
  set:(k,v)=>{ try{localStorage.setItem(k,JSON.stringify(v));}catch{} },
  del:(k)=>{ try{localStorage.removeItem(k);}catch{} },
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const IS  = (x={})=>({background:'#fff',border:`1px solid ${T.border}`,borderRadius:'10px',color:T.text1,padding:'10px 14px',fontSize:'14px',width:'100%',outline:'none',boxSizing:'border-box',fontFamily:"'DM Sans',sans-serif",...x});
const PB  = (x={})=>({background:T.accent,border:'none',borderRadius:'10px',color:'#fff',padding:'10px 22px',fontWeight:700,cursor:'pointer',fontSize:'13px',letterSpacing:'0.04em',fontFamily:"'DM Sans',sans-serif",...x});
const GB  = (x={})=>({background:T.surface2,border:`1px solid ${T.border}`,borderRadius:'10px',color:T.text2,padding:'10px 18px',cursor:'pointer',fontSize:'13px',fontFamily:"'DM Sans',sans-serif",...x});
const DB  = {background:'#fdf0f0',border:'1px solid #e0b0b0',borderRadius:'10px',color:T.danger,padding:'10px 16px',cursor:'pointer',fontSize:'13px',fontFamily:"'DM Sans',sans-serif"};
const SB  = (active,accent=T.accent)=>({background:active?`${accent}18`:T.surface2,border:`1px solid ${active?`${accent}60`:T.border}`,borderRadius:'40px',color:active?accent:T.text3,padding:'7px 16px',cursor:'pointer',fontSize:'12px',letterSpacing:'0.06em',fontFamily:"'DM Sans',sans-serif",fontWeight:active?600:400,transition:'all 0.15s'});

const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body{background:#faf6f0;}
::-webkit-scrollbar{width:5px;}
::-webkit-scrollbar-track{background:#f2ece2;}
::-webkit-scrollbar-thumb{background:#c8b89a;border-radius:3px;}
input::placeholder,textarea::placeholder{color:#b0988a;}
select option{background:#fff;color:#1a1208;}
.day-cell:hover{background:#ece4d6!important;}
.lift:hover{transform:translateY(-2px);box-shadow:0 6px 24px rgba(0,0,0,0.1)!important;transition:transform 0.18s,box-shadow 0.18s;}
/* ── Overlay locks background, card scrolls ── */
.overlay-inner{overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:none;}
.modal-card{overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;max-height:88vh;}
body.modal-open{overflow:hidden;}
.bottom-nav{position:fixed;bottom:0;left:0;right:0;z-index:9000;}
.page-scroll{padding-bottom:calc(120px + env(safe-area-inset-bottom,20px))!important;}

/* ── Mobile: sheet slides up from bottom ── */
@media(max-width:600px){
  .overlay-inner{align-items:flex-end!important;padding:0!important;}
  .modal-card{max-width:100%!important;border-radius:20px 20px 0 0!important;max-height:92vh!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior:contain!important;padding-bottom:env(safe-area-inset-bottom,16px)!important;}
  .clock-row{flex-direction:column!important;}
  .pill-row{gap:5px!important;}
  .cal-grid-cell{min-height:40px!important;}
  .dual-clock-sep{display:none!important;}
  .admin-grid{grid-template-columns:1fr!important;}
}
@media(min-width:601px) and (max-width:900px){
  .cal-max{max-width:700px!important;}
}
`;

// ─── Small reusable atoms ────────────────────────────────────────────────────
const Label = ({children,color=T.text3})=>(
  <div style={{fontSize:'11px',letterSpacing:'0.14em',color,textTransform:'uppercase',marginBottom:'7px',fontWeight:600}}>{children}</div>
);
function Overlay({onClose,zIndex=200,children}) {
  useEffect(()=>{
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    return()=>{
      document.body.style.overflow = prev;
      document.body.style.position = '';
      document.body.style.width = '';
    };
  },[]);
  return(
    <div
      className="overlay-inner"
      style={{position:'fixed',inset:0,background:'rgba(26,18,8,0.45)',display:'flex',alignItems:'center',justifyContent:'center',zIndex,padding:'16px',backdropFilter:'blur(4px)'}}
      onClick={onClose}
    >
      {children}
    </div>
  );
}
const Card = ({children,style={}})=>(
  <div
    className="modal-card"
    onClick={e=>e.stopPropagation()}
    style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:'22px',padding:'clamp(18px,4vw,28px)',width:'100%',boxShadow:'0 24px 80px rgba(0,0,0,0.2)',overflowY:'auto',WebkitOverflowScrolling:'touch',...style}}
  >{children}</div>
);

// ─── AddressInput — autocomplete + GPS ───────────────────────────────────────
const MAPS_KEY = 'YOUR_GOOGLE_MAPS_KEY'; // replace with your key to enable autocomplete

function AddressInput({value, onChange, placeholder='Enter address...',style}) {
  const [suggestions, setSuggestions] = useState([]);
  const [gpsLoading,  setGpsLoading]  = useState(false);
  const debounce = useRef(null);

  function handleType(e) {
    const v = e.target.value;
    onChange(v);
    clearTimeout(debounce.current);
    if(!v||v.length<2){setSuggestions([]);return;}
    debounce.current = setTimeout(()=>fetchSuggestions(v), 350);
  }

  async function fetchSuggestions(input) {
    // Google Places if key configured
    if(MAPS_KEY!=='YOUR_GOOGLE_MAPS_KEY'&&window.google) {
      try {
        const svc = new window.google.maps.places.AutocompleteService();
        svc.getPlacePredictions({input}, (preds, status)=>{
          if(status==='OK'&&preds) setSuggestions(preds.map(p=>p.description));
          else setSuggestions([]);
        });
        return;
      } catch {}
    }
    // Free fallback: OpenStreetMap Nominatim
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(input)}&format=json&limit=6`,
        {headers:{'Accept-Language':'en'}}
      );
      const data = await res.json();
      setSuggestions(data.map(r=>r.display_name));
    } catch { setSuggestions([]); }
  }

  function pick(s) { onChange(s); setSuggestions([]); }

  function useGPS() {
    if(!navigator.geolocation){alert('Location not available on this device.');return;}
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(async pos=>{
      const {latitude:lat,longitude:lng}=pos.coords;
      try {
        const res=await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,{headers:{'Accept-Language':'en'}});
        const d=await res.json();
        if(d.display_name){onChange(d.display_name);setGpsLoading(false);return;}
      } catch {}
      onChange(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      setGpsLoading(false);
    },()=>{alert('Could not get location. Please type it in.');setGpsLoading(false);},{timeout:8000});
  }

  return(
    <div style={{position:'relative'}}>
      <div style={{display:'flex',gap:'8px'}}>
        <input
          value={value}
          onChange={handleType}
          onBlur={()=>setTimeout(()=>setSuggestions([]),200)}
          placeholder={placeholder}
          style={IS({flex:1,width:'auto',...(style||{})})}
          autoComplete="off"
        />
        <button type="button" onClick={useGPS} title="Use my current location"
          style={{flexShrink:0,background:'#fff',border:`1px solid ${T.border}`,borderRadius:'10px',padding:'0 12px',cursor:'pointer',color:gpsLoading?T.text4:T.sky,display:'flex',alignItems:'center',justifyContent:'center'}}>
          {gpsLoading
            ? <span style={{fontSize:'11px',color:T.text4}}>...</span>
            : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="8" strokeDasharray="2 3"/></svg>
          }
        </button>
      </div>
      {suggestions.length>0&&(
        <div style={{position:'absolute',top:'100%',left:0,right:0,background:'#fff',border:`1px solid ${T.border}`,borderRadius:'12px',boxShadow:'0 8px 32px rgba(0,0,0,0.14)',zIndex:9999,marginTop:'4px',maxHeight:'200px',overflowY:'auto'}}>
          {suggestions.map((s,i)=>(
            <div key={i} onMouseDown={()=>pick(s)}
              style={{padding:'10px 14px',fontSize:'13px',color:T.text1,cursor:'pointer',borderBottom:i<suggestions.length-1?`1px solid ${T.border}`:'none',display:'flex',gap:'8px',alignItems:'flex-start',lineHeight:1.35}}>
              <svg style={{flexShrink:0,marginTop:'2px'}} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.text4} strokeWidth="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
              <span>{s}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── TzSelect ────────────────────────────────────────────────────────────────
function TzSelect({value,onChange,style}) {
  const regions=[...new Set(TIMEZONES.map(t=>t.region))];
  return (
    <select value={value} onChange={onChange} style={style||IS()}>
      {regions.map(r=>(
        <optgroup key={r} label={r}>
          {TIMEZONES.filter(t=>t.region===r).map(t=>(
            <option key={`${t.value}-${t.label}`} value={t.value}>{t.label}</option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

// ─── AuthScreen ───────────────────────────────────────────────────────────────
function AuthScreen({onComplete}) {
  const [mode,   setMode]   = useState('signin');
  const [email,  setEmail]  = useState('');
  const [pass,   setPass]   = useState('');
  const [name,   setName]   = useState('');
  const [phone,  setPhone]  = useState('');
  const [promo,  setPromo]  = useState('');
  const [smsOk,  setSmsOk]  = useState(false);
  const [pushOk, setPushOk] = useState(false);
  const [err,    setErr]    = useState('');
  const [loading,setLoading]= useState(false);

  async function requestPush() {
    if(!('Notification' in window)) return false;
    return (await Notification.requestPermission()) === 'granted';
  }

  function makeLocalUser(fbUser, extra={}) {
    const betaValid = checkBetaCode(promo);
    const stored = LS.get('ophelia_users',[]).filter?.(()=>true)??[];
    const existing = stored.find(u=>u.id===fbUser.uid||u.email===fbUser.email);
    const u = existing || {
      id: fbUser.uid || Date.now(),
      email: fbUser.email||'',
      name: fbUser.displayName||fbUser.email?.split('@')[0]||'User',
      authMethod: extra.authMethod||'email',
      phone: phone||'',
      smsConsent: smsOk,
      plan: betaValid?'plus': (existing?.plan||'free'),
      betaCode: betaValid?promo.trim().toUpperCase():null,
      ...extra,
    };
    if(!existing) LS.set('ophelia_users',[...stored, u]);
    return u;
  }

  async function handleEmail(e) {
    e.preventDefault();
    if(!email||!pass) { setErr('Please fill in all fields.'); return; }
    setErr(''); setLoading(true);

    // ── Firebase path ──
    if(IS_CONFIGURED) {
      try {
        let fbUser;
        if(mode==='signup') {
          if(!name) { setErr('Please enter your name.'); setLoading(false); return; }
          if(pass.length<8) { setErr('Password must be at least 8 characters.'); setLoading(false); return; }
          const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
          await updateProfile(cred.user, { displayName: name });
          fbUser = cred.user;
        } else {
          const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
          fbUser = cred.user;
        }
        const pushGranted = (mode==='signup'&&pushOk) ? await requestPush() : false;
        onComplete(makeLocalUser(fbUser, { authMethod:'email', pushEnabled:pushGranted }));
      } catch(e) {
        const msgs = {
          'auth/user-not-found':'No account found with that email.',
          'auth/wrong-password':'Incorrect password.',
          'auth/email-already-in-use':'An account with that email already exists. Sign in instead.',
          'auth/weak-password':'Password must be at least 8 characters.',
          'auth/invalid-email':'Please enter a valid email address.',
          'auth/invalid-credential':'Incorrect email or password.',
        };
        setErr(msgs[e.code]||e.message);
        setLoading(false);
      }
      return;
    }

    // ── Local fallback (Firebase not yet configured) ──
    const key = email.trim().toLowerCase();
    const stored = LS.get('ophelia_users',[]).filter?.(()=>true)??[];
    const existing = stored.find(u=>u.email.toLowerCase()===key);
    if(mode==='signin') {
      if(!existing) {
        // Account not found locally — auto-recover: create it so they can get back in
        const betaValid = checkBetaCode(promo);
        const user = { id:Date.now(), email:key, name:key.split('@')[0], authMethod:'email', passHash:hashPass(pass), phone:'', smsConsent:false, pushEnabled:false, plan:betaValid?'plus':'free' };
        LS.set('ophelia_users',[...stored, user]);
        onComplete(user);
        return;
      }
      if(existing.passHash && existing.passHash!==hashPass(pass)) { setErr('Incorrect password.'); setLoading(false); return; }
      onComplete(existing); return;
    }
    if(!name) { setErr('Please enter your name.'); setLoading(false); return; }
    if(pass.length<8) { setErr('Password must be at least 8 characters.'); setLoading(false); return; }
    if(existing) {
      // Already exists — just sign them in if password matches
      if(existing.passHash && existing.passHash!==hashPass(pass)) { setErr('An account with that email exists. Check your password.'); setLoading(false); return; }
      onComplete(existing); return;
    }
    const betaValid = checkBetaCode(promo);
    const pushGranted = pushOk ? await requestPush() : false;
    const user = { id:Date.now(), email:key, name:name||key.split('@')[0], authMethod:'email', passHash:hashPass(pass), phone:phone||'', smsConsent:smsOk, pushEnabled:pushGranted, plan:betaValid?'plus':'free', betaCode:betaValid?promo.trim().toUpperCase():null };
    LS.set('ophelia_users',[...stored,user]);
    onComplete(user);
  }

  async function handleGoogle() {
    setErr(''); setLoading(true);
    if(IS_CONFIGURED) {
      try {
        const cred = await signInWithPopup(auth, googleProvider);
        onComplete(makeLocalUser(cred.user, { authMethod:'google' }));
      } catch(e) {
        if(e.code!=='auth/popup-closed-by-user') setErr('Google sign-in failed. Please try again.');
        setLoading(false);
      }
    } else {
      setErr('Firebase not configured yet. Use email sign-in for now.');
      setLoading(false);
    }
  }

  async function handleApple() {
    setErr(''); setLoading(true);
    if(IS_CONFIGURED) {
      try {
        const cred = await signInWithPopup(auth, appleProvider);
        onComplete(makeLocalUser(cred.user, { authMethod:'apple' }));
      } catch(e) {
        if(e.code!=='auth/popup-closed-by-user') setErr('Apple sign-in failed. Please try again.');
        setLoading(false);
      }
    } else {
      setErr('Firebase not configured yet. Use email sign-in for now.');
      setLoading(false);
    }
  }

  return (
    <div style={{minHeight:'100vh',background:T.bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px',fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{maxWidth:'400px',width:'100%'}}>
        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(48px,12vw,72px)',fontWeight:300,color:T.text1,lineHeight:0.9,letterSpacing:'-0.02em',marginBottom:'8px'}}>Ophelia</h1>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'16px',color:T.text3,fontStyle:'italic'}}>{mode==='signup'?'Create your account':'your everyday calendar'}</div>
        </div>

        {!IS_CONFIGURED&&(
          <div style={{background:'#fffbea',border:'1px solid #e8d87a',borderRadius:'10px',padding:'10px 14px',marginBottom:'16px',fontSize:'12px',color:'#7a6a10',lineHeight:1.5}}>
            Firebase not connected yet — Google &amp; Apple login coming soon. Email sign-in works now.
          </div>
        )}
        <div style={{display:'flex',flexDirection:'column',gap:'10px',marginBottom:'20px'}}>
          <button onClick={handleGoogle} disabled={loading} style={{...GB({width:'100%',padding:'12px',textAlign:'center',background:'#fff',border:`1px solid ${T.border}`}),display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',fontWeight:500,opacity:loading?0.6:1}}>
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            Continue with Google
          </button>
          <button onClick={handleApple} disabled={loading} style={{...GB({width:'100%',padding:'12px',textAlign:'center',background:'#111',border:'1px solid #111',color:'#fff'}),display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',fontWeight:500,opacity:loading?0.6:1}}>
            <span style={{fontSize:'16px'}}>&#63743;</span> Continue with Apple
          </button>
        </div>

        <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'20px'}}>
          <div style={{flex:1,height:'1px',background:T.border}}/>
          <div style={{fontSize:'12px',color:T.text4}}>or with email</div>
          <div style={{flex:1,height:'1px',background:T.border}}/>
        </div>

        <form onSubmit={handleEmail} style={{display:'flex',flexDirection:'column',gap:'12px'}}>
          {mode==='signup'&&<input placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} style={IS()} />}
          <input type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)} style={IS()} />
          <input type="password" placeholder="Password (8+ characters)" value={pass} onChange={e=>setPass(e.target.value)} style={IS()} />

          <div>
            <input placeholder="Promo / beta code (optional)" value={promo} onChange={e=>setPromo(e.target.value)} style={IS({borderColor:promo&&checkBetaCode(promo)?T.sage:undefined})} />
            {promo&&checkBetaCode(promo)&&<div style={{fontSize:'12px',color:T.sage,marginTop:'5px',fontWeight:600}}>&#10003; Beta code valid — Ophelia Plus unlocked free</div>}
            {promo&&!checkBetaCode(promo)&&<div style={{fontSize:'12px',color:T.text4,marginTop:'5px'}}>Code not recognised</div>}
          </div>
          {mode==='signup'&&(
            <>
              <div>
                <input type="tel" placeholder="Phone number (optional)" value={phone} onChange={e=>setPhone(e.target.value)} style={IS()} />
                <div style={{fontSize:'11px',color:T.text4,marginTop:'5px',lineHeight:1.5}}>For urgent alerts like major traffic delays. Never used for marketing.</div>
              </div>

              {/* Permissions */}
              <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:'12px',padding:'14px 16px',display:'flex',flexDirection:'column',gap:'12px'}}>
                <div style={{fontSize:'12px',fontWeight:700,color:T.text2,letterSpacing:'0.04em'}}>Stay in the loop</div>

                <label style={{display:'flex',alignItems:'flex-start',gap:'12px',cursor:'pointer'}}>
                  <div onClick={()=>setPushOk(v=>!v)} style={{width:'20px',height:'20px',borderRadius:'5px',border:`2px solid ${pushOk?T.accent:T.border}`,background:pushOk?T.accent:'#fff',flexShrink:0,marginTop:'1px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
                    {pushOk&&<span style={{color:'#fff',fontSize:'12px',fontWeight:700}}>&#10003;</span>}
                  </div>
                  <div>
                    <div style={{fontSize:'13px',color:T.text1,fontWeight:600}}>Push notifications</div>
                    <div style={{fontSize:'11px',color:T.text4,marginTop:'2px'}}>Event reminders and urgent alerts on this device</div>
                  </div>
                </label>

                {phone&&(
                  <label style={{display:'flex',alignItems:'flex-start',gap:'12px',cursor:'pointer'}}>
                    <div onClick={()=>setSmsOk(v=>!v)} style={{width:'20px',height:'20px',borderRadius:'5px',border:`2px solid ${smsOk?T.accent:T.border}`,background:smsOk?T.accent:'#fff',flexShrink:0,marginTop:'1px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
                      {smsOk&&<span style={{color:'#fff',fontSize:'12px',fontWeight:700}}>&#10003;</span>}
                    </div>
                    <div>
                      <div style={{fontSize:'13px',color:T.text1,fontWeight:600}}>SMS alerts</div>
                      <div style={{fontSize:'11px',color:T.text4,marginTop:'2px'}}>Text me for critical updates only (e.g. severe traffic). Msg &amp; data rates may apply.</div>
                    </div>
                  </label>
                )}
              </div>
            </>
          )}

          {err&&<div style={{fontSize:'12px',color:T.danger,background:'#fdf0f0',border:'1px solid #e0b0b0',borderRadius:'8px',padding:'8px 12px'}}>{err}</div>}
          <button type="submit" disabled={loading} style={PB({width:'100%',padding:'13px',textAlign:'center',borderRadius:'12px',opacity:loading?0.6:1})}>
            {loading?'Please wait...':(mode==='signup'?'Create Account':'Sign In →')}
          </button>
        </form>

        <div style={{textAlign:'center',marginTop:'16px',fontSize:'13px',color:T.text3}}>
          {mode==='signup'?'Already have an account?':'New to Ophelia?'}
          <button onClick={()=>{setMode(mode==='signup'?'signin':'signup');setErr('');}} style={{background:'none',border:'none',color:T.accent,cursor:'pointer',fontWeight:700,marginLeft:'5px',fontSize:'13px'}}>
            {mode==='signup'?'Sign in':'Create one'}
          </button>
        </div>

        <div style={{textAlign:'center',marginTop:'24px',fontSize:'11px',color:T.text4,lineHeight:1.6}}>
          By continuing you agree to our Terms of Service and Privacy Policy.<br/>
          Your data is stored securely and never sold.
        </div>
      </div>
    </div>
  );
}

// ─── Clock ────────────────────────────────────────────────────────────────────
function Clock({tz,label,accent=T.accent,tag}) {
  const [time,setTime]=useState(new Date());
  useEffect(()=>{const id=setInterval(()=>setTime(new Date()),1000);return()=>clearInterval(id);},[]);
  return (
    <div style={{background:'#fff',border:`1px solid ${T.border}`,borderRadius:'16px',padding:'16px 20px',textAlign:'center',flex:1,minWidth:0,boxShadow:'0 2px 12px rgba(0,0,0,0.06)',position:'relative'}}>
      {tag&&<div style={{position:'absolute',top:'8px',right:'10px',fontSize:'9px',letterSpacing:'0.14em',color:T.sage,fontWeight:700,textTransform:'uppercase'}}>{tag}</div>}
      <div style={{fontSize:'10px',letterSpacing:'0.18em',color:accent,textTransform:'uppercase',marginBottom:'4px',fontFamily:"'Cormorant Garamond',serif",fontWeight:600}}>{label}</div>
      <div style={{fontSize:'28px',fontFamily:"'Cormorant Garamond',serif",color:T.text1,fontWeight:600,lineHeight:1}}>{fmt(time,tz,{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true})}</div>
      <div style={{fontSize:'12px',color:T.text3,marginTop:'4px'}}>{fmt(time,tz,{weekday:'short',month:'short',day:'numeric'})}</div>
    </div>
  );
}

// ─── EventCard ────────────────────────────────────────────────────────────────
function EventCard({ev,tzA,tzB,labelA,labelB,onClick}) {
  const tA=evtTime(ev,tzA), tB=tzB?evtTime(ev,tzB):null;
  return (
    <div onClick={onClick} style={{background:'#fff',border:`1px solid ${T.border}`,borderLeft:`4px solid ${ev.color}`,borderRadius:'12px',padding:'12px 16px',cursor:'pointer',display:'flex',gap:'12px',alignItems:'flex-start',boxShadow:'0 1px 6px rgba(0,0,0,0.05)'}}>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:'14px',color:T.text1,fontWeight:600,marginBottom:'4px'}}>{ev.title}</div>
        <div style={{display:'flex',gap:'12px',flexWrap:'wrap',fontSize:'12px'}}>
          <span><span style={{color:T.text4}}>{labelA} </span><span style={{color:T.accent,fontWeight:600}}>{tA}{ev.endTime?` – ${ev.endTime.replace(/^0/,'').replace(':00','').replace(':30',' 30').replace(/(\d+):(\d+)/,(_,h,m)=>{const H=parseInt(h);return `${H>12?H-12:H||12}:${m} ${H>=12?'PM':'AM'}`})}`:''}</span></span>
          {tB&&<><span style={{color:T.border2}}>&#9670;</span><span><span style={{color:T.text4}}>{labelB} </span><span style={{color:T.lavender,fontWeight:600}}>{tB}</span></span></>}
        </div>
        {ev.endDate&&ev.endDate!==ev.date&&<div style={{fontSize:'11px',color:T.sage,marginTop:'3px',fontWeight:600}}>&#9632; {dateLabel(ev.date)} – {dateLabel(ev.endDate)}</div>}
        {ev.location&&<div style={{fontSize:'11px',color:T.sky,marginTop:'3px'}}>&#9671; {ev.location}</div>}
        {ev.recurrence&&ev.recurrence!=='none'&&<div style={{fontSize:'10px',color:T.sage,marginTop:'3px',fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase'}}>{RECURRENCE_LABELS[ev.recurrence]||ev.recurrence}</div>}
        {ev.note&&<div style={{fontSize:'11px',color:T.text3,marginTop:'3px',fontStyle:'italic'}}>{ev.note}</div>}
      </div>
      <div style={{fontSize:'11px',color:T.text4,whiteSpace:'nowrap',paddingTop:'2px'}}>{ev.endDate&&ev.endDate!==ev.date?`${dateLabel(ev.date)}–${dateLabel(ev.endDate)}`:dateLabel(ev.date)}</div>
    </div>
  );
}

// ─── Traffic Alert ────────────────────────────────────────────────────────────
function TrafficAlert({event,homeLocation}) {
  const [open,setOpen]=useState(false);
  // TODO: call Google Maps Distance Matrix API when open=true
  // GET https://maps.googleapis.com/maps/api/distancematrix/json
  //   ?origins=encodeURIComponent(homeLocation)
  //   &destinations=encodeURIComponent(event.location)
  //   &departure_time=now&traffic_model=best_guess&key=GOOGLE_MAPS_API_KEY
  const simDrive=30, simTraffic=45;
  const eventDt=new Date(`${event.date}T${event.time}`);
  const leaveAt=new Date(eventDt-simTraffic*60000).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:true});
  const isSlow=simTraffic>simDrive;
  return (
    <div style={{background:`${T.sky}0d`,border:`1px solid ${T.sky}30`,borderRadius:'10px',padding:'10px 14px',marginTop:'6px'}}>
      <button onClick={()=>setOpen(o=>!o)} style={{background:'none',border:'none',color:T.sky,cursor:'pointer',fontWeight:600,fontSize:'12px',padding:0}}>
        &#9660;&ensp;{open?'Hide':'Check'} Traffic
      </button>
      {open&&(
        <div style={{marginTop:'8px',fontSize:'12px',color:T.text2,lineHeight:1.7}}>
          <div>Drive time: {simDrive} min normally</div>
          {isSlow&&<div style={{color:T.danger,fontWeight:600}}>&#9650; Traffic adds {simTraffic-simDrive} min today</div>}
          <div style={{fontWeight:700,color:T.text1,marginTop:'4px'}}>Leave by {leaveAt} to arrive on time</div>
          <a href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(homeLocation||'')}&destination=${encodeURIComponent(event.location||'')}`} target="_blank" rel="noopener noreferrer" style={{color:T.sky,fontSize:'11px',marginTop:'4px',display:'inline-block'}}>Open in Google Maps &#8594;</a>
          <div style={{fontSize:'10px',color:T.text4,marginTop:'4px'}}>Live traffic: add GOOGLE_MAPS_API_KEY to App.js</div>
        </div>
      )}
    </div>
  );
}

// ─── EventModal ───────────────────────────────────────────────────────────────
function EventModal({event,tzA,tzB,labelA,labelB,homeLocation,plan,eventCount,onClose,onSave,onDelete}) {
  const [title,     setTitle]     = useState(event?.title      || '');
  const [date,      setDate]      = useState(event?.date       || '');
  const [endDate,   setEndDate]   = useState(event?.endDate    || '');
  const [multiDay,  setMultiDay]  = useState(!!(event?.endDate && event.endDate !== event?.date));
  const [time,      setTime]      = useState(event?.time       || '12:00');
  const [endTime,   setEndTime]   = useState(event?.endTime    || '');
  const [tz,        setTz]        = useState(event?.tz         || tzA);
  const [recurrence,setRecurrence]= useState(event?.recurrence || 'none');
  const [location,  setLocation]  = useState(event?.location   || '');
  const [fromAddr,  setFromAddr]  = useState(event?.fromAddr   || homeLocation || '');
  const [color,     setColor]     = useState(event?.color      || EVENT_COLORS[0].value);
  const [note,      setNote]      = useState(event?.note       || '');

  const otherTz=tz===tzA?tzB:tzA, otherLabel=tz===tzA?labelB:labelA;
  let converted='';
  if(date&&time&&otherTz) try{converted=fmt(new Date(`${date}T${time}`),otherTz,{hour:'2-digit',minute:'2-digit',hour12:true,month:'short',day:'numeric'});}catch{}

  return (
    <Overlay onClose={onClose}>
      <Card style={{maxWidth:'440px',paddingBottom:'clamp(24px,6vw,40px)'}}>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'22px',color:T.text1,marginBottom:'20px',fontWeight:600}}>{event?.id?'Edit Event':'New Event'}</div>
        <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
          <input placeholder="Event title..." value={title} onChange={e=>setTitle(e.target.value)} style={IS()} />
          <div>
            <Label>Event location</Label>
            <AddressInput value={location} onChange={setLocation} placeholder="School, work, venue address..." />
          </div>
          <div>
            <Label>Leaving from (your address)</Label>
            <AddressInput value={fromAddr} onChange={setFromAddr} placeholder="Your home, office, current location..." />
          </div>
          <div style={{display:'flex',gap:'10px'}}>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={IS({flex:1,width:'auto'})} />
            <input type="time" value={time} onChange={e=>setTime(e.target.value)} style={IS({flex:1,width:'auto'})} />
            <input type="time" value={endTime} onChange={e=>setEndTime(e.target.value)} placeholder="End" style={IS({flex:1,width:'auto',color:endTime?T.text1:T.text4})} />
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <button onClick={()=>{setMultiDay(v=>!v);if(multiDay)setEndDate('');}} style={{...GB({padding:'6px 14px',fontSize:'12px'}),background:multiDay?`${T.accent}15`:'transparent',border:`1px solid ${multiDay?T.accent:T.border}`,color:multiDay?T.accent:T.text3}}>
              {multiDay?'✓ Multi-day':'+ Multi-day'}
            </button>
            {multiDay&&<input type="date" value={endDate} min={date} onChange={e=>setEndDate(e.target.value)} style={IS({flex:1,width:'auto'})} />}
          </div>

          <div>
            <Label>Repeat</Label>
            <select value={recurrence} onChange={e=>setRecurrence(e.target.value)} style={IS()}>
              {RECURRENCE_OPTIONS.map(r=><option key={r} value={r}>{RECURRENCE_LABELS[r]||r}</option>)}
            </select>
          </div>

          {tzB&&(
            <div>
              <Label>Whose timezone?</Label>
              <div style={{display:'flex',gap:'8px'}}>
                {[{label:labelA,value:tzA},{label:labelB,value:tzB}].map(item=>(
                  <button key={item.value} onClick={()=>setTz(item.value)} style={{...GB({flex:1,textAlign:'center',padding:'8px 12px'}),background:tz===item.value?`${T.accent}15`:T.surface2,border:`1px solid ${tz===item.value?`${T.accent}60`:T.border}`,color:tz===item.value?T.accent:T.text3,fontWeight:tz===item.value?700:400}}>{item.label}</button>
                ))}
              </div>
            </div>
          )}

          {converted&&<div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:'10px',padding:'10px 14px',fontSize:'13px',color:T.text2}}>&#8758; For <strong>{otherLabel}</strong>, this is <span style={{color:T.accent,fontWeight:700}}>{converted}</span></div>}

          {location&&(fromAddr||homeLocation)&&date&&time&&<TrafficAlert event={{date,time,location}} homeLocation={fromAddr||homeLocation}/>}

          <textarea placeholder="Notes (optional)..." value={note} onChange={e=>setNote(e.target.value)} rows={2} style={IS({resize:'none'})}/>

          <div>
            <Label>Colour</Label>
            <div style={{display:'flex',gap:'8px'}}>
              {EVENT_COLORS.map(c=><div key={c.value} title={c.name} onClick={()=>setColor(c.value)} style={{width:'26px',height:'26px',borderRadius:'50%',background:c.value,cursor:'pointer',border:color===c.value?`3px solid ${T.text1}`:'3px solid transparent',transition:'border 0.12s'}}/>)}
            </div>
          </div>
        </div>

        {plan==='free'&&!event?.id&&eventCount>=10&&(
          <div style={{background:'#fdf0f0',border:'1px solid #e0b0b0',borderRadius:'10px',padding:'12px 14px',marginTop:'12px',fontSize:'13px',color:T.danger}}>
            Free plan is limited to 10 events.{' '}
            <strong>Upgrade to Plus</strong> for unlimited events.
          </div>
        )}
        <div style={{display:'flex',gap:'8px',marginTop:'22px'}}>
          {event?.id&&<button onClick={()=>onDelete(event.id)} style={DB}>Delete</button>}
          <div style={{flex:1}}/>
          <button onClick={onClose} style={GB()}>Cancel</button>
          <button onClick={()=>{if(!title||!date)return;if(plan==='free'&&!event?.id&&eventCount>=10)return;onSave({id:event?.id||Date.now(),title,date,endDate:multiDay&&endDate?endDate:date,time,endTime:endTime||null,tz,recurrence,location,fromAddr,color,note});}} style={PB({opacity:plan==='free'&&!event?.id&&eventCount>=10?0.4:1})}>Save</button>

        </div>
      </Card>
    </Overlay>
  );
}

// ─── MeetingFinder ────────────────────────────────────────────────────────────
function MeetingFinder({tzA,tzB,labelA,labelB,onClose}) {
  const offA=getOffsetH(tzA),offB=getOffsetH(tzB);
  const slots=Array.from({length:24},(_,h)=>{
    const hB=(((h-offA+offB)%24)+24)%24;
    const sA=h>=9&&h<21?(h>=10&&h<20?2:1):0;
    const sB=hB>=9&&hB<21?(hB>=10&&hB<20?2:1):0;
    return{hA:h,hB,total:sA+sB};
  });
  const best=slots.filter(s=>s.total===4),good=slots.filter(s=>s.total===3),ok=slots.filter(s=>s.total===2);
  const fmtH=h=>{const d=new Date();d.setHours(h,0,0,0);return d.toLocaleTimeString('en-US',{hour:'numeric',hour12:true});};
  const Row=({slot,q})=>{
    const col=q==='ideal'?T.sage:q==='good'?T.accent:T.text3;
    return(
      <div style={{display:'flex',alignItems:'center',gap:'12px',padding:'10px 14px',background:'#fff',border:`1px solid ${T.border}`,borderRadius:'10px',marginBottom:'6px'}}>
        <div style={{width:'6px',height:'6px',borderRadius:'50%',background:col,flexShrink:0}}/>
        <div style={{flex:1,fontSize:'13px',color:T.text2}}>
          <span style={{color:T.accent,fontWeight:600}}>{fmtH(slot.hA)}</span>
          <span style={{color:T.text4,marginLeft:'4px',fontSize:'11px'}}>for {labelA}</span>
          <span style={{color:T.border2,margin:'0 8px'}}>&#8644;</span>
          <span style={{color:T.lavender,fontWeight:600}}>{fmtH(slot.hB)}</span>
          <span style={{color:T.text4,marginLeft:'4px',fontSize:'11px'}}>for {labelB}</span>
        </div>
        <div style={{fontSize:'10px',letterSpacing:'0.1em',color:col,textTransform:'uppercase',fontWeight:700}}>{q}</div>
      </div>
    );
  };
  return (
    <Overlay onClose={onClose}>
      <Card style={{maxWidth:'450px',maxHeight:'78vh',overflowY:'auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:'18px'}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'22px',color:T.text1,fontWeight:600}}>Best Times to Meet</div>
          <button onClick={onClose} style={{background:'none',border:'none',color:T.text3,cursor:'pointer',fontSize:'18px'}}>&#10005;</button>
        </div>
        {best.length>0&&<><div style={{fontSize:'11px',letterSpacing:'0.14em',color:T.sage,textTransform:'uppercase',fontWeight:700,marginBottom:'9px'}}>&#9670; Ideal</div>{best.map((s,i)=><Row key={i} slot={s} q="ideal"/>)}</>}
        {good.length>0&&<><div style={{fontSize:'11px',letterSpacing:'0.14em',color:T.accent,textTransform:'uppercase',fontWeight:700,margin:'16px 0 9px'}}>&#9670; Good</div>{good.map((s,i)=><Row key={i} slot={s} q="good"/>)}</>}
        {ok.length>0  &&<><div style={{fontSize:'11px',letterSpacing:'0.14em',color:T.text3,textTransform:'uppercase',fontWeight:700,margin:'16px 0 9px'}}>&#9670; Possible</div>{ok.slice(0,5).map((s,i)=><Row key={i} slot={s} q="ok"/>)}</>}
      </Card>
    </Overlay>
  );
}

// ─── NotesWall ────────────────────────────────────────────────────────────────
function NotesWall({notes,labelA,labelB,onClose,onAdd,onDelete}) {
  const [text,setText]=useState(''),[from,setFrom]=useState('A');
  const endRef=useRef(null);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:'smooth'});},[notes.length]);
  function submit(){if(!text.trim())return;onAdd({id:Date.now(),text:text.trim(),from,date:new Date().toISOString().split('T')[0]});setText('');}
  return (
    <Overlay onClose={onClose}>
      <div className="modal-card" style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:'22px',width:'100%',maxWidth:'480px',maxHeight:'82vh',display:'flex',flexDirection:'column',boxShadow:'0 24px 80px rgba(0,0,0,0.2)',overflow:'hidden'}} onClick={e=>e.stopPropagation()} onTouchMove={e=>e.stopPropagation()}>
        <div style={{padding:'22px 24px 16px',borderBottom:`1px solid ${T.border}`,display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
          <div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'22px',fontWeight:600,color:T.text1}}>Love Notes</div>
            <div style={{fontSize:'12px',color:T.text3,marginTop:'2px'}}>{notes.length} note{notes.length!==1?'s':''} saved</div>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',color:T.text3,cursor:'pointer',fontSize:'20px'}}>&#10005;</button>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:'16px 20px',display:'flex',flexDirection:'column',gap:'12px'}}>
          {notes.length===0&&<div style={{textAlign:'center',padding:'40px 20px',color:T.text4,fontFamily:"'Cormorant Garamond',serif",fontSize:'17px',fontStyle:'italic'}}>No notes yet — write the first one</div>}
          {notes.map(n=>{const isA=n.from==='A',nm=isA?labelA:labelB,col=isA?T.accent:T.rose;return(
            <div key={n.id} style={{display:'flex',flexDirection:'column',alignItems:isA?'flex-start':'flex-end'}}>
              <div style={{maxWidth:'80%',background:isA?'#fff':`${T.rose}0f`,border:`1px solid ${isA?T.border:`${T.rose}30`}`,borderRadius:isA?'4px 18px 18px 18px':'18px 4px 18px 18px',padding:'14px 16px'}}>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'16px',fontStyle:'italic',color:T.text1,lineHeight:1.55,marginBottom:'8px'}}>"{n.text}"</div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'16px'}}>
                  <div style={{fontSize:'11px',color:col,fontWeight:600}}>{nm}</div>
                  <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
                    <div style={{fontSize:'11px',color:T.text4}}>{dateLabel(n.date)}</div>
                    <button onClick={()=>onDelete(n.id)} style={{background:'none',border:'none',cursor:'pointer',color:T.border2,fontSize:'13px',padding:0}}>&#10005;</button>
                  </div>
                </div>
              </div>
            </div>
          );})}
          <div ref={endRef}/>
        </div>
        <div style={{padding:'14px 20px 18px',borderTop:`1px solid ${T.border}`,flexShrink:0,background:T.surface}}>
          <div style={{display:'flex',gap:'8px',marginBottom:'10px'}}>
            <div style={{fontSize:'11px',color:T.text3,letterSpacing:'0.1em',textTransform:'uppercase',fontWeight:600,alignSelf:'center',marginRight:'4px'}}>From:</div>
            {[{v:'A',l:labelA,c:T.accent},{v:'B',l:labelB,c:T.rose}].map(x=>(
              <button key={x.v} onClick={()=>setFrom(x.v)} style={{...GB({flex:1,textAlign:'center',padding:'7px 10px'}),background:from===x.v?`${x.c}18`:T.surface2,border:`1px solid ${from===x.v?`${x.c}55`:T.border}`,color:from===x.v?x.c:T.text3,fontWeight:from===x.v?700:400}}>{x.l}</button>
            ))}
          </div>
          <div style={{display:'flex',gap:'8px'}}>
            <textarea value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();submit();}}} placeholder="Write a little note..." rows={2} style={IS({flex:1,resize:'none',fontSize:'14px',width:'auto'})}/>
            <button onClick={submit} disabled={!text.trim()} style={PB({padding:'10px 16px',borderRadius:'10px',alignSelf:'stretch',opacity:text.trim()?1:0.4,background:from==='B'?T.rose:T.accent})}>&#8593;</button>
          </div>
          <div style={{fontSize:'11px',color:T.text4,marginTop:'6px'}}>Enter to send · Shift+Enter for new line</div>
        </div>
      </div>
    </Overlay>
  );
}

// ─── LoveNoteSplash ───────────────────────────────────────────────────────────
function LoveNoteSplash({notes,labelA,labelB,onClose}) {
  const latest=notes.length>0?notes[notes.length-1]:null;
  if(!latest)return null;
  const fromName=latest.from==='A'?labelA:labelB,fromColor=latest.from==='A'?T.accent:T.rose;
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(26,18,8,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:300,padding:'24px',backdropFilter:'blur(6px)',overflow:'auto'}} onClick={onClose} onTouchMove={e=>e.preventDefault()}>
      <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:'24px',padding:'40px 36px',width:'100%',maxWidth:'400px',textAlign:'center',boxShadow:'0 32px 80px rgba(0,0,0,0.2)'}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:'32px',color:T.rose,marginBottom:'16px'}}>&#9825;</div>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'13px',letterSpacing:'0.25em',color:T.text4,textTransform:'uppercase',marginBottom:'6px'}}>A note from</div>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'22px',fontWeight:600,color:fromColor,marginBottom:'24px'}}>{fromName}</div>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'20px',fontStyle:'italic',color:T.text1,lineHeight:1.6,marginBottom:'8px',padding:'0 8px'}}>"{latest.text}"</div>
        <div style={{fontSize:'11px',color:T.text4,marginBottom:'28px'}}>{dateLabel(latest.date)}</div>
        <button onClick={onClose} style={PB({padding:'11px 36px',borderRadius:'40px',background:fromColor})}>Open Ophelia</button>
      </div>
    </div>
  );
}

// ─── GiftModal ────────────────────────────────────────────────────────────────
// Partner companies to integrate:
//  Flowers:  1-800-Flowers (API + affiliate), FTD, Bloom & Wild (UK/EU), Interflora (int'l)
//  Gifts:    UncommonGoods, Not On The High Street (UK), Etsy Affiliate, Goldbelly (food)
//  Self-care: Sephora affiliate, The Body Shop, Tatcha
// Integration path: join each affiliate program → add links to AFFILIATE_PACKAGES via Admin panel
// For real-time ordering: use each brand's API or Zapier → backend order handler → Stripe charge
function GiftModal({partnerName,onClose}) {
  const [tab,setTab]=useState('flowers');
  const [selected,setSelected]=useState(null);
  const [address,setAddress]=useState('');
  const [date,setDate]=useState('');
  const [note,setNote]=useState('');
  const [step,setStep]=useState('browse'); // 'browse' | 'details' | 'sent'
  const affiliatePkgs=LS.get('ophelia_affiliate_packages',[]);
  const allItems=[...GIFT_ITEMS,...affiliatePkgs];
  const item=allItems.find(g=>g.id===selected);
  const items=tab==='affiliate'?affiliatePkgs:GIFT_ITEMS.filter(g=>g.cat===tab);

  if(step==='sent'){
    return(
      <Overlay onClose={onClose}><Card style={{maxWidth:'380px',textAlign:'center'}}>
        <div style={{fontSize:'36px',color:T.rose,marginBottom:'14px'}}>&#9825;</div>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'24px',color:T.text1,marginBottom:'8px',fontWeight:600}}>Sent to {partnerName}</div>
        <div style={{fontSize:'13px',color:T.text2,marginBottom:'12px'}}>Your {item?.name?.toLowerCase()} is scheduled for {date}.</div>
        <div style={{fontSize:'13px',color:T.text3,fontStyle:'italic',marginBottom:'24px',padding:'12px',background:T.surface,borderRadius:'10px'}}>"{note||'Thinking of you.'}"</div>
        <div style={{fontSize:'11px',color:T.text4,marginBottom:'20px',lineHeight:1.6}}>Live delivery processing will be active once gift partner APIs are connected.</div>
        <button onClick={onClose} style={PB({padding:'11px 32px',borderRadius:'40px'})}>Done</button>
      </Card></Overlay>
    );
  }

  if(step==='details'&&item){
    return(
      <Overlay onClose={onClose}><Card style={{maxWidth:'440px'}}>
        <div style={{display:'flex',gap:'12px',alignItems:'flex-start',marginBottom:'20px'}}>
          <button onClick={()=>setStep('browse')} style={{background:'none',border:'none',color:T.text3,cursor:'pointer',fontSize:'20px',padding:'2px',lineHeight:1}}>&#8592;</button>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'20px',color:T.text1,fontWeight:600}}>{item.name}</div>
            <div style={{fontSize:'13px',color:T.text3,marginTop:'2px'}}>{item.desc}</div>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',color:T.text3,cursor:'pointer',fontSize:'18px'}}>&#10005;</button>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
          <div><Label>Delivery address for {partnerName}</Label><AddressInput value={address} onChange={setAddress} placeholder="Street, city, state, zip..." /></div>
          <div><Label>Deliver on</Label><input type="date" value={date} onChange={e=>setDate(e.target.value)} style={IS()}/></div>
          <div><Label>Personal note</Label><textarea value={note} onChange={e=>setNote(e.target.value)} onClick={e=>e.stopPropagation()} placeholder="Write them something..." rows={3} style={IS({resize:'none'})}/></div>

          <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:'12px',padding:'14px 16px'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:'6px'}}>
              <span style={{fontSize:'13px',color:T.text2}}>{item.name}</span>
              <span style={{fontSize:'13px',color:T.text1,fontWeight:700}}>${item.price}</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between'}}>
              <span style={{fontSize:'12px',color:T.text4}}>Delivery</span>
              <span style={{fontSize:'12px',color:T.text4}}>Calculated at checkout</span>
            </div>
            <div style={{borderTop:`1px solid ${T.border}`,marginTop:'10px',paddingTop:'10px',display:'flex',justifyContent:'space-between'}}>
              <span style={{fontWeight:700,color:T.text1,fontSize:'14px'}}>Est. total</span>
              <span style={{fontWeight:700,color:T.accent,fontSize:'14px'}}>${item.price}+</span>
            </div>
            <div style={{fontSize:'11px',color:T.text4,marginTop:'6px'}}>Secured by Stripe. Gift partner APIs coming soon.</div>
          </div>

          <button
            onClick={()=>{if(address&&date)setStep('sent');}}
            style={PB({padding:'13px',textAlign:'center',borderRadius:'12px',opacity:address&&date?1:0.4,background:T.rose})}
          >
            Send {item.name} to {partnerName} &#8594;
          </button>
          {(!address||!date)&&<div style={{fontSize:'11px',color:T.text4,textAlign:'center'}}>Add delivery address and date to continue</div>}
        </div>
      </Card></Overlay>
    );
  }

  return(
    <Overlay onClose={onClose}><Card style={{maxWidth:'480px',maxHeight:'84vh',overflowY:'auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'22px',color:T.text1,fontWeight:600}}>Send a Gift</div>
        <button onClick={onClose} style={{background:'none',border:'none',color:T.text3,cursor:'pointer',fontSize:'18px'}}>&#10005;</button>
      </div>
      <div style={{fontSize:'13px',color:T.text3,marginBottom:'20px'}}>Delivered to {partnerName}'s door.</div>

      <div style={{display:'flex',gap:'6px',marginBottom:'18px',flexWrap:'wrap'}}>
        {[{id:'flowers',label:'Flowers'},{id:'package',label:'Care Packages'},{id:'affiliate',label:'Partner Gifts'}].map(t=>(
          <button key={t.id} onClick={()=>{setTab(t.id);setSelected(null);}} style={{...GB({flex:1,textAlign:'center',padding:'9px 10px',minWidth:'90px'}),background:tab===t.id?`${T.rose}15`:T.surface2,border:`1px solid ${tab===t.id?`${T.rose}60`:T.border}`,color:tab===t.id?T.rose:T.text3,fontWeight:tab===t.id?700:400}}>{t.label}</button>
        ))}
      </div>

      {tab==='affiliate'&&affiliatePkgs.length===0&&(
        <div style={{textAlign:'center',padding:'32px 20px',background:T.surface,border:`1px dashed ${T.border2}`,borderRadius:'14px',marginBottom:'18px'}}>
          <div style={{fontSize:'22px',color:T.border2,marginBottom:'10px'}}>&#9671;</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'18px',color:T.text3,marginBottom:'6px'}}>Partner gifts coming soon</div>
          <div style={{fontSize:'12px',color:T.text4,lineHeight:1.7}}>
            We are partnering with 1-800-Flowers, Bloom &amp; Wild, UncommonGoods, and more.<br/>
            They will appear here once live.
          </div>
        </div>
      )}

      {items.length>0&&(
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'18px'}}>
          {items.map(g=>(
            <div key={g.id} onClick={()=>{setSelected(g.id);setStep('details');}} className="lift" style={{background:'#fff',border:`1px solid ${T.border}`,borderRadius:'12px',padding:'14px 12px',cursor:'pointer'}}>
              <div style={{fontSize:'20px',color:T.rose,marginBottom:'6px'}}>{g.icon}</div>
              <div style={{fontSize:'13px',color:T.text1,fontWeight:600,marginBottom:'3px'}}>{g.name}</div>
              <div style={{fontSize:'11px',color:T.text3,marginBottom:'7px',lineHeight:1.4}}>{g.desc}</div>
              <div style={{fontSize:'14px',color:T.accent,fontWeight:700}}>${g.price}</div>
            </div>
          ))}
        </div>
      )}
    </Card></Overlay>
  );
}

// ─── ShareModal (invite link — recipient must create an account) ──────────────
function ShareModal({tzA,labelA,onClose,plan,onConnected}) {
  const coupleId = useState(()=>{
    const cfg=LS.get('ophelia_config',null);
    if(cfg?.coupleId) return cfg.coupleId;
    const id=`couple_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
    if(cfg){const updated={...cfg,coupleId:id};LS.set('ophelia_config',updated);}
    return id;
  })[0];
  const inviteData = encodeShare({type:'invite',fromName:labelA,fromTz:tzA,coupleId,ts:Date.now()});
  const url = `${window.location.origin}${window.location.pathname}?invite=${inviteData}`;
  const [copied,setCopied] = useState(false);
  const [tab,setTab] = useState('link'); // 'link' | 'code'
  const [theirCode,setTheirCode] = useState('');
  const [codeErr,setCodeErr] = useState('');
  const shortCode = coupleId.slice(-6).toUpperCase();

  async function copy(){try{await navigator.clipboard.writeText(url);setCopied(true);setTimeout(()=>setCopied(false),2500);}catch{}}

  function connectByCode(){
    if(!theirCode.trim()){setCodeErr('Enter your partner\'s code.');return;}
    const raw=theirCode.trim().toUpperCase();
    // reconstruct a coupleId from the short code by searching known patterns
    // We store the short code → full coupleId mapping in localStorage when we generate one
    const map=LS.get('ophelia_code_map',{});
    const fullId=map[raw]||Object.keys(map).find(k=>k.endsWith(raw));
    if(!fullId){setCodeErr('Code not found. Make sure your partner shared their 6-digit code from their Share screen.');return;}
    const cfg=LS.get('ophelia_config',null);
    if(cfg){const updated={...cfg,coupleId:fullId};LS.set('ophelia_config',updated);}
    setCodeErr('');
    if(onConnected) onConnected(fullId);
    onClose();
  }

  // Save our short code → coupleId mapping so partners can find us
  useState(()=>{
    const map=LS.get('ophelia_code_map',{});
    map[shortCode]=coupleId;
    LS.set('ophelia_code_map',map);
  });

  const canShare = plan==='plus'||plan==='pro';
  return(
    <Overlay onClose={onClose}><Card style={{maxWidth:'430px'}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'16px'}}>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'22px',color:T.text1,fontWeight:600}}>Connect Calendars</div>
        <button onClick={onClose} style={{background:'none',border:'none',color:T.text3,cursor:'pointer',fontSize:'18px'}}>&#10005;</button>
      </div>
      {!canShare?(
        <div>
          <div style={{fontSize:'13px',color:T.text3,marginBottom:'20px'}}>Calendar sharing is available on Ophelia Plus and Pro.</div>
          <div style={{background:`${T.accent}0e`,border:`1px solid ${T.accent}30`,borderRadius:'12px',padding:'16px',marginBottom:'20px'}}>
            <div style={{fontSize:'13px',fontWeight:700,color:T.accent,marginBottom:'4px'}}>Upgrade to Plus — $2.99/mo</div>
            <div style={{fontSize:'12px',color:T.text3}}>Share your calendar with 1 person. Works whether or not they already have an account.</div>
          </div>
          <button onClick={onClose} style={GB({width:'100%',textAlign:'center'})}>Close</button>
        </div>
      ):(
        <div>
          {/* Tab switcher */}
          <div style={{display:'flex',gap:'6px',marginBottom:'18px',background:T.surface,borderRadius:'10px',padding:'4px'}}>
            {[{id:'link',label:'Invite Link'},{id:'code',label:'Connect by Code'}].map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:'7px',border:'none',borderRadius:'7px',cursor:'pointer',background:tab===t.id?'#fff':'transparent',color:tab===t.id?T.accent:T.text3,fontWeight:tab===t.id?700:400,fontSize:'12px',fontFamily:"'DM Sans',sans-serif",boxShadow:tab===t.id?'0 1px 4px rgba(0,0,0,0.1)':'none'}}>{t.label}</button>
            ))}
          </div>

          {tab==='link'&&(
            <div>
              <div style={{fontSize:'13px',color:T.text3,marginBottom:'16px'}}>Share this link. Works even if they already have an Ophelia account.</div>
              <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:'12px',padding:'12px 14px',marginBottom:'16px'}}>
                <div style={{fontSize:'11px',color:T.text4,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:'5px',fontWeight:600}}>Invite Link</div>
                <div style={{fontSize:'12px',color:T.sky,wordBreak:'break-all',lineHeight:1.5}}>{url.length>90?`${url.slice(0,70)}...`:url}</div>
              </div>
              <div style={{display:'flex',gap:'8px'}}>
                <button onClick={onClose} style={GB()}>Close</button>
                <button onClick={copy} style={PB({flex:1,textAlign:'center',background:copied?T.sage:T.sky})}>{copied?'Copied ✓':'Copy Link'}</button>
              </div>
            </div>
          )}

          {tab==='code'&&(
            <div>
              <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:'12px',padding:'14px',marginBottom:'16px',textAlign:'center'}}>
                <div style={{fontSize:'11px',color:T.text4,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:'6px',fontWeight:600}}>Your Connect Code</div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'32px',fontWeight:700,color:T.accent,letterSpacing:'0.2em'}}>{shortCode}</div>
                <div style={{fontSize:'11px',color:T.text3,marginTop:'4px'}}>Share this with your partner</div>
              </div>
              <Label color={T.accent}>Enter your partner's code</Label>
              <input value={theirCode} onChange={e=>setTheirCode(e.target.value.toUpperCase())} placeholder="e.g. A3X9KL" maxLength={6} style={IS({letterSpacing:'0.2em',textTransform:'uppercase',fontFamily:"'DM Sans',sans-serif",fontSize:'18px',textAlign:'center',marginTop:'6px',marginBottom:'8px'})}/>
              {codeErr&&<div style={{fontSize:'12px',color:T.danger,marginBottom:'8px'}}>{codeErr}</div>}
              <div style={{display:'flex',gap:'8px',marginTop:'4px'}}>
                <button onClick={onClose} style={GB()}>Cancel</button>
                <button onClick={connectByCode} style={PB({flex:1,textAlign:'center'})}>Connect</button>
              </div>
            </div>
          )}
        </div>
      )}
    </Card></Overlay>
  );
}

// ─── InviteScreen — shown when someone lands on ?invite= link ─────────────────
function InviteScreen({inviteData,onAccept}) {
  const [mode,  setMode]  = useState(()=>LS.get('ophelia_config',null)?'signin':'signup');
  const [email, setEmail] = useState('');
  const [pass,  setPass]  = useState('');
  const [name,  setName]  = useState('');
  const [err,   setErr]   = useState('');
  const from = inviteData?.fromName || 'Someone';

  function handleSubmit(e){
    e.preventDefault();
    setErr('');
    const stored=LS.get('ophelia_users',[]);
    if(mode==='signin'){
      const found=stored.find(u=>u.email===email);
      if(!found){setErr('No account found with that email.');return;}
      // merge coupleId into their existing config
      const existingCfg=LS.get('ophelia_config',null);
      const cfg={...(existingCfg||{}),coupleId:inviteData?.coupleId||null,partnerName:inviteData?.fromName||'Partner',tzB:inviteData?.fromTz||existingCfg?.tzB||'America/New_York',connectedViaInvite:true};
      LS.set('ophelia_config',cfg);
      onAccept(found,inviteData);
    } else {
      if(!email||!pass||!name){setErr('Please fill in all fields.');return;}
      const user={id:Date.now(),email,name,authMethod:'email',plan:'free'};
      if(!stored.find(u=>u.email===email)) LS.set('ophelia_users',[...stored,user]);
      onAccept(user,inviteData);
    }
  }

  return(
    <div style={{minHeight:'100vh',background:T.bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px',fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{maxWidth:'400px',width:'100%'}}>
        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(40px,10vw,64px)',fontWeight:300,color:T.text1,lineHeight:0.9,letterSpacing:'-0.02em',marginBottom:'12px'}}>Ophelia</h1>
          <div style={{background:`${T.accent}0e`,border:`1px solid ${T.accent}30`,borderRadius:'14px',padding:'16px 20px',marginBottom:'8px'}}>
            <div style={{fontSize:'13px',color:T.text3,marginBottom:'4px'}}>You have been invited by</div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'22px',color:T.accent,fontWeight:600}}>{from}</div>
            <div style={{fontSize:'12px',color:T.text3,marginTop:'6px'}}>{mode==='signin'?'Sign in to connect your calendars.':'Create a free account to connect your calendars.'}</div>
          </div>
        </div>
        <div style={{display:'flex',gap:'6px',marginBottom:'18px',background:T.surface,borderRadius:'10px',padding:'4px'}}>
          {[{id:'signup',label:'New Account'},{id:'signin',label:'Already have account'}].map(t=>(
            <button key={t.id} onClick={()=>setMode(t.id)} style={{flex:1,padding:'7px',border:'none',borderRadius:'7px',cursor:'pointer',background:mode===t.id?'#fff':'transparent',color:mode===t.id?T.accent:T.text3,fontWeight:mode===t.id?700:400,fontSize:'12px',fontFamily:"'DM Sans',sans-serif",boxShadow:mode===t.id?'0 1px 4px rgba(0,0,0,0.1)':'none'}}>{t.label}</button>
          ))}
        </div>
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'12px'}}>
          {mode==='signup'&&<input placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} style={IS()}/>}
          <input type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)} style={IS()}/>
          <input type="password" placeholder="Password" value={pass} onChange={e=>setPass(e.target.value)} style={IS()}/>
          {err&&<div style={{fontSize:'12px',color:T.danger,background:'#fdf0f0',border:'1px solid #e0b0b0',borderRadius:'8px',padding:'8px 12px'}}>{err}</div>}
          <button type="submit" style={PB({width:'100%',padding:'13px',textAlign:'center',borderRadius:'12px'})}>{mode==='signin'?'Sign In & Connect ':'Create Account & Connect '} &#8594;</button>
        </form>
        <div style={{textAlign:'center',marginTop:'20px',fontSize:'12px',color:T.text4,lineHeight:1.6}}>
          Your calendar is private. Only {from} can see your shared events after you connect.
        </div>
      </div>
    </div>
  );
}

// ─── AdminPanel ───────────────────────────────────────────────────────────────
function AdminPanel({onClose}) {
  const [authed,setAuthed]=useState(false);
  const [pass,setPass]=useState('');
  const [passErr,setPassErr]=useState(false);
  const [tab,setTab]=useState('overview');
  const [affPkgs,setAffPkgs]=useState(()=>LS.get('ophelia_affiliate_packages',[]));
  const [newPkg,setNewPkg]=useState({name:'',affiliateId:'',price:'',desc:'',affiliateUrl:'',commission:'',icon:'✦'});
  const users=LS.get('ophelia_users',[]);

  function login(){if(pass===ADMIN_PASSCODE){setAuthed(true);setPassErr(false);}else setPassErr(true);}

  function savePkg(){
    if(!newPkg.name||!newPkg.price)return;
    const pkg={...newPkg,id:`aff_${Date.now()}`,cat:'affiliate',price:Number(newPkg.price)};
    const updated=[...affPkgs,pkg];
    setAffPkgs(updated);LS.set('ophelia_affiliate_packages',updated);
    setNewPkg({name:'',affiliateId:'',price:'',desc:'',affiliateUrl:'',commission:'',icon:'✦'});
  }
  function removePkg(id){const u=affPkgs.filter(p=>p.id!==id);setAffPkgs(u);LS.set('ophelia_affiliate_packages',u);}

  if(!authed){
    return(
      <div style={{position:'fixed',inset:0,background:'rgba(10,20,40,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:500,backdropFilter:'blur(6px)',overflow:'auto'}} onClick={onClose} onTouchMove={e=>e.preventDefault()}>
        <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:'22px',padding:'36px',width:'100%',maxWidth:'360px',textAlign:'center',boxShadow:'0 32px 80px rgba(0,0,0,0.25)'}} onClick={e=>e.stopPropagation()}>
          <div style={{fontSize:'11px',letterSpacing:'0.3em',color:T.admin,textTransform:'uppercase',fontWeight:700,marginBottom:'8px'}}>Admin Access</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'26px',color:T.text1,fontWeight:600,marginBottom:'24px'}}>Ophelia Admin</div>
          <input type="password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&login()} placeholder="Admin passcode..." style={IS({marginBottom:'12px',textAlign:'center'})}/>
          {passErr&&<div style={{fontSize:'12px',color:T.danger,marginBottom:'10px'}}>Incorrect passcode</div>}
          <button onClick={login} style={PB({width:'100%',padding:'12px',textAlign:'center',background:T.admin})}>Enter</button>
          <button onClick={onClose} style={{...GB({width:'100%',textAlign:'center',marginTop:'8px'})}}>Cancel</button>
        </div>
      </div>
    );
  }

  const TABS=[{id:'overview',label:'Overview'},{id:'users',label:'Users'},{id:'affiliate',label:'Affiliate Pkgs'},{id:'gifts',label:'Gift Catalog'},{id:'payments',label:'Payments'}];

  return(
    <div style={{position:'fixed',inset:0,background:'rgba(10,20,40,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:500,backdropFilter:'blur(4px)',padding:'16px',overflow:'auto'}} onClick={onClose} onTouchMove={e=>e.preventDefault()}>
      <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:'22px',width:'100%',maxWidth:'740px',maxHeight:'90vh',display:'flex',flexDirection:'column',boxShadow:'0 32px 80px rgba(0,0,0,0.25)'}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'20px 24px 16px',borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            <div style={{width:'8px',height:'8px',borderRadius:'50%',background:T.sage}}/>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'20px',fontWeight:600,color:T.text1}}>Admin Panel</div>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',color:T.text3,cursor:'pointer',fontSize:'18px'}}>&#10005;</button>
        </div>
        <div style={{display:'flex',gap:'2px',padding:'12px 24px 0',borderBottom:`1px solid ${T.border}`,flexShrink:0,flexWrap:'wrap'}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:'8px 14px',border:'none',borderRadius:'8px 8px 0 0',cursor:'pointer',background:tab===t.id?'#fff':'transparent',color:tab===t.id?T.admin:T.text3,fontWeight:tab===t.id?700:400,fontSize:'12px',fontFamily:"'DM Sans',sans-serif",borderBottom:tab===t.id?`2px solid ${T.admin}`:'2px solid transparent'}}>{t.label}</button>
          ))}
        </div>
        <div style={{flex:1,overflowY:'auto',padding:'24px'}}>

          {tab==='overview'&&(
            <div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'24px'}}>
                {[{label:'Users',value:users.length},{label:'Affiliate Items',value:affPkgs.length},{label:'Build',value:'✓ OK'}].map(s=>(
                  <div key={s.label} style={{background:'#fff',border:`1px solid ${T.border}`,borderRadius:'14px',padding:'18px',textAlign:'center'}}>
                    <div style={{fontSize:'26px',color:T.admin,fontWeight:700,fontFamily:"'Cormorant Garamond',serif"}}>{s.value}</div>
                    <div style={{fontSize:'12px',color:T.text2,fontWeight:600,marginTop:'2px'}}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{background:'#fff',border:`1px solid ${T.border}`,borderRadius:'14px',padding:'18px'}}>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'17px',fontWeight:600,color:T.text1,marginBottom:'12px'}}>Setup Checklist</div>
                {['Add Stripe Publishable Key + Price IDs in App.js','Set up Firebase (auth, Firestore) for user accounts','Add Google Maps API key for real-time traffic','Configure Google OAuth Client ID and Apple Team ID','Join affiliate programs — add items via Affiliate Pkgs tab','Set up SendGrid / AWS SES for email notifications','Deploy to Vercel (recommended) — connect custom domain'].map((t,i)=>(
                  <div key={i} style={{display:'flex',gap:'10px',fontSize:'13px',color:T.text2,marginBottom:'8px',lineHeight:1.5}}>
                    <span style={{color:T.border2,flexShrink:0}}>&#9671;</span><span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab==='users'&&(
            <div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'20px',fontWeight:600,color:T.text1,marginBottom:'16px'}}>Users ({users.length})</div>
              {users.length===0?<div style={{textAlign:'center',padding:'40px 20px',background:T.surface,border:`1px dashed ${T.border2}`,borderRadius:'14px',color:T.text4}}>No users yet</div>:(
                <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                  {users.map(u=>(
                    <div key={u.id} style={{background:'#fff',border:`1px solid ${T.border}`,borderRadius:'12px',padding:'14px 16px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div>
                        <div style={{fontWeight:600,color:T.text1}}>{u.name}</div>
                        <div style={{fontSize:'12px',color:T.text3,marginTop:'2px'}}>{u.email||'—'} · via {u.authMethod}</div>
                      </div>
                      <div style={{fontSize:'11px',background:T.surface,border:`1px solid ${T.border}`,borderRadius:'20px',padding:'3px 10px',color:T.text3}}>{u.plan||'free'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab==='affiliate'&&(
            <div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'20px',fontWeight:600,color:T.text1,marginBottom:'4px'}}>Affiliate Packages</div>
              <div style={{fontSize:'13px',color:T.text3,marginBottom:'18px'}}>Add partner gifts here once affiliate programs are joined. They appear in the Gift modal under "Partner Gifts".</div>
              <div style={{background:'#fff',border:`1px solid ${T.border}`,borderRadius:'14px',padding:'18px',marginBottom:'20px'}}>
                <div style={{fontSize:'13px',fontWeight:600,color:T.text1,marginBottom:'14px'}}>Add Package</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'10px'}}>
                  <div><Label>Name</Label><input value={newPkg.name} onChange={e=>setNewPkg(p=>({...p,name:e.target.value}))} placeholder="e.g. Classic Roses" style={IS()}/></div>
                  <div><Label>Affiliate ID</Label><input value={newPkg.affiliateId} onChange={e=>setNewPkg(p=>({...p,affiliateId:e.target.value}))} placeholder="e.g. 1800flowers" style={IS()}/></div>
                  <div><Label>Price ($)</Label><input type="number" value={newPkg.price} onChange={e=>setNewPkg(p=>({...p,price:e.target.value}))} placeholder="59" style={IS()}/></div>
                  <div><Label>Commission</Label><input value={newPkg.commission} onChange={e=>setNewPkg(p=>({...p,commission:e.target.value}))} placeholder="8%" style={IS()}/></div>
                </div>
                <div style={{marginBottom:'10px'}}><Label>Description</Label><input value={newPkg.desc} onChange={e=>setNewPkg(p=>({...p,desc:e.target.value}))} placeholder="Short description..." style={IS()}/></div>
                <div style={{marginBottom:'12px'}}><Label>Affiliate URL</Label><input value={newPkg.affiliateUrl} onChange={e=>setNewPkg(p=>({...p,affiliateUrl:e.target.value}))} placeholder="https://..." style={IS()}/></div>
                <button onClick={savePkg} style={PB({padding:'10px 20px',background:T.admin})}>Add Package</button>
              </div>
              {affPkgs.length===0?<div style={{textAlign:'center',padding:'32px',background:T.surface,border:`1px dashed ${T.border2}`,borderRadius:'14px',color:T.text4,fontSize:'13px'}}>No affiliate packages yet</div>:(
                <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                  {affPkgs.map(p=>(
                    <div key={p.id} style={{background:'#fff',border:`1px solid ${T.border}`,borderRadius:'12px',padding:'14px 16px',display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                      <div>
                        <div style={{fontWeight:600,color:T.text1}}>{p.name}</div>
                        <div style={{fontSize:'12px',color:T.text3,marginTop:'2px'}}>{p.desc}</div>
                        <div style={{display:'flex',gap:'12px',marginTop:'6px'}}>
                          <span style={{fontSize:'11px',color:T.accent,fontWeight:700}}>${p.price}</span>
                          <span style={{fontSize:'11px',color:T.text4}}>via {p.affiliateId}</span>
                          {p.commission&&<span style={{fontSize:'11px',color:T.sage}}>&#9670; {p.commission}</span>}
                        </div>
                      </div>
                      <button onClick={()=>removePkg(p.id)} style={{...DB,padding:'6px 12px',fontSize:'12px',flexShrink:0}}>Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab==='gifts'&&(
            <div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'20px',fontWeight:600,color:T.text1,marginBottom:'4px'}}>Gift Catalog</div>
              <div style={{fontSize:'13px',color:T.text3,marginBottom:'18px'}}>Built-in items. Edit GIFT_ITEMS in App.js to add or change.</div>
              {GIFT_ITEMS.map(g=>(
                <div key={g.id} style={{background:'#fff',border:`1px solid ${T.border}`,borderRadius:'12px',padding:'12px 16px',display:'flex',gap:'12px',alignItems:'center',marginBottom:'8px'}}>
                  <span style={{fontSize:'18px',color:T.rose}}>{g.icon}</span>
                  <div style={{flex:1}}><div style={{fontWeight:600,color:T.text1,fontSize:'13px'}}>{g.name}</div><div style={{fontSize:'11px',color:T.text3}}>{g.desc}</div></div>
                  <div style={{fontSize:'14px',color:T.accent,fontWeight:700}}>${g.price}</div>
                  <div style={{fontSize:'11px',color:T.text4,background:T.surface,border:`1px solid ${T.border}`,borderRadius:'20px',padding:'3px 10px'}}>{g.cat}</div>
                </div>
              ))}
            </div>
          )}

          {tab==='payments'&&(
            <div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'20px',fontWeight:600,color:T.text1,marginBottom:'4px'}}>Payment Setup</div>
              <div style={{fontSize:'13px',color:T.text3,marginBottom:'18px'}}>Stripe configuration — fill in App.js before going live.</div>
              {PLANS.filter(p=>p.priceNum>0).map(plan=>(
                <div key={plan.id} style={{background:'#fff',border:`1px solid ${T.border}`,borderRadius:'14px',padding:'16px 18px',marginBottom:'12px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'10px'}}>
                    <div>
                      <div style={{fontWeight:700,color:T.text1,fontSize:'14px'}}>{plan.label}</div>
                      <div style={{fontSize:'13px',color:T.accent,fontWeight:600,marginTop:'2px'}}>{plan.price}</div>
                    </div>
                    <div style={{fontSize:'11px',background:`${T.accent}15`,color:T.accent,border:`1px solid ${T.accent}30`,borderRadius:'20px',padding:'3px 10px',fontWeight:600}}>{plan.id.toUpperCase()}</div>
                  </div>
                  <Label>Stripe Price ID</Label>
                  <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:'8px',padding:'9px 12px',fontSize:'12px',color:plan.stripePriceId?.includes('HERE')?T.danger:T.sky,fontFamily:'monospace'}}>{plan.stripePriceId}</div>
                  {plan.stripePriceId?.includes('HERE')&&<div style={{fontSize:'11px',color:T.danger,marginTop:'4px'}}>&#9670; Replace this in App.js → PLANS array</div>}
                </div>
              ))}
              <div style={{background:`${T.admin}0a`,border:`1px solid ${T.admin}25`,borderRadius:'14px',padding:'16px 18px'}}>
                <div style={{fontSize:'13px',fontWeight:600,color:T.admin,marginBottom:'8px'}}>Integration Steps</div>
                {['Set STRIPE_PUBLIC_KEY in App.js','Install @stripe/stripe-js and @stripe/react-stripe-js','Create a backend endpoint to initiate Stripe Checkout or subscriptions','Configure Stripe webhook → update user subscription in database','Test with Stripe test keys first (pk_test_..., price_test_...)'].map((t,i)=>(
                  <div key={i} style={{fontSize:'12px',color:T.text2,marginBottom:'5px',display:'flex',gap:'8px'}}><span style={{color:T.border2}}>&#9671;</span><span>{t}</span></div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PaymentModal ─────────────────────────────────────────────────────────────
function PaymentModal({plan,onSuccess,onClose}) {
  const [method, setMethod] = useState('card'); // 'card' | 'apple'
  const [card,   setCard]   = useState('');
  const [exp,    setExp]    = useState('');
  const [cvc,    setCvc]    = useState('');
  const [name,   setName]   = useState('');
  const [err,    setErr]    = useState('');
  const [loading,setLoading]= useState(false);
  const planInfo = PLANS.find(p=>p.id===plan);
  const canApplePay = typeof window !== 'undefined' && window.ApplePaySession && window.ApplePaySession.canMakePayments();

  function handlePay(e) {
    e.preventDefault();
    if(method==='card'&&(!card||!exp||!cvc||!name)){setErr('Please fill in all card details.');return;}
    setErr('');setLoading(true);
    // TODO: integrate Stripe
    // 1. Call your backend: POST /create-subscription { priceId: planInfo.stripePriceId, paymentMethod }
    // 2. Backend creates Stripe customer + subscription, returns clientSecret
    // 3. stripe.confirmCardPayment(clientSecret) → success → update user plan
    // Simulating success for now:
    setTimeout(()=>{setLoading(false);onSuccess(plan);},1200);
  }

  function handleApplePay() {
    // TODO: integrate Stripe + Apple Pay
    // const session = new ApplePaySession(3, { countryCode:'US', currencyCode:'USD', ... });
    // session.begin(); handle session.onpaymentauthorized → pass token to Stripe
    onSuccess(plan);
  }

  return(
    <Overlay onClose={onClose}>
      <Card style={{maxWidth:'420px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
          <div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'22px',fontWeight:600,color:T.text1}}>Upgrade to {planInfo?.label}</div>
            <div style={{fontSize:'13px',color:T.accent,fontWeight:700,marginTop:'2px'}}>{planInfo?.price}</div>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',color:T.text3,cursor:'pointer',fontSize:'20px'}}>&#10005;</button>
        </div>

        {/* Feature summary */}
        <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:'12px',padding:'14px 16px',marginBottom:'20px',fontSize:'12px',color:T.text3,lineHeight:1.7}}>
          {planInfo?.sub}
        </div>

        {/* Method selector */}
        <div style={{display:'flex',gap:'8px',marginBottom:'18px'}}>
          <button onClick={()=>setMethod('card')} style={{...GB({flex:1,textAlign:'center',padding:'10px'}),background:method==='card'?`${T.accent}10`:T.surface2,border:`1px solid ${method==='card'?T.accent:T.border}`,color:method==='card'?T.accent:T.text3,fontWeight:method==='card'?700:400}}>
            &#9673; Card
          </button>
          {canApplePay&&(
            <button onClick={()=>setMethod('apple')} style={{...GB({flex:1,textAlign:'center',padding:'10px'}),background:method==='apple'?'#000':T.surface2,border:`1px solid ${method==='apple'?'#000':T.border}`,color:method==='apple'?'#fff':T.text3,fontWeight:700}}>
              &#63743; Apple Pay
            </button>
          )}
        </div>

        {method==='apple'&&canApplePay&&(
          <div style={{textAlign:'center',padding:'20px 0'}}>
            <button onClick={handleApplePay} style={{background:'#000',color:'#fff',border:'none',borderRadius:'12px',padding:'14px 36px',fontSize:'16px',cursor:'pointer',fontWeight:600,fontFamily:"'DM Sans',sans-serif",letterSpacing:'0.02em'}}>
              &#63743; Pay {planInfo?.price}
            </button>
            <div style={{fontSize:'11px',color:T.text4,marginTop:'10px'}}>Authenticate with Face ID or Touch ID</div>
          </div>
        )}

        {method==='card'&&(
          <form onSubmit={handlePay} style={{display:'flex',flexDirection:'column',gap:'12px'}}>
            <div><Label>Name on card</Label><input placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} style={IS()}/></div>
            <div><Label>Card number</Label>
              <input placeholder="1234 5678 9012 3456" value={card} onChange={e=>setCard(e.target.value.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim())} style={IS({letterSpacing:'0.1em'})} maxLength={19}/>
            </div>
            <div style={{display:'flex',gap:'10px'}}>
              <div style={{flex:1}}><Label>Expiry</Label><input placeholder="MM / YY" value={exp} onChange={e=>setExp(e.target.value)} style={IS()} maxLength={7}/></div>
              <div style={{flex:1}}><Label>CVC</Label><input placeholder="123" value={cvc} onChange={e=>setCvc(e.target.value.replace(/\D/g,'').slice(0,4))} style={IS()} maxLength={4}/></div>
            </div>
            {err&&<div style={{fontSize:'12px',color:T.danger,background:'#fdf0f0',border:'1px solid #e0b0b0',borderRadius:'8px',padding:'8px 12px'}}>{err}</div>}
            <button type="submit" disabled={loading} style={PB({padding:'13px',textAlign:'center',borderRadius:'12px',opacity:loading?0.6:1})}>
              {loading?'Processing...':(`Pay ${planInfo?.price}`)}
            </button>
          </form>
        )}

        <div style={{fontSize:'11px',color:T.text4,textAlign:'center',marginTop:'14px',lineHeight:1.6}}>
          Secured by Stripe. Cancel anytime from account settings.<br/>
          You won't be charged until Stripe integration is live.
        </div>
      </Card>
    </Overlay>
  );
}

// ─── Onboarding ───────────────────────────────────────────────────────────────
function Onboarding({onComplete}) {
  const [step,setStep]=useState(0);
  const [plan,setPlan]=useState('plus');
  const [types,setTypes]=useState([]);
  const [name,setName]=useState('');
  const [partnerName,setPartnerName]=useState('');
  const [tzA,setTzA]=useState('America/New_York');
  const [tzB,setTzB]=useState('Australia/Melbourne');
  const [extraTzs,setExtraTzs]=useState([{tz:'Europe/London',label:'City 2'}]);
  const [homeLocation,setHomeLocation]=useState('');
  const [showPayment,setShowPayment]=useState(false);
  const [paidPlan,setPaidPlan]=useState(null);
  const toggle=id=>setTypes(c=>c.includes(id)?c.filter(i=>i!==id):[...c,id]);
  const progress=[0,25,50,75,100][step];
  const hasCouple=types.includes('couple');
  const hasTraveler=types.includes('traveler');
  const hasLocal=types.includes('local')&&!hasCouple&&!hasTraveler;

  function finishOnboarding(){
    const finalPlan = paidPlan || plan;
    onComplete({plan:finalPlan,types,name,partnerName,tzA,tzB,extraTzs,homeLocation,user:{id:Date.now(),email:'',name,plan:finalPlan,authMethod:'onboarding'}});
  }

  return(
    <div style={{minHeight:'100vh',background:T.bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px',fontFamily:"'DM Sans',sans-serif"}}>
      {step>0&&<div style={{position:'fixed',top:0,left:0,right:0,height:'3px',background:T.border,zIndex:10}}><div style={{height:'100%',width:`${progress}%`,background:T.accent,transition:'width 0.4s ease'}}/></div>}
      <div style={{maxWidth:'520px',width:'100%'}}>

        {step===0&&(
          <div style={{textAlign:'center'}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'13px',letterSpacing:'0.35em',color:T.text4,textTransform:'uppercase',marginBottom:'10px'}}>Welcome to</div>
            <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(56px,12vw,80px)',fontWeight:300,color:T.text1,lineHeight:0.9,letterSpacing:'-0.02em',marginBottom:'8px'}}>Ophelia</h1>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'17px',color:T.text3,fontStyle:'italic',marginBottom:'40px'}}>your everyday calendar</div>
            <div style={{display:'flex',flexDirection:'column',gap:'10px',marginBottom:'36px',textAlign:'left'}}>
              {[['◇','Stay connected across any time zone'],['⊕','Real-time traffic alerts — know when to leave'],['✦','Send flowers, gifts, and notes to the people you love']].map(([icon,text])=>(
                <div key={text} style={{display:'flex',gap:'14px',alignItems:'center',background:'#fff',border:`1px solid ${T.border}`,borderRadius:'12px',padding:'14px 16px'}}>
                  <span style={{color:T.accent,fontSize:'18px',width:'22px',textAlign:'center',flexShrink:0}}>{icon}</span>
                  <span style={{fontSize:'14px',color:T.text2,fontWeight:500}}>{text}</span>
                </div>
              ))}
            </div>
            <button onClick={()=>setStep(1)} style={PB({padding:'14px 52px',fontSize:'15px',borderRadius:'40px',letterSpacing:'0.08em'})}>Get Started</button>
            <div style={{fontSize:'12px',color:T.text4,marginTop:'12px'}}>Start free &mdash; Plus from $2.99 / month</div>
          </div>
        )}

        {/* ── Step 1: Choose plan ── */}
        {step===1&&(
          <div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'30px',fontWeight:400,color:T.text1,marginBottom:'6px'}}>Choose your plan</div>
            <div style={{fontSize:'14px',color:T.text3,marginBottom:'26px'}}>Start free. Upgrade anytime.</div>
            <div style={{display:'flex',flexDirection:'column',gap:'10px',marginBottom:'28px'}}>
              {PLANS.map(item=>(
                <div key={item.id} onClick={()=>setPlan(item.id)} className="lift" style={{background:plan===item.id?`${T.accent}0e`:'#fff',border:`1.5px solid ${plan===item.id?T.accent:T.border}`,borderRadius:'14px',padding:'18px 20px',cursor:'pointer',position:'relative',boxShadow:'0 2px 10px rgba(0,0,0,0.06)'}}>
                  {item.badge&&<div style={{position:'absolute',top:'-11px',left:'16px',background:T.accent,color:'#fff',fontSize:'10px',fontWeight:700,padding:'3px 10px',borderRadius:'20px',letterSpacing:'0.06em'}}>{item.badge}</div>}
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                    <div style={{flex:1,marginRight:'12px'}}>
                      <div style={{fontSize:'15px',color:T.text1,fontWeight:700,marginBottom:'4px'}}>{item.label}</div>
                      <div style={{fontSize:'12px',color:T.text3,lineHeight:1.5}}>{item.sub}</div>
                    </div>
                    <div style={{fontSize:'14px',color:plan===item.id?T.accent:T.text3,fontWeight:700,flexShrink:0}}>{item.price}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{display:'flex',gap:'10px'}}>
              <button onClick={()=>setStep(0)} style={GB({flexShrink:0})}>Back</button>
              <button onClick={()=>{
                if(plan!=='free'){setShowPayment(true);}
                else setStep(2);
              }} style={PB({flex:1,textAlign:'center'})}>
                {plan==='free'?'Continue':'Pay & Continue'}
              </button>
            </div>
            {showPayment&&<PaymentModal plan={plan} onClose={()=>setShowPayment(false)} onSuccess={p=>{setPaidPlan(p);setShowPayment(false);setStep(2);}}/>}
          </div>
        )}

        {/* ── Step 2: Calendar type ── */}
        {step===2&&(
          <div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'30px',fontWeight:400,color:T.text1,marginBottom:'6px'}}>How do you use Ophelia?</div>
            <div style={{fontSize:'14px',color:T.text3,marginBottom:'22px'}}>Select all that apply — features adapt to your choices.</div>
            <div style={{display:'flex',flexDirection:'column',gap:'10px',marginBottom:'26px'}}>
              {USER_TYPES.map(ut=>{const sel=types.includes(ut.id);return(
                <div key={ut.id} onClick={()=>toggle(ut.id)} className="lift" style={{background:sel?`${ut.accent}0e`:'#fff',border:`1.5px solid ${sel?ut.accent:T.border}`,borderRadius:'14px',padding:'18px 20px',cursor:'pointer',boxShadow:'0 2px 10px rgba(0,0,0,0.06)'}}>
                  <div style={{display:'flex',gap:'14px',alignItems:'flex-start'}}>
                    <div style={{fontSize:'20px',color:ut.accent,width:'26px',textAlign:'center',flexShrink:0,marginTop:'1px'}}>{ut.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:'15px',color:T.text1,fontWeight:700,marginBottom:'3px'}}>{ut.title}</div>
                      <div style={{fontSize:'13px',color:T.text3,marginBottom:'10px'}}>{ut.desc}</div>
                      <div style={{display:'flex',flexWrap:'wrap',gap:'5px'}}>
                        {ut.features.map(f=><span key={f} style={{fontSize:'11px',background:`${ut.accent}14`,border:`1px solid ${ut.accent}30`,color:ut.accent,padding:'3px 9px',borderRadius:'20px',fontWeight:600}}>{f}</span>)}
                      </div>
                    </div>
                    <div style={{width:'20px',height:'20px',borderRadius:'50%',border:`2px solid ${sel?ut.accent:T.border}`,background:sel?ut.accent:'transparent',flexShrink:0,marginTop:'1px',display:'flex',alignItems:'center',justifyContent:'center'}}>
                      {sel&&<span style={{fontSize:'11px',color:'#fff',fontWeight:700}}>&#10003;</span>}
                    </div>
                  </div>
                </div>
              );})}
            </div>
            <div style={{display:'flex',gap:'10px'}}>
              <button onClick={()=>setStep(1)} style={GB({flexShrink:0})}>Back</button>
              <button onClick={()=>setStep(3)} disabled={types.length===0} style={PB({flex:1,textAlign:'center',opacity:types.length===0?0.4:1})}>Continue</button>
            </div>
          </div>
        )}

        {/* ── Step 3: Tailored profile setup ── */}
        {step===3&&(
          <div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'30px',fontWeight:400,color:T.text1,marginBottom:'6px'}}>Set up your profile</div>
            <div style={{fontSize:'14px',color:T.text3,marginBottom:'22px'}}>
              {hasCouple&&hasTraveler?'Couple + traveler mode — you get everything.'
               :hasCouple?'Long-distance couple mode.'
               :hasTraveler?'Business traveler mode.'
               :'Local calendar mode.'}
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'14px',marginBottom:'26px'}}>

              {/* Always: your name */}
              <div><Label>Your Name</Label><input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name..." style={IS()}/></div>

              {/* Always: your home timezone */}
              <div><Label>Your Home Timezone</Label><TzSelect value={tzA} onChange={e=>setTzA(e.target.value)}/></div>

              {/* Home location for traffic */}
              <div>
                <Label>Home Address (for traffic alerts)</Label>
                <AddressInput value={homeLocation} onChange={setHomeLocation} placeholder="e.g. 123 Main St, New York, NY" />
                <div style={{fontSize:'11px',color:T.text4,marginTop:'5px'}}>Calculates drive time to events. Never shared.</div>
              </div>

              {/* Couple: partner name + their timezone */}
              {hasCouple&&(
                <div style={{background:`${T.rose}08`,border:`1px solid ${T.rose}25`,borderRadius:'14px',padding:'16px',display:'flex',flexDirection:'column',gap:'12px'}}>
                  <div style={{fontSize:'12px',fontWeight:700,color:T.rose,letterSpacing:'0.08em',textTransform:'uppercase'}}>◇ Your Person</div>
                  <div><Label color={T.rose}>Their Name</Label><input value={partnerName} onChange={e=>setPartnerName(e.target.value)} placeholder="Their name..." style={IS()}/></div>
                  <div><Label color={T.rose}>Their Timezone</Label><TzSelect value={tzB} onChange={e=>setTzB(e.target.value)}/></div>
                  <div style={{fontSize:'11px',color:T.text4}}>You will share a calendar and can send each other notes and gifts.</div>
                </div>
              )}

              {/* Traveler: multiple city timezones */}
              {hasTraveler&&(
                <div style={{background:`${T.sky}08`,border:`1px solid ${T.sky}25`,borderRadius:'14px',padding:'16px',display:'flex',flexDirection:'column',gap:'12px'}}>
                  <div style={{fontSize:'12px',fontWeight:700,color:T.sky,letterSpacing:'0.08em',textTransform:'uppercase'}}>⊕ Travel Timezones</div>
                  <div style={{fontSize:'12px',color:T.text3}}>Add the cities you travel to most. You can switch between them with Travel Mode.</div>
                  {!hasCouple&&<div><Label color={T.sky}>Primary Work Contact / City</Label><input value={partnerName} onChange={e=>setPartnerName(e.target.value)} placeholder="Contact name or city..." style={IS()}/></div>}
                  {!hasCouple&&<div><Label color={T.sky}>Their / That City's Timezone</Label><TzSelect value={tzB} onChange={e=>setTzB(e.target.value)}/></div>}
                  {extraTzs.map((et,i)=>(
                    <div key={i} style={{display:'flex',gap:'8px',alignItems:'flex-end'}}>
                      <div style={{flex:1}}><Label color={T.sky}>Extra City {i+2} Label</Label><input value={et.label} onChange={e=>setExtraTzs(prev=>prev.map((x,j)=>j===i?{...x,label:e.target.value}:x))} placeholder={`City ${i+2}`} style={IS()}/></div>
                      <div style={{flex:2}}><Label color={T.sky}>Timezone</Label><TzSelect value={et.tz} onChange={e=>setExtraTzs(prev=>prev.map((x,j)=>j===i?{...x,tz:e.target.value}:x))}/></div>
                      <button onClick={()=>setExtraTzs(prev=>prev.filter((_,j)=>j!==i))} style={{...GB({padding:'10px 12px',flexShrink:0}),color:T.danger,marginBottom:'0'}}>&#10005;</button>
                    </div>
                  ))}
                  <button onClick={()=>setExtraTzs(prev=>[...prev,{tz:'Asia/Tokyo',label:`City ${prev.length+2}`}])} style={GB({textAlign:'center',fontSize:'12px'})}>&#43; Add another city</button>
                </div>
              )}

              {/* Local only */}
              {hasLocal&&(
                <div style={{background:`${T.sage}08`,border:`1px solid ${T.sage}25`,borderRadius:'14px',padding:'14px 16px'}}>
                  <div style={{fontSize:'12px',color:T.sage,fontWeight:600}}>&#9671; Single timezone mode — clean, fast, local.</div>
                  <div style={{fontSize:'11px',color:T.text4,marginTop:'4px'}}>Color events, set reminders, and get traffic alerts. You can add timezones later.</div>
                </div>
              )}
            </div>
            <div style={{display:'flex',gap:'10px'}}>
              <button onClick={()=>setStep(2)} style={GB({flexShrink:0})}>Back</button>
              <button onClick={()=>name&&finishOnboarding()} disabled={!name} style={PB({flex:1,textAlign:'center',opacity:!name?0.4:1})}>Open Ophelia &#8594;</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── BottomNav ────────────────────────────────────────────────────────────────
function BottomNav({events,tzA,tzB,labelA,labelB,todayStr,onEventClick,onNewEvent,onReset,plan}) {
  const [open,setOpen]=useState(false);
  const allUpcoming=[...(Array.isArray(events)?events:[])]
    .filter(e=>e.date>=todayStr)
    .sort((a,b)=>`${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));

  const isToday=ds=>ds===todayStr;
  const isTomorrow=ds=>{const t=new Date();t.setDate(t.getDate()+1);const s=`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;return ds===s;};
  const dayLabel=ds=>{if(isToday(ds))return'Today';if(isTomorrow(ds))return'Tomorrow';return dateLabel(ds);};

  const RECUR_ICONS={'daily':'Daily','weekdays':'Weekdays','weekends':'Weekends','weekly':'Weekly','bi-weekly':'Every 2 wks','monthly':'Monthly','yearly':'Yearly'};

  return(
    <>
      {/* Drawer backdrop */}
      {open&&<div onClick={()=>setOpen(false)} style={{position:'fixed',inset:0,background:'rgba(26,18,8,0.3)',zIndex:8000,backdropFilter:'blur(2px)'}}/>}

      {/* Upcoming events drawer — slides up from bottom */}
      <div style={{
        position:'fixed',bottom:open?0:'-100%',left:0,right:0,
        background:T.bg,borderRadius:'22px 22px 0 0',
        border:`1px solid ${T.border}`,borderBottom:'none',
        boxShadow:'0 -8px 48px rgba(0,0,0,0.18)',
        zIndex:8100,
        maxHeight:'78vh',display:'flex',flexDirection:'column',
        transition:'bottom 0.32s cubic-bezier(0.32,0.72,0,1)',
        fontFamily:"'DM Sans',sans-serif",
      }}>
        {/* Drag handle */}
        <div style={{display:'flex',justifyContent:'center',padding:'12px 0 4px',flexShrink:0}}>
          <div style={{width:'36px',height:'4px',borderRadius:'2px',background:T.border2}}/>
        </div>

        {/* Drawer header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'4px 20px 14px',flexShrink:0,borderBottom:`1px solid ${T.border}`}}>
          <div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'20px',fontWeight:600,color:T.text1}}>Upcoming Events</div>
            <div style={{fontSize:'12px',color:T.text4,marginTop:'2px'}}>{allUpcoming.length} event{allUpcoming.length!==1?'s':''} ahead</div>
          </div>
          <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
            <button onClick={onNewEvent} style={PB({padding:'8px 14px',fontSize:'12px'})}>&#43; New</button>
            <button onClick={()=>setOpen(false)} style={{background:'none',border:'none',color:T.text3,cursor:'pointer',fontSize:'20px',padding:'4px',lineHeight:1}}>&#10005;</button>
          </div>
        </div>

        {/* Event list */}
        <div style={{flex:1,overflowY:'auto',padding:'14px 16px 24px',display:'flex',flexDirection:'column',gap:'10px'}}>
          {allUpcoming.length===0&&(
            <div style={{textAlign:'center',padding:'48px 20px',color:T.text4}}>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'18px',fontStyle:'italic',marginBottom:'6px'}}>Nothing on the horizon</div>
              <div style={{fontSize:'13px'}}>Tap <strong>+ New</strong> to add your first event</div>
            </div>
          )}
          {allUpcoming.map(ev=>{
            const tA=evtTime(ev,tzA);
            const tB=tzB?evtTime(ev,tzB):null;
            const dLabel=dayLabel(ev.date);
            const isNearby=isToday(ev.date)||isTomorrow(ev.date);
            return(
              <div key={ev.id} onClick={()=>{onEventClick(ev);setOpen(false);}} style={{
                background:'#fff',border:`1px solid ${T.border}`,
                borderLeft:`4px solid ${ev.color}`,
                borderRadius:'14px',padding:'14px 16px',
                cursor:'pointer',
                boxShadow:'0 1px 6px rgba(0,0,0,0.05)',
              }}>
                {/* Date badge + title row */}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'8px'}}>
                  <div style={{flex:1,minWidth:0,marginRight:'12px'}}>
                    <div style={{fontSize:'15px',color:T.text1,fontWeight:700,marginBottom:'2px'}}>{ev.title}</div>
                    {ev.note&&<div style={{fontSize:'12px',color:T.text3,fontStyle:'italic',marginTop:'2px',lineHeight:1.45}}>{ev.note}</div>}
                  </div>
                  <div style={{flexShrink:0,textAlign:'right'}}>
                    <div style={{fontSize:'12px',fontWeight:700,color:isNearby?T.accent:T.text3,background:isNearby?`${T.accent}12`:T.surface,border:`1px solid ${isNearby?`${T.accent}30`:T.border}`,borderRadius:'20px',padding:'3px 10px',whiteSpace:'nowrap'}}>{dLabel}</div>
                  </div>
                </div>

                {/* Time row */}
                <div style={{display:'flex',flexWrap:'wrap',gap:'10px',fontSize:'13px',marginBottom:ev.location||ev.recurrence?'8px':0}}>
                  <span>
                    <span style={{fontSize:'11px',color:T.text4,letterSpacing:'0.06em',textTransform:'uppercase',marginRight:'4px'}}>{labelA}</span>
                    <span style={{color:T.accent,fontWeight:700}}>{tA}</span>
                  </span>
                  {tB&&(
                    <span>
                      <span style={{color:T.border2,marginRight:'8px'}}>&#9670;</span>
                      <span style={{fontSize:'11px',color:T.text4,letterSpacing:'0.06em',textTransform:'uppercase',marginRight:'4px'}}>{labelB}</span>
                      <span style={{color:T.lavender,fontWeight:700}}>{tB}</span>
                    </span>
                  )}
                </div>

                {/* Location + recurrence */}
                <div style={{display:'flex',gap:'12px',flexWrap:'wrap',marginTop:'2px'}}>
                  {ev.location&&(
                    <div style={{fontSize:'12px',color:T.sky,display:'flex',alignItems:'center',gap:'4px'}}>
                      <span style={{fontSize:'10px'}}>&#9671;</span>{ev.location}
                    </div>
                  )}
                  {ev.recurrence&&ev.recurrence!=='none'&&(
                    <div style={{fontSize:'11px',color:T.sage,fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase'}}>
                      {RECUR_ICONS[ev.recurrence]||ev.recurrence}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fixed bottom bar */}
      <div className="bottom-nav" style={{
        background:T.bg,borderTop:`1px solid ${T.border}`,
        display:'flex',alignItems:'center',justifyContent:'space-around',
        padding:'8px 8px calc(8px + env(safe-area-inset-bottom))',
        fontFamily:"'DM Sans',sans-serif",
        boxShadow:'0 -2px 16px rgba(0,0,0,0.08)',
      }}>
        {/* Events icon */}
        <button onClick={()=>setOpen(o=>!o)} style={{
          display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',
          background:'none',border:'none',cursor:'pointer',padding:'6px 14px',borderRadius:'12px',
          color:open?T.accent:T.text3,
          background:open?`${T.accent}10`:'none',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="3"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
            <line x1="8" y1="14" x2="8" y2="14" strokeWidth="2.5"/><line x1="12" y1="14" x2="12" y2="14" strokeWidth="2.5"/><line x1="16" y1="14" x2="16" y2="14" strokeWidth="2.5"/>
            <line x1="8" y1="18" x2="8" y2="18" strokeWidth="2.5"/><line x1="12" y1="18" x2="12" y2="18" strokeWidth="2.5"/>
          </svg>
          <span style={{fontSize:'10px',fontWeight:600,letterSpacing:'0.04em'}}>Events</span>
          {allUpcoming.length>0&&<span style={{position:'absolute',top:'4px',width:'16px',height:'16px',borderRadius:'50%',background:T.accent,color:'#fff',fontSize:'9px',fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',marginLeft:'16px',marginTop:'-2px'}}>{allUpcoming.length>9?'9+':allUpcoming.length}</span>}
        </button>

        {/* New event centre button */}
        <button onClick={onNewEvent} style={{
          background:T.accent,color:'#fff',border:'none',
          width:'52px',height:'52px',borderRadius:'50%',
          fontSize:'24px',cursor:'pointer',
          boxShadow:`0 4px 20px ${T.accent}55`,
          display:'flex',alignItems:'center',justifyContent:'center',
          fontWeight:300,lineHeight:1,
          transform:'translateY(-6px)',
        }}>&#43;</button>

        {/* no reset button */}
      </div>
    </>
  );
}

// ─── UpgradeModal ─────────────────────────────────────────────────────────────
function UpgradeModal({currentPlan,onClose,onSuccess}) {
  const options=PLANS.filter(p=>p.id!=='free'&&(currentPlan==='free'||p.id==='pro'));
  const [selected,setSelected]=useState(options[0]?.id||'plus');
  const [paying,setPaying]=useState(false);
  if(paying) return <PaymentModal plan={selected} onClose={()=>setPaying(false)} onSuccess={onSuccess}/>;
  return(
    <Overlay onClose={onClose}>
      <Card style={{maxWidth:'420px'}}>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'24px',fontWeight:400,color:T.text1,marginBottom:'6px'}}>Upgrade Ophelia</div>
        <div style={{fontSize:'13px',color:T.text3,marginBottom:'20px'}}>Unlock more features for your calendar.</div>
        <div style={{display:'flex',flexDirection:'column',gap:'10px',marginBottom:'22px'}}>
          {options.map(p=>(
            <div key={p.id} onClick={()=>setSelected(p.id)} style={{background:selected===p.id?`${T.accent}0e`:'#fff',border:`1.5px solid ${selected===p.id?T.accent:T.border}`,borderRadius:'14px',padding:'16px 18px',cursor:'pointer',position:'relative'}}>
              {p.badge&&<div style={{position:'absolute',top:'-10px',left:'14px',background:T.accent,color:'#fff',fontSize:'10px',fontWeight:700,padding:'2px 10px',borderRadius:'20px'}}>{p.badge}</div>}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                <div style={{flex:1,marginRight:'10px'}}>
                  <div style={{fontSize:'14px',fontWeight:700,color:T.text1,marginBottom:'4px'}}>{p.label}</div>
                  <div style={{fontSize:'12px',color:T.text3,lineHeight:1.5}}>{p.sub}</div>
                </div>
                <div style={{fontSize:'14px',fontWeight:700,color:selected===p.id?T.accent:T.text3,flexShrink:0}}>{p.price}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{display:'flex',gap:'10px'}}>
          <button onClick={onClose} style={GB()}>Cancel</button>
          <button onClick={()=>setPaying(true)} style={PB({flex:1,textAlign:'center'})}>Continue to Payment</button>
        </div>
      </Card>
    </Overlay>
  );
}

// ─── TravelPicker — searchable city/timezone picker ───────────────────────────
function TravelPicker({value,onChange}) {
  const [query,setQuery]=useState('');
  const inputRef=useRef(null);
  const matches=query.trim().length===0
    ? TIMEZONES
    : TIMEZONES.filter(t=>
        t.label.toLowerCase().includes(query.toLowerCase())||
        t.value.toLowerCase().includes(query.toLowerCase())
      );
  const current=TIMEZONES.find(t=>t.value===value);
  return(
    <div style={{background:'#f0faf2',border:`1px solid ${T.sage}40`,borderRadius:'14px',padding:'14px 18px',marginBottom:'20px'}}>
      <Label color={T.sage}>&#8853; Where are you right now?</Label>
      <div style={{position:'relative'}}>
        <input
          ref={inputRef}
          value={query}
          onChange={e=>setQuery(e.target.value)}
          placeholder={current?current.label:'Search city...'}
          style={IS({marginBottom:'0',borderColor:`${T.sage}60`})}
          onClick={e=>e.stopPropagation()}
        />
        {query.trim().length>0&&(
          <div style={{position:'absolute',top:'100%',left:0,right:0,background:'#fff',border:`1px solid ${T.border}`,borderRadius:'12px',boxShadow:'0 8px 32px rgba(0,0,0,0.12)',zIndex:9999,marginTop:'4px',maxHeight:'220px',overflowY:'auto'}}>
            {matches.length===0&&<div style={{padding:'12px 16px',fontSize:'13px',color:T.text4}}>No cities found</div>}
            {matches.map(t=>(
              <div key={t.value+t.label} onClick={()=>{onChange(t.value);setQuery('');}} style={{padding:'10px 16px',fontSize:'13px',color:T.text1,cursor:'pointer',borderBottom:`1px solid ${T.border}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}
                onMouseOver={e=>e.currentTarget.style.background=T.surface}
                onMouseOut={e=>e.currentTarget.style.background='#fff'}
              >
                <span>{t.label}</span>
                <span style={{fontSize:'11px',color:T.text4}}>{t.region}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {current&&<div style={{fontSize:'12px',color:T.sage,marginTop:'8px'}}>Currently set to <strong>{current.label}</strong> — your clock updates live. Events still save in your home timezone.</div>}
    </div>
  );
}

// ─── Calendar ─────────────────────────────────────────────────────────────────
function Calendar({config,onReset}) {
  const rawTypes=config.types;
  const types=Array.isArray(rawTypes)?rawTypes:(rawTypes?[rawTypes]:[]);
  const {name,partnerName,tzA:initA,tzB:initB,homeLocation}=config;
  const userId = config?.user?.id || 'guest';
  const evKey  = `ophelia_events_${userId}`;
  const ntKey  = `ophelia_notes_${userId}`;
  const today=new Date();
  const todayStr=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const hasPartner=types.includes('couple'), isTraveler=types.includes('traveler'), isLocal=types.includes('local')&&!hasPartner&&!isTraveler;

  const [tzA,setTzA]=useState(initA||'America/New_York');
  const [tzB,setTzB]=useState(initB||'Australia/Melbourne');
  const [labelA,setLabelA]=useState(name||'You');
  const [labelB,setLabelB]=useState(partnerName||'Them');
  const [events,setEvents]=useState(()=>{const v=LS.get(evKey,[]);return Array.isArray(v)?v:[];});
  const [notes,setNotes]=useState(()=>{const v=LS.get(ntKey,[]);return Array.isArray(v)?v:[];});
  const [calView,setCalView]=useState('month'); // 'day'|'week'|'month'|'year'
  const [viewMonth,setViewMonth]=useState(today.getMonth());
  const [viewYear,setViewYear]=useState(today.getFullYear());
  const [selectedDay,setSelectedDay]=useState(null);
  const [modal,setModal]=useState(null);
  const [panel,setPanel]=useState(null);
  const [travelMode,setTravelMode]=useState(()=>LS.get(`ophelia_travel_mode_${userId}`,false));
  const [travelTz,setTravelTz]=useState(()=>LS.get(`ophelia_travel_tz_${userId}`,'America/New_York'));
  const [showGift,setShowGift]=useState(false);
  const [showNotes,setShowNotes]=useState(false);
  const [showSplash,setShowSplash]=useState(hasPartner&&notes.length>0);
  const [showAdmin,setShowAdmin]=useState(false);
  const [showUpgrade,setShowUpgrade]=useState(false);
  const [notifMins,setNotifMins]=useState(()=>LS.get(`ophelia_notif_mins_${userId}`,30));
  const [notifEnabled,setNotifEnabled]=useState(()=>Notification?.permission==='granted');
  const adminTaps=useRef(0);
  const seenPartnerEventsRef=useRef(new Set(events.map(e=>e.id)));
  const adminTimer=useRef(null);
  function handleLogoTap(){
    adminTaps.current+=1;
    clearTimeout(adminTimer.current);
    adminTimer.current=setTimeout(()=>{adminTaps.current=0;},1500);
    if(adminTaps.current>=5){adminTaps.current=0;setShowAdmin(true);}
  }

  // Persist events locally always
  useEffect(()=>{LS.set(evKey,events);},[events]);
  useEffect(()=>{LS.set(ntKey,notes);},[notes]);
  useEffect(()=>{LS.set(`ophelia_notif_mins_${userId}`,notifMins);},[notifMins]);
  useEffect(()=>{LS.set(`ophelia_travel_mode_${userId}`,travelMode);},[travelMode]);
  useEffect(()=>{LS.set(`ophelia_travel_tz_${userId}`,travelTz);},[travelTz]);

  // Day-of recap on first load
  useEffect(()=>{
    if(Notification?.permission!=='granted') return;
    const todayEvs=events.filter(e=>e.date===todayStr).sort((a,b)=>a.time.localeCompare(b.time));
    if(todayEvs.length===0) return;
    const already=LS.get('ophelia_recap_shown','');
    if(already===todayStr) return;
    LS.set('ophelia_recap_shown',todayStr);
    const list=todayEvs.map(e=>`${e.time} ${e.title}`).join(' · ');
    setTimeout(()=>sendImmediateNotif(
      `Today on Ophelia — ${todayEvs.length} event${todayEvs.length>1?'s':''}`,
      list,'recap'
    ),2000);
  },[]);

  // Schedule reminders for all upcoming events whenever events or notifMins changes
  useEffect(()=>{
    if(Notification?.permission!=='granted') return;
    events.filter(e=>new Date(`${e.date}T${e.time}`)>new Date())
      .forEach(e=>scheduleEventNotif(e,notifMins));
  },[events,notifMins]);

  // Detect partner-added events via Firestore (new ids not in our initial set)
  useEffect(()=>{
    if(!coupleId||!IS_CONFIGURED) return;
    const userId_local=config?.user?.id;
    events.forEach(ev=>{
      if(!seenPartnerEventsRef.current.has(ev.id)){
        seenPartnerEventsRef.current.add(ev.id);
        // Only notify if the event wasn't added by us (no reliable author field yet, notify all new)
        sendImmediateNotif(
          `New event from ${partnerName||'your partner'}`,
          `${ev.title} on ${ev.date} at ${ev.time}`,
          `partner-${ev.id}`
        );
      }
    });
  },[events]);

  // ── Firestore real-time sync (only when Firebase configured + coupleId exists) ──
  const coupleId = config?.coupleId||null;
  useEffect(()=>{
    if(!IS_CONFIGURED||!coupleId||!db) return;
    const colRef=collection(db,`couples/${coupleId}/events`);
    const unsubscribe=onSnapshot(query(colRef,orderBy('date')), snap=>{
      const remote=snap.docs.map(d=>d.data());
      setEvents(remote);
      LS.set(evKey,remote);
    });
    return unsubscribe;
  },[coupleId]);

  const activeTzA=travelMode?travelTz:tzA;
  const accentB=hasPartner?T.rose:isTraveler?T.sky:T.sage;
  const firstDay=new Date(viewYear,viewMonth,1).getDay();
  const daysInMonth=new Date(viewYear,viewMonth+1,0).getDate();
  const cells=Array(firstDay).fill(null).concat(Array.from({length:daysInMonth},(_,i)=>i+1));
  while(cells.length%7!==0)cells.push(null);

  const eventsForDay=day=>{
    if(!day)return[];
    const ds=`${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return events.filter(e=>e.date===ds);
  };
  const upcoming=[...(Array.isArray(events)?events:[])].filter(e=>e.date>=todayStr).sort((a,b)=>`${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)).slice(0,5);

  const prevMonth=()=>{setSelectedDay(null);if(viewMonth===0){setViewMonth(11);setViewYear(y=>y-1);}else setViewMonth(m=>m-1);};
  const nextMonth=()=>{setSelectedDay(null);if(viewMonth===11){setViewMonth(0);setViewYear(y=>y+1);}else setViewMonth(m=>m+1);};

  return(
    <>
      <div style={{minHeight:'100vh',background:T.bg,fontFamily:"'DM Sans',sans-serif",color:T.text1}}>
        <div className="cal-max page-scroll" style={{maxWidth:'840px',margin:'0 auto',paddingTop:'clamp(16px,4vw,28px)',paddingLeft:'clamp(12px,4vw,18px)',paddingRight:'clamp(12px,4vw,18px)',paddingBottom:'200px'}}>

          {/* Header */}
          <div style={{textAlign:'center',marginBottom:'28px'}}>
            <div onClick={handleLogoTap} style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'11px',letterSpacing:'0.4em',color:T.text4,textTransform:'uppercase',marginBottom:'6px',cursor:'default',userSelect:'none'}}>Ophelia</div>
            <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(28px,5vw,42px)',fontWeight:300,color:T.text1,lineHeight:1.05}}>
              {hasPartner?<>Hello, <em style={{color:T.accent,fontStyle:'italic'}}>{labelA}</em></>:isLocal?<>Good {today.getHours()<12?'morning':today.getHours()<18?'afternoon':'evening'}, <em style={{color:T.accent}}>{labelA}</em></>:<>Welcome back, <em style={{color:T.accent}}>{labelA}</em></>}
            </h1>
          </div>

          {/* Dual clocks */}
          {!isLocal&&(
            <>
              <div className="clock-row" style={{display:'flex',gap:'10px',marginBottom:'8px'}}>
                <Clock tz={activeTzA} accent={T.accent} label={`${labelA} · ${TIMEZONES.find(t=>t.value===activeTzA)?.label||activeTzA}`} tag={travelMode?'traveling':undefined}/>
                <div className="dual-clock-sep" style={{display:'flex',alignItems:'center',flexShrink:0,color:T.border2,fontSize:'20px'}}>&#8596;</div>
                <Clock tz={tzB} accent={accentB} label={`${labelB} · ${TIMEZONES.find(t=>t.value===tzB)?.label||tzB}`}/>
              </div>
              <div style={{textAlign:'center',fontSize:'12px',color:T.text4,marginBottom:'22px'}}>&#9670; {tzDiff(tzA,tzB,labelB)}</div>
            </>
          )}
          {isLocal&&<div style={{marginBottom:'22px'}}><Clock tz={tzA} accent={T.sage} label={`${labelA} · ${TIMEZONES.find(t=>t.value===tzA)?.label||tzA}`}/></div>}

          {/* Upgrade nudge for free users */}
          {(config?.plan==='free')&&events.length>=7&&(
            <div onClick={()=>setShowUpgrade(true)} style={{background:`linear-gradient(135deg,${T.accent}18,${T.lavender}12)`,border:`1px solid ${T.accent}40`,borderRadius:'14px',padding:'12px 16px',marginBottom:'16px',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontSize:'13px',fontWeight:700,color:T.accent}}>You're almost at your event limit</div>
                <div style={{fontSize:'12px',color:T.text3,marginTop:'2px'}}>{10-events.length} event{10-events.length===1?'':' slots'} remaining on Free — upgrade for unlimited</div>
              </div>
              <div style={{background:T.accent,color:'#fff',borderRadius:'20px',padding:'6px 14px',fontSize:'12px',fontWeight:700,flexShrink:0,marginLeft:'12px'}}>Upgrade</div>
            </div>
          )}

          {/* Action pills */}
          <div className="pill-row" style={{display:'flex',gap:'7px',justifyContent:'center',flexWrap:'wrap',marginBottom:'22px'}}>
            <button style={SB(panel==='settings')} onClick={()=>setPanel(p=>p==='settings'?null:'settings')}>&#9965;&ensp;Settings</button>
            {(isTraveler||hasPartner)&&<button style={SB(travelMode,T.sage)} onClick={()=>setTravelMode(v=>!v)}>&#8853;&ensp;Travel Mode</button>}
            {(hasPartner||isTraveler)&&<button style={SB(panel==='meeting',T.lavender)} onClick={()=>setPanel(p=>p==='meeting'?null:'meeting')}>&#9737;&ensp;Best Times</button>}
            {(hasPartner||isTraveler)&&<button style={SB(panel==='share',T.sky)} onClick={()=>setPanel(p=>p==='share'?null:'share')}>&#8618;&ensp;Share</button>}
            {hasPartner&&<button style={SB(showGift,T.rose)} onClick={()=>setShowGift(true)}>&#9825;&ensp;Send a Gift</button>}
            {hasPartner&&<button style={SB(showNotes,T.lavender)} onClick={()=>setShowNotes(true)}>&#9825;&ensp;Love Notes{notes.length>0&&<span style={{background:T.lavender,color:'#fff',borderRadius:'20px',padding:'1px 6px',fontSize:'10px',fontWeight:700,marginLeft:'4px'}}>{notes.length}</span>}</button>}
          </div>

          {/* Settings panel */}
          {panel==='settings'&&(
            <div style={{background:'#fff',border:`1px solid ${T.border}`,borderRadius:'16px',padding:'20px 22px',marginBottom:'20px',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'18px',color:T.text1,fontWeight:600,marginBottom:'16px'}}>Settings</div>
              <div style={{display:'grid',gridTemplateColumns:isLocal?'1fr':'1fr 1fr',gap:'14px',marginBottom:'18px'}}>
                {[{label:'Your Name',value:labelA,set:setLabelA,tz:tzA,setTz:setTzA,color:T.accent},...(!isLocal?[{label:hasPartner?'Partner':'Contact',value:labelB,set:setLabelB,tz:tzB,setTz:setTzB,color:accentB}]:[])].map((item,i)=>(
                  <div key={i}>
                    <Label color={item.color}>{item.label}</Label>
                    <input value={item.value} onChange={e=>item.set(e.target.value)} style={IS({marginBottom:'8px'})}/>
                    <TzSelect value={item.tz} onChange={e=>item.setTz(e.target.value)}/>
                  </div>
                ))}
              </div>
              {/* Membership */}
              <div style={{borderTop:`1px solid ${T.border}`,paddingTop:'16px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <div style={{fontSize:'13px',fontWeight:700,color:T.text1}}>Membership</div>
                    <div style={{fontSize:'12px',color:T.text3,marginTop:'2px',textTransform:'capitalize'}}>{config?.plan||'free'} plan{config?.plan==='free'?' · 10 event limit':config?.plan==='plus'?' · Unlimited events':' · All features'}</div>
                  </div>
                  {(config?.plan==='free'||config?.plan==='plus')&&(
                    <button onClick={()=>setShowUpgrade(true)} style={PB({padding:'8px 16px',fontSize:'12px'})}>
                      {config?.plan==='free'?'Upgrade':'Go Pro'}
                    </button>
                  )}
                  {config?.plan==='pro'&&<span style={{fontSize:'12px',color:T.sage,fontWeight:700}}>&#10003; Pro</span>}
                </div>
              </div>
              {/* Notifications */}
              <div style={{borderTop:`1px solid ${T.border}`,paddingTop:'16px',marginTop:'16px'}}>
                <div style={{fontSize:'13px',fontWeight:700,color:T.text1,marginBottom:'10px'}}>Notifications</div>
                {!notifEnabled?(
                  <button onClick={async()=>{const ok=await requestNotifPermission();setNotifEnabled(ok);}} style={PB({padding:'8px 16px',fontSize:'12px',width:'100%'})}>
                    Enable Notifications
                  </button>
                ):(
                  <div>
                    <div style={{fontSize:'12px',color:T.sage,fontWeight:600,marginBottom:'10px'}}>&#10003; Notifications enabled</div>
                    <Label color={T.accent}>Remind me before events</Label>
                    <div style={{display:'flex',gap:'8px',marginTop:'6px'}}>
                      {[{v:15,label:'15 min'},{v:30,label:'30 min'},{v:60,label:'1 hour'}].map(opt=>(
                        <button key={opt.v} onClick={()=>setNotifMins(opt.v)} style={{flex:1,padding:'8px 4px',border:`1.5px solid ${notifMins===opt.v?T.accent:T.border}`,borderRadius:'10px',background:notifMins===opt.v?T.accent:'transparent',color:notifMins===opt.v?'#fff':T.text2,fontSize:'12px',fontWeight:notifMins===opt.v?700:400,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",transition:'all 0.15s'}}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Travel mode */}
          {travelMode&&(
            <TravelPicker value={travelTz} onChange={setTravelTz}/>
          )}

          {/* View toggle */}
          <div style={{display:'flex',gap:'4px',background:T.surface,border:`1px solid ${T.border}`,borderRadius:'12px',padding:'4px',marginBottom:'16px'}}>
            {['day','week','month','year'].map(v=>(
              <button key={v} onClick={()=>setCalView(v)} style={{flex:1,padding:'7px 4px',border:'none',borderRadius:'9px',cursor:'pointer',background:calView===v?'#fff':'transparent',color:calView===v?T.accent:T.text3,fontWeight:calView===v?700:400,fontSize:'12px',fontFamily:"'DM Sans',sans-serif",boxShadow:calView===v?'0 1px 4px rgba(0,0,0,0.1)':'none',transition:'all 0.15s',letterSpacing:'0.02em',textTransform:'capitalize'}}>
                {v}
              </button>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{background:'#fff',border:`1px solid ${T.border}`,borderRadius:'20px',overflow:'hidden',marginBottom:'22px',boxShadow:'0 2px 16px rgba(0,0,0,0.07)'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 20px 14px',borderBottom:`1px solid ${T.border}`}}>
              <button onClick={prevMonth} style={{background:'none',border:'none',color:T.text3,fontSize:'22px',cursor:'pointer',padding:'2px 8px',lineHeight:1}}>&#8249;</button>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'22px',color:T.text1,fontWeight:600,letterSpacing:'0.02em'}}>
                {calView==='day'&&`${MONTHS[viewMonth]} ${selectedDay||today.getDate()}, ${viewYear}`}
                {calView==='week'&&`Week of ${MONTHS[viewMonth]} ${viewMonth===today.getMonth()&&viewYear===today.getFullYear()?today.getDate()-today.getDay()+1:1}`}
                {calView==='month'&&<>{MONTHS[viewMonth]}&ensp;<span style={{color:T.text4,fontWeight:300}}>{viewYear}</span></>}
                {calView==='year'&&<span style={{color:T.text4,fontWeight:300}}>{viewYear}</span>}
              </div>
              <button onClick={nextMonth} style={{background:'none',border:'none',color:T.text3,fontSize:'22px',cursor:'pointer',padding:'2px 8px',lineHeight:1}}>&#8250;</button>
            </div>
            {calView==='month'&&<div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',padding:'10px 12px 2px'}}>
              {DAYS.map(d=><div key={d} style={{textAlign:'center',fontSize:'11px',letterSpacing:'0.1em',color:T.text4,textTransform:'uppercase',fontWeight:600}}>{d}</div>)}
            </div>}
            {calView==='month'&&<div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'2px',padding:'4px 10px 14px'}}>
              {cells.map((day,idx)=>{
                const dayEvents=eventsForDay(day);
                const ds=day?`${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`:'' ;
                const isToday=ds===todayStr, isSel=selectedDay===day;
                return(
                  <div key={idx} className="day-cell cal-grid-cell" onClick={()=>day&&setSelectedDay(day===selectedDay?null:day)} style={{minHeight:'54px',padding:'5px 4px',borderRadius:'9px',cursor:day?'pointer':'default',background:isSel?`${T.accent}18`:isToday?`${T.accent}0e`:'transparent',border:isToday?`1.5px solid ${T.accent}50`:'1.5px solid transparent',transition:'background 0.12s'}}>
                    {day&&(
                      <>
                        <div style={{fontSize:'13px',color:isToday?T.accent:T.text1,fontWeight:isToday?700:500,textAlign:'center',marginBottom:'3px'}}>{day}</div>
                        <div style={{display:'flex',flexWrap:'wrap',gap:'2px',justifyContent:'center'}}>
                          {dayEvents.slice(0,3).map(e=><div key={e.id} style={{width:'6px',height:'6px',borderRadius:'50%',background:e.color}}/>)}
                          {dayEvents.length>3&&<span style={{fontSize:'9px',color:T.text4}}>+{dayEvents.length-3}</span>}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>}
          </div>

          {/* ── Day view ── */}
          {calView==='day'&&(()=>{
            const d=selectedDay||today.getDate();
            const ds=`${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            const evs=eventsForDay(d);
            return(
              <div style={{marginBottom:'22px'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'12px'}}>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'20px',color:T.text1,fontWeight:600}}>{MONTHS[viewMonth]} {d}, {viewYear}</div>
                  <button onClick={()=>setModal({date:ds})} style={PB({padding:'8px 16px',fontSize:'12px'})}>&#43; Add</button>
                </div>
                {Array.from({length:24},(_,h)=>{
                  const hEvs=evs.filter(e=>{try{return parseInt(e.time?.split(':')[0])===h;}catch{return false;}});
                  return(
                    <div key={h} style={{display:'flex',gap:'10px',minHeight:'44px',borderBottom:`1px solid ${T.border}08`}}>
                      <div style={{width:'44px',flexShrink:0,fontSize:'11px',color:T.text4,paddingTop:'4px',textAlign:'right'}}>{h===0?'12 am':h<12?`${h} am`:h===12?'12 pm':`${h-12} pm`}</div>
                      <div style={{flex:1,paddingTop:'4px',display:'flex',flexDirection:'column',gap:'4px'}}>
                        {hEvs.map(e=>(
                          <div key={e.id} onClick={()=>setModal(e)} style={{background:e.color,color:'#fff',borderRadius:'8px',padding:'4px 10px',fontSize:'12px',fontWeight:600,cursor:'pointer'}}>{e.title}</div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* ── Week view ── */}
          {calView==='week'&&(()=>{
            const ref=new Date(viewYear,viewMonth,selectedDay||today.getDate());
            const startOfWeek=new Date(ref);startOfWeek.setDate(ref.getDate()-ref.getDay());
            const days=Array.from({length:7},(_,i)=>{const d=new Date(startOfWeek);d.setDate(d.getDate()+i);return d;});
            return(
              <div style={{marginBottom:'22px'}}>
                <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'4px',marginBottom:'8px'}}>
                  {days.map((d,i)=>{
                    const ds=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
                    const evs=events.filter(e=>e.date===ds);
                    const isT=ds===todayStr;
                    return(
                      <div key={i} onClick={()=>{setViewMonth(d.getMonth());setViewYear(d.getFullYear());setSelectedDay(d.getDate());setCalView('day');}} style={{background:isT?`${T.accent}10`:'#fff',border:`1px solid ${isT?T.accent:T.border}`,borderRadius:'12px',padding:'8px 4px',cursor:'pointer',minHeight:'80px'}}>
                        <div style={{fontSize:'10px',color:T.text4,textAlign:'center',textTransform:'uppercase',letterSpacing:'0.08em'}}>{['Su','Mo','Tu','We','Th','Fr','Sa'][i]}</div>
                        <div style={{fontSize:'15px',color:isT?T.accent:T.text1,fontWeight:isT?700:500,textAlign:'center',marginBottom:'4px'}}>{d.getDate()}</div>
                        {evs.slice(0,3).map(e=><div key={e.id} style={{background:e.color,borderRadius:'4px',height:'5px',marginBottom:'2px',marginInline:'4px'}}/>)}
                        {evs.length>3&&<div style={{fontSize:'9px',color:T.text4,textAlign:'center'}}>+{evs.length-3}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* ── Month view (existing) ── */}
          {(calView==='month'||calView==='year')&&null}

          {/* Day detail (month view only) */}
          {calView==='month'&&selectedDay&&(()=>{
            const dayEvents=eventsForDay(selectedDay);
            const ds=`${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(selectedDay).padStart(2,'0')}`;
            return(
              <div style={{marginBottom:'22px'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'12px'}}>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'20px',color:T.text1,fontWeight:600}}>{MONTHS[viewMonth]} {selectedDay}</div>
                  <button onClick={()=>setModal({date:ds})} style={PB({padding:'8px 16px',fontSize:'12px'})}>&#43;&ensp;Add Event</button>
                </div>
                {dayEvents.length===0?(
                  <div style={{fontSize:'13px',color:T.text4,padding:'16px',textAlign:'center',background:T.surface,border:`1px solid ${T.border}`,borderRadius:'12px'}}>Nothing planned yet &#9671;</div>
                ):(
                  <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                    {dayEvents.map(e=><EventCard key={e.id} ev={e} tzA={activeTzA} tzB={isLocal?null:tzB} labelA={labelA} labelB={labelB} onClick={()=>setModal(e)}/>)}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── Year view ── */}
          {calView==='year'&&(
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px',marginBottom:'22px'}}>
              {MONTHS.map((m,mi)=>{
                const evCount=events.filter(e=>e.date?.startsWith(`${viewYear}-${String(mi+1).padStart(2,'0')}`)).length;
                const isCurrentMonth=mi===today.getMonth()&&viewYear===today.getFullYear();
                return(
                  <div key={m} onClick={()=>{setViewMonth(mi);setCalView('month');}} style={{background:isCurrentMonth?`${T.accent}10`:'#fff',border:`1px solid ${isCurrentMonth?T.accent:T.border}`,borderRadius:'14px',padding:'14px 10px',cursor:'pointer',textAlign:'center'}}>
                    <div style={{fontSize:'13px',fontWeight:600,color:isCurrentMonth?T.accent:T.text1,marginBottom:'4px'}}>{m.slice(0,3)}</div>
                    {evCount>0&&<div style={{fontSize:'11px',color:T.text3}}>{evCount} event{evCount!==1?'s':''}</div>}
                  </div>
                );
              })}
            </div>
          )}

          {/* Upcoming */}
          {!hasPartner&&upcoming.length>0&&(
            <div style={{marginBottom:'28px'}}>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'20px',color:T.text1,fontWeight:600,marginBottom:'12px'}}>
                Coming up&ensp;<span style={{fontStyle:'italic',color:T.text3,fontWeight:300}}>for you</span>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                {upcoming.map(e=><EventCard key={e.id} ev={e} tzA={activeTzA} tzB={null} labelA={labelA} labelB={labelB} onClick={()=>setModal(e)}/>)}
              </div>
            </div>
          )}

          {/* Couple: two separate upcoming sections */}
          {hasPartner&&(()=>{
            const myEvents   = upcoming.filter(e=>!e.tz||e.tz===tzA||e.tz===activeTzA);
            const theirEvents= upcoming.filter(e=>e.tz&&e.tz===tzB);
            const sharedEvents= upcoming.filter(e=>!e.tz||(!myEvents.find(m=>m.id===e.id)&&!theirEvents.find(t=>t.id===e.id)));
            // Show all events under "my" section, partner's under their name
            return(
              <>
                {upcoming.length>0&&(
                  <div style={{marginBottom:'24px'}}>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'20px',color:T.text1,fontWeight:600,marginBottom:'12px'}}>
                      Coming up&ensp;<span style={{fontStyle:'italic',color:T.accent,fontWeight:300}}>for {labelA}</span>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                      {upcoming.filter(e=>!e.tz||e.tz===tzA||e.tz===activeTzA||e.tz!==tzB).map(e=>(
                        <EventCard key={e.id} ev={e} tzA={activeTzA} tzB={tzB} labelA={labelA} labelB={labelB} onClick={()=>setModal(e)}/>
                      ))}
                    </div>
                  </div>
                )}
                {upcoming.filter(e=>e.tz===tzB).length>0&&(
                  <div style={{marginBottom:'28px'}}>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'20px',color:T.text1,fontWeight:600,marginBottom:'12px'}}>
                      Coming up&ensp;<span style={{fontStyle:'italic',color:T.rose,fontWeight:300}}>for {labelB}</span>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                      {upcoming.filter(e=>e.tz===tzB).map(e=>(
                        <EventCard key={e.id} ev={e} tzA={activeTzA} tzB={tzB} labelA={labelA} labelB={labelB} onClick={()=>setModal(e)}/>
                      ))}
                    </div>
                  </div>
                )}
              </>
            );
          })()}

          {/* Latest note teaser */}
          {hasPartner&&notes.length>0&&(
            <div onClick={()=>setShowNotes(true)} style={{background:'#fff',border:`1px solid ${T.lavender}30`,borderLeft:`4px solid ${T.lavender}`,borderRadius:'14px',padding:'16px 20px',marginBottom:'24px',cursor:'pointer',boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
              <div style={{fontSize:'11px',letterSpacing:'0.15em',color:T.lavender,textTransform:'uppercase',fontWeight:700,marginBottom:'8px'}}>&#9825; Latest Note</div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'17px',fontStyle:'italic',color:T.text1,lineHeight:1.55,marginBottom:'6px'}}>"{notes[notes.length-1].text}"</div>
              <div style={{fontSize:'11px',color:T.text4}}>from {notes[notes.length-1].from==='A'?labelA:labelB} · {dateLabel(notes[notes.length-1].date)} · <span style={{color:T.lavender}}>See all {notes.length} &#8594;</span></div>
            </div>
          )}

          {/* New event CTA */}
          {!selectedDay&&<div style={{textAlign:'center',marginTop:'12px'}}><button onClick={()=>setModal({})} style={PB({padding:'13px 40px',fontSize:'15px',borderRadius:'40px',letterSpacing:'0.06em',boxShadow:'0 6px 24px rgba(181,99,30,0.3)'})}>&#43;&ensp;New Event</button></div>}
          <div style={{height:'80px'}}/>
        </div>
      </div>

      {/* Modals */}
      {modal!==null&&<EventModal event={modal} tzA={tzA} tzB={isLocal?null:tzB} labelA={labelA} labelB={labelB} homeLocation={homeLocation} plan={config?.plan||'free'} eventCount={events.length} onClose={()=>setModal(null)}
        onSave={ev=>{
          setEvents(prev=>{const ex=prev.find(i=>i.id===ev.id);return ex?prev.map(i=>i.id===ev.id?ev:i):[...prev,ev];});
          if(IS_CONFIGURED&&coupleId&&db) setDoc(doc(db,`couples/${coupleId}/events/${ev.id}`),ev).catch(()=>{});
          cancelEventNotif(ev.id);
          scheduleEventNotif(ev,notifMins);
          setModal(null);
        }}
        onDelete={id=>{
          setEvents(prev=>prev.filter(e=>e.id!==id));
          if(IS_CONFIGURED&&coupleId&&db) deleteDoc(doc(db,`couples/${coupleId}/events/${id}`)).catch(()=>{});
          cancelEventNotif(id);
          setModal(null);
        }}
      />}
      {panel==='meeting'&&<MeetingFinder tzA={activeTzA} tzB={tzB} labelA={labelA} labelB={labelB} onClose={()=>setPanel(null)}/>}
      {panel==='share'&&<ShareModal tzA={tzA} labelA={labelA} plan={config?.plan||'free'} onClose={()=>setPanel(null)} onConnected={newCoupleId=>{const cfg={...config,coupleId:newCoupleId};LS.set('ophelia_config',cfg);window.location.reload();}}/>}
      {showGift&&<GiftModal partnerName={labelB} onClose={()=>setShowGift(false)}/>}
      {showNotes&&<NotesWall notes={notes} labelA={labelA} labelB={labelB} onClose={()=>setShowNotes(false)} onAdd={note=>setNotes(prev=>[...prev,note])} onDelete={id=>setNotes(prev=>prev.filter(n=>n.id!==id))}/>}
      {showSplash&&<LoveNoteSplash notes={notes} labelA={labelA} labelB={labelB} onClose={()=>setShowSplash(false)}/>}
      {showAdmin&&<AdminPanel onClose={()=>setShowAdmin(false)}/>}
      {showUpgrade&&<UpgradeModal currentPlan={config?.plan||'free'} onClose={()=>setShowUpgrade(false)} onSuccess={p=>{const u=LS.get('ophelia_auth_user',null);if(u){const updated={...u,plan:p};LS.set('ophelia_auth_user',updated);}const cfg={...config,plan:p,user:{...config.user,plan:p}};LS.set('ophelia_config',cfg);setShowUpgrade(false);window.location.reload();}}/>}

      {/* Bottom nav bar — hidden when any modal is open */}
      {!modal&&!showGift&&!showNotes&&!showAdmin&&panel!=='share'&&panel!=='meeting'&&(
        <BottomNav
          events={events}
          tzA={activeTzA} tzB={isLocal?null:tzB}
          labelA={labelA} labelB={labelB}
          todayStr={todayStr}
          onEventClick={ev=>setModal(ev)}
          onNewEvent={()=>setModal({})}
          onReset={onReset}
          plan={config?.plan||'free'}
        />
      )}
    </>
  );
}

// ─── Error Boundary ───────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props){super(props);this.state={err:null};}
  static getDerivedStateFromError(e){return{err:e};}
  render(){
    if(this.state.err){
      return(
        <div style={{minHeight:'100vh',background:'#faf6f0',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'32px',fontFamily:"'DM Sans',sans-serif",textAlign:'center'}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'48px',fontWeight:300,color:'#b5631e',marginBottom:'12px'}}>Ophelia</div>
          <div style={{fontSize:'15px',color:'#7a6248',marginBottom:'20px'}}>Something went wrong. Please try again.</div>
          <button onClick={()=>{localStorage.clear();window.location.reload();}} style={{background:'#b5631e',color:'#fff',border:'none',borderRadius:'10px',padding:'12px 28px',cursor:'pointer',fontSize:'14px',fontWeight:600}}>Reset &amp; Reload</button>
          <div style={{marginTop:'16px',fontSize:'11px',color:'#a08868',maxWidth:'360px',wordBreak:'break-all'}}>{String(this.state.err?.message||this.state.err)}</div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Root ─────────────────────────────────────────────────────────────────────
function OpheliaApp() {
  const [config,setConfig]=useState(()=>LS.get('ophelia_config',null));
  const [screen, setScreen] = useState(()=>{
    const cfg=LS.get('ophelia_config',null);
    const authUser=LS.get('ophelia_auth_user',null);
    // Stay logged in: skip auth if both config and auth user are saved
    if(cfg&&authUser) return 'calendar';
    if(cfg) return 'calendar';
    return 'auth';
  });
  const [inviteData,setInviteData]=useState(null);

  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    // Handle invite link
    const inv=params.get('invite');
    if(inv){const d=decodeShare(inv);if(d&&d.type==='invite'){setInviteData(d);setScreen('invite');return;}}
    // Admin shortcut
    if(params.get('admin')==='1') setScreen('calendar');
    // PWA service worker
    if('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').then(reg=>{
        reg.update();
        if(reg.waiting) reg.waiting.postMessage({type:'SKIP_WAITING'});
        reg.addEventListener('updatefound',()=>{
          const w=reg.installing;
          if(w) w.addEventListener('statechange',()=>{
            if(w.state==='installed'&&navigator.serviceWorker.controller) window.location.reload();
          });
        });
      }).catch(()=>{});
      navigator.serviceWorker.addEventListener('controllerchange',()=>window.location.reload());
    }
  },[]);

  function handleAuth(user) {
    LS.set('ophelia_auth_user',user);
    const existing=LS.get('ophelia_users',[]);
    if(!existing.find(u=>u.id===user.id)) LS.set('ophelia_users',[...existing,user]);
    // If this user already has a saved calendar config, skip onboarding and go straight in
    const savedCfg=LS.get('ophelia_config',null);
    if(savedCfg) {
      // Refresh the user object in case plan changed
      const merged={...savedCfg,user:{...savedCfg.user,...user}};
      LS.set('ophelia_config',merged);
      setConfig(merged);
      setScreen('calendar');
    } else {
      setScreen('onboarding');
    }
  }

  function handleInviteAccept(user,inv) {
    // Connect as a couple — recipient becomes "you", inviter is "partner"
    LS.set('ophelia_auth_user',user);
    const existing=LS.get('ophelia_users',[]);
    if(!existing.find(u=>u.id===user.id)) LS.set('ophelia_users',[...existing,user]);
    const cfg={
      types:['couple'],
      name:user.name,
      partnerName:inv.fromName||'Partner',
      tzA:LS.get('ophelia_config',null)?.tzA||'America/New_York',
      tzB:inv.fromTz||'America/New_York',
      homeLocation:'',
      plan:'free',
      user:{...user,plan:'free'},
      coupleId:inv.coupleId||null,
      connectedViaInvite:true,
    };
    LS.set('ophelia_config',cfg);
    setConfig(cfg);
    setScreen('calendar');
    window.history.replaceState({},'',window.location.pathname);
  }

  function handleOnboarding(cfg) {
    const authUser=LS.get('ophelia_auth_user',null);
    const finalCfg={...cfg,user:{...(authUser||cfg.user),plan:cfg.plan}};
    LS.set('ophelia_config',finalCfg);
    setConfig(finalCfg);
    setScreen('calendar');
  }

  function handleReset() {
    LS.del('ophelia_config');LS.del('ophelia_events');LS.del('ophelia_notes');LS.del('ophelia_auth_user');
    setConfig(null);setScreen('auth');
  }

  return(
    <>
      <style>{CSS}</style>
      {screen==='auth'      && <AuthScreen onComplete={handleAuth}/>}
      {screen==='invite'    && <InviteScreen inviteData={inviteData} onAccept={handleInviteAccept}/>}
      {screen==='onboarding'&& <Onboarding onComplete={handleOnboarding}/>}
      {screen==='calendar'  && (config
        ? <Calendar config={config} onReset={handleReset}/>
        : <AuthScreen onComplete={handleAuth}/>
      )}
    </>
  );
}

export default function Ophelia(){
  return <ErrorBoundary><OpheliaApp/></ErrorBoundary>;
}
