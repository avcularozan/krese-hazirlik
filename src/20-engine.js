/* ================= DURUM & DEPOLAMA (yalnızca bu cihaz) ================= */
const KEY="kresehazirlik.v2";
const TODAY=new Date(); TODAY.setHours(0,0,0,0);
const iso=d=>{const x=new Date(d);return x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0")+"-"+String(x.getDate()).padStart(2,"0")};
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const dayDiff=(a,b)=>Math.round((new Date(a)-new Date(b))/864e5);
const MONTHS=["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
const DOW=["Paz","Pzt","Sal","Çar","Per","Cum","Cmt"];
const fmtDate=s=>{const d=new Date(s);return d.getDate()+" "+MONTHS[d.getMonth()]};
let S=null, view="bugun", tmp={};

const blank=()=>({child:null,checkins:{},teacher:{},skills:{},readiness:{},tried:{},goals:[],code:null,demo:false});
function load(){try{const r=localStorage.getItem(KEY);if(r)return JSON.parse(r)}catch(e){}return null}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}

/* ================= TEMEL HESAPLAR ================= */
function ageMonths(bd,at=TODAY){const b=new Date(bd);let m=(at.getFullYear()-b.getFullYear())*12+(at.getMonth()-b.getMonth());
  if(at.getDate()<b.getDate())m--;return Math.max(0,m)}
function ageText(bd){const m=ageMonths(bd);return Math.floor(m/12)+" yaş "+(m%12)+" ay"}
function schoolDay(on=TODAY){if(!S.child)return 0;return dayDiff(on,new Date(S.child.startDate))+1}
function phaseOf(day){return day<=3?1:day<=7?2:day<=14?3:4}
function phaseInfo(day){return PHASES.find(p=>p.p===phaseOf(day))}
function inAdaptation(){const d=schoolDay();return d>=1&&d<=30}
function tipOfDay(){const d=schoolDay();return TIPS[Math.min(30,Math.max(1,d))]}

function entries(src="PARENT"){const o=src==="TEACHER"?S.teacher:S.checkins;
  return Object.keys(o).sort().map(k=>({date:k,...o[k]}))}
function inWindow(list,days,endOffset=0){
  const end=addDays(TODAY,-endOffset),start=addDays(end,-(days-1));
  return list.filter(e=>{const d=new Date(e.date);return d>=start&&d<=end});}
function avgItem(list,code){const v=list.map(e=>e.items&&e.items[code]).filter(x=>typeof x==="number");
  return v.length?{avg:v.reduce((a,b)=>a+b,0)/v.length,n:v.length}:null}
function avgArea(list,area){const codes=ITEMS.filter(i=>i.a===area).map(i=>i.c);
  let s=0,n=0;list.forEach(e=>codes.forEach(c=>{const v=e.items&&e.items[c];if(typeof v==="number"){s+=v;n++}}));
  return n?{avg:s/n,n}:null}
function moodAvg(list){const v=list.map(e=>e.mood).filter(Boolean);return v.length?v.reduce((a,b)=>a+b,0)/v.length:null}
function spanDays(list,code){const d=list.filter(e=>typeof (e.items||{})[code]==="number").map(e=>new Date(e.date));
  return d.length<2?0:Math.round((Math.max(...d)-Math.min(...d))/864e5)+1}

/* Grafik serisi: gün başına genel gidişat (1-4). Eksik günler null kalır, çizgi kırılır. */
function moodSeries(days,src="PARENT"){
  const store=src==="TEACHER"?S.teacher:S.checkins,out=[];
  for(let i=days-1;i>=0;i--){const d=iso(addDays(TODAY,-i));const e=store[d];
    out.push({date:d,v:e&&e.mood?e.mood:null,note:e&&e.note?e.note:""})}
  return out;
}
/* Haftalık ortalamalar — 30/90 günlük pencerede gürültüyü azaltmak için. */
function weeklySeries(days){
  const weeks=Math.ceil(days/7),out=[];
  for(let w=weeks-1;w>=0;w--){
    const list=inWindow(entries(),7,w*7),a=moodAvg(list);
    out.push({label:w===0?"bu hafta":w+" hafta önce",v:a,n:list.length,
      date:iso(addDays(TODAY,-(w*7)))});
  }
  return out;
}

/* ================= TREND MOTORU =================
   Tek günden sonuç çıkarılmaz: bir cümle için ≥3 kayıt,
   "desteklenebilecek" demek için ≥5 kayıt ve ≥14 günlük yayılım gerekir. */
function trends(){
  const all=entries(),up=[],watch=[],support=[];
  const cur=inWindow(all,7),prev=inWindow(all,7,7);
  if(cur.length>=3&&prev.length>=3){
    const a=moodAvg(cur),b=moodAvg(prev);
    if(a-b>=.5)up.push({k:"up",t:"Son bir haftada günler genel olarak daha rahat geçmiş görünüyor."});
    else if(b-a>=.5)watch.push({k:"down",t:"Bu hafta geçen haftaya göre biraz daha zorlanmış görünüyor. Tek başına bir anlam taşımayabilir; birkaç gün daha izlemek yararlı olur."});
  }
  ITEMS.forEach(it=>{
    const c=avgItem(cur,it.c),p=avgItem(prev,it.c);
    if(!c||!p||c.n<3||p.n<3)return;
    if(c.avg-p.avg>=.6)up.push({k:"up",d:c.avg-p.avg,t:"“"+it.t+"” konusunda son iki haftada belirgin bir kolaylaşma görülüyor."});
    else if(p.avg-c.avg>=.6)watch.push({k:"watch",d:p.avg-c.avg,t:"“"+it.t+"” bu hafta geçen haftaya göre daha zorlayıcı görünüyor."});
  });
  /* Desteklenebilecek maddeler alan bazında toplanır — aynı cümle art arda tekrarlanmaz. */
  const m30=inWindow(all,30),byArea={};
  ITEMS.forEach(it=>{
    const w=avgItem(m30,it.c);
    if(w&&w.n>=5&&w.avg<1.5&&spanDays(m30,it.c)>=14)
      (byArea[it.a]||(byArea[it.a]=[])).push({t:it.t.toLocaleLowerCase("tr"),avg:w.avg});
  });
  Object.entries(byArea).sort((a,b)=>a[1][0].avg-b[1][0].avg).slice(0,2).forEach(([area,list])=>{
    list.sort((a,b)=>a.avg-b.avg);
    const names=list.slice(0,2).map(x=>"“"+x.t+"”").join(" ve ");
    const rest=list.length>2?" (ve "+(list.length-2)+" madde daha)":"";
    support.push({k:"support",t:AREA_N[area]+" alanında "+names+rest+" son haftalarda zorlanma sürüyor. Bu alanı öğretmeniyle birlikte gözlemlemek yararlı olabilir."});
  });
  up.sort((a,b)=>(b.d||9)-(a.d||9)); watch.sort((a,b)=>(b.d||9)-(a.d||9));
  return [...up.slice(0,3),...watch.slice(0,2),...support];
}
function referralHint(){
  const m30=inWindow(entries(),30);
  const weak=ITEMS.filter(it=>{const w=avgItem(m30,it.c);return w&&w.n>=5&&w.avg<1.2&&spanDays(m30,it.c)>=21});
  const areas=new Set(weak.map(i=>i.a));
  return areas.size>=3?"Birden fazla alanda üç haftadır süren bir zorlanma görünüyor. Bu durumun bir süre daha devam etmesi halinde öğretmeninizle ve uygun bir çocuk gelişimi uzmanıyla görüşmeniz yararlı olabilir.":null;
}

/* Alan puanları: günlük kayıtlar + beceri gözlemleri, 0-3 ölçeğinde. */
function areaScores(days=30){
  const list=inWindow(entries(),days),out={};
  AREAS.forEach(a=>{
    const ci=avgArea(list,a.c);
    const sk=Object.entries(S.skills).map(([c,o])=>({s:SKILLS.find(x=>x.c===c),o}))
      .filter(x=>x.s&&x.s.a===a.c&&LEVEL[x.o.level]&&LEVEL[x.o.level].v!==null);
    let s=0,n=0;
    if(ci){s+=ci.avg*ci.n;n+=ci.n}
    sk.forEach(x=>{s+=LEVEL[x.o.level].v;n++});
    out[a.c]=n?{avg:s/n,n}:null;
  });
  return out;
}
function bucketOf(avg){return avg>=2.4?"strong":avg>=1.5?"emerging":"support"}
function buckets(){
  const sc=areaScores(30),strong=[],emerging=[],support=[];
  AREAS.forEach(a=>{const r=sc[a.c];if(!r||r.n<3)return;
    const row={...r,...a,count:r.n};
    ({strong,emerging,support})[bucketOf(r.avg)].push(row)});
  [strong,emerging,support].forEach(l=>l.sort((x,y)=>y.avg-x.avg));
  return {strong,emerging,support,scores:sc};
}
function biggestGain(windowDays=14){
  const all=entries(),cur=inWindow(all,windowDays),prev=inWindow(all,windowDays,windowDays);let best=null;
  ITEMS.forEach(it=>{const c=avgItem(cur,it.c),p=avgItem(prev,it.c);
    if(c&&p&&c.n>=3&&p.n>=3){const d=c.avg-p.avg;if(d>.3&&(!best||d>best.d))best={d,t:it.t,area:it.a}}});
  return best;
}
function suggestedActivities(n=6,areaFilter=null){
  const m=S.child?ageMonths(S.child.birthDate):36;
  const b=buckets();
  const focus=[...b.support.map(x=>x.c),...(S.child?.focusAreas||[]),...b.emerging.map(x=>x.c)];
  let fit=ACTS.filter(a=>m>=a.min&&m<=a.max);
  if(areaFilter)fit=fit.filter(a=>a.a===areaFilter);
  const ranked=fit.map(a=>({a,r:(focus.indexOf(a.a)===-1?99:focus.indexOf(a.a))+(S.tried[a.c]?20:0)}))
    .sort((x,y)=>x.r-y.r);
  return ranked.slice(0,n).map(x=>x.a);
}

/* Dinamik soru seçimi: her gün aynı uzun form gösterilmez. */
function pickQuestions(){
  const day=Math.max(1,schoolDay()),ph=phaseOf(day),all=entries();
  const pool=ITEMS.filter(i=>i.p<=ph);
  const recent=inWindow(all,3).map(e=>e.items||{});
  const newly=pool.filter(i=>i.p===ph&&ph>1);
  const last=all.slice(-1)[0];
  const score=i=>{
    let s=0;
    s-=recent.filter(r=>typeof r[i.c]==="number").length*2;
    const lv=last&&last.items?last.items[i.c]:undefined;
    if(typeof lv==="number"&&lv<=1)s+=6;
    if(newly.includes(i))s+=5;
    if((S.child?.focusAreas||[]).includes(i.a))s+=2;
    if(ph===1)s+=3;
    const w7=avgItem(inWindow(all,7),i.c);
    if(w7&&w7.avg>=2.6&&w7.n>=3)s-=5;
    return s+Math.random()*1.2;
  };
  return pool.sort((a,b)=>score(b)-score(a)).slice(0,day<=3?5:4);
}

/* Aylık hedefler — en fazla 3, küçük ve somut. */
const GOAL_TEXT={
 sosyal:"Akran etkileşimi için günde bir kez kısa bir sıra alma oyunu",
 dil:"Her akşam “günün üç şeyi”ni birlikte anlatmak",
 dikkat:"Günde bir kez iki adımlı yönerge oyunu",
 ince:"Haftada üç kez 10 dakikalık el çalışması (hamur, mandal)",
 kaba:"Okul dönüşü 15 dakika hareket",
 bilis:"Akşamları birlikte bir yapboz",
 ozbakim:"Çantayı her akşam kendisi hazırlasın",
 oyun:"Günde 15 dakika çocuğun kurduğu oyuna eşlik etmek",
 duygu:"Sakin anlarda balon nefesi alıştırması"};
function goalText(g){return g&&g.text?g.text:(GOAL_TEXT[g&&g.c]||"Bu ay için küçük bir adım")}
function monthlyGoals(){const b=buckets();return [...b.support,...b.emerging].slice(0,3)}

/* Okul olgunluğu tablosu */
function readinessBuckets(){
  const strong=[],em=[],sp=[];
  READY.forEach(a=>{
    const vals=a.i.map((_,i)=>S.readiness[a.c+"."+i]).filter(v=>typeof v==="number");
    if(!vals.length)return;
    const avg=vals.reduce((x,y)=>x+y,0)/vals.length;
    const row={...a,avg,n:vals.length};
    (avg>=2.5?strong:avg>=1.5?em:sp).push(row);
  });
  return {strong,em,sp};
}
