/* ============================================================
   SCRIPTURE LAUNCHPAD — app.js
   Chapter-by-chapter study guides + easy 3-question quizzes
   across the five standard works. Zero network calls; everything
   persists to localStorage["slp_state_v1"].
   Sections:
   0. DATA — volumes, canon normalize
   1. STATE
   2. XP · LEVELS · CLIPS · STREAK
   3. TOASTS + CONFETTI
   4. BADGES
   5. ICONS + HELPERS
   6. WICK (pixel oil lamp mascot)
   7. GLOSSARY — annotator, tooltip, panel, flashcards
   8. SHOP + PROGRESS MODAL + PILL
   9. VIEWS
   10. ROUTER + KEYBOARD + TABBAR
   ============================================================ */
(function(){
"use strict";

/* ============ 0. DATA ============ */
const RAW = (window.SLP && window.SLP.books) ? window.SLP.books : [];
const GLOSS = (window.SLP && window.SLP.gloss) ? window.SLP.gloss : [];

const VOLUMES = [
  { id:"ot",  name:"Old Testament",       short:"OT",  acc:"#a52714", tint:"#fce8e6", icon:"scroll", blurb:"Covenant history, prophets, and poetry from Genesis to Malachi." },
  { id:"nt",  name:"New Testament",       short:"NT",  acc:"#1a73e8", tint:"#e8f0fe", icon:"book",   blurb:"The life of Christ and the letters of the apostles." },
  { id:"bom", name:"Book of Mormon",      short:"BoM", acc:"#b06000", tint:"#fdeed3", icon:"plates", blurb:"Another testament of Jesus Christ. Full chapter guides live now." },
  { id:"dc",  name:"Doctrine & Covenants",short:"D&C", acc:"#00796b", tint:"#e0f2f1", icon:"quill",  blurb:"Modern revelations, mostly to Joseph Smith, 1828-1844." },
  { id:"pgp", name:"Pearl of Great Price",short:"PGP", acc:"#7627bb", tint:"#f3e8fd", icon:"pearl",  blurb:"Moses, Abraham, Joseph Smith's history, the Articles of Faith." }
];
const VOL_BY_ID = {}; VOLUMES.forEach(v=>VOL_BY_ID[v.id]=v);

/* normalize: merge the two Alma parts, order books by volume */
const BOOKS = [];
{
  const merged = [];
  const byId = {};
  for (const b of RAW){
    if (b.id === "alma-b"){
      const a = byId["alma"];
      if (a){ a.chapters = (a.chapters||[]).concat(b.chapters||[]); continue; }
    }
    const copy = Object.assign({}, b);
    copy.chapters = copy.chapters || [];
    byId[copy.id] = copy;
    merged.push(copy);
  }
  VOLUMES.forEach(v=>{
    merged.filter(b=>b.volume===v.id).forEach(b=>BOOKS.push(b));
  });
}
const BOOK_BY_ID = {}; BOOKS.forEach(b=>BOOK_BY_ID[b.id]=b);
const unitLabel  = b => b.unit || "chapter";
const unitShort  = b => ({chapter:"CH", section:"SEC", article:"ART"})[unitLabel(b)] || "CH";
const unitCount  = b => b.chapterCount || (b.chapters ? b.chapters.length : 0);
function chapterOf(book, n){
  const c = (book.chapters||[]).find(x=>x.n===n);
  return c ? Object.assign({authored:true}, c) : { n:n, authored:false };
}
const booksOf = vid => BOOKS.filter(b=>b.volume===vid);
const TOTAL_UNITS = BOOKS.reduce((s,b)=>s+unitCount(b),0);
function readCountIn(vid){
  let n=0; booksOf(vid).forEach(b=>{ const r=S.read[b.id]; if(r) n+=r.length; });
  return n;
}
function readCount(){ let n=0; for(const k in S.read) n+=S.read[k].length; return n; }
function anyBookFinished(){
  return BOOKS.some(b=>{ const r=S.read[b.id]; return r && r.length>0 && r.length>=unitCount(b); });
}

/* ============ 1. STATE ============ */
const KEY = "slp_state_v1";
const DEF = {
  xp:0, clips:0, streak:0, lastDay:"",
  read:{},              // { "1-ne": [1,2,...] }
  quiz:{},              // { "1-ne:1": bestScore 0..3 }
  badges:[], buzz:{}, owned:[],
  cosmetics:{ accent:"", theme:"", ox:false, vocab2:false, confetti:false },
  last:{ book:"", n:0 },
  fcDecks:0
};
let S = load();
function load(){
  try{
    const raw = localStorage.getItem(KEY);
    if(!raw) return JSON.parse(JSON.stringify(DEF));
    const p = JSON.parse(raw);
    return Object.assign(JSON.parse(JSON.stringify(DEF)), p, {
      cosmetics: Object.assign({}, DEF.cosmetics, p.cosmetics||{}),
      last: Object.assign({}, DEF.last, p.last||{})
    });
  }catch(e){ return JSON.parse(JSON.stringify(DEF)); }
}
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }

/* ============ 2. XP · LEVELS · CLIPS · STREAK ============ */
const XP_CUT  = [0,100,250,500,850,1300,1850,2500];
const TITLES  = ["Seeker","Reader","Searcher","Student","Scholar","Teacher","Disciple","Zion-bound"];
function levelOf(xp){ let l=1; for(let i=0;i<XP_CUT.length;i++){ if(xp>=XP_CUT[i]) l=i+1; } return l; }
function levelInfo(){
  const l = levelOf(S.xp);
  const base = XP_CUT[l-1], next = XP_CUT[l] || null;
  return {
    level:l, title:TITLES[l-1],
    into:S.xp-base,
    span: next ? next-base : 0,
    next, toGo: next ? next-S.xp : 0
  };
}
function dayKey(off){
  const d = new Date(); d.setDate(d.getDate()+(off||0));
  return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
}
function markDay(){
  const t = dayKey();
  if (S.lastDay === t) return;
  S.streak = (S.lastDay === dayKey(-1)) ? S.streak+1 : 1;
  S.lastDay = t;
}
function awardXp(n, label){
  S.xp += n; S.clips += n; markDay();
  const before = levelOf(S.xp-n), after = levelOf(S.xp);
  toast("+"+n+" XP", label);
  if (after > before){
    S.clips += 25*after;
    toast("LEVEL "+after+" — "+TITLES[after-1].toUpperCase(), "+"+(25*after)+" CLIPS");
    confetti();
  }
  checkBadges(); updatePill(); save();
}

/* reading state */
function isRead(bid,n){ const r=S.read[bid]; return !!(r && r.indexOf(n)>=0); }
function setRead(bid,n,val){
  S.read[bid] = S.read[bid] || [];
  const had = isRead(bid,n);
  if (val && !had){
    S.read[bid].push(n); S.read[bid].sort((a,b)=>a-b);
    S.last = { book:bid, n:n };
    awardXp(10, bidLabel(bid,n)+" read");
  } else if (!val && had){
    S.read[bid] = S.read[bid].filter(x=>x!==n);
    save();
  }
  updatePill();
}
function bidLabel(bid,n){
  const b = BOOK_BY_ID[bid]; if(!b) return "Chapter";
  const up = b.title.toUpperCase();
  return up+" "+(unitLabel(b)==="chapter" ? n : n);
}

/* ============ 3. TOASTS + CONFETTI ============ */
function toast(main, tag){
  const t = document.createElement("div");
  t.className = "toast";
  t.innerHTML = (tag ? '<span class="txp">'+esc(tag)+'</span>' : '') + '<span>'+esc(main)+'</span>';
  document.getElementById("toasts").appendChild(t);
  setTimeout(()=>{ t.style.opacity="0"; t.style.transition="opacity .3s"; }, 2600);
  setTimeout(()=>{ if(t.parentNode) t.parentNode.removeChild(t); }, 3000);
}
const CONF_COLORS = ["#1a73e8","#188038","#d93025","#f9ab00","#e8710a"];
function confetti(){
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const root = document.getElementById("confetti");
  const count = S.cosmetics.confetti ? 60 : 30;
  for (let i=0;i<count;i++){
    const p = document.createElement("i");
    p.style.left = Math.random()*100+"vw";
    p.style.background = CONF_COLORS[i%CONF_COLORS.length];
    root.appendChild(p);
    const dur = 1400+Math.random()*1400;
    p.animate(
      [{ transform:"translateY(-12px) rotate(0deg)" },
       { transform:"translateY("+(window.innerHeight+30)+"px) rotate("+(Math.random()*720-360)+"deg)" }],
      { duration:dur, delay:Math.random()*250, easing:"cubic-bezier(.3,.4,.6,1)" }
    ).onfinish = ()=>{ if(p.parentNode) p.parentNode.removeChild(p); };
  }
}

/* ============ 4. BADGES ============ */
const BADGES = [
  { id:"first",   name:"First Chapter", icon:"book",  test:()=>readCount()>=1 },
  { id:"ten",     name:"Ten Chapters",  icon:"grid",  test:()=>readCount()>=10 },
  { id:"fifty",   name:"Fifty Chapters",icon:"medal", test:()=>readCount()>=50 },
  { id:"perfect", name:"Flawless",      icon:"star",  test:()=>Object.keys(S.quiz).some(k=>S.quiz[k]>=3) },
  { id:"high5",   name:"High Five",     icon:"spark", test:()=>Object.keys(S.quiz).filter(k=>S.quiz[k]>=3).length>=5 },
  { id:"week",    name:"Seven Days",    icon:"flame", test:()=>S.streak>=7 },
  { id:"scribe",  name:"Scribe",        icon:"quote", test:()=>knownTerms()>=25 },
  { id:"closed",  name:"Book Closed",   icon:"scroll",test:()=>anyBookFinished() }
];
function knownTerms(){ let n=0; for(const k in S.buzz){ if(S.buzz[k]>=2) n++; } return n; }
function checkBadges(){
  BADGES.forEach(b=>{
    if (S.badges.indexOf(b.id)>=0) return;
    let ok=false; try{ ok=b.test(); }catch(e){}
    if (ok){
      S.badges.push(b.id);
      S.xp += 25; S.clips += 25;
      toast("BADGE — "+b.name.toUpperCase(), "+25 XP");
    }
  });
}

/* ============ 5. ICONS + HELPERS ============ */
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m])); }
function escRe(s){ return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
function fmt(n){ return n.toLocaleString("en-US"); }
function icon(name, sz){
  const P = {
    scroll:'<path d="M7 4h11a2 2 0 0 1 2 2v11"/><path d="M7 4a2 2 0 0 0-2 2v12a2 2 0 0 1-2-2V6"/><path d="M7 4v13a2 2 0 0 0 2 2h11"/><path d="M9 8h7M9 11h7"/>',
    book:'<path d="M12 6c-2-1.4-4.8-2-8-2v14c3.2 0 6 .6 8 2 2-1.4 4.8-2 8-2V4c-3.2 0-6 .6-8 2z"/><path d="M12 6v14"/>',
    plates:'<rect x="4" y="7" width="16" height="10" rx="1.5"/><path d="M9.5 7v10M14.5 7v10M4 12h16"/>',
    quill:'<path d="M20 4c-6.5.4-10.5 4.5-12.5 10L5 19.5 10.5 17C16 15 19.6 10.5 20 4z"/><path d="M8.5 15.5C11 12 14 9.5 17 7.5"/>',
    pearl:'<circle cx="12" cy="12" r="6.5"/><path d="M9.5 9.8a3.2 3.2 0 0 1 2.2-1.3"/>',
    flame:'<path d="M12 3c1 3.2 4.5 4.8 4.5 8.5a4.5 4.5 0 0 1-9 0c0-1.6.6-2.9 1.6-4.3.4 1 1 1.8 1.9 2.2C10.8 7 11.3 5 12 3z"/>',
    clip:'<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
    star:'<path d="M12 3.5l2.5 5.4 5.9.7-4.4 4 1.2 5.9L12 16.6l-5.2 2.9 1.2-5.9-4.4-4 5.9-.7z"/>',
    medal:'<circle cx="12" cy="9" r="5"/><path d="M9 13.5L7 21l5-2.5L17 21l-2-7.5"/>',
    spark:'<path d="M12 3l2 6.2L20 12l-6 2.8L12 21l-2-6.2L4 12l6-2.8z"/>',
    grid:'<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    x:'<path d="M6 6l12 12M18 6L6 18"/>',
    prev:'<path d="M14.5 5.5L8 12l6.5 6.5"/>',
    next:'<path d="M9.5 5.5L16 12l-6.5 6.5"/>',
    arrow:'<path d="M4 12h15M13.5 6.5L19 12l-5.5 5.5"/>',
    search:'<circle cx="10.5" cy="10.5" r="6"/><path d="M15.5 15.5L20.5 20.5"/>',
    cards:'<rect x="3.5" y="7" width="13" height="13" rx="2"/><path d="M8 4h12.5v12.5"/>',
    quote:'<path d="M9.5 7C7 7.8 5.5 9.8 5.5 13v4h5v-5h-2.6c.2-1.7 1-2.8 2.6-3.4z"/><path d="M18.5 7C16 7.8 14.5 9.8 14.5 13v4h5v-5h-2.6c.2-1.7 1-2.8 2.6-3.4z"/>',
    home:'<path d="M4 11l8-7.5L20 11v9h-5.5v-5.5h-5V20H4z"/>',
    user:'<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5c1-4 4-6 7.5-6s6.5 2 7.5 6"/>'
  };
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"'+(sz?' style="width:'+sz+'px;height:'+sz+'px"':'')+'>'+(P[name]||"")+'</svg>';
}

/* ============ 6. WICK ============ */
const WICK_LINES = [
  "Nephi broke a bow once. Made a new one. That's the whole strategy.",
  "Isaiah wrote 66 chapters. Nobody said you have to do it in one sitting.",
  "The Liahona worked when they pushed. Streaks work the same way.",
  "Enos prayed all day and all night. The quiz takes two minutes.",
  "'It came to pass' count today: yes.",
  "Laban would have been a terrible study partner.",
  "One chapter closer than yesterday. Barely counts. Counts.",
  "Alma the Younger took five days off. Do not take five days off.",
  "The stripling warriors had no pause button. You do. Use it wisely.",
  "Moroni finished the record alone. You've got me. Marginally better company."
];
const WICK_LINES_2 = [
  "Enos 1 is one chapter long. It still took me three days to summarize.",
  "Verse numbers were added in the 1800s. The prophets did not have them.",
  "Ether 15 has more battles than my patience has lines.",
  "You underlined another orange word. I keep score. Quietly.",
  "Zeezrom asked tricky questions. My quiz questions are nicer.",
  "Two thousand stripling warriors. Zero study breaks reported.",
  "King Noah built towers. Build habits instead.",
  "Isaiah quoted Isaiah. I quote Isaiah. We are not the same.",
  "'If there is anything virtuous' — reading counts as seeking it out.",
  "The gold plates were heavy. Your streak is light. Carry both.",
  "A phone, a lamp, and one chapter. That's a whole evening.",
  "Benediction: one verse before bed. One."
];
function wickLine(){
  const pool = WICK_LINES.concat(S.cosmetics.vocab2 ? WICK_LINES_2 : []);
  return pool[Math.floor(Math.random()*pool.length)];
}
function wickSVG(){
  return '<svg class="wick" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true">'
    +'<g fill="var(--yellow)"><rect class="wflame" x="7" y="0" width="2" height="1"/><rect class="wflame" x="6" y="1" width="4" height="1"/><rect class="wflame" x="6" y="2" width="4" height="1" style="fill:var(--orange)"/><rect class="wflame" x="7" y="3" width="2" height="1" style="fill:var(--orange)"/></g>'
    +'<g fill="var(--ink)"><rect x="5" y="4" width="6" height="1"/><rect x="4" y="5" width="8" height="1"/><rect x="3" y="6" width="10" height="1"/>'
    +'<rect x="3" y="7" width="10" height="4"/><rect x="1" y="7" width="2" height="2"/><rect x="13" y="7" width="2" height="2"/>'
    +'<rect x="4" y="11" width="8" height="1"/></g>'
    +'<g fill="var(--card)"><rect x="5" y="7" width="6" height="3"/><rect class="weye" x="6" y="8" width="1" height="1" style="fill:var(--ink)"/><rect class="weye" x="9" y="8" width="1" height="1" style="fill:var(--ink)"/></g>'
    +'</svg>';
}
function wickDuo(){
  return '<div class="wick-duo">'+wickSVG()
    +'<div class="wick-bubble"><b>WICK /// RESIDENT LAMP</b>'+esc(wickLine())+'</div></div>';
}
setInterval(()=>{
  document.querySelectorAll(".weye").forEach(e=>{
    e.style.opacity="0"; setTimeout(()=>{ e.style.opacity="1"; },160);
  });
}, 4200);

/* ============ 7. GLOSSARY ============ */
let GLOB = null;
function buildGlob(){
  const terms = GLOSS.slice().sort((a,b)=>b.term.length-a.term.length);
  const byName = {};
  terms.forEach(t=>{ byName[t.term.toLowerCase()] = t; });
  GLOB = {
    re: new RegExp("\\b("+terms.map(t=>escRe(t.term)).join("|")+")\\b","gi"),
    byName: byName
  };
}
function buzz(name){ return S.buzz[name]||0; }
function promote(name, minLevel){
  if (buzz(name) >= (minLevel||1)) return false;
  S.buzz[name] = minLevel||1; save(); updateBzTab(); return true;
}
const BZ_LEVEL_LABEL = ["NEW TO YOU","SEEN ONCE","LEARNING","KNOW IT"];
const BZ_LEVEL_COLORS = ["#dadce0","#f9ab00","#e8710a","#188038"];

function annotate(root){
  if (!GLOB) buildGlob();
  if (!GLOSS.length) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(n){
      const p = n.parentNode; if (!p) return NodeFilter.FILTER_REJECT;
      if (/^(SCRIPT|STYLE|TEXTAREA|INPUT|SELECT|BUTTON|MARK)$/.test(p.nodeName)) return NodeFilter.FILTER_REJECT;
      if (p.closest && p.closest(".noannotate")) return NodeFilter.FILTER_REJECT;
      return n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });
  const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(n=>{
    const txt = n.nodeValue;
    GLOB.re.lastIndex = 0;
    if (!GLOB.re.test(txt)) return;
    GLOB.re.lastIndex = 0;
    const frag = document.createDocumentFragment();
    let last = 0, m, hits = 0;
    while ((m = GLOB.re.exec(txt)) && hits < 400){
      frag.appendChild(document.createTextNode(txt.slice(last, m.index)));
      const key = m[0].toLowerCase();
      const s = document.createElement("span");
      s.className = "bz"; s.dataset.term = key; s.tabIndex = 0;
      s.textContent = m[0];
      frag.appendChild(s);
      last = m.index + m[0].length; hits++;
    }
    frag.appendChild(document.createTextNode(txt.slice(last)));
    n.parentNode.replaceChild(frag, n);
  });
}

/* tooltip / bottom sheet */
let tipTimer = null, tipSeen = false, tipEl = null;
function isMobile(){ return matchMedia("(max-width:680px)").matches; }
function tipHTML(g){
  return '<span class="tt">'+esc(g.term)+'</span><span class="td">'+esc(g.def)+'</span>'
    +'<span class="tf">'+BZ_LEVEL_LABEL[buzz(g.term.toLowerCase())]+' · '+esc(g.tag)+'</span>';
}
function showTip(el){
  const g = GLOB.byName[el.dataset.term]; if(!g) return;
  tipEl = el; tipSeen = false;
  const tip = document.getElementById("bztip");
  tip.innerHTML = tipHTML(g);
  tip.hidden = false;
  if (isMobile()){ el.classList.add("open-tip"); return; }
  const r = el.getBoundingClientRect();
  const tw = Math.min(300, window.innerWidth-30);
  let x = r.left + r.width/2 - tw/2;
  x = Math.max(12, Math.min(x, window.innerWidth-tw-12));
  tip.style.left = x+"px"; tip.style.right = "auto";
  tip.style.top = Math.max(8, r.top - 12 - tip.offsetHeight)+"px";
  clearTimeout(tipTimer);
  tipTimer = setTimeout(()=>{
    if (promote(g.term.toLowerCase(),1)){
      tip.innerHTML = tipHTML(g); tipSeen = true;
    }
  }, 450);
}
function hideTip(){
  clearTimeout(tipTimer);
  const tip = document.getElementById("bztip");
  tip.hidden = true;
  if (tipEl){ tipEl.classList.remove("open-tip"); tipEl = null; }
}
document.addEventListener("mouseover", e=>{
  const t = e.target.closest && e.target.closest(".bz");
  if (!t || isMobile()) return;
  if (tipEl === t) return;
  showTip(t);
});
document.addEventListener("mouseout", e=>{
  const t = e.target.closest && e.target.closest(".bz");
  if (t && !isMobile()) hideTip();
});
document.addEventListener("focusin", e=>{
  const t = e.target.closest && e.target.closest(".bz");
  if (t && !isMobile()) showTip(t);
});
document.addEventListener("focusout", ()=>{ if(!isMobile()) hideTip(); });
document.addEventListener("click", e=>{
  if (!isMobile()) return;
  const t = e.target.closest && e.target.closest(".bz");
  if (t){ showTip(t); } else { hideTip(); }
});

/* glossary panel */
const BZ_FILTERS = ["ALL","NEW","SEEN","LEARNING","KNOW"];
let bzFilter = "ALL", bzQuery = "";
function renderBzPanel(){
  const panel = document.getElementById("bzpanel");
  let known=0, seen=0, learning=0;
  GLOSS.forEach(g=>{ const l=buzz(g.term.toLowerCase()); if(l>=3)known++; else if(l===2)learning++; else if(l>=1)seen++; });
  const total = GLOSS.length || 1;
  const rows = GLOSS.slice()
    .filter(g=>{
      if (bzQuery && (g.term+" "+g.def).toLowerCase().indexOf(bzQuery)<0) return false;
      const l = buzz(g.term.toLowerCase());
      if (bzFilter==="NEW") return l===0;
      if (bzFilter==="SEEN") return l===1;
      if (bzFilter==="LEARNING") return l===2;
      if (bzFilter==="KNOW") return l>=3;
      return true;
    })
    .sort((a,b)=> (buzz(a.term.toLowerCase())-buzz(b.term.toLowerCase())) || a.term.localeCompare(b.term));
  panel.innerHTML =
    '<div class="bz-head">'
    +'<div class="bt"><h3>TERMS '+known+'/'+GLOSS.length+'</h3>'
    +'<button type="button" id="bzfc" title="Flashcards">'+icon("cards")+'</button>'
    +'<button type="button" id="bzclose" title="Close">'+icon("x")+'</button></div>'
    +'<div class="bz-stack">'
      +'<i style="width:'+(seen/total*100)+'%;background:'+BZ_LEVEL_COLORS[1]+'"></i>'
      +'<i style="width:'+(learning/total*100)+'%;background:'+BZ_LEVEL_COLORS[2]+'"></i>'
      +'<i style="width:'+(known/total*100)+'%;background:'+BZ_LEVEL_COLORS[3]+'"></i>'
    +'</div>'
    +'<input class="bz-search" id="bzq" type="text" placeholder="Search terms and definitions" value="'+esc(bzQuery)+'">'
    +'<div class="bz-filters">'+BZ_FILTERS.map(f=>'<button type="button" class="bz-fch'+(bzFilter===f?" on":"")+'" data-f="'+f+'">'+f+'</button>').join("")+'</div>'
    +'</div>'
    +'<div class="bz-list" id="bzlist">'
    + (rows.length ? rows.map(g=>{
        const l = buzz(g.term.toLowerCase());
        return '<div class="bz-row'+(l===0?"":" exp-able")+'" data-term="'+esc(g.term.toLowerCase())+'">'
          +'<div class="rt"><b>'+esc(g.term)+'</b>'
          +'<span class="meter">'+[1,2,3].map(i=>'<i class="'+(l>=i?"f":"")+'"></i>').join("")+'</span>'
          +'<span class="tag">'+esc(g.tag)+'</span></div>'
          +'<div class="rd">'+esc(g.def)+'</div></div>';
      }).join("") : '<p style="padding:16px;color:var(--grey)">No terms match.</p>')
    +'</div>'
    +'<div class="bz-foot"><span class="bf-note">HOVER UNDERLINED TERMS ANYWHERE</span>'
    +'<button type="button" class="btn btn-dark btn-sm" id="bzfc2">'+icon("cards",15)+' FLASHCARDS +10 XP</button></div>';
  panel.classList.add("open");
  panel.setAttribute("aria-hidden","false");
  panel.querySelector("#bzclose").addEventListener("click", closeBz);
  panel.querySelector("#bzq").addEventListener("input", e=>{ bzQuery = e.target.value.trim().toLowerCase(); renderBzList(); });
  panel.querySelectorAll(".bz-fch").forEach(b=>b.addEventListener("click", ()=>{ bzFilter = b.dataset.f; renderBzPanel(); }));
  panel.querySelectorAll(".bz-row").forEach(r=>r.addEventListener("click", ()=>{
    r.classList.toggle("exp");
    promote(r.dataset.term, 1); renderBzTabCount();
  }));
  panel.querySelector("#bzfc").addEventListener("click", openFlashcards);
  panel.querySelector("#bzfc2").addEventListener("click", openFlashcards);
  updateBzTab();
}
function renderBzList(){
  renderBzPanelKeepFocus();
}
function renderBzPanelKeepFocus(){
  const q = document.getElementById("bzq");
  const pos = q ? q.selectionStart : null;
  renderBzPanel();
  const nq = document.getElementById("bzq");
  if (nq && pos!==null){ nq.focus(); try{ nq.setSelectionRange(pos,pos); }catch(e){} }
}
function closeBz(){
  const panel = document.getElementById("bzpanel");
  panel.classList.remove("open");
  panel.setAttribute("aria-hidden","true");
  markTabbar();
}
function updateBzTab(){ renderBzTabCount(); }
function renderBzTabCount(){
  const el = document.getElementById("bzcount");
  if (el) el.textContent = knownTerms()+"/"+GLOSS.length;
  const tb = document.getElementById("tbadge");
  if (tb){
    const k = knownTerms();
    tb.textContent = k; tb.style.display = k>0 ? "" : "none";
  }
}
document.getElementById("bztab").addEventListener("click", ()=>{
  const p = document.getElementById("bzpanel");
  if (p.classList.contains("open")) closeBz(); else { renderBzPanel(); markTabbar(); }
});

/* flashcards */
let FC = null;
function openFlashcards(){
  const deck = GLOSS.slice()
    .sort((a,b)=> (buzz(a.term.toLowerCase())-buzz(b.term.toLowerCase())) || (Math.random()-.5))
    .slice(0,12);
  FC = { deck, i:0, side:0, right:0 };
  drawFlashcard();
}
function drawFlashcard(){
  const o = document.getElementById("fcoverlay");
  if (!FC){ o.hidden = true; o.innerHTML=""; return; }
  const g = FC.deck[FC.i];
  const done = FC.i >= FC.deck.length;
  o.hidden = false;
  o.innerHTML =
    '<div class="fc-card">'
    +'<div class="fk"><span>FLASHCARDS · WEAKEST FIRST</span><span>'+(Math.min(FC.i+1,FC.deck.length))+'/'+FC.deck.length+'</span></div>'
    + (done
      ? '<div class="fc-face"><span class="fw">Deck done</span><span class="fd">'+FC.right+' of '+FC.deck.length+' felt solid. Weakest cards come back first next time.</span></div>'
        +'<div class="fc-btns"><button type="button" class="btn btn-primary" id="fcdone">Collect +10 XP</button></div>'
      : '<div class="fc-face" id="fcface">'
        + (FC.side===0
            ? '<span class="fw">'+esc(g.term)+'</span><span class="fhint">TAP TO FLIP</span>'
            : '<span class="fd">'+esc(g.def)+'</span><span class="fhint">'+esc(g.tag)+'</span>')
        +'</div>'
        + (FC.side===0
            ? '<div class="fc-btns"><button type="button" class="btn btn-ghost" id="fcflip" style="width:100%;justify-content:center">Flip</button></div>'
            : '<div class="fc-btns"><button type="button" class="btn btn-ghost" id="fcno">Not yet</button><button type="button" class="btn btn-green" id="fcyes">Got it</button></div>')
    )
    +'<button type="button" class="mx" id="fcx" style="position:absolute;top:14px;right:14px;border:none;background:none;cursor:pointer;color:var(--grey)">'+icon("x",18)+'</button>'
    +'</div>';
  o.querySelector("#fcx").addEventListener("click", ()=>{ FC=null; drawFlashcard(); });
  if (done){
    o.querySelector("#fcdone").addEventListener("click", ()=>{
      S.fcDecks++; FC=null; drawFlashcard(); awardXp(10, "flashcard deck");
    });
  } else {
    o.querySelector("#fcface").addEventListener("click", ()=>{ FC.side=1; drawFlashcard(); });
    const flip = o.querySelector("#fcflip"); if (flip) flip.addEventListener("click", ()=>{ FC.side=1; drawFlashcard(); });
    const yes = o.querySelector("#fcyes"), no = o.querySelector("#fcno");
    if (yes) yes.addEventListener("click", ()=>{ gradeCard(g, +1); });
    if (no)  no.addEventListener("click",  ()=>{ gradeCard(g, -1); });
  }
}
function gradeCard(g, d){
  const key = g.term.toLowerCase();
  S.buzz[key] = Math.max(1, Math.min(3, buzz(key)+d));
  if (d>0) FC.right++;
  FC.i++; FC.side = 0; save();
  renderBzTabCount();
  drawFlashcard();
  const p = document.getElementById("bzpanel");
  if (p.classList.contains("open")) renderBzPanelKeepFocus();
}
document.getElementById("fcoverlay").addEventListener("click", e=>{
  if (e.target.id === "fcoverlay"){ FC=null; drawFlashcard(); }
});

/* ============ 8. SHOP + PROGRESS MODAL + PILL ============ */
const SHOP = [
  { id:"acc-galilee", kind:"accent", name:"Sea of Galilee", price:80, colors:{b:"#0b57d0",d:"#0842a0",t:"#d9e6fc"}, desc:"Blues for the lake where He walked." },
  { id:"acc-wild",    kind:"accent", name:"Wilderness",     price:80, colors:{b:"#558b2f",d:"#33691e",t:"#e9f2df"}, desc:"Olive and sand for the long way around." },
  { id:"acc-liahona", kind:"accent", name:"Liahona",        price:80, colors:{b:"#b06000",d:"#8a4b00",t:"#fbead3"}, desc:"Brass for the compass that runs on faith." },
  { id:"ox",          kind:"cosmetic", name:"The Shop Ox",  price:120, desc:"A stubborn pixel ox for the masthead. Eats nothing." },
  { id:"midnight",    kind:"theme",  name:"Midnight Edition", price:200, desc:"Full dark theme for late-night study." },
  { id:"vocab2",      kind:"cosmetic", name:"Wick's Second Journal", price:60, desc:"12 more deadpan lines from the lamp." },
  { id:"confetti",    kind:"cosmetic", name:"Full-Deck Confetti", price:40, desc:"60 confetti squares instead of 30." }
];
function applyCosmetics(){
  const h = document.documentElement;
  if (S.cosmetics.accent) h.dataset.accent = S.cosmetics.accent; else delete h.dataset.accent;
  if (S.cosmetics.theme) h.dataset.theme = S.cosmetics.theme; else delete h.dataset.theme;
  document.getElementById("oxmount").innerHTML = S.cosmetics.ox ? oxSVG() : "";
}
function oxSVG(){
  return '<svg viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true" title="the shop ox">'
    +'<g fill="var(--ink)">'
    +'<rect x="1" y="1" width="2" height="1"/><rect x="13" y="1" width="2" height="1"/>'
    +'<rect x="3" y="2" width="10" height="4"/>'
    +'<rect x="2" y="6" width="12" height="5"/>'
    +'<rect x="3" y="11" width="2" height="3"/><rect x="11" y="11" width="2" height="3"/>'
    +'</g>'
    +'<g fill="var(--card)"><rect x="5" y="3" width="1" height="1"/><rect x="10" y="3" width="1" height="1"/><rect x="4" y="6" width="8" height="3"/></g>'
    +'<g fill="var(--ink)"><rect x="5" y="7" width="1" height="1"/><rect x="10" y="7" width="1" height="1"/></g>'
    +'</svg>';
}
function buyItem(id){
  const item = SHOP.find(s=>s.id===id); if(!item) return;
  if (S.owned.indexOf(id)>=0){ toggleEquip(id); return; }
  if (S.clips < item.price){ toast("Not enough clips", "NEED "+(item.price-S.clips)); return; }
  S.clips -= item.price; S.owned.push(id);
  toast("BOUGHT — "+item.name.toUpperCase(), "-"+item.price+" CLIPS");
  updatePill();
  toggleEquip(id, true);
}
function toggleEquip(id, forceOn){
  if (id.indexOf("acc-")===0){
    const a = id.slice(4);
    S.cosmetics.accent = (forceOn || S.cosmetics.accent!==a) ? a : "";
  } else if (id==="midnight"){
    S.cosmetics.theme = (forceOn || S.cosmetics.theme!=="midnight") ? "midnight" : "";
  } else if (id==="ox"){
    S.cosmetics.ox = forceOn ? true : !S.cosmetics.ox;
  } else if (id==="vocab2"){
    S.cosmetics.vocab2 = forceOn ? true : !S.cosmetics.vocab2;
  } else if (id==="confetti"){
    S.cosmetics.confetti = forceOn ? true : !S.cosmetics.confetti;
  }
  applyCosmetics(); save(); renderModal();
}
function updatePill(){
  const li = levelInfo();
  document.getElementById("pillfill").style.width = (li.next ? Math.round(li.into/li.span*100) : 100)+"%";
  document.getElementById("pillclips").textContent = fmt(S.clips);
  document.querySelector(".pill .pl-lv").textContent = "LV "+li.level;
}
document.getElementById("pill").addEventListener("click", openModal);

function openModal(){
  const root = document.getElementById("modalroot");
  root.hidden = false;
  renderModal();
}
function closeModal(){ document.getElementById("modalroot").hidden = true; }
function renderModal(){
  const root = document.getElementById("modalroot");
  if (root.hidden) return;
  const li = levelInfo();
  const quizzes = Object.keys(S.quiz).length;
  root.innerHTML =
    '<div class="modal-back" id="mback"></div>'
    +'<div class="modal" role="dialog" aria-label="Progress">'
    +'<button type="button" class="mx" id="mx">'+icon("x",18)+'</button>'
    +'<span class="kicker">PROGRESS /// SCRIPTURE LAUNCHPAD</span>'
    +'<h2 style="font-size:26px;font-weight:900;text-transform:uppercase">Study record</h2>'
    +'<div class="mgrid">'
      +'<div class="mbox"><span class="mk">LEVEL</span><div class="big">LV '+li.level+' · '+esc(li.title.toUpperCase())+'</div>'
        +'<div class="levelbar" style="margin-top:10px"><span class="fill" style="display:block;height:100%;width:'+(li.next?Math.round(li.into/li.span*100):100)+'%;background:var(--blue)"></span></div>'
        +'<div class="sub">'+(li.next ? fmt(S.xp)+" / "+fmt(li.next)+" XP · "+fmt(li.toGo)+" TO GO" : fmt(S.xp)+" XP — MAX LEVEL")+'</div>'
      +'</div>'
      +'<div class="mbox"><span class="mk">CLIP WALLET</span><div class="big" style="color:var(--yellow-d)">'+fmt(S.clips)+'</div>'
        +'<div class="sub">CLIPS = 1 PER XP · LEVEL-UP BONUS 25×LEVEL</div>'
        +'<div class="statrow">'
          +'<span class="chip streak">'+icon("flame",14)+' '+S.streak+' DAY STREAK</span>'
          +'<span class="chip">'+icon("book",14)+' '+fmt(readCount())+' READ</span>'
          +'<span class="chip xp">'+icon("check",14)+' '+quizzes+' QUIZZES</span>'
          +'<span class="chip lvl">'+icon("quote",14)+' '+knownTerms()+' TERMS</span>'
        +'</div>'
      +'</div>'
    +'</div>'
    +'<div class="mgrid">'
      +'<div class="mbox"><span class="mk">LEVEL LADDER</span><div class="ladder">'
        + XP_CUT.map((cut,i)=>{
            const lvl=i+1, state = lvl<li.level?"done":(lvl===li.level?"now":"locked");
            return '<div class="lrow '+state+'"><span class="ln">'+(state==="done"?icon("check",13):lvl)+'</span>'
              +'<span class="lt">'+TITLES[i].toUpperCase()+'</span>'
              +'<span class="lr">'+fmt(cut)+' XP · +'+(25*lvl)+' CLIPS</span></div>';
          }).join("")
      +'</div></div>'
      +'<div class="mbox"><span class="mk">BADGES</span><div class="badge-grid">'
        + BADGES.map(b=>{
            const has = S.badges.indexOf(b.id)>=0;
            return '<div class="badge'+(has?"":" locked")+'" title="'+esc(b.name)+'">'+icon(b.icon)
              +'<span class="bn">'+esc(b.name.toUpperCase())+'</span>'
              +(has?"":'<span class="lk">'+icon("x",11)+'</span>')+'</div>';
          }).join("")
      +'</div></div>'
    +'</div>'
    +'<div class="mbox" style="margin-top:16px"><span class="mk">STUDY SHOP — COSMETICS ONLY</span><div class="shopgrid">'
      + SHOP.map(it=>{
          const owned = S.owned.indexOf(it.id)>=0;
          let on = false;
          if (it.kind==="accent") on = S.cosmetics.accent === it.id.slice(4);
          else if (it.kind==="theme") on = S.cosmetics.theme === "midnight";
          else on = !!S.cosmetics[it.id];
          const afford = S.clips >= it.price;
          let swatches = "";
          if (it.colors) swatches = '<span class="sw"><i style="background:'+it.colors.b+'"></i><i style="background:'+it.colors.d+'"></i><i style="background:'+it.colors.t+'"></i></span>';
          else if (it.id==="midnight") swatches = '<span class="sw"><i style="background:#1b1c1f"></i><i style="background:#3c4043"></i><i style="background:#8ab4f8"></i></span>';
          else if (it.id==="ox") swatches = '<span class="sw" style="align-items:center">'+oxSVG()+'</span>';
          let btn;
          if (!owned) btn = '<button type="button" class="btn btn-dark btn-sm" data-buy="'+it.id+'"'+(afford?"":" disabled")+'>Buy</button>';
          else if (on) btn = '<button type="button" class="btn btn-green btn-sm" data-buy="'+it.id+'">On</button>';
          else btn = '<button type="button" class="btn btn-ghost btn-sm" data-buy="'+it.id+'">Equip</button>';
          return '<div class="shopcard'+(owned?" owned":"")+'">'+swatches
            +'<span class="pname">'+esc(it.name)+'</span>'
            +'<span class="pdesc">'+esc(it.desc)+'</span>'
            +'<span class="prow"><span class="price">'+icon("clip",13)+' '+it.price+'</span>'+btn+'</span></div>';
        }).join("")
    +'</div><p class="shopfoot">COSMETICS ONLY — NO SCORES, NO SHORTCUTS</p></div>'
    +'</div>';
  root.querySelector("#mx").addEventListener("click", closeModal);
  root.querySelector("#mback").addEventListener("click", closeModal);
  root.querySelectorAll("[data-buy]").forEach(b=>b.addEventListener("click", ()=>buyItem(b.dataset.buy)));
}
document.addEventListener("keydown", e=>{
  if (e.key==="Escape"){
    const p = document.getElementById("bzpanel");
    if (p.classList.contains("open")){ closeBz(); return; }
    if (!document.getElementById("modalroot").hidden) closeModal();
    if (FC){ FC=null; drawFlashcard(); }
  }
});

/* ============ 9. VIEWS ============ */
const view = document.getElementById("view");

function continueTarget(){
  if (S.last.book && BOOK_BY_ID[S.last.book]) return { bid:S.last.book, n:S.last.n };
  return { bid:"1-ne", n:1 };
}
function nextChapter(bid, n){
  const b = BOOK_BY_ID[bid]; if(!b) return null;
  if (n < unitCount(b)) return { bid:bid, n:n+1 };
  const i = BOOKS.indexOf(b);
  if (i>=0 && i<BOOKS.length-1){ const nb = BOOKS[i+1]; return { bid:nb.id, n:1 }; }
  return null;
}
function prevChapter(bid, n){
  const b = BOOK_BY_ID[bid]; if(!b) return null;
  if (n > 1) return { bid:bid, n:n-1 };
  const i = BOOKS.indexOf(b);
  if (i>0){ const pb = BOOKS[i-1]; return { bid:pb.id, n:unitCount(pb) }; }
  return null;
}

/* ---- home ---- */
function viewHome(){
  const c = continueTarget();
  const hasProgress = readCount() > 0;
  const li = levelInfo();
  const stages = [
    { t:"Pick a volume", d:"Five standard works, one library. The Book of Mormon ships with full chapter-by-chapter guides first.", m:"VOLUMES /// OT · NT · BOM · D&C · PGP" },
    { t:"Read the guide", d:"A short original summary, who wrote it and when, key verses, and one takeaway — read it beside the actual text.", m:"GUIDES /// BOM LIVE NOW" },
    { t:"Take the 3-question quiz", d:"Easy comprehension questions, scored on the spot. Finishing marks the chapter read and pays XP, clips, and streak days.", m:"QUIZ /// 3 QUESTIONS · AUTO-GRADED" }
  ];
  const stageState = hasProgress ? ["done","done","now"] : ["now","",""];
  view.innerHTML =
  '<section class="hero"><div class="wrap hero-grid">'
    +'<div class="hero-main">'
      +'<p class="kicker"><span class="dot">///</span> SCRIPTURE LAUNCHPAD · STUDY EDITION</p>'
      +'<h1>Many books.<br><span class="outl">One canon.</span></h1>'
      +'<p class="sub">Chapter-by-chapter study guides and quick three-question quizzes across all five standard works. Read a little. Learn a lot. Keep the streak.</p>'
      +'<div class="cta"><a class="btn btn-primary btn-hero" href="#/volumes" data-nav>Open the library '+icon("arrow",17)+'</a></div>'
      +'<p class="alt">'+(hasProgress
          ? 'or <a href="#/chapter/'+c.bid+'/'+c.n+'" data-nav>pick up where you left off — '+esc(bidLabel(c.bid,c.n))+'</a>'
          : 'or <a href="#/chapter/1-ne/1" data-nav>start at the beginning — 1 Nephi 1</a>')+'</p>'
      +'<div class="microline"><b>'+VOLUMES.length+' VOLUMES</b><span>///</span><b>'+fmt(TOTAL_UNITS)+' CHAPTERS</b><span>///</span><span>BOOK OF MORMON GUIDES LIVE</span><span>///</span><span>NO ACCOUNTS · NO ADS</span></div>'
    +'</div>'
    +'<div class="hero-side">'
      +'<span class="stamp corner-stamp">EST. 2026 — STUDY EDITION</span>'
      + wickDuo()
    +'</div>'
  +'</div>'
  +'<div class="scrollcue">SCROLL<span>'+icon("next",14)+'</span></div></section>'
  +'<section class="section"><div class="wrap path-grid">'
    +'<div>'
      +'<div class="section-head"><h2>The routine</h2><span class="rule"></span><span class="count">THREE MOVES</span></div>'
      + stages.map((s,i)=>'<div class="stage"><div class="railv"><div class="node '+(stageState[i]==="done"?"done":(stageState[i]==="now"?"now":""))+'">'+(stageState[i]==="done"?icon("check",16):(i+1))+'</div>'+(i<stages.length-1?'<div class="cord"></div>':'')+'</div>'
        +'<div class="body"><h3>'+esc(s.t)+'</h3><p class="desc">'+esc(s.d)+'</p><p class="meta">'+esc(s.m)+'</p></div></div>').join("")
    +'</div>'
    +'<div class="railcol">'
      +'<div class="card">'
        +'<p class="kicker">YOUR STREAK</p>'
        +'<div style="display:flex;align-items:baseline;gap:8px"><span style="font:900 34px var(--font-disp)">'+S.streak+'</span><span class="mono" style="font:700 11px var(--font-mono);color:var(--grey)">DAY STREAK</span></div>'
        +'<div class="levelbar" style="margin-top:10px"><span class="fill" style="display:block;height:100%;width:'+(li.next?Math.round(li.into/li.span*100):100)+'%;background:var(--blue)"></span></div>'
        +'<p class="mono" style="font:500 10.5px var(--font-mono);color:var(--grey);letter-spacing:.08em;margin:8px 0 14px">LV '+li.level+' · '+esc(li.title.toUpperCase())+' · '+fmt(S.xp)+' XP'+(li.next?' · '+fmt(li.toGo)+' TO GO':'')+'</p>'
        +'<button type="button" class="btn btn-ghost btn-sm" id="homeprogress" style="width:100%;justify-content:center">Progress &amp; shop</button>'
      +'</div>'
      +'<div class="card tight">'
        +'<p class="kicker">KEEP GOING</p>'
        +'<p style="margin:0 0 10px;font-size:14px;color:var(--ink2)">'+(hasProgress
            ? 'Next up: <b>'+esc(bidLabel(c.bid,c.n))+'</b>'
            : 'Start with <b>1 Nephi 1</b> — ten minutes, one guide, one quiz.')+'</p>'
        +'<a class="btn btn-primary btn-sm btn-full" href="#/chapter/'+c.bid+'/'+c.n+'" data-nav>'+(hasProgress?'Continue':'Start reading')+' '+icon("arrow",15)+'</a>'
      +'</div>'
      +'<div class="card tight"><p class="kicker">NOTE</p><p style="margin:0;font-size:12.5px;color:var(--grey)">A study aid, not an official publication of the Church. Read with your scriptures open. <a href="#/about" data-nav>Sources</a>.</p></div>'
    +'</div>'
  +'</div></section>';
  document.getElementById("homeprogress").addEventListener("click", openModal);
}

/* ---- volumes ---- */
function viewVolumes(){
  const cards = VOLUMES.map(v=>{
    const bs = booksOf(v.id);
    const units = bs.reduce((s,b)=>s+unitCount(b),0);
    const read = readCountIn(v.id);
    const pct = units ? Math.round(read/units*100) : 0;
    return '<a class="card hard vcard" href="#/volume/'+v.id+'" data-nav style="--acc:'+v.acc+';--acc-t:'+v.tint+'">'
      +'<span class="bar"></span><span class="inner">'
      +'<span class="toprow"><span class="ic">'+icon(v.icon,19)+'</span>'
      +'<span class="guidechip'+(v.id==="bom"?"":" soon")+'">'+(v.id==="bom"?"GUIDES LIVE":"TRACKER")+'</span></span>'
      +'<h3>'+esc(v.name)+'</h3><span class="blurb">'+esc(v.blurb)+'</span>'
      +'<span class="pbar"><span style="width:'+pct+'%"></span></span>'
      +'<span class="meta"><span>'+fmt(read)+' / '+fmt(units)+' '+ (v.id==="dc"?"SECTIONS":"CHAPTERS")+'</span><span class="go">'+icon("arrow",15)+'</span></span>'
      +'</span></a>';
  }).join("");
  view.innerHTML =
    '<div class="wrap"><section class="section" style="padding-top:26px">'
    +'<div class="section-head"><h2>The standard works</h2><span class="rule"></span><span class="count">5 VOLUMES · '+fmt(TOTAL_UNITS)+' UNITS</span></div>'
    +'<div class="volgrid">'+cards+'</div>'
    +'<p class="mono" style="font:500 10.5px var(--font-mono);color:#9aa0a6;letter-spacing:.12em;margin-top:26px">STUDY GUIDES ROLL OUT VOLUME BY VOLUME /// THE BOOK OF MORMON IS FULLY GUIDED IN V1 /// EVERY VOLUME TRACKS READING NOW</p>'
    +'</section></div>';
}

/* ---- volume ---- */
function viewVolume(vid){
  const v = VOL_BY_ID[vid]; if(!v) return notFound();
  const bs = booksOf(v.id);
  const units = bs.reduce((s,b)=>s+unitCount(b),0);
  const read = readCountIn(vid);
  view.innerHTML =
    '<div class="wrap">'
    +'<p class="crumb"><a href="#/volumes" data-nav>VOLUMES</a> / '+esc(v.name.toUpperCase())+'</p>'
    +'<div class="det-head" style="--acc:'+v.acc+';--acc-t:'+v.tint+'">'
      +'<span class="big-ic">'+icon(v.icon,38)+'</span>'
      +'<div><h1>'+esc(v.name)+'</h1><p class="aka">'+bs.length+' BOOKS · '+fmt(units)+' '+(vid==="dc"?"SECTIONS":"CHAPTERS")+' · '+fmt(read)+' READ</p></div>'
      +'<div class="head-cta"><span class="stamp gold">'+(vid==="bom"?"GUIDES COMPLETE":"TRACKER ONLY")+'</span></div>'
    +'</div>'
    +'<div class="group-head"><span class="gname">BOOKS</span><span class="grule"></span><span class="gn">'+bs.length+'</span></div>'
    +'<div class="bookgrid">'
    + bs.map(b=>{
        const u = unitCount(b), r = (S.read[b.id]||[]).length;
        const pct = u?Math.round(r/u*100):0;
        return '<a class="card hard vcard" href="#/book/'+b.id+'" data-nav style="--acc:'+v.acc+';--acc-t:'+v.tint+'">'
          +'<span class="bar"></span><span class="inner">'
          +'<span class="toprow"><span class="ic">'+icon(b.unit==="section"?"quill":(b.unit==="article"?"quote":"book"),19)+'</span>'
          +((b.chapters||[]).length ? '<span class="guidechip">GUIDES</span>' : '<span class="guidechip soon">TRACKER</span>')+'</span>'
          +'<h3>'+esc(b.title)+'</h3><span class="blurb">'+esc(b.blurb||"")+'</span>'
          +'<span class="pbar"><span style="width:'+pct+'%"></span></span>'
          +'<span class="meta"><span>'+r+' / '+u+' '+unitShort(b)+'</span><span class="go">'+icon("arrow",15)+'</span></span>'
          +'</span></a>';
      }).join("")
    +'</div></div>';
}

/* ---- book ---- */
function viewBook(bid){
  const b = BOOK_BY_ID[bid]; if(!b) return notFound();
  const v = VOL_BY_ID[b.volume];
  const u = unitCount(b), r = (S.read[b.id]||[]).length;
  const hasGuides = (b.chapters||[]).length > 0;
  const c = continueTarget();
  view.innerHTML =
    '<div class="wrap">'
    +'<p class="crumb"><a href="#/volumes" data-nav>VOLUMES</a> / <a href="#/volume/'+v.id+'" data-nav>'+esc(v.name.toUpperCase())+'</a> / '+esc(b.title.toUpperCase())+'</p>'
    +'<div class="det-head" style="--acc:'+v.acc+';--acc-t:'+v.tint+'">'
      +'<span class="big-ic">'+icon(b.unit==="section"?"quill":"book",38)+'</span>'
      +'<div><h1>'+esc(b.title)+'</h1><p class="aka">'+u+' '+unitLabel(b).toUpperCase()+'S · '+r+' READ · '+(hasGuides?"GUIDES READY":"READING TRACKER")+'</p></div>'
      +'<div class="head-cta"><a class="btn btn-primary btn-sm" href="#/chapter/'+c.bid+'/'+c.n+'" data-nav>Continue</a></div>'
    +'</div>'
    +'<div class="group-head"><span class="gname">'+unitLabel(b).toUpperCase()+'S</span><span class="grule"></span><span class="gn">'+u+'</span></div>'
    +'<div class="chapgrid">'
    + Array.from({length:u},(_,i)=>i+1).map(n=>{
        const ch = chapterOf(b,n);
        const rd = isRead(b.id,n);
        const qd = S.quiz[b.id+":"+n]>=1;
        return '<button type="button" class="chap'+(rd?" read":"")+(ch.authored?" guide":"")+'" data-n="'+n+'" title="'+esc(b.title)+' '+n+(rd?" — read":"")+'">'
          +(rd?icon("check",13)+" ":"")+n
          +(qd?'<span class="cd"></span>':'<span class="cd none"></span>')
          +'</button>';
      }).join("")
    +'</div></div>';
  view.querySelectorAll(".chap").forEach(btn=>btn.addEventListener("click", ()=>{
    location.hash = "#/chapter/"+bid+"/"+btn.dataset.n;
  }));
}

/* ---- chapter ---- */
let RUNQ = null;
function viewChapter(bid, n){
  const b = BOOK_BY_ID[bid]; if(!b) return notFound();
  const v = VOL_BY_ID[b.volume];
  const ch = chapterOf(b, n);
  const label = b.title.toUpperCase()+" "+n;
  RUNQ = ch.authored ? { i:0, score:0, locked:false, done:false, bid:bid, n:n } : null;
  const nx = nextChapter(bid,n), pv = prevChapter(bid,n);

  let guideBlock = "";
  if (ch.authored){
    guideBlock =
      '<div class="card guidecard">'
      +'<div class="gh"><h3>What happens</h3><span class="grule"></span></div>'
      +'<p class="sum">'+esc(ch.summary)+'</p>'
      +'<span class="ctxline">'+esc(ch.context)+'</span>'
      +'<div class="gh"><h3>Key verses</h3><span class="grule"></span></div>'
      +'<div class="kvblock">'+(ch.keyVerses||[]).map(kv=>
          '<div class="kv"><p class="kvt">&ldquo;'+esc(kv.text)+'&rdquo;</p><span class="kvr">'+esc(kv.ref)+'</span></div>'
        ).join("")+'</div>'
      +'<div class="takeaway"><span class="tk">TAKE AWAY</span><p>'+esc(ch.takeaway)+'</p></div>'
      +'</div>';
  } else {
    guideBlock =
      '<div class="card comingsoon">'
      +'<span class="cs-k">/// STUDY GUIDE IN PROGRESS</span>'
      +'<p>This volume ships with reading-tracker support first; original chapter guides roll out volume by volume. The Book of Mormon is fully guided.</p>'
      +'<p>Open the full text in the <a href="https://www.churchofjesuschrist.org/study?lang=eng" target="_blank" rel="noopener">Gospel Library</a>, then mark it read here.</p>'
      +'</div>';
  }

  view.innerHTML =
    '<div class="wrap"><div class="study">'
    +'<p class="crumb"><a href="#/volumes" data-nav>VOLUMES</a> / <a href="#/volume/'+v.id+'" data-nav>'+esc(v.name.toUpperCase())+'</a> / <a href="#/book/'+b.id+'" data-nav>'+esc(b.title.toUpperCase())+'</a></p>'
    +'<div class="chap-head" style="--acc:'+v.acc+'">'
      +'<div><p class="kicker">'+esc(v.name.toUpperCase())+' /// '+esc(b.title.toUpperCase())+'</p><h1>'+esc(label)+'</h1></div>'
      +'<span class="readtoggle"><button type="button" id="readbtn" class="'+(isRead(bid,n)?"on":"")+'">'+icon("check",14)+' '+(isRead(bid,n)?"READ":"MARK AS READ")+'</button></span>'
    +'</div>'
    + guideBlock
    + (ch.authored ? '<div class="hard flat quizcard noannotate" id="quizcard" style="--acc:'+v.acc+'">'
        +'<div class="qh"><h3>Chapter quiz</h3><span class="qmeta">3 QUESTIONS · EASY · ON THIS DEVICE</span></div>'
        +'<div id="qbody"></div></div>' : '')
    +'<div class="chapter-nav">'
      +(pv ? '<a class="btn btn-ghost btn-sm" href="#/chapter/'+pv.bid+'/'+pv.n+'" data-nav>'+icon("prev",15)+' '+esc(bidLabel(pv.bid,pv.n))+'</a>' : '<span></span>')
      +(nx ? '<a class="btn btn-ghost btn-sm" href="#/chapter/'+nx.bid+'/'+nx.n+'" data-nav>'+esc(bidLabel(nx.bid,nx.n))+' '+icon("next",15)+'</a>' : '<span></span>')
    +'</div>'
    +'</div></div>';

  document.getElementById("readbtn").addEventListener("click", function(){
    const on = !isRead(bid,n);
    setRead(bid,n,on);
    this.className = on ? "on" : "";
    this.innerHTML = icon("check",14)+" "+(on?"READ":"MARK AS READ");
  });
  if (RUNQ) renderQ();
  annotate(view);
}

/* quiz rendering */
function renderQ(){
  const body = document.getElementById("qbody"); if(!body || !RUNQ) return;
  const b = BOOK_BY_ID[RUNQ.bid], ch = chapterOf(b, RUNQ.n);
  if (RUNQ.done){ renderQDone(body); return; }
  const q = ch.quiz[RUNQ.i];
  /* rotate choice order deterministically per chapter+question so the authored
     answer index never becomes a tell; `why` stays bound to the question */
  const rot = (RUNQ.n * 3 + RUNQ.i) % 4;
  const order = [0,1,2,3].map(i => (i + rot) % 4);
  const aNew = order.indexOf(q.a);
  const dots = [0,1,2].map(i=>{
    let cl = "";
    if (RUNQ.log && RUNQ.log[i]!==undefined) cl = RUNQ.log[i] ? "ok" : "bad";
    else if (i===RUNQ.i) cl = "cur";
    return '<span class="'+cl+'"></span>';
  }).join("");
  body.innerHTML =
    '<div class="qprog">'+dots+'</div>'
    +'<p class="qq">'+esc(q.q)+'</p>'
    +'<div class="choices">'+order.map((oi,bi)=>
      '<button type="button" class="choice" data-i="'+bi+'"><span class="key">'+(bi+1)+'</span><span>'+esc(q.choices[oi])+'</span></button>'
    ).join("")+'</div>'
    +'<div id="qfeed"></div>';
  annotate(body);
  body.querySelectorAll(".choice").forEach(btn=>btn.addEventListener("click", ()=>pickQ(+btn.dataset.i, aNew)));
  RUNQ.locked = false;
}
function pickQ(i, aNew){
  if (!RUNQ || RUNQ.locked || RUNQ.done) return;
  const b = BOOK_BY_ID[RUNQ.bid], ch = chapterOf(b, RUNQ.n);
  const q = ch.quiz[RUNQ.i];
  RUNQ.locked = true;
  RUNQ.log = RUNQ.log || [];
  const right = i === aNew;
  RUNQ.log[RUNQ.i] = right;
  if (right) RUNQ.score++;
  const body = document.getElementById("qbody");
  body.querySelectorAll(".choice").forEach((btn,bi)=>{
    btn.disabled = true;
    if (bi===aNew) btn.classList.add("right");
    else if (bi===i) btn.classList.add("wrong");
    else btn.classList.add("dim");
  });
  document.getElementById("qfeed").innerHTML =
    '<div class="qwhy"><b>'+(right?"Correct.":"Not quite.")+'</b> '+esc(q.why)+'</div>'
    +'<div class="qnext"><button type="button" class="btn btn-green btn-sm" id="qgo">'+(RUNQ.i<2?"Continue":"See score")+' '+icon("arrow",15)+'</button></div>';
  document.getElementById("qgo").addEventListener("click", ()=>{
    if (RUNQ.i < 2){ RUNQ.i++; renderQ(); }
    else finishQuiz();
  });
  document.getElementById("qgo").focus();
}
function finishQuiz(){
  RUNQ.done = true;
  const key = RUNQ.bid+":"+RUNQ.n;
  const first = !(key in S.quiz);
  const perfect = RUNQ.score===3;
  S.quiz[key] = Math.max(S.quiz[key]||0, RUNQ.score);
  if (!isRead(RUNQ.bid, RUNQ.n)) setRead(RUNQ.bid, RUNQ.n, true);
  if (first) awardXp(15, bidLabel(RUNQ.bid,RUNQ.n)+" quiz");
  if (perfect) awardXp(5, "perfect quiz bonus");
  save();
  const body = document.getElementById("qbody");
  renderQDone(body);
  const rb = document.getElementById("readbtn");
  if (rb && isRead(RUNQ.bid, RUNQ.n)){
    rb.className = "on";
    rb.innerHTML = icon("check",14)+" READ";
  }
  updatePill();
}
function renderQDone(body){
  const b = BOOK_BY_ID[RUNQ.bid];
  const nx = nextChapter(RUNQ.bid, RUNQ.n);
  const sc = RUNQ.score;
  body.innerHTML =
    '<div class="qdone">'
    +'<span class="stamp '+(sc===3?"green":"blue")+' scorestamp">'+(sc===3?"FLAWLESS":"SCORE "+sc+"/3")+'</span>'
    +'<p class="scoreline">You scored <b>'+sc+' of 3</b> on '+esc(bidLabel(RUNQ.bid,RUNQ.n))+'.</p>'
    +'<p class="xpnote">'+icon("check",13)+' CHAPTER MARKED READ · QUIZ +15 XP'+(sc===3?' · PERFECT +5 XP':'')+'</p>'
    +'<div class="qactions">'
      +'<button type="button" class="btn btn-ghost btn-sm" id="qretake">Retake</button>'
      +'<a class="btn btn-ghost btn-sm" href="#/book/'+RUNQ.bid+'" data-nav>All '+esc(b.title)+' '+unitShort(b)+'</a>'
      +(nx?'<a class="btn btn-primary" href="#/chapter/'+nx.bid+'/'+nx.n+'" data-nav>Next: '+esc(bidLabel(nx.bid,nx.n))+' '+icon("arrow",15)+'</a>':'')
    +'</div></div>';
  body.querySelector("#qretake").addEventListener("click", ()=>{
    RUNQ = { i:0, score:0, locked:false, done:false, bid:RUNQ.bid, n:RUNQ.n };
    renderQ();
  });
}

/* ---- about ---- */
function viewAbout(){
  view.innerHTML =
  '<div class="wrap"><div class="about">'
  +'<p class="crumb" style="padding-top:26px">ABOUT &amp; SOURCES</p>'
  +'<h1 style="font-size:clamp(30px,4vw,44px);font-weight:900;text-transform:uppercase">The fine print</h1>'
  +'<h2>What this is</h2>'
  +'<p>Scripture Launchpad is a chapter-by-chapter study companion for the five standard works: pick a chapter, read a short original guide, take an easy three-question quiz, and keep your reading streak alive. It runs entirely in your browser as a student project.</p>'
  +'<h2>Content &amp; sources</h2>'
  +'<div class="src"><span class="sk">SCRIPTURE TEXT</span><p>Public domain — the King James Bible and LDS editions of the standard works. Short quotations appear with references. Read any chapter in full in the <a href="https://www.churchofjesuschrist.org/study?lang=eng" target="_blank" rel="noopener">Gospel Library</a>.</p></div>'
  +'<div class="src"><span class="sk">STUDY GUIDES &amp; QUIZZES</span><p>Original work written for this project, drafted with AI assistance and edited by the team. They summarize and quiz — they do not replace the text itself.</p></div>'
  +'<div class="src"><span class="sk">NOT AN OFFICIAL PUBLICATION</span><p>Not an official publication of The Church of Jesus Christ of Latter-day Saints. A student-built study aid.</p></div>'
  +'<h2>How it works</h2>'
  +'<ul>'
  +'<li><b>Read</b> — every guided chapter has a summary, context, key verses, and one takeaway.</li>'
  +'<li><b>Quiz</b> — 3 comprehension questions, auto-graded on the spot. +15 XP per chapter quiz, +5 for a flawless score.</li>'
  +'<li><b>Track</b> — marking a chapter read pays +10 XP. Clamps to 1 XP = 1 clip, spend clips on cosmetics in the shop. No shortcuts purchasable.</li>'
  +'<li><b>Terms</b> — orange-underlined gospel terms have plain-English definitions on hover; the weakest ones become your flashcard deck.</li>'
  +'</ul>'
  +'<h2>Privacy</h2>'
  +'<p>No accounts, no trackers, zero network calls after the page loads. All progress lives in your browser\'s localStorage. "Reset demo progress" in the footer wipes it.</p>'
  +'<h2>Credits</h2>'
  +'<p>Built by the SBLearn team — the second site on the same platform as the <a href="https://jarin.dev/CareerLaunchpad/" target="_blank" rel="noopener">IS Career Launchpad</a>.</p>'
  +'</div></div>';
}

function notFound(){
  view.innerHTML = '<div class="wrap"><section class="section"><div class="section-head"><h2>Lost page</h2></div><p>That route does not exist. <a href="#/" data-nav>Go home</a>.</p></section></div>';
}

/* ============ 10. ROUTER + KEYBOARD + TABBAR ============ */
function route(){
  const h = location.hash.replace(/^#\/?/, "");
  const p = h.split("/").filter(Boolean);
  RUNQ = null;
  hideTip();
  const modal = document.getElementById("modalroot");
  if (!modal.hidden) closeModal();
  const panel = document.getElementById("bzpanel");
  if (panel.classList.contains("open") && p[0]==="volumes") closeBz();
  if (p.length===0) viewHome();
  else if (p[0]==="volumes") viewVolumes();
  else if (p[0]==="volume" && p[1]) viewVolume(p[1]);
  else if (p[0]==="book" && p[1]) viewBook(p[1]);
  else if (p[0]==="chapter" && p[1] && p[2]) viewChapter(p[1], Math.max(1, parseInt(p[2],10)||1));
  else if (p[0]==="about") viewAbout();
  else notFound();
  markNav(p);
  const readTab = document.querySelector('#tabbar [data-tb="read"]');
  if (readTab){ const c = continueTarget(); readTab.href = "#/chapter/"+c.bid+"/"+c.n; }
  markTabbar();
  window.scrollTo(0,0);
}
function markNav(p){
  let key = "";
  if (p.length===0) key="home";
  else if (p[0]==="volumes"||p[0]==="volume") key="volumes";
  else if (p[0]==="about") key="about";
  document.querySelectorAll("#appnav a").forEach(a=>{
    a.classList.toggle("on", a.dataset.navkey===key);
  });
}
/* mobile tab bar */
function renderTabbar(){
  const c = continueTarget();
  const bar = document.getElementById("tabbar");
  bar.innerHTML =
    '<a class="tb" href="#/" data-nav data-tb="home"><span class="ti">'+icon("home")+'</span><span class="tl">Home</span></a>'
    +'<a class="tb" href="#/volumes" data-nav data-tb="volumes"><span class="ti">'+icon("grid")+'</span><span class="tl">Volumes</span></a>'
    +'<a class="tb" href="#/chapter/'+c.bid+'/'+c.n+'" data-nav data-tb="read"><span class="ti">'+icon("book")+'</span><span class="tl">Read</span></a>'
    +'<button class="tb" type="button" data-tb="terms"><span class="ti"><span class="tbadge" style="display:none">0</span>'+icon("quote")+'</span><span class="tl">Terms</span></button>'
    +'<button class="tb" type="button" data-tb="you"><span class="ti">'+icon("user")+'</span><span class="tl">You</span></button>';
  bar.querySelectorAll("button[data-tb]").forEach(b=>b.addEventListener("click", ()=>{
    if (b.dataset.tb==="terms"){
      const p = document.getElementById("bzpanel");
      if (p.classList.contains("open")) closeBz(); else { renderBzPanel(); markTabbar(); }
    } else if (b.dataset.tb==="you"){ openModal(); }
  }));
  renderBzTabCount();
}
function markTabbar(){
  const h = location.hash;
  const p = h.replace(/^#\/?/, "").split("/").filter(Boolean);
  let key = "";
  if (p.length===0) key="home";
  else if (p[0]==="volumes"||p[0]==="volume") key="volumes";
  else if (p[0]==="book"||p[0]==="chapter") key="read";
  const panelOpen = document.getElementById("bzpanel").classList.contains("open");
  document.querySelectorAll("#tabbar .tb").forEach(t=>{
    t.classList.toggle("on", (t.dataset.tb===key) || (t.dataset.tb==="terms" && panelOpen));
  });
}
document.addEventListener("keydown", e=>{
  const tag = (e.target && e.target.tagName) || "";
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag) || (e.target && e.target.isContentEditable)) return;
  if (!RUNQ || RUNQ.done) return;
  const body = document.getElementById("qbody"); if(!body) return;
  if (/^[1-4]$/.test(e.key)){
    const btns = body.querySelectorAll(".choice:not([disabled])");
    const b = btns[+e.key-1];
    if (b){ b.click(); e.preventDefault(); }
  } else if (e.key==="Enter"){
    const go = document.getElementById("qgo");
    if (go){ go.click(); e.preventDefault(); }
  }
});
document.getElementById("resetlink").addEventListener("click", e=>{
  e.preventDefault();
  if (confirm("Reset all Scripture Launchpad progress on this device?")){
    localStorage.removeItem(KEY);
    location.hash = "#/";
    location.reload();
  }
});
window.addEventListener("hashchange", route);

/* boot */
applyCosmetics();
renderTabbar();
updatePill();
renderBzTabCount();
route();

})();
