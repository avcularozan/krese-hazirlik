/* ================= KABUK ================= */
const app=document.getElementById("app"), navEl=document.getElementById("nav");
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const ICONS={
 bugun:'<path d="M3 12h3l2.5-7 4 14L15 9l2 3h4"/>',
 gelisim:'<path d="M4 19V5m0 14h16M8 19v-6m4 6V9m4 10v-4"/>',
 etkinlik:'<path d="M12 3l2.4 5 5.6.7-4 3.9 1 5.4-5-2.7-5 2.7 1-5.4-4-3.9 5.6-.7z"/>',
 rapor:'<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h4"/>',
 profil:'<circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6"/>'};
const TABS=[["bugun","Bugün"],["gelisim","Gelişim"],["etkinlik","Etkinlikler"],["rapor","Raporlar"],["profil","Profil"]];

function header(eyebrow,title,right=""){
  const initial=S.child?S.child.nickname.trim().charAt(0).toLocaleUpperCase("tr"):"?";
  return `<div class="hdr"><div class="avatar">${esc(initial)}</div>
    <div style="flex:1;min-width:0"><div class="eyebrow">${esc(eyebrow)}</div><h1>${esc(title)}</h1></div>${right}</div>`;
}
function renderNav(){
  navEl.innerHTML=TABS.map(([k,t])=>`<button data-nav="${k}" ${view===k?'aria-current="page"':""}>
    <svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[k]}</svg>${t}</button>`).join("");
  navEl.parentElement.classList.toggle("hide",!S.child);
}
function render(){
  if(!S.child){app.innerHTML=viewOnboard();renderNav();window.scrollTo(0,0);return}
  app.innerHTML=({bugun:viewToday,gelisim:viewGelisim,etkinlik:viewEtkinlik,rapor:viewRapor,profil:viewProfil}[view])();
  renderNav(); bindChartHover();
}
function go(v){view=v;render();window.scrollTo(0,0)}
function emptyState(text,cta=""){
  return `<div class="empty"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16v13H4z"/><path d="M4 7l2-3h12l2 3M9 12h6"/></svg>
    <div>${esc(text)}</div>${cta}</div>`;
}

/* ================= ONBOARDING (3 adım) ================= */
function viewOnboard(){
  const d=tmp.ob||(tmp.ob={step:1,nickname:"",birthDate:"",startDate:iso(TODAY),group:"",prev:"",hours:"",focusAreas:[]});
  const bar=`<div class="row" style="gap:6px;margin-bottom:18px">${[1,2,3].map(i=>
    `<div class="bar" style="height:5px"><i style="width:${d.step>=i?100:0}%"></i></div>`).join("")}</div>`;
  const head=`<div class="hdr"><div style="flex:1"><div class="eyebrow">Kreşe Hazırlık · ${d.step}/3</div>
    <h1>${d.step===1?"Çocuğunuzu tanıyalım":d.step===2?"Okul bilgileri":"Neyi izlemek istersiniz?"}</h1></div></div>`;

  if(d.step===1) return head+bar+`<div class="stack">
    <div class="callout">Bu uygulama çocukları birbiriyle karşılaştırmaz, tanı koymaz. Amacı çocuğunuzun <b>kendi içindeki</b> değişimi zaman içinde görmenize yardımcı olmak.</div>
    <div class="card stack">
      <div><label class="fld" for="ob-name">Adı veya takma adı</label>
        <input id="ob-name" type="text" placeholder="Örn. Ada ya da “Minik”" value="${esc(d.nickname)}" autocomplete="off"></div>
      <div class="tiny">Gerçek adı yerine takma ad kullanabilirsiniz. Fotoğraf istemiyoruz.</div>
      <div><label class="fld" for="ob-bd">Doğum tarihi</label><input id="ob-bd" type="date" value="${d.birthDate}" max="${iso(TODAY)}"></div>
      <div class="tiny">Yaşı yıl ve ay olarak kendiliğinden hesaplanır; sorular ve etkinlikler buna göre seçilir.</div>
    </div>
    <button class="btn" data-act="ob-next">Devam</button>
    <button class="link" data-act="demo" style="margin:2px auto 8px">Örnek çocuk verisiyle dene</button>
  </div>`;

  if(d.step===2) return head+bar+`<div class="stack">
    <div class="card stack">
      <div><label class="fld" for="ob-sd">Kreşe/anaokuluna başlama tarihi</label><input id="ob-sd" type="date" value="${d.startDate}"></div>
      <div class="tiny">Son 30 gün içindeyse 30 günlük “Okula Uyum Yolculuğu” kendiliğinden başlar.</div>
      <div><label class="fld" for="ob-grp">Eğitim grubu</label>
        <select id="ob-grp"><option value="">Seçiniz</option>
        ${["Bebek grubu","2 yaş grubu","3 yaş grubu","4 yaş grubu","5 yaş grubu","Anasınıfı"].map(g=>`<option ${d.group===g?"selected":""}>${g}</option>`).join("")}</select></div>
      <div><label class="fld" for="ob-prev">Daha önce okul deneyimi</label>
        <select id="ob-prev"><option value="">Seçiniz</option>
        ${["Yok","Kısa süreli","Var"].map(g=>`<option ${d.prev===g?"selected":""}>${g}</option>`).join("")}</select></div>
      <div><label class="fld" for="ob-hrs">Günlük okul süresi</label>
        <select id="ob-hrs"><option value="">Seçiniz</option>
        ${["Yarım gün (3-4 saat)","5-6 saat","Tam gün (7-9 saat)"].map(g=>`<option ${d.hours===g?"selected":""}>${g}</option>`).join("")}</select></div>
    </div>
    <button class="btn" data-act="ob-next">Devam</button>
    <button class="link" data-act="ob-back" style="margin:2px auto 8px">Geri</button>
  </div>`;

  return head+bar+`<div class="stack">
    <div class="sub">İsteğe bağlı. Seçtiğiniz alanların soruları biraz daha sık sorulur, etkinlikler öncelikli olarak buradan gelir. Sonradan değiştirebilirsiniz.</div>
    <div class="stack" style="gap:8px">
      ${AREAS.map(a=>`<button class="choice" data-focus="${a.c}" aria-pressed="${d.focusAreas.includes(a.c)}">
        <span style="flex:1"><span class="t">${a.n}</span><br><span class="tiny">${a.d}</span></span></button>`).join("")}
    </div>
    <button class="btn" data-act="ob-save">Başlayalım</button>
    <button class="link" data-act="ob-back" style="margin:2px auto 0">Geri</button>
    <div class="tiny" style="text-align:center;padding-bottom:8px">Veriler yalnızca bu cihazda, tarayıcınızda saklanır.</div>
  </div>`;
}

/* ================= BUGÜN ================= */
function viewToday(){
  const c=S.child,day=schoolDay(),today=S.checkins[iso(TODAY)];
  const gain=biggestGain(),act=suggestedActivities(1)[0],b=buckets();
  const goal=monthlyGoals()[0];
  const hint=referralHint();
  const ph=phaseInfo(day),tip=tipOfDay();
  const dots=Array.from({length:7},(_,i)=>{const d=iso(addDays(TODAY,-(6-i)));const e=S.checkins[d];
    return `<span class="dot ${e?"m"+e.mood:""}" title="${fmtDate(d)}"></span>`}).join("");
  const tObs=entries("TEACHER").slice(-1)[0];
  const hour=new Date().getHours();
  const hello=hour<11?"Günaydın":hour<17?"İyi günler":"İyi akşamlar";

  return header(hello.toLocaleUpperCase("tr")+" · "+ageText(c.birthDate),c.nickname)+`
  <div class="stack">
    ${S.demo?`<div class="banner">Örnek veri görüntülüyorsunuz. Profil sekmesinden temizleyip kendi çocuğunuzla başlayabilirsiniz.</div>`:""}

    <div class="today">
      <div class="between"><div style="min-width:0">
        <div class="eyebrow">${inAdaptation()?`Uyum yolculuğu · ${day}. gün`:`Okulun ${day}. günü`}</div>
        <h2 style="font-size:21px;margin-top:4px">${today?esc(MOODS.find(m=>m.v===today.mood).t):"Bugünü henüz kaydetmediniz"}</h2>
        <div class="sub">${today?"Bugünün kaydı tamam. İsterseniz düzenleyebilirsiniz.":"1-2 dakikanızı alır."}</div>
      </div><div class="mood">${today?MOODS.find(m=>m.v===today.mood).e:"🌱"}</div></div>
      ${inAdaptation()?`<div style="margin:14px 0 6px" class="journey"><i style="width:${Math.round(day/30*100)}%"></i></div>
        <div class="between"><span class="tiny">${esc(ph.g)} · ${esc(ph.b)}</span>
        <button class="link" data-act="journey">Yolculuk</button></div>`
        :`<div class="streak">${dots}</div><div class="tiny" style="margin-top:6px">Son 7 gün</div>`}
      <div style="margin-top:14px"><button class="btn" data-act="checkin">${today?"Bugünün kaydını düzenle":"Bugünü kaydet"}</button></div>
    </div>

    ${inAdaptation()&&tip?`<div class="card" style="background:var(--honey-soft);border-color:transparent">
      <span class="pill honey">${day}. günün ipucu</span>
      <div style="margin-top:9px;font-size:14.5px;color:var(--ink)">${esc(tip)}</div></div>`:""}

    ${hint?`<div class="card" style="border-color:var(--honey)">
      <div class="sec-title">Bir not</div>
      <div class="sub" style="color:var(--ink);margin-top:6px">${esc(hint)}</div></div>`:""}

    ${gain?`<div class="card" style="background:var(--sage-soft);border-color:transparent">
      <span class="pill sage">Son iki haftada fark ettiğimiz</span>
      <div style="margin-top:9px;font-weight:600;font-size:15.5px">${esc(gain.t)} konusunda gözle görülür bir ilerleme var.</div></div>`:""}

    ${goal?`<div class="card"><div class="between"><span class="pill honey">Devam eden hedef</span>
      <button class="link" data-act="go-rapor">Rapora bak</button></div>
      <div style="margin-top:9px;font-weight:600">${esc(goalText(goal))}</div>
      <div class="sub" style="margin-top:4px">Tek ve küçük bir hedef; acele etmeye gerek yok.</div></div>`:""}

    ${act?`<div class="card"><div class="between"><span class="pill">Bugün için öneri</span>
      <span class="tiny num">${act.dk} dk · ${esc(AREA_K[act.a])}</span></div>
      <div style="margin-top:9px;font-weight:600;font-size:16.5px;font-family:var(--display)">${esc(act.t)}</div>
      <div class="sub">${esc(act.g)}</div>
      <div class="row" style="margin-top:11px">
        <button class="btn ghost sm" data-open-act="${act.c}">Nasıl oynanır</button>
        <button class="btn ghost sm" data-try="${act.c}">${S.tried[act.c]?"Denedik ✓":"Denedik"}</button></div></div>`:""}

    ${tObs?`<div class="card"><div class="between"><span class="pill plain">Öğretmen gözlemi</span>
      <span class="tiny">${fmtDate(tObs.date)}</span></div>
      ${tObs.note?`<div class="note" style="margin-top:10px">“${esc(tObs.note)}”</div>`:
        `<div class="sub" style="margin-top:8px">${esc(tObs.alias||"Öğretmen")} kısa bir gözlem paylaştı.</div>`}
      <button class="link" style="margin-top:10px" data-act="go-rapor">Karşılaştırmayı gör</button></div>`:""}

    <div class="card"><div class="between"><div class="sec-title">Son kayıtlar</div>
      <button class="link" data-act="go-rapor">Tümü</button></div>
      ${entries().slice().reverse().slice(0,4).map(e=>`<div class="item">
        <span style="font-size:19px">${MOODS.find(m=>m.v===e.mood).e}</span>
        <div style="flex:1;min-width:0"><div style="font-weight:600;font-size:14px">${fmtDate(e.date)} · ${esc(MOODS.find(m=>m.v===e.mood).t)}</div>
        ${e.note?`<div class="tiny" style="font-style:italic">“${esc(e.note)}”</div>`:""}</div></div>`).join("")
        ||emptyState("Henüz kayıt yok. İlk kaydınızı bugün oluşturabilirsiniz.")}
    </div>
  </div>`;
}

/* 30 günlük yolculuk detayı */
function journeyHtml(){
  const day=Math.max(1,schoolDay());
  const cells=Array.from({length:30},(_,i)=>{
    const n=i+1,d=iso(addDays(new Date(S.child.startDate),i)),e=S.checkins[d];
    const cls=[e?"m"+e.mood:"",n===day?"now":"",n>day?"future":""].filter(Boolean).join(" ");
    return `<span class="${cls}" title="${n}. gün · ${fmtDate(d)}">${n}</span>`;
  }).join("");
  const kept=Object.keys(S.checkins).filter(d=>{const n=dayDiff(d,new Date(S.child.startDate))+1;return n>=1&&n<=30}).length;
  return `<div class="between"><div><span class="pill">Okula uyum</span>
      <h2 style="font-size:21px;margin-top:8px">30 günlük yolculuk</h2></div>
    <button class="link" data-act="close">Kapat</button></div>
  <div class="stack" style="margin-top:14px">
    <div class="card">
      <div class="between" style="margin-bottom:10px"><span class="tiny">${day}. gün</span><span class="tiny num">${kept} kayıt</span></div>
      <div class="cal">${cells}</div>
      <div class="legend"><span><i style="background:var(--sage)"></i>Rahat</span>
        <span><i style="background:color-mix(in srgb,var(--sage) 55%,var(--surface))"></i>İyi</span>
        <span><i style="background:var(--honey)"></i>Zorlandı</span>
        <span><i style="background:var(--rose)"></i>Zor gün</span>
        <span><i style="background:var(--line-2)"></i>Kayıt yok</span></div>
      <div class="tiny" style="margin-top:10px">Boş günler sorun değil. Hafta sonları ve kayıt girilmeyen günler örüntüyü bozmaz.</div>
    </div>
    ${PHASES.map(p=>{const active=p.p===phaseOf(day),done=p.p<phaseOf(day);
      return `<div class="card" ${active?'style="border-color:var(--plum)"':""}>
        <div class="between"><span class="pill ${done?"sage":active?"":"plain"}">${esc(p.g)}${done?" ✓":""}</span>
          ${active?`<span class="tiny">şu an buradasınız</span>`:""}</div>
        <div style="margin-top:9px;font-weight:700;font-family:var(--display);font-size:16px">${esc(p.b)}</div>
        <div class="sub" style="margin-top:4px">${esc(p.o)}</div>
        <div class="tabs" style="flex-wrap:wrap;margin-top:10px">${p.t.map(t=>`<span class="pill plain">${esc(t)}</span>`).join("")}</div>
      </div>`}).join("")}
    <div class="callout">30. günde ilk aylık özetiniz hazırlanır: güçlü görünen alanlar, gelişmekte olanlar ve desteklenebilecekler.</div>
  </div>`;
}
