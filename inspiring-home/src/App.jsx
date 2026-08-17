import { useEffect, useMemo, useState } from "react";

const A = "/assets/source/";
const stories = [
  { title: "Leading from the kitchen", author: "Mar Castagno", company: "FREELANCE", avatar: "41315a8c0fe268fd" },
  { title: "Doing it right even when no one sees it", author: "Marcos Llerena", company: "MANDARINA", avatar: "f99e0d201b180988" },
  { title: "Inventing a new language", author: "Wesly Haar, ter", company: "MONKS", avatar: "180c6781a625fcd2" },
  { title: "The phone call I didn't expect", author: "Liva Grinberga", company: "NOT ON SALE", image: "c0681761e2ea0f72.gif", avatar: "af1427a2440b9dbe" },
  { title: "Three stories about momentum, roles and failure", author: "Fernando Vega Olmos", company: "ANITA & VEGA", image: "9c98e88623e1a5fd.gif", avatar: "c1b927002c9152c6" },
  { title: "When criteria became community", author: "Daniel Perez Pinazo", company: "AWWWARDS", image: "39a46c56fb466141.jpg", avatar: "bf18a513f093c36f" },
  { title: "Making do with what you have", author: "Belen González Martínez", company: "PAISANOS", image: "fd76e1a4de66a527.png", avatar: "b8c889b80cff8aa5" },
  { title: "Daring to play in another league", author: "Alejandro Lazos", company: "SOUTHMATES STUDIO", image: "c6aba6aa27dd9f5b.jpg", avatar: "428f990d12299f4c" },
  { title: "Calm is also a way of leading", author: "Hernan Puente", company: "INDICIUS", image: "0b9ae87cfe958df1.gif", avatar: "f692399816799ebf" },
  { title: "Building what is possible", author: "Lucas Davison", company: "DHNN", image: "270298ae4df7d79a.jpeg", avatar: "ea33acc3cf4e6d5f" },
  { title: "Community as a driving force", author: "Alan Buscaglia", company: "GENTLEMAN PROGRAMMING", image: "bf684bce90f0a92d.gif", avatar: "b2bce306c79a4c6f" },
  { title: "Technology is not enough", author: "Lucas Llorente", company: "ZETENTA", image: "135485fbfc331a08.jpg", avatar: "86bf2312b8a36314" },
];

function Logo({ dark = false, onClick }) {
  return <button className={`logo ${dark ? "dark" : ""}`} aria-label="Home" onClick={onClick}><i>/</i>nk</button>;
}

function StoryCard({ story, index, onOpen }) {
  return <button className={`story-card story-${index}`} onClick={() => onOpen(story)}>
    {story.image && <img className="story-cover" src={A + story.image} alt="" />}
    <h3>{story.title}</h3>
    <div className="author-row"><img src={A + story.avatar} alt="" /><span>{story.author}<small>{story.company}</small></span></div>
  </button>;
}

function DetailsPanel({ story, onClose }) {
  if (!story) return null;
  return <div className="panel-wrap" role="dialog" aria-modal="true" aria-label={story.title}>
    <button className="panel-close" onClick={onClose} aria-label="Close">×</button>
    <article className="detail-panel">
      <div className="detail-top"><span>ENG⌄</span></div>
      <h2>{story.title}</h2>
      <div className="detail-author"><img src={A + story.avatar} alt="" /><div>{story.author}<small>CREATIVE LEADERSHIP AT {story.company}</small></div></div>
      <p className="eyebrow">INTRODUCTION</p>
      <p className="lead">I almost didn't become a designer. Not because I lacked the talent or the drive, but because I was 18 years old, standing outside a restaurant in London on my first day of work, completely overwhelmed.</p>
      <p className="eyebrow">DISCOVER {story.author.split(" ")[0].toUpperCase()}’S STORY</p>
      <p>I had just left home to study Graphic Design in one of the most demanding cities in the world. To survive there, I needed a job. So there I was, thinking: why am I doing this?</p>
      <p>Inspiration rarely arrives as a grand gesture. Sometimes it is a pointed question, a difficult morning, or the choice to stay. Those moments become part of the way we later lead, support, and challenge others.</p>
    </article>
  </div>;
}

function SharePanel({ onClose }) {
  return <div className="panel-wrap" role="dialog" aria-modal="true" aria-label="Share your story of inspiration">
    <button className="panel-close" onClick={onClose} aria-label="Close">×</button>
    <form className="share-panel" onSubmit={(e) => e.preventDefault()}>
      <h2>Share your <u>story</u><br />of inspiration</h2>
      <p>A moment, a person, or a decision that stayed with you.<br />If you have one, you can share it here.</p>
      <div className="form-label">— &nbsp; YOU CAN SHARE IT BELOW</div>
      <div className="form-grid"><input placeholder="Your name*   eg: Leo Messi" /><input placeholder="Your email*   eg: leo@goat" /><input placeholder="Company*   eg: GOAT Inc." /><input placeholder="Where are you writing from?*" /></div>
      <textarea placeholder="Start writing your story...   A moment, a person, or a turning point that stayed with you." />
      <div className="form-foot"><label><input type="checkbox" /> By sharing your story, you agree to our <u>Terms</u> & <u>Privacy Policy</u>.</label><button type="submit">↗ &nbsp; SEND</button></div>
    </form>
  </div>;
}

function MobileMenu({ onClose, onHome, onShare }) {
  return <nav className="mobile-menu" aria-label="Menu"><Logo dark onClick={onHome} /><button className="menu-close" onClick={onClose} aria-label="Close">×</button><p>— &nbsp; MENU</p><button onClick={onHome}>Home</button><button onClick={onShare}>Share your<br/>inspiration</button><a href="#manifesto">Manifesto</a><a href="https://www.nk.studio">Visit us</a><a href="#credits">Credits</a><div className="langs"><b>ENG</b><span>ESP</span></div></nav>;
}

export function App() {
  const [view, setView] = useState("hero");
  const [story, setStory] = useState(null);
  const [share, setShare] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") { setStory(null); setShare(false); setMenu(false); } };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, []);

  const starDots = useMemo(() => Array.from({ length: 24 }, (_, i) => ({ left: `${(i * 43) % 97}%`, top: `${(i * 71) % 93}%`, animationDelay: `${(i % 7) * -.8}s` })), []);
  const goHome = () => { setView("hero"); setStory(null); setShare(false); setMenu(false); };
  const moveHeroLayers = (event) => {
    if (event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    const y = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
    const hero = event.currentTarget.style;
    hero.setProperty("--hero-rotate-x", `${y * -6.5}deg`);
    hero.setProperty("--hero-rotate-y", `${x * 8}deg`);
  };
  const resetHeroLayers = (event) => {
    ["--hero-rotate-x", "--hero-rotate-y"]
      .forEach((property) => event.currentTarget.style.removeProperty(property));
  };

  return <main className={`site ${view}`}>
    <div className="space-bg" aria-hidden="true">{starDots.map((d,i)=><i key={i} style={d}/>)}</div>
    <header><Logo onClick={goHome} />{view === "archive" && <button className="anniversary" onClick={goHome}>20 years inspired by people ©</button>}<button className="language">ENG⌄</button></header>
    {view === "hero" ? <section className="hero-screen" onPointerMove={moveHeroLayers} onPointerLeave={resetHeroLayers}><div className="hero-copy"><p className="since hero-layer hero-layer--since">SINCE 2006</p><h1 className="hero-layer hero-layer--title">Before we <u>inspired</u> others,<br/>we were <u>inspired</u>.</h1><p className="intro hero-layer hero-layer--intro">We’re celebrating 20 years by inviting colleagues, friends, clients and industry<br className="desktop"/> voices who inspired us to share what once inspired them.</p><button className="explore hero-layer hero-layer--cta" onClick={() => setView("archive")}>Explore the inspiration archive</button></div></section> : <section className="archive-screen">
      <div className="card-field">{stories.map((s,i)=><StoryCard key={s.title} story={s} index={i} onOpen={setStory}/>)}</div><div className="swipe">ↄ <b>SWIPE TO EXPLORE</b></div>
      <footer><div className="sound"><span>〰</span> ON</div><nav><button onClick={goHome}>/ Home</button><a href="#manifesto">Manifesto</a><a href="#credits">Credits</a><a href="https://www.nk.studio">Visit us</a><button className="share-btn" onClick={()=>setShare(true)}>Share your inspiration</button></nav><div className="sparks"><i/> YOUR SPARKS <b>0/33</b></div></footer>
    </section>}
    <button className="hamburger" aria-label="hamburger menu" onClick={()=>setMenu(true)}><span/><span/></button>
    {menu && <MobileMenu onClose={()=>setMenu(false)} onHome={goHome} onShare={()=>{setMenu(false);setShare(true)}}/>}
    {(story || share) && <div className="backdrop" onClick={()=>{setStory(null);setShare(false)}}/>}
    <DetailsPanel story={story} onClose={()=>setStory(null)} />{share && <SharePanel onClose={()=>setShare(false)} />}
    <div className="cursor-dot" aria-hidden="true" />
  </main>;
}
