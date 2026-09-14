/* ================= SAYFA PARÇASI (sheet) ================= */
let sheetEl=null;
function sheet(html){
  close();
  sheetEl=document.createElement("div");sheetEl.className="sheet";
  sheetEl.innerHTML=`<div class="panel"><div class="grab"></div><div id="sheet-body">${html}</div></div>`;
  document.body.appendChild(sheetEl);
  sheetEl.addEventListener("click",e=>{if(e.target===sheetEl)close()});
  document.body.style.overflow="hidden";
  bindChartHover();
}
function refreshSheet(html){const b=document.getElementById("sheet-body");if(b){b.innerHTML=html;bindChartHover()}}
function close(){if(sheetEl){sheetEl.remove();sheetEl=null;document.body.style.overflow=""}
  const t=document.getElementById("tip");if(t)t.remove()}
document.addEventListener("keydown",e=>{if(e.key==="Escape")close()});

/* ================= OLAYLAR ================= */
function keepObInputs(){
  const g=id=>{const el=document.getElementById(id);return el?el.value.trim():undefined};
  const d=tmp.ob;if(!d)return;
  const map={"ob-name":"nickname","ob-bd":"birthDate","ob-sd":"startDate","ob-grp":"group","ob-prev":"prev","ob-hrs":"hours"};
  Object.entries(map).forEach(([id,k])=>{const v=g(id);if(v!==undefined)d[k]=v});
}
document.addEventListener("click",e=>{
  const b=e.target.closest("button");if(!b)return;
  const d=b.dataset;

  if(d.nav){go(d.nav);return}
  if(d.focus){const f=tmp.ob.focusAreas;const i=f.indexOf(d.focus);i<0?f.push(d.focus):f.splice(i,1);render();return}
  if(d.pfocus){const f=S.child.focusAreas||(S.child.focusAreas=[]);const i=f.indexOf(d.pfocus);
    i<0?f.push(d.pfocus):f.splice(i,1);save();render();return}
  if(d.area){sheet(areaHtml(d.area));return}
  if(d.actarea){tmp.actArea=d.actarea;render();return}
  if(d.dur){tmp.actDur=d.dur;render();return}
  if(d.win){tmp.win=+d.win;render();return}
  if(d.openAct){sheet(actHtml(d.openAct));return}
  if(d.try){const c=d.try;
    if(S.tried[c])delete S.tried[c]; else S.tried[c]=iso(TODAY);
    save(); if(sheetEl)refreshSheet(actHtml(c)); else render(); return}
  if(d.mood){tmp.ci.mood=+d.mood;
    const n=document.getElementById("ci-note");if(n)tmp.ci.note=n.value;
    refreshSheet(checkinHtml());return}
  if(d.item){const v=d.val==="na"?null:+d.val;
    tmp.ci.items[d.item]=tmp.ci.items[d.item]===v?undefined:v;
    if(tmp.ci.items[d.item]===undefined)delete tmp.ci.items[d.item];
    const n=document.getElementById("ci-note");if(n)tmp.ci.note=n.value;
    refreshSheet(checkinHtml());return}
  if(d.titem){const v=d.val==="na"?null:+d.val;tmp.tobs.items[d.titem]=v;
    const n=document.getElementById("t-note"),a=document.getElementById("t-alias");
    if(n)tmp.tobs.note=n.value; if(a)tmp.tobs.alias=a.value;
    refreshSheet(teacherHtml());return}
  if(d.skill){const cur=S.skills[d.skill];
    if(cur&&cur.level===d.lvl)delete S.skills[d.skill]; else S.skills[d.skill]={level:d.lvl,date:iso(TODAY)};
    save();
    const areaCode=(SKILLS.find(s=>s.c===d.skill)||{}).a;
    if(sheetEl&&areaCode)refreshSheet(areaHtml(areaCode)); else render();
    return}
  if(d.ready){S.readiness[d.ready]=+d.val;save();refreshSheet(readinessHtml());return}

  const a=d.act;
  if(a==="close")close();
  else if(a==="checkin")openCheckin();
  else if(a==="journey")sheet(journeyHtml());
  else if(a==="go-rapor")go("rapor");
  else if(a==="readiness")sheet(readinessHtml());
  else if(a==="teacher")openTeacher();
  else if(a==="revoke"){S.code=String(Math.floor(100000+Math.random()*900000));save();refreshSheet(teacherHtml())}
  else if(a==="ob-next"){keepObInputs();
    if(tmp.ob.step===1&&(!tmp.ob.nickname||!tmp.ob.birthDate)){alert("Devam etmek için ad/takma ad ve doğum tarihi gerekiyor.");return}
    if(tmp.ob.step===1&&new Date(tmp.ob.birthDate)>TODAY){alert("Doğum tarihi bugünden ileri olamaz.");return}
    tmp.ob.step++;render()}
  else if(a==="ob-back"){keepObInputs();tmp.ob.step--;render()}
  else if(a==="ob-save")saveOnboard();
  else if(a==="ci-save")saveCheckin();
  else if(a==="t-save")saveTeacher();
  else if(a==="demo"){seed();close();go("bugun")}
  else if(a==="export")exportData();
  else if(a==="wipe")wipe();
});
