/* ================= GÜNLÜK CHECK-IN ================= */
function openCheckin(){
  const d=iso(TODAY),ex=S.checkins[d];
  tmp.ci={mood:ex?ex.mood:null,items:ex?{...ex.items}:{},note:ex?ex.note:"",
    qs:(ex&&ex.qs)?ex.qs.map(c=>ITEM[c]).filter(Boolean):pickQuestions()};
  sheet(checkinHtml());
}
function checkinHtml(){
  const c=tmp.ci,day=Math.max(1,schoolDay()),ph=phaseInfo(day);
  const answered=c.qs.filter(q=>q.c in c.items).length;
  const step2=c.mood!==null;
  return `<div class="between"><div><div class="eyebrow">${fmtDate(iso(TODAY))} · ${day}. gün</div>
    <h2 style="font-size:20px;margin-top:3px">Bugün okul nasıl geçti?</h2></div>
    <button class="link" data-act="close">Kapat</button></div>
  <div class="choices" style="margin-top:14px">
   ${MOODS.map(m=>`<button class="choice" data-mood="${m.v}" aria-pressed="${c.mood===m.v}">
     <span class="e">${m.e}</span><span class="t">${m.t}</span></button>`).join("")}
  </div>
  <div class="${step2?"":"hide"}">
   <div class="between" style="margin:20px 0 2px">
     <span class="sec-title" style="font-size:15px">${esc(ph.b)}</span>
     <span class="tiny num">${answered}/${c.qs.length}</span></div>
   <div class="sub">Emin değilseniz “Gözlemleme fırsatım olmadı” diyebilirsiniz — o madde hiçbir ortalamaya girmez.</div>
   ${c.qs.map(q=>{const opts=q.o||SCALE;return `<fieldset style="margin-top:16px">
     <div style="font-weight:600;font-size:14.5px;margin-bottom:3px">${esc(q.t)}</div>
     <div class="tiny" style="margin-bottom:8px">${esc(AREA_N[q.a])}</div>
     <div class="scale">
       ${[3,2,1,0].map(v=>`<button data-item="${q.c}" data-val="${v}" aria-pressed="${c.items[q.c]===v}">${esc(opts[v])}</button>`).join("")}
       <button class="wide" data-item="${q.c}" data-val="na" aria-pressed="${c.items[q.c]===null}">Gözlemleme fırsatım olmadı</button>
     </div></fieldset>`}).join("")}
   <div style="margin-top:18px"><label class="fld" for="ci-note">Kısa not (isteğe bağlı)</label>
     <textarea id="ci-note" placeholder="Örn. Bugün kapıda ağladı fakat öğretmeni aldıktan 5 dakika sonra sakinleşmiş.">${esc(c.note)}</textarea></div>
   <button class="btn" style="margin-top:14px" data-act="ci-save">Kaydet</button>
   <div class="tiny" style="text-align:center;margin-top:8px">Tek bir gün bir sonuç değildir; örüntüye birlikte bakacağız.</div>
  </div>`;
}

/* ================= GELİŞİM ================= */
function viewGelisim(){
  const m=ageMonths(S.child.birthDate),b=buckets(),ready=m>=60;
  const withData=AREAS.map(a=>({...a,r:b.scores[a.c]})).filter(x=>x.r&&x.r.n>=3).sort((x,y)=>y.r.avg-x.r.avg);
  const without=AREAS.filter(a=>!b.scores[a.c]||b.scores[a.c].n<3);
  const done=Object.keys(S.skills).length,total=SKILLS.filter(s=>m>=s.min&&m<=s.max).length;
  const label={strong:"güçlü",emerging:"gelişmekte",support:"desteklenebilir"};
  return header("Gelişim","Gelişim haritası")+`
  <div class="stack">
    <div class="card">
      <div class="between"><div class="sec-title">Yaşa uygun beceri gözlemi</div><span class="tiny num">${done}/${total}</span></div>
      <div class="bar" style="margin:10px 0 8px"><i style="width:${total?Math.round(done/total*100):0}%"></i></div>
      <div class="sub">${ageText(S.child.birthDate)} yaşına uygun ${total} madde gösteriliyor. Bu bir test değil; kendi değişimini izlemek için.</div>
    </div>

    ${ready?`<button class="card" style="text-align:left;border-color:var(--plum);width:100%" data-act="readiness">
      <span class="pill">Okula Hazırlık</span>
      <div style="margin-top:8px;font-weight:700;font-family:var(--display);font-size:16px">İlkokula hazırlık bölümü açıldı</div>
      <div class="sub">11 alanda 33 madde. “Hazır/değil” kararı vermez; güçlü, gelişmekte ve desteklenebilecek alanları gösterir.</div></button>`:""}

    <div class="card">
      <div class="sec-title">Alanlar</div>
      <div class="tiny" style="margin:4px 0 12px">Çubuklar çocuğunuzun kendi kayıtlarının ortalamasını gösterir (0-3). Başka çocuklarla kıyas yoktur.</div>
      ${withData.map(a=>`<button class="item" style="width:100%;background:none;border-top:0;border-inline:0;text-align:left" data-area="${a.c}">
        <div style="flex:1;min-width:0">
          <div class="between"><span style="font-weight:600;font-size:14.5px">${esc(a.n)}</span>
            <span class="tiny">${esc(label[bucketOf(a.r.avg)])}</span></div>
          <div class="row" style="margin-top:7px">
            <div class="bar ${bucketOf(a.r.avg)==="strong"?"sage":bucketOf(a.r.avg)==="support"?"honey":""}">
              <i style="width:${Math.round(a.r.avg/3*100)}%"></i></div>
            <span class="tiny num" style="flex:0 0 66px;text-align:right;white-space:nowrap">${a.r.n} gözlem</span></div>
        </div></button>`).join("")}
      ${without.length?`<div class="flat" style="margin-top:12px">
        <div class="tiny" style="font-weight:700;margin-bottom:6px">Henüz eğilim gösterilemeyen alanlar</div>
        <div class="tabs" style="flex-wrap:wrap">${without.map(a=>`<button data-area="${a.c}">${esc(a.k)}</button>`).join("")}</div>
        <div class="tiny" style="margin-top:8px">Bir alan için en az 3 gözlem gerekir. Yetersiz veriyle yorum yapmıyoruz.</div>
      </div>`:""}
    </div>
  </div>`;
}

function areaHtml(code){
  const a=AREA[code],m=ageMonths(S.child.birthDate),b=buckets();
  const r=b.scores[code];
  const list=SKILLS.filter(s=>s.a===code&&m>=s.min&&m<=s.max);
  const items=ITEMS.filter(i=>i.a===code);
  const acts=suggestedActivities(3,code);
  const label={strong:"güçlü görünüyor",emerging:"gelişmekte",support:"desteklenebilir"};
  return `<div class="between"><div><span class="pill">${esc(a.k)}</span>
      <h2 style="font-size:21px;margin-top:8px">${esc(a.n)}</h2></div>
    <button class="link" data-act="close">Kapat</button></div>
  <div class="sub" style="margin-top:6px">${esc(a.d)}</div>
  <div class="stack" style="margin-top:14px">
    ${r&&r.n>=3?`<div class="card">
      <div class="between"><span class="tiny">Son 30 gün</span><span class="tiny">${esc(label[bucketOf(r.avg)])}</span></div>
      <div class="row" style="margin-top:8px"><div class="bar ${bucketOf(r.avg)==="strong"?"sage":bucketOf(r.avg)==="support"?"honey":""}">
        <i style="width:${Math.round(r.avg/3*100)}%"></i></div>
        <span class="num tiny" style="flex:0 0 62px;text-align:right;white-space:nowrap">${r.avg.toFixed(1)} / 3</span></div>
      <div class="tiny" style="margin-top:8px">${r.n} gözleme dayanıyor — günlük kayıtlar ve beceri gözlemleri birlikte.</div>
    </div>`:`<div class="flat tiny">Bu alanda eğilim göstermek için henüz yeterli kayıt yok (en az 3 gözlem gerekir).</div>`}

    ${items.length?`<div class="card"><div class="sec-title" style="font-size:15px">Günlük kayıtta bu alana ait maddeler</div>
      <div class="stack" style="margin-top:10px;gap:9px">
      ${items.map(i=>{const w=avgItem(inWindow(entries(),30),i.c);
        return `<div class="row"><span style="flex:1;font-size:13.5px">${esc(i.t)}</span>
        ${w?`<div class="bar" style="max-width:76px"><i style="width:${Math.round(w.avg/3*100)}%"></i></div>
             <span class="tiny num" style="flex:0 0 34px;text-align:right;white-space:nowrap">${w.n}×</span>`
           :`<span class="tiny">kayıt yok</span>`}</div>`}).join("")}</div></div>`:""}

    <div class="card"><div class="sec-title" style="font-size:15px">Yaşa uygun beceriler</div>
      <div class="tiny" style="margin-top:4px">Gözlemlediğiniz kadarını işaretleyin; boş bırakmak da bir cevaptır.</div>
      <div style="margin-top:6px">
      ${list.length?list.map(s=>{const cur=S.skills[s.c];
        return `<div class="item" style="flex-direction:column;gap:8px;align-items:stretch">
          <div style="font-weight:600;font-size:14.5px">${esc(s.t)}</div>
          <div class="scale">${LEVELS.map(l=>`<button class="${l.c==="NA"?"wide":""}" data-skill="${s.c}" data-lvl="${l.c}" aria-pressed="${cur&&cur.level===l.c}">${l.t}</button>`).join("")}</div>
          ${cur?`<div class="tiny">Son kayıt: ${fmtDate(cur.date)}</div>`:""}
        </div>`}).join(""):`<div class="tiny">Bu alanda çocuğunuzun yaşına uygun madde bulunmuyor.</div>`}
      </div>
    </div>

    ${acts.length?`<div class="card"><div class="sec-title" style="font-size:15px">Bu alanı destekleyen etkinlikler</div>
      <div class="stack" style="margin-top:10px;gap:8px">
      ${acts.map(x=>`<button class="flat" style="text-align:left;width:100%" data-open-act="${x.c}">
        <div class="between"><span style="font-weight:600;font-size:14.5px">${esc(x.t)}</span><span class="tiny num">${x.dk} dk</span></div>
        <div class="tiny">${esc(x.g)}</div></button>`).join("")}</div></div>`:""}
  </div>`;
}
