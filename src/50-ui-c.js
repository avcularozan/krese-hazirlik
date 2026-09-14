/* ================= ETKİNLİKLER ================= */
function viewEtkinlik(){
  const m=ageMonths(S.child.birthDate);
  const f=tmp.actArea||"oneri", dur=tmp.actDur||"hepsi";
  let list;
  if(f==="oneri")list=suggestedActivities(10);
  else if(f==="denenen")list=ACTS.filter(a=>S.tried[a.c]);
  else list=ACTS.filter(a=>a.a===f&&m>=a.min&&m<=a.max);
  if(dur==="kisa")list=list.filter(a=>a.dk<=10);
  else if(dur==="orta")list=list.filter(a=>a.dk>10&&a.dk<=15);
  else if(dur==="uzun")list=list.filter(a=>a.dk>15);
  const triedCount=Object.keys(S.tried).length;
  return header("Etkinlikler","Evde oynayarak")+`
  <div class="stack">
    <div class="tabs">
      <button data-actarea="oneri" aria-pressed="${f==="oneri"}">Size özel</button>
      ${triedCount?`<button data-actarea="denenen" aria-pressed="${f==="denenen"}">Denediklerimiz (${triedCount})</button>`:""}
      ${AREAS.map(a=>`<button data-actarea="${a.c}" aria-pressed="${f===a.c}">${esc(a.k)}</button>`).join("")}
    </div>
    <div class="between">
      <div class="seg">
        <button data-dur="hepsi" aria-pressed="${dur==="hepsi"}">Tümü</button>
        <button data-dur="kisa" aria-pressed="${dur==="kisa"}">≤10 dk</button>
        <button data-dur="orta" aria-pressed="${dur==="orta"}">≤15 dk</button>
        <button data-dur="uzun" aria-pressed="${dur==="uzun"}">Uzun</button>
      </div>
      <span class="tiny num">${list.length} etkinlik</span>
    </div>
    ${f==="oneri"?`<div class="tiny">${ageText(S.child.birthDate)} yaşına uygun etkinlikler; desteklenebilecek alanlar ve takip ettiğiniz alanlar öne alındı.</div>`:""}
    ${list.length?list.map(a=>`<button class="card" style="text-align:left;width:100%" data-open-act="${a.c}">
      <div class="between"><span class="pill">${esc(AREA_K[a.a])}</span>
        <span class="tiny num">${a.dk} dk${S.tried[a.c]?" · denedik ✓":""}</span></div>
      <div style="margin-top:9px;font-family:var(--display);font-weight:600;font-size:16.5px">${esc(a.t)}</div>
      <div class="sub">${esc(a.g)}</div></button>`).join("")
      :emptyState("Bu filtreye uyan etkinlik yok. Filtreyi genişletmeyi deneyin.")}
  </div>`;
}
function actHtml(code){
  const a=ACTS.find(x=>x.c===code);if(!a)return "";
  return `<div class="between"><div><span class="pill">${esc(AREA_N[a.a])}</span>
      <h2 style="font-size:21px;margin-top:8px">${esc(a.t)}</h2></div>
    <button class="link" data-act="close">Kapat</button></div>
  <div class="stack" style="margin-top:14px">
    <div class="callout"><b>Amaç.</b> ${esc(a.g)}</div>
    <div class="grid2">
      <div class="flat"><div class="tiny">Süre</div>
        <div style="font-weight:700;font-family:var(--display);font-size:18px" class="num">${a.dk} dakika</div></div>
      <div class="flat"><div class="tiny">Uygun yaş</div>
        <div style="font-weight:700;font-family:var(--display);font-size:18px" class="num">${Math.floor(a.min/12)}-${Math.floor(a.max/12)} yaş</div></div>
    </div>
    <div class="card"><div class="sec-title" style="font-size:15px">Gerekli malzemeler</div>
      <ul class="ul" style="margin-top:9px">${a.m.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>
    <div class="card"><div class="sec-title" style="font-size:15px">Nasıl uygulanır</div>
      <ol class="ol" style="margin-top:11px">${a.s.map(x=>`<li><span>${esc(x)}</span></li>`).join("")}</ol></div>
    <div class="card" style="background:var(--honey-soft);border-color:transparent">
      <div class="sec-title" style="font-size:15px;color:var(--honey)">Nelere dikkat edelim</div>
      <ul class="ul" style="margin-top:9px">${a.d.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>
    <button class="btn ${S.tried[a.c]?"ghost":""}" data-try="${a.c}">${S.tried[a.c]?`Denedik · ${fmtDate(S.tried[a.c])}`:"Bunu denedik olarak işaretle"}</button>
  </div>`;
}

/* ================= GRAFİK ================= */
const MOOD_LABEL={4:"Rahat geçti",3:"İyiydi",2:"Zorlandı",1:"Zor gün"};
function lineChart(series,opts={}){
  const W=340,H=152,L=30,R=12,T=12,B=26;
  const pts=series[0].data,n=pts.length;
  const x=i=>L+(n<=1?0:i*(W-L-R)/(n-1));
  const y=v=>T+(4-v)/3*(H-T-B);
  const path=d=>{let s="",open=false;
    d.forEach((p,i)=>{if(p.v==null){open=false;return}s+=(open?"L":"M")+x(i).toFixed(1)+" "+y(p.v).toFixed(1)+" ";open=true});
    return s.trim()};
  const areaPath=d=>{const k=d.map((p,i)=>({...p,i})).filter(p=>p.v!=null);
    if(k.length<2)return "";
    return "M"+x(k[0].i).toFixed(1)+" "+(H-B)+" "+k.map(p=>"L"+x(p.i).toFixed(1)+" "+y(p.v).toFixed(1)).join(" ")
      +" L"+x(k[k.length-1].i).toFixed(1)+" "+(H-B)+" Z"};
  const grid=[1,2,3,4].map(v=>`<line class="gridline" x1="${L}" y1="${y(v).toFixed(1)}" x2="${W-R}" y2="${y(v).toFixed(1)}"/>`).join("");
  const ylabs=[[4,"Rahat"],[1,"Zor"]].map(([v,t])=>
    `<text class="axis" x="${L-6}" y="${(y(v)+3).toFixed(1)}" text-anchor="end">${t}</text>`).join("");
  const idx=[0,Math.floor((n-1)/2),n-1].filter((v,i,ar)=>ar.indexOf(v)===i);
  const xlabs=idx.map(i=>`<text class="axis" x="${x(i).toFixed(1)}" y="${H-8}" text-anchor="${i===0?"start":i===n-1?"end":"middle"}">${esc(pts[i].label||fmtDate(pts[i].date))}</text>`).join("");
  const marks=series.map((s,si)=>{
    const k=s.data.map((p,i)=>({...p,i})).filter(p=>p.v!=null);
    const last=k[k.length-1];
    return `${si===0&&opts.fill!==false?`<path d="${areaPath(s.data)}" fill="var(--s${si+1}-fill)"/>`:""}
      <path d="${path(s.data)}" fill="none" stroke="var(--s${si+1})" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      ${n<=14?k.map(p=>`<circle cx="${x(p.i).toFixed(1)}" cy="${y(p.v).toFixed(1)}" r="3.4" fill="var(--s${si+1})" stroke="var(--surface)" stroke-width="2"/>`).join(""):""}
      ${last?`<circle cx="${x(last.i).toFixed(1)}" cy="${y(last.v).toFixed(1)}" r="5" fill="var(--s${si+1})" stroke="var(--surface)" stroke-width="2"/>`:""}`;
  }).join("");
  const hit=pts.map((p,i)=>`<rect x="${(x(i)-(W-L-R)/(2*Math.max(1,n-1))).toFixed(1)}" y="${T}"
     width="${((W-L-R)/Math.max(1,n-1)).toFixed(1)}" height="${H-T-B}" fill="transparent" data-i="${i}"/>`).join("");
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opts.alt||"Genel gidişat")}"
     data-chart='${esc(JSON.stringify({labels:pts.map(p=>p.label||fmtDate(p.date)),
       series:series.map(s=>({name:s.name,data:s.data.map(p=>p.v)}))}))}'>
    ${grid}${ylabs}${xlabs}${marks}
    <g class="hit">${hit}</g></svg>`;
}
function bindChartHover(){
  document.querySelectorAll("svg.chart").forEach(svg=>{
    let meta;try{meta=JSON.parse(svg.dataset.chart)}catch(e){return}
    const show=e=>{
      const r=e.target.closest("rect[data-i]");if(!r)return;
      const i=+r.dataset.i;
      let tip=document.getElementById("tip");
      if(!tip){tip=document.createElement("div");tip.id="tip";document.body.appendChild(tip)}
      const rows=meta.series.map((s,si)=>{
        const v=s.data[i];
        return `<div style="display:flex;gap:7px;align-items:center">
          <i style="width:9px;height:9px;border-radius:2px;background:var(--s${si+1});display:inline-block"></i>
          <span>${esc(s.name)}: <b>${v==null?"kayıt yok":esc(MOOD_LABEL[Math.round(v)]||v.toFixed(1))}</b></span></div>`}).join("");
      tip.innerHTML=`<div style="font-weight:700;margin-bottom:3px">${esc(meta.labels[i])}</div>${rows}`;
      const box=r.getBoundingClientRect();
      tip.style.left=Math.max(8,Math.min(window.innerWidth-tip.offsetWidth-8,box.left+box.width/2-tip.offsetWidth/2))+"px";
      tip.style.top=(box.top+window.scrollY-tip.offsetHeight-8)+"px";
    };
    svg.addEventListener("pointermove",show);
    svg.addEventListener("pointerdown",show);
    svg.addEventListener("pointerleave",()=>{const t=document.getElementById("tip");if(t)t.remove()});
  });
}

/* ================= RAPORLAR ================= */
function viewRapor(){
  const t=trends(),b=buckets(),gain=biggestGain(),win=tmp.win||7;
  const hasTeacher=entries("TEACHER").length>0;
  const day=schoolDay(),cmp=comparison();
  const daily=win<=30;
  const parent=daily?moodSeries(win):weeklySeries(90).map(w=>({date:w.date,label:w.label,v:w.v}));
  const teacher=daily?moodSeries(win,"TEACHER"):null;
  const series=[{name:"Ebeveyn",data:parent}];
  if(hasTeacher&&teacher)series.push({name:"Öğretmen",data:teacher});
  const kayit=parent.filter(p=>p.v!=null).length;
  const label={strong:"Güçlü görünen alanlar",emerging:"Gelişmekte olan alanlar",support:"Desteklenebilecek alanlar"};
  return header("Raporlar",day>=30?"Aylık özet":"Gidişat")+`
  <div class="stack">
    <div class="card">
      <div class="between" style="flex-wrap:wrap;gap:8px;margin-bottom:10px">
        <div class="sec-title">Genel gidişat</div>
        <div class="seg"><button data-win="7" aria-pressed="${win===7}">7 gün</button>
          <button data-win="30" aria-pressed="${win===30}">30 gün</button>
          <button data-win="90" aria-pressed="${win===90}">90 gün</button></div></div>
      ${kayit>=2?lineChart(series,{alt:"Son "+win+" günün genel gidişatı"})+
        (series.length>1?`<div class="legend">${series.map((s,i)=>
          `<span><i style="background:var(--s${i+1})"></i>${esc(s.name)}</span>`).join("")}</div>`
          :`<div class="legend"><span><i style="background:var(--s1)"></i>Günün genel gidişatı (ebeveyn kaydı)</span></div>`)+
        `<div class="tiny" style="margin-top:8px">${kayit} kayıt${win===90?" · haftalık ortalamalar":""}. Boş günler çizgide kesinti olarak görünür.</div>`
        :emptyState("Eğilim gösterebilmek için en az iki günlük kayıt gerekiyor.")}
    </div>

    ${t.length?`<div class="card"><div class="sec-title">Örüntüler</div>
      <div class="stack" style="margin-top:10px;gap:10px">
      ${t.slice(0,6).map(x=>`<div class="row" style="align-items:flex-start">
        <span class="pill ${x.k==="up"?"sage":x.k==="support"?"honey":x.k==="down"?"rose":""}" style="flex:0 0 auto">
          ${x.k==="up"?"ilerleme":x.k==="support"?"destek":"izliyoruz"}</span>
        <div style="font-size:14px">${esc(x.t)}</div></div>`).join("")}</div>
      <div class="tiny" style="margin-top:12px">Bu cümleler yalnızca yeterli sayıda kayıt biriktiğinde üretilir; tek bir günden sonuç çıkarılmaz.</div></div>`
      :`<div class="card"><div class="sec-title">Örüntüler</div>
        <div class="tiny" style="margin-top:6px">Birkaç günlük kayıt daha biriktiğinde buraya örüntü cümleleri gelecek.</div></div>`}

    ${(b.strong.length||b.emerging.length||b.support.length)?`<div class="card">
      <div class="between"><div class="sec-title">${MONTHS[TODAY.getMonth()]} gelişim özeti</div>
        <span class="tiny">son 30 gün</span></div>
      ${gain?`<div class="flat" style="background:var(--sage-soft);border-color:transparent;margin:12px 0">
        <span class="pill sage">Bu ay fark ettiğimiz güzel gelişme</span>
        <div style="margin-top:8px;font-weight:600">${esc(gain.t)} konusunda belirgin bir ilerleme var.</div></div>`:""}
      ${["strong","emerging","support"].map(k=>bucketBlock(label[k],b[k],k==="strong"?"sage":k==="support"?"honey":"")).join("")}
      <div class="sec-title" style="margin-top:18px;font-size:15px">Gelecek ay için küçük hedefler</div>
      <ol class="ol" style="margin-top:10px">${monthlyGoals().map(g=>`<li><span>${esc(goalText(g))}</span></li>`).join("")
        ||"<li><span>Şu anki rutini sürdürmek yeterli.</span></li>"}</ol>
      <div class="tiny" style="margin-top:10px">Bu özet bir değerlendirme ya da tanı değildir; yalnızca kendi kayıtlarınızın özetidir.</div>
      </div>`:""}

    <div class="card">
      <div class="between"><div class="sec-title">Öğretmen gözlemi</div>
        <button class="link" data-act="teacher">${S.code?"Bağlantıyı gör":"Bağlantı oluştur"}</button></div>
      ${cmp?`<div class="stack" style="margin-top:12px;gap:12px">
        ${cmp.rows.map(r=>`<div>
          <div style="font-size:13.5px;font-weight:600">${esc(r.t)}</div>
          <div class="row" style="margin-top:5px"><span class="tiny" style="flex:0 0 60px">Ebeveyn</span>
            <div class="bar"><i style="width:${Math.round(r.p/3*100)}%;background:var(--s1)"></i></div></div>
          <div class="row" style="margin-top:4px"><span class="tiny" style="flex:0 0 60px">Öğretmen</span>
            <div class="bar"><i style="width:${Math.round(r.t2/3*100)}%;background:var(--s2)"></i></div></div></div>`).join("")}
        ${cmp.note?`<div class="note">${esc(cmp.note)}</div>`:""}
        <div class="tiny">İki gözlem hiçbir zaman tek ortalamada birleştirilmez. Farklı olmaları olağandır.</div></div>`
      :`<div class="sub" style="margin-top:8px">Öğretmen hesap açmadan, kısa bir formla gözlemini paylaşabilir. Gözlemler ayrı tutulur ve yan yana gösterilir.</div>`}
    </div>

    <div class="card"><div class="between"><div class="sec-title">Geçmiş kayıtlar</div>
      <span class="tiny num">${entries().length} gün</span></div>
      ${entries().slice().reverse().slice(0,40).map(e=>{
        const it=Object.entries(e.items||{}).filter(([,v])=>typeof v==="number");
        return `<div class="item">
        <span style="font-size:18px">${MOODS.find(m=>m.v===e.mood).e}</span>
        <div style="flex:1;min-width:0"><div class="between"><span style="font-weight:600;font-size:14px">${fmtDate(e.date)}</span>
          <span class="tiny">${DOW[new Date(e.date).getDay()]}</span></div>
          <div class="tiny">${it.slice(0,3).map(([k,v])=>esc((ITEM[k]||{}).t||k)+": "+esc(((ITEM[k]&&ITEM[k].o)||SCALE)[v])).join(" · ")||"madde kaydı yok"}${it.length>3?` +${it.length-3}`:""}</div>
          ${e.note?`<div class="tiny" style="font-style:italic;margin-top:3px">“${esc(e.note)}”</div>`:""}</div></div>`}).join("")
        ||emptyState("Henüz kayıt yok.")}
    </div>
  </div>`;
}
function bucketBlock(title,arr,tone){
  if(!arr.length)return "";
  return `<div style="margin-top:14px"><span class="pill ${tone}">${esc(title)}</span>
    <div class="stack" style="margin-top:9px;gap:8px">${arr.map(a=>`<button class="row" style="width:100%;background:none;border:0;padding:0" data-area="${a.c}">
      <span style="flex:1;font-size:14px;font-weight:500;text-align:left">${esc(a.n)}</span>
      <span class="bar ${tone}" style="max-width:92px"><i style="width:${Math.round(a.avg/3*100)}%"></i></span></button>`).join("")}</div></div>`;
}
function comparison(){
  const te=entries("TEACHER");if(!te.length)return null;
  const pe=entries(),rows=[];
  ITEMS.forEach(it=>{const p=avgItem(inWindow(pe,30),it.c),t=avgItem(inWindow(te,30),it.c);
    if(p&&t)rows.push({t:it.t,p:p.avg,t2:t.avg,d:t.avg-p.avg})});
  if(!rows.length)return null;
  rows.sort((a,b)=>Math.abs(b.d)-Math.abs(a.d));
  const top=rows[0];let note=null;
  if(top.d>=.7)note=`“${top.t}” ebeveyn açısından zorlayıcı görünmesine rağmen öğretmen gözlemlerine göre sınıf içinde daha kolay ilerliyor. İki ortamın farklı olması olağandır.`;
  else if(top.d<=-.7)note=`“${top.t}” evde daha rahat, sınıf ortamında ise biraz daha zorlayıcı görünüyor. Öğretmeniyle bu maddeyi konuşmak yararlı olabilir.`;
  return {rows:rows.slice(0,4),note};
}

/* ================= OKUL OLGUNLUĞU ================= */
function readinessHtml(){
  const b=readinessBuckets();
  const answered=Object.keys(S.readiness).length,total=READY.reduce((n,a)=>n+a.i.length,0);
  return `<div class="between"><div><span class="pill">Okula Hazırlık</span>
      <h2 style="font-size:21px;margin-top:8px">İlkokul öncesi bakış</h2></div>
    <button class="link" data-act="close">Kapat</button></div>
  <div class="callout" style="margin-top:12px">Bu bölüm “hazır / hazır değil” kararı vermez. Amacı güçlü yanları görmek ve desteklenebilecek alanları öğretmeniyle birlikte planlamaktır.</div>
  <div class="between" style="margin-top:14px"><span class="tiny">İşaretlenen madde</span><span class="tiny num">${answered}/${total}</span></div>
  <div class="bar" style="margin-top:6px"><i style="width:${Math.round(answered/total*100)}%"></i></div>
  ${(b.strong.length||b.em.length||b.sp.length)?`<div class="card" style="margin-top:14px">
    <div class="sec-title" style="font-size:15px">Şu anki tablo</div>
    ${[["Güçlü görünen alanlar",b.strong,"sage"],["Gelişmekte olan alanlar",b.em,""],["Desteklenebilecek alanlar",b.sp,"honey"]]
      .filter(x=>x[1].length).map(([t,arr,tone])=>`<div style="margin-top:11px"><span class="pill ${tone}">${t}</span>
      <div class="sub" style="margin-top:6px">${arr.map(x=>esc(x.t)).join(" · ")}</div></div>`).join("")}
    </div>`:""}
  <div class="stack" style="margin-top:14px">
  ${READY.map(a=>`<div class="card">
    <div style="font-weight:700;font-family:var(--display);font-size:16px">${esc(a.t)}</div>
    ${a.i.map((txt,i)=>{const k=a.c+"."+i,v=S.readiness[k];
      return `<fieldset style="margin-top:12px">
        <div style="font-size:14px;margin-bottom:7px">${esc(txt)}</div>
        <div class="scale">${[3,2,1,0].map(val=>`<button data-ready="${k}" data-val="${val}" aria-pressed="${v===val}">${esc(READY_SCALE[val])}</button>`).join("")}</div>
      </fieldset>`}).join("")}
  </div>`).join("")}
  </div>`;
}

/* ================= ÖĞRETMEN ================= */
function openTeacher(){
  if(!S.code){S.code=String(Math.floor(100000+Math.random()*900000));save()}
  if(!tmp.tobs)tmp.tobs={items:{},note:"",alias:""};
  sheet(teacherHtml());
}
const TEACHER_Q=["ayrilik","sakin","oyun","yemek","akran","yonerge"];
function teacherHtml(){
  const t=tmp.tobs,qs=TEACHER_Q.map(c=>ITEM[c]).filter(Boolean);
  const past=entries("TEACHER").slice().reverse();
  return `<div class="between"><div><span class="pill">Öğretmen bağlantısı</span>
      <h2 style="font-size:20px;margin-top:8px">Kısa gözlem formu</h2></div>
    <button class="link" data-act="close">Kapat</button></div>
   <div class="card" style="margin-top:12px;text-align:center">
     <div class="tiny">Öğretmeninizle paylaşacağınız kod</div>
     <div style="font-family:var(--display);font-size:32px;font-weight:700;letter-spacing:.14em" class="num">${S.code}</div>
     <div class="tiny">30 gün geçerli · istediğiniz an iptal edebilirsiniz · öğretmenin hesap açması gerekmez</div>
     <div class="tiny" style="margin-top:6px">Kod yalnızca gözlem <b>yazmaya</b> yarar; geçmiş kayıtlarınızı göstermez.</div>
     <button class="btn ghost sm" style="margin-top:10px" data-act="revoke">Kodu iptal et ve yenisini oluştur</button>
   </div>
   <div class="sub" style="margin:16px 0 6px">Bu demoda formu burada doldurabilirsiniz — gerçek uygulamada öğretmen bağlantıyı açıp yalnızca bu 6 soruyu görür.</div>
   <div><label class="fld" for="t-alias">Öğretmen adı (isteğe bağlı)</label>
     <input id="t-alias" type="text" value="${esc(t.alias)}" placeholder="Örn. Zeynep Öğretmen"></div>
   ${qs.map(q=>{const opts=q.o||SCALE;return `<fieldset style="margin-top:16px">
     <div style="font-weight:600;font-size:14.5px;margin-bottom:8px">${esc(q.t)}</div>
     <div class="scale">${[3,2,1,0].map(v=>`<button data-titem="${q.c}" data-val="${v}" aria-pressed="${t.items[q.c]===v}">${esc(opts[v])}</button>`).join("")}
     <button class="wide" data-titem="${q.c}" data-val="na" aria-pressed="${t.items[q.c]===null}">Gözlemleyemedim</button></div></fieldset>`}).join("")}
   <div style="margin-top:16px"><label class="fld" for="t-note">Kısa not</label>
     <textarea id="t-note" placeholder="Örn. Sabah ayrılıkta kısa süre ağladı, 5 dakika içinde oyuna katıldı.">${esc(t.note)}</textarea></div>
   <button class="btn" style="margin-top:14px" data-act="t-save">Gözlemi kaydet</button>
   ${past.length?`<div class="card" style="margin-top:16px"><div class="sec-title" style="font-size:15px">Önceki öğretmen gözlemleri</div>
     ${past.slice(0,5).map(o=>`<div class="item"><div style="flex:1">
       <div style="font-weight:600;font-size:13.5px">${fmtDate(o.date)}${o.alias?" · "+esc(o.alias):""}</div>
       ${o.note?`<div class="tiny" style="font-style:italic">“${esc(o.note)}”</div>`:""}</div></div>`).join("")}</div>`:""}`;
}

/* ================= PROFİL ================= */
function viewProfil(){
  const c=S.child,m=ageMonths(c.birthDate);
  const rows=[["Yaş",ageText(c.birthDate)],["Doğum tarihi",fmtDate(c.birthDate)+" "+new Date(c.birthDate).getFullYear()],
    ["Okula başlama",fmtDate(c.startDate)+" "+new Date(c.startDate).getFullYear()],["Grup",c.group||"—"],
    ["Günlük süre",c.hours||"—"],["Önceki okul deneyimi",c.prev||"—"],["Okulun kaçıncı günü",String(schoolDay())]];
  return header("Profil",c.nickname)+`
  <div class="stack">
    <div class="card">${rows.map(([k,v])=>`<div class="item"><span style="flex:1" class="sub">${esc(k)}</span><b>${esc(v)}</b></div>`).join("")}</div>

    <div class="card"><div class="sec-title">Takip ettiğiniz alanlar</div>
      <div class="tiny" style="margin:4px 0 10px">Seçtiğiniz alanların soruları biraz daha sık sorulur, etkinlikler öncelikli buradan gelir.</div>
      <div class="tabs" style="flex-wrap:wrap">${AREAS.map(a=>`<button data-pfocus="${a.c}" aria-pressed="${(c.focusAreas||[]).includes(a.c)}">${esc(a.k)}</button>`).join("")}</div></div>

    <div class="card"><div class="between"><div class="sec-title">Öğretmen bağlantısı</div>
      <button class="link" data-act="teacher">${S.code?"Kodu gör":"Oluştur"}</button></div>
      <div class="sub" style="margin-top:6px">${S.code?"Etkin bir kodunuz var. İptal edip yenisini oluşturabilirsiniz.":"Öğretmeniniz hesap açmadan kısa bir gözlem paylaşabilir."}</div></div>

    <div class="card"><div class="sec-title">Gizlilik</div>
      <ul class="ul" style="margin-top:10px">
        <li>Tüm kayıtlar yalnızca bu cihazın tarayıcısında tutulur; hiçbir sunucuya gönderilmez.</li>
        <li>Fotoğraf istenmez; gerçek ad yerine takma ad kullanabilirsiniz.</li>
        <li>Verilerinizi istediğiniz an dışa aktarabilir veya geri dönüşsüz silebilirsiniz.</li>
        <li>Öğretmen kodu yalnızca gözlem girmeye yarar, geçmişinizi göstermez; süreli ve iptal edilebilir.</li>
      </ul>
      <div class="grid2" style="margin-top:14px">
        <button class="btn ghost sm" style="width:100%" data-act="export">Verileri dışa aktar</button>
        <button class="btn ghost sm" style="width:100%;color:var(--rose);border-color:var(--rose)" data-act="wipe">Tüm verileri sil</button>
      </div>
    </div>

    <div class="card"><div class="sec-title">Bu uygulama ne yapar, ne yapmaz</div>
      <div class="stack" style="margin-top:10px;gap:9px">
        <div class="row" style="align-items:flex-start"><span class="pill sage">yapar</span>
          <div style="font-size:13.5px">Çocuğunuzun kendi kayıtlarındaki değişimi zaman içinde gösterir; yaşına uygun öneriler sunar.</div></div>
        <div class="row" style="align-items:flex-start"><span class="pill rose">yapmaz</span>
          <div style="font-size:13.5px">Tanı koymaz, çocukları birbiriyle karşılaştırmaz, sıralamaz ve tek bir günden sonuç çıkarmaz.</div></div>
      </div>
      <div class="tiny" style="margin-top:12px">Kaygı veren ya da uzun süren bir durumda öğretmeniniz ve bir çocuk gelişimi uzmanı en doğru adrestir.</div>
    </div>

    ${S.demo?`<button class="btn ghost" data-act="wipe">Örnek veriyi temizle ve kendi çocuğumla başla</button>`:""}
    <div class="tiny" style="text-align:center;padding-bottom:6px">v2 · ${SKILLS.length} beceri maddesi · ${ACTS.length} etkinlik · ${ITEMS.length} günlük madde</div>
  </div>`;
}
