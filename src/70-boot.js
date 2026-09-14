/* ================= KAYDETME ================= */
function saveOnboard(){
  keepObInputs();
  const d=tmp.ob;
  if(!d.nickname||!d.birthDate){alert("Ad/takma ad ve doğum tarihi gerekiyor.");return}
  S.child={nickname:d.nickname,birthDate:d.birthDate,startDate:d.startDate||iso(TODAY),
    group:d.group,prev:d.prev,hours:d.hours,focusAreas:d.focusAreas.slice()};
  S.demo=false;save();tmp.ob=null;go("bugun");
}
function saveCheckin(){
  const c=tmp.ci;
  if(c.mood===null){alert("Önce bugünün genel gidişatını seçin.");return}
  const note=document.getElementById("ci-note");
  S.checkins[iso(TODAY)]={mood:c.mood,items:c.items,note:note?note.value.trim():"",
    qs:c.qs.map(q=>q.c),source:"PARENT"};
  save();close();go("bugun");
}
function saveTeacher(){
  const n=document.getElementById("t-note"),a=document.getElementById("t-alias");
  const items=tmp.tobs.items;
  const vals=Object.values(items).filter(v=>typeof v==="number");
  const mood=vals.length?Math.max(1,Math.min(4,Math.round(vals.reduce((x,y)=>x+y,0)/vals.length)+1)):3;
  S.teacher[iso(TODAY)]={mood,items,note:n?n.value.trim():"",alias:a?a.value.trim():"",source:"TEACHER"};
  save();tmp.tobs=null;close();go("rapor");
}
async function exportData(){
  const json=JSON.stringify({exportedAt:new Date().toISOString(),...S},null,2);
  const name=(S.child?S.child.nickname:"cocuk")+"-gelisim-verileri.json";
  try{
    const dl=window.claude&&window.claude.use?await window.claude.use("downloads"):null;
    if(dl){await dl.save({filename:name,data:json});return}
  }catch(e){if(e&&e.code==="cancelled")return}
  try{await navigator.clipboard.writeText(json);
    alert("Verileriniz panoya kopyalandı. Bir not uygulamasına yapıştırıp .json olarak saklayabilirsiniz.");return;
  }catch(e){}
  sheet('<div class="between"><div><span class="pill">Dışa aktarma</span><h2 style="font-size:20px;margin-top:8px">Verileriniz</h2></div>'
   +'<button class="link" data-act="close">Kapat</button></div>'
   +'<div class="tiny" style="margin:10px 0">Aşağıdaki metni kopyalayıp saklayabilirsiniz.</div>'
   +'<textarea readonly style="min-height:320px;font-family:ui-monospace,monospace;font-size:11px">'+esc(json)+'</textarea>');
}
function wipe(){
  if(!confirm("Tüm kayıtlar bu cihazdan geri dönüşsüz olarak silinecek. Devam edilsin mi?"))return;
  S=blank();try{localStorage.removeItem(KEY)}catch(e){}
  tmp={};view="bugun";close();render();
}

/* ================= ÖRNEK VERİ (3 yaş, kreşe yeni başlamış) ================= */
function seed(){
  S=blank();S.demo=true;
  const start=addDays(TODAY,-28);
  S.child={nickname:"Ada",birthDate:iso(new Date(TODAY.getFullYear()-3,TODAY.getMonth()-4,12)),
    startDate:iso(start),group:"3 yaş grubu",prev:"Yok",hours:"Yarım gün (3-4 saat)",
    focusAreas:["duygu","sosyal","ince"]};
  const rnd=(s=>()=>((s=s*16807%2147483647)/2147483647))(20260914);
  const base={},growth={};
  ITEMS.forEach(i=>{base[i.c]=.8+rnd()*.7;growth[i.c]=.03+rnd()*.05});
  // uyum süreciyle en çok değişen maddeler
  Object.assign(growth,{evden:.075,ayrilik:.085,sakin:.08,destek:.075,giris:.07,guven:.07});
  Object.assign(base,{ayrilik:.4,sakin:.5,evden:.8,yemek:.9});

  for(let day=1;day<=28;day++){
    const date=iso(addDays(start,day-1));
    const dow=new Date(date).getDay(); if(dow===0||dow===6)continue;   // hafta sonu okul yok
    if(day===12||day===20)continue;                                    // birkaç gün kayıt girilmemiş
    const ph=phaseOf(day);
    const pool=ITEMS.filter(i=>i.p<=ph);
    const picked=pool.filter(()=>rnd()<(ph===1?.9:.4)).slice(0,ph===1?8:5);
    const items={};
    picked.forEach(i=>{
      if(rnd()<.06){items[i.c]=null;return}
      let v=base[i.c]+growth[i.c]*day+(rnd()-.5)*.9;
      if(i.c==="yemek")v=Math.min(v,1.35);                             // süregelen zorlanma alanı
      items[i.c]=Math.max(0,Math.min(3,Math.round(v)));
    });
    const vals=Object.values(items).filter(v=>typeof v==="number");
    const m=vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:1.5;
    S.checkins[date]={mood:Math.max(1,Math.min(4,Math.round(m)+1)),items,
      note:SEED_NOTES[day]||"",qs:picked.map(p=>p.c),source:"PARENT"};
  }
  [7,17,26].forEach(day=>{
    const date=iso(addDays(start,day-1));
    const items={ayrilik:Math.min(3,1+Math.round(day/12)),sakin:Math.min(3,1+Math.round(day/10)),
      oyun:Math.min(3,2+(day>20?1:0)),yemek:1,akran:day>14?2:1,yonerge:2};
    const vals=Object.values(items);
    S.teacher[date]={mood:Math.max(1,Math.min(4,Math.round(vals.reduce((a,b)=>a+b,0)/vals.length)+1)),
      alias:"Zeynep Öğretmen",source:"TEACHER",items,
      note:day===26?"Sınıfa girdikten 5 dakika sonra oyuna katılıyor. Yemekte seçici davranıyor.":
           day===17?"Sabah kısa süre ağladı, ardından kendi etkinliğini seçti.":""};
  });
  const m=ageMonths(S.child.birthDate);
  SKILLS.filter(s=>m>=s.min&&m<=s.max).forEach((s,i)=>{
    if(i%3===2)return;
    S.skills[s.c]={level:["IND","REM","HELP","NOT"][Math.min(3,Math.floor(rnd()*3.3))],
      date:iso(addDays(TODAY,-(i%10)))};
  });
  S.tried={a5:iso(addDays(TODAY,-6)),b8:iso(addDays(TODAY,-2))};
  save();
}
const SEED_NOTES={
 2:"Kapıda ağladı, öğretmeni aldıktan sonra uzun süre sakinleşememiş.",
 5:"Bugün kapıda ağladı fakat öğretmeni aldıktan 5 dakika sonra sakinleşmiş.",
 9:"Sabah çantasını kendi taşımak istedi.",
 14:"Sınıfa girerken el salladı, ağlamadı.",
 18:"Eve dönüşte Deniz adında bir arkadaşından bahsetti.",
 23:"Yemekte yine çok az yemiş, öğretmeni de aynısını söylüyor.",
 27:"Bugün kapıdan koşarak girdi."};

/* ================= BAŞLAT ================= */
S=load();
if(!S||!S.child){ S=blank(); seed(); }
["readiness","teacher","skills","tried","goals","checkins"].forEach(k=>{ if(!S[k])S[k]=k==="goals"?[]:{} });
render();
