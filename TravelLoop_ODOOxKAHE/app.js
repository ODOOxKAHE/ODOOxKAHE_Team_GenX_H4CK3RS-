// Traveloop SPA - Core Application
const NAV_ITEMS = [
  {id:'explore',label:'Explore',icon:'🌍'},
  {id:'trips',label:'My Trips',icon:'✈️'},
  {id:'plan',label:'Plan Trip',icon:'📋'},
  {id:'budget',label:'Budget',icon:'💰'},
  {id:'community',label:'Community',icon:'👥'},
  {id:'profile',label:'Profile',icon:'👤'}
];

let currentPage = 'explore';

// Login handler
document.getElementById('loginForm').addEventListener('submit', e => {
  e.preventDefault();
  document.getElementById('login-page').style.display = 'none';
  document.getElementById('app-shell').style.display = 'block';
  buildNav();
  navigate('explore');
});

// Nav scroll effect
window.addEventListener('scroll', () => {
  const nav = document.getElementById('mainNav');
  if(nav) nav.classList.toggle('scrolled', window.scrollY > 10);
});

function buildNav() {
  const nl = document.getElementById('navLinks');
  nl.innerHTML = NAV_ITEMS.map(n =>
    `<a class="nav-link" data-page="${n.id}" onclick="navigate('${n.id}')">${n.label}</a>`
  ).join('');
}

function navigate(page) {
  currentPage = page;
  document.querySelectorAll('.nav-link').forEach(l =>
    l.classList.toggle('active', l.dataset.page === page)
  );
  const c = document.getElementById('appContent');
  c.innerHTML = pages[page] ? pages[page]() : pages.explore();
  window.scrollTo({top: 0, behavior: 'smooth'});
  if(page === 'budget') setTimeout(drawChart, 100);
}

function drawChart() {
  const canvas = document.getElementById('budgetCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const data = [{v:35,c:'#0f172a'},{v:25,c:'#0d9488'},{v:20,c:'#fb7185'},{v:12,c:'#6366f1'},{v:8,c:'#f59e0b'}];
  let start = -Math.PI/2;
  data.forEach(d => {
    const angle = (d.v/100)*2*Math.PI;
    ctx.beginPath(); ctx.arc(100,100,80,start,start+angle);
    ctx.lineTo(100,100); ctx.fillStyle=d.c; ctx.fill();
    start += angle;
  });
  ctx.beginPath(); ctx.arc(100,100,55,0,2*Math.PI);
  ctx.fillStyle='#fff'; ctx.fill();
}

const IC = {
  map:`<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="7" r="3"/><path d="M9 17s-6-5.5-6-10a6 6 0 0112 0c0 4.5-6 10-6 10z"/></svg>`,
  cal:`<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="12" height="12" rx="2"/><path d="M2 7h12M5 1v4M11 1v4"/></svg>`,
  star:`<svg width="14" height="14" fill="#f59e0b" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01z"/></svg>`,
};

const pages = {};

pages.explore = () => `
<section class="hero">
  <div class="container hero-content">
    <h1>Discover the Heart of <span>South India</span></h1>
    <p>From the historic temples of Tamil Nadu to the pristine peaks of Sikkim, start your journey here.</p>
    <div class="hero-actions">
      <button class="btn btn-cta" onclick="navigate('plan')">Plan a Trip</button>
      <button class="btn btn-secondary" style="color:white;border-color:rgba(255,255,255,.4)" onclick="navigate('explore')">Watch Video</button>
    </div>
    <div class="hero-stats">
      <div><div class="hero-stat-value">2,500+</div><div class="hero-stat-label">Destinations</div></div>
      <div><div class="hero-stat-value">50K+</div><div class="hero-stat-label">Happy Travelers</div></div>
      <div><div class="hero-stat-value">4.9</div><div class="hero-stat-label">User Rating</div></div>
    </div>
  </div>
</section>
<section class="section"><div class="container">
  <div class="section-header"><h2>Best Offers for You</h2><p>Exclusive deals curated for your next adventure.</p></div>
  <div class="grid grid-3">
    <div class="offer-card"><h4>Flat 15% OFF on Indigo</h4><p>Use Code: TRAVELOOP15</p><div class="chip chip-teal" style="margin-top:12px">Limited Time</div></div>
    <div class="offer-card" style="--before-bg:var(--accent)"><h4>Book 2 Nights, Get 1 Free</h4><p>On Heritage Stays across India</p><div class="chip chip-coral" style="margin-top:12px">Popular</div></div>
    <div class="offer-card"><h4>₹2,000 Cashback on HDFC</h4><p>Valid on International Trips</p><div class="chip chip-navy" style="margin-top:12px">Bank Offer</div></div>
  </div>
</div></section>
<section class="section" style="background:var(--surface-container)"><div class="container">
  <div class="section-header"><h2>Top Regional Selections</h2><p>Curated destinations for your next escape.</p></div>
  <div class="grid grid-4">
    ${[
      {n:'Mylapore, Chennai',t:'Culture & Heritage',img:'images/chennai.png'},
      {n:'Sikkim Silk Route',t:'Mountain Adventure',img:'images/sikkim.png'},
      {n:'Munnar, Kerala',t:'Tea Plantations',img:'images/kerala.png'},
      {n:'Maldives',t:'Tropical Paradise',img:'images/maldives.png'}
    ].map(d=>`<div class="dest-card" onclick="navigate('plan')"><img src="${d.img}" alt="${d.n}"><div class="dest-card-overlay"><span>${d.t}</span><h3>${d.n}</h3></div></div>`).join('')}
  </div>
</div></section>
<section class="section"><div class="container">
  <div class="section-header"><h2>Trending Packages</h2><p>Top-rated itineraries loved by our community.</p></div>
  <div class="grid grid-3">
    ${[
      {n:'The Himalayan Odyssey',d:'7 Days • Sikkim & Darjeeling',p:'₹32,500',img:'images/sikkim.png',tags:['Hotels','Sightseeing','Transfers']},
      {n:'Chennai Heritage Walk',d:'2 Days • Tamil Nadu',p:'₹8,900',img:'images/chennai.png',tags:['Guide','Breakfast']},
      {n:'Kerala Backwaters',d:'5 Days • Alleppey & Munnar',p:'₹24,000',img:'images/kerala.png',tags:['Resort','Houseboat']}
    ].map(t=>`<div class="trip-card" onclick="navigate('plan')">
      <div class="trip-card-img"><img src="${t.img}" alt="${t.n}"></div>
      <div class="trip-card-body">
        <h3>${t.n}</h3><p>${t.d}</p>
        <div style="display:flex;gap:6px;margin:12px 0;flex-wrap:wrap">${t.tags.map(tg=>`<span class="chip chip-teal">${tg}</span>`).join('')}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
          <span style="font-size:20px;font-weight:800;color:var(--secondary)">${t.p}</span>
          <span style="display:flex;gap:2px">${IC.star.repeat(5)}</span>
        </div>
      </div>
    </div>`).join('')}
  </div>
</div></section>`;

pages.trips = () => `<section class="section"><div class="container">
  <div class="section-header"><h2>My Adventures</h2><p>Track all your journeys in one place.</p></div>
  <h3 style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--secondary);margin-bottom:20px">● Ongoing</h3>
  <div class="grid grid-3" style="margin-bottom:48px">
    <div class="trip-card"><div class="trip-card-img"><img src="images/jaipur.png" alt="Jaipur"><span class="trip-card-badge badge-ongoing">Ongoing</span></div>
    <div class="trip-card-body"><h3>North India Adventure</h3><p>Exploring the mystical landscapes of Rajasthan and the Golden Triangle. Currently in Jaipur.</p>
    <div class="progress-bar" style="margin-top:12px"><div class="progress-fill" style="width:65%"></div></div>
    <span class="label-sm" style="color:var(--outline);margin-top:6px;display:block">65% Complete</span></div></div>
  </div>
  <h3 style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--accent);margin-bottom:20px">◆ Upcoming</h3>
  <div class="grid grid-3" style="margin-bottom:48px">
    <div class="trip-card"><div class="trip-card-img"><img src="images/sikkim.png" alt="Sikkim"><span class="trip-card-badge badge-upcoming">Upcoming</span></div>
    <div class="trip-card-body"><h3>Sikkim Silk Route</h3><p>Dec 15 - Dec 22, 2024</p></div></div>
    <div class="trip-card"><div class="trip-card-img"><img src="images/chennai.png" alt="Chennai"><span class="trip-card-badge badge-upcoming">Upcoming</span></div>
    <div class="trip-card-body"><h3>Chennai Cultural Weekend</h3><p>Jan 5 - Jan 7, 2025</p></div></div>
    <div class="trip-card" style="border:2px dashed var(--outline-variant);box-shadow:none;display:flex;align-items:center;justify-content:center;min-height:280px;cursor:pointer" onclick="navigate('plan')">
    <div style="text-align:center;padding:20px"><div style="font-size:40px;margin-bottom:12px">+</div><h3>New Adventure</h3><p style="color:var(--on-surface-variant);font-size:13px">Plan your next trip</p></div></div>
  </div>
  <h3 style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--outline);margin-bottom:20px">✓ Completed</h3>
  <div class="grid grid-3">
    <div class="trip-card" style="opacity:.8"><div class="trip-card-img"><img src="images/chennai.png" alt="Agra"><span class="trip-card-badge badge-completed">Completed</span></div>
    <div class="trip-card-body"><h3>Heritage of Agra</h3><p>Completed Aug 2024</p></div></div>
    <div class="trip-card" style="opacity:.8"><div class="trip-card-img"><img src="images/maldives.png" alt="Mumbai"><span class="trip-card-badge badge-completed">Completed</span></div>
    <div class="trip-card-body"><h3>Gateway City Mumbai</h3><p>Completed June 2024</p></div></div>
  </div>
</div></section>`;

pages.plan = () => `<section class="section"><div class="container">
  <div class="section-header"><h2>Plan a New Trip</h2><p>Your next adventure begins with a single step. Let's map it out.</p></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px">
    <div>
      <div class="card" style="padding:32px;margin-bottom:24px">
        <h3 class="headline-md" style="margin-bottom:24px">Trip Details</h3>
        <div class="input-group" style="margin-bottom:20px"><label class="input-label">Destination</label><input class="input" placeholder="Where to?" value="Chennai, India"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
          <div class="input-group"><label class="input-label">Start Date</label><input class="input" type="date" value="2024-10-15"></div>
          <div class="input-group"><label class="input-label">End Date</label><input class="input" type="date" value="2024-10-20"></div>
        </div>
        <div class="input-group" style="margin-bottom:20px"><label class="input-label">Travelers</label>
          <select class="input"><option>2 Adults</option><option>1 Adult</option><option>3 Adults</option><option>Family (2+2)</option></select>
        </div>
        <div class="input-group" style="margin-bottom:24px"><label class="input-label">Budget Range</label>
          <select class="input"><option>₹15,000 - ₹30,000</option><option>₹30,000 - ₹50,000</option><option>₹50,000+</option></select>
        </div>
        <button class="btn btn-cta" style="width:100%;justify-content:center">Generate Itinerary ✨</button>
      </div>
      <div class="card" style="padding:24px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">${IC.map}<span class="label-sm" style="color:var(--secondary)">AI TIP</span></div>
        <p class="body-md">Traveling to Chennai in October? It's the perfect weather for Marina Beach sunsets and temple visits.</p>
      </div>
    </div>
    <div>
      <h3 class="headline-md" style="margin-bottom:20px">Suggestions for Chennai</h3>
      ${[
        {n:'Marina Beach Walk',d:"World's second longest urban beach, perfect for evening strolls and street food.",t:'Beach'},
        {n:'Kapaleeshwarar Temple',d:'A masterpiece of Dravidian architecture dedicated to Lord Shiva.',t:'Heritage'},
        {n:'DakshinaChitra Museum',d:'Living-history museum exhibiting South Indian heritage and lifestyles.',t:'Culture'}
      ].map(s=>`<div class="card" style="padding:20px;margin-bottom:16px;cursor:pointer">
        <div style="display:flex;justify-content:space-between;align-items:start">
          <div><h4 style="font-weight:700;margin-bottom:4px">${s.n}</h4><p style="font-size:13px;color:var(--on-surface-variant);line-height:1.5">${s.d}</p></div>
          <span class="chip chip-teal">${s.t}</span>
        </div></div>`).join('')}
      <div class="dest-card" style="margin-top:24px;height:220px"><img src="images/chennai.png" alt="Chennai">
        <div class="dest-card-overlay"><span>Your destination</span><h3>Chennai, Tamil Nadu</h3></div>
      </div>
    </div>
  </div>
</div></section>`;

pages.budget = () => `<section class="section"><div class="container">
  <div class="section-header"><h2>Trip Budget</h2><p>Financial breakdown and smart optimization for your Hawaiian getaway.</p></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px">
    <div>
      <div class="card" style="padding:32px;text-align:center;margin-bottom:24px">
        <h3 style="font-size:14px;font-weight:600;color:var(--on-surface-variant);margin-bottom:20px">TOTAL BUDGET</h3>
        <div class="budget-ring"><canvas id="budgetCanvas" width="200" height="200"></canvas>
          <div class="budget-center"><div class="amount">$2,460</div><div class="label">of $3,000</div></div>
        </div>
        <div class="progress-bar" style="margin-top:24px"><div class="progress-fill" style="width:82%"></div></div>
        <p style="font-size:13px;color:var(--on-surface-variant);margin-top:8px">82% of budget used • $540 remaining</p>
      </div>
      <div class="grid grid-2">
        ${[{l:'Flights',v:'$850',c:'var(--primary)',p:'35%'},{l:'Hotels',v:'$620',c:'var(--secondary)',p:'25%'},{l:'Food',v:'$480',c:'var(--accent)',p:'20%'},{l:'Activities',v:'$510',c:'#6366f1',p:'20%'}].map(i=>
          `<div class="stat-card"><div style="display:flex;justify-content:space-between;align-items:center"><span class="label-sm">${i.l}</span><span style="width:10px;height:10px;border-radius:50%;background:${i.c}"></span></div>
          <div class="stat-value" style="font-size:22px;margin-top:8px">${i.v}</div><span class="label-sm" style="color:var(--outline)">${i.p}</span></div>`
        ).join('')}
      </div>
    </div>
    <div>
      <div class="card" style="padding:24px;margin-bottom:24px;background:linear-gradient(135deg,rgba(13,148,136,.06),rgba(13,148,136,.02))">
        <div class="chip chip-teal" style="margin-bottom:12px">💡 Student Benefits</div>
        <p class="body-md">Your ISIC card saved you <strong>$240</strong> on round-trip flights to Honolulu.</p>
      </div>
      <div class="card" style="padding:24px;margin-bottom:24px">
        <div class="chip chip-coral" style="margin-bottom:12px">🎟️ Museum Perks</div>
        <p class="body-md">Free entries to Bishop Museum and Pearl Harbor Memorial via the Culture Pass.</p>
      </div>
      <div class="card" style="padding:24px">
        <h3 style="font-weight:700;margin-bottom:16px">Recent Adjustments</h3>
        ${[{t:'Sarah added Helicopter Tour',d:'2 hours ago',a:'+$180'},{t:'Budget limit updated',d:'Yesterday',a:'$3,000'},{t:'Hotel discount applied',d:'3 days ago',a:'-$85'}].map(r=>
          `<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--surface-container)">
            <div><p style="font-size:14px;font-weight:500">${r.t}</p><span class="label-sm" style="color:var(--outline)">${r.d}</span></div>
            <span style="font-weight:700;color:${r.a.startsWith('+')?'var(--accent)':r.a.startsWith('-')?'var(--secondary)':'var(--primary)'}">${r.a}</span>
          </div>`).join('')}
      </div>
    </div>
  </div>
</div></section>`;

pages.community = () => `<section class="section"><div class="container">
  <div class="section-header"><h2>Discover Journeys</h2><p>Explore authentic journeys shared by our community of wanderers.</p></div>
  <div class="grid grid-3">
    ${[
      {n:'Alleppey Backwaters',u:'@amara_travels',img:'images/kerala.png',l:'Kerala',likes:342},
      {n:'Maafushi Retreat',u:'@island_hopper',img:'images/maldives.png',l:'Maldives',likes:518},
      {n:'Jaipur Heritage',u:'@royal_wanderer',img:'images/jaipur.png',l:'Rajasthan',likes:267},
      {n:'Sikkim Valley Trek',u:'@mountain_soul',img:'images/sikkim.png',l:'Sikkim',likes:189},
      {n:'Chennai Temples',u:'@culture_seeker',img:'images/chennai.png',l:'Tamil Nadu',likes:156},
      {n:'Beach Paradise',u:'@sunset_chaser',img:'images/hero.png',l:'Coastal',likes:423}
    ].map(c=>`<div class="community-card">
      <img src="${c.img}" alt="${c.n}">
      <div class="community-card-body">
        <h4>${c.n}</h4>
        <p>${c.l} • Shared by ${c.u}</p>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
          <span style="font-size:13px;color:var(--outline)">❤️ ${c.likes} likes</span>
          <button class="btn btn-sm btn-secondary" style="padding:4px 12px;font-size:12px">Save</button>
        </div>
      </div>
    </div>`).join('')}
  </div>
  <div class="card" style="padding:40px;text-align:center;margin-top:48px;background:linear-gradient(135deg,rgba(13,148,136,.05),rgba(251,113,133,.05))">
    <h3 class="headline-md" style="margin-bottom:8px">Plan your dream journey with friends</h3>
    <p class="body-md" style="color:var(--on-surface-variant);max-width:500px;margin:0 auto 24px">Add trips to a collaborative board and invite companions to vote, comment, and build the perfect itinerary.</p>
    <button class="btn btn-cta" onclick="navigate('plan')">Start Planning Together</button>
  </div>
</div></section>`;

pages.social = () => `<section class="section"><div class="container">
  <div class="section-header"><h2>Social Journeys</h2><p>Connect with fellow travelers and share experiences.</p></div>
  <div class="grid grid-2">
    <div class="card" style="padding:24px">
      <h3 style="font-weight:700;margin-bottom:20px">Trending Discussions</h3>
      ${['Best hidden gems in Kerala?','Budget tips for Rajasthan','Solo travel safety in India','Photography spots in Sikkim'].map((t,i)=>
        `<div style="padding:14px 0;border-bottom:1px solid var(--surface-container);cursor:pointer">
          <h4 style="font-size:15px;font-weight:600">${t}</h4>
          <div style="display:flex;gap:12px;margin-top:6px">
            <span class="label-sm" style="color:var(--outline)">${12+i*7} replies</span>
            <span class="label-sm" style="color:var(--secondary)">${3+i} hours ago</span>
          </div>
        </div>`).join('')}
    </div>
    <div class="card" style="padding:24px">
      <h3 style="font-weight:700;margin-bottom:20px">Top Travelers This Month</h3>
      ${['Amara Travels','Island Hopper','Mountain Soul','Culture Seeker','Sunset Chaser'].map((n,i)=>
        `<div style="display:flex;align-items:center;gap:14px;padding:12px 0;border-bottom:1px solid var(--surface-container)">
          <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,${['#0d9488','#fb7185','#6366f1','#f59e0b','#0f172a'][i]},${['#34d399','#f43f5e','#818cf8','#fbbf24','#334155'][i]});display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:14px">${n[0]}</div>
          <div><p style="font-weight:600;font-size:14px">${n}</p><span class="label-sm" style="color:var(--outline)">${[48,35,29,22,18][i]} trips shared</span></div>
          <span style="margin-left:auto;font-weight:700;color:var(--secondary)">#${i+1}</span>
        </div>`).join('')}
    </div>
  </div>
</div></section>`;

pages.discussion = () => pages.social();

pages.profile = () => `<section class="section"><div class="container">
  <div class="card" style="padding:40px;margin-bottom:32px">
    <div style="display:flex;align-items:center;gap:24px">
      <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,var(--secondary),var(--accent));display:flex;align-items:center;justify-content:center;color:white;font-size:28px;font-weight:800">AT</div>
      <div>
        <h2 class="headline-md">Arun Traveler</h2>
        <p class="body-md" style="color:var(--on-surface-variant)">Explorer since 2022 • 12 trips completed</p>
        <div style="display:flex;gap:8px;margin-top:8px">
          <span class="chip chip-teal">✈️ Globe Trotter</span>
          <span class="chip chip-coral">📸 Storyteller</span>
        </div>
      </div>
      <button class="btn btn-secondary" style="margin-left:auto">Edit Profile</button>
    </div>
  </div>
  <div class="grid grid-3">
    <div class="stat-card"><div class="stat-icon" style="background:rgba(13,148,136,.1);color:var(--secondary)">✈️</div><div class="stat-value">12</div><div class="stat-label">Trips Completed</div></div>
    <div class="stat-card"><div class="stat-icon" style="background:rgba(251,113,133,.1);color:var(--accent)">🌍</div><div class="stat-value">8</div><div class="stat-label">Countries Visited</div></div>
    <div class="stat-card"><div class="stat-icon" style="background:rgba(99,102,241,.1);color:#6366f1">📸</div><div class="stat-value">247</div><div class="stat-label">Photos Shared</div></div>
  </div>
  <div style="margin-top:40px"><div class="section-header"><h2>Travel Memories</h2></div>
    <div class="grid grid-3">
      ${[{n:'Misty Kodaikanal',d:'4 Days • Aug 2023',img:'images/kerala.png'},{n:'Chennai Cultural Weekend',d:'2 Days • June 2023',img:'images/chennai.png'},{n:'Kanyakumari Odyssey',d:'5 Days • Jan 2023',img:'images/hero.png'}].map(m=>
        `<div class="trip-card"><div class="trip-card-img"><img src="${m.img}" alt="${m.n}"><span class="trip-card-badge badge-completed">Memory</span></div>
        <div class="trip-card-body"><h3>${m.n}</h3><p>${m.d}</p></div></div>`).join('')}
    </div>
  </div>
  <div style="margin-top:32px;text-align:center">
    <button class="btn btn-ghost" style="color:var(--error)" onclick="document.getElementById('app-shell').style.display='none';document.getElementById('login-page').style.display='grid'">Sign Out</button>
  </div>
</div></section>`;
