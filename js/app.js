const $=id=>document.getElementById(id);
const state={language:null,entries:[],index:0,stage:0,completed:{},answers:{}};
const stageNames=["المشهد","اكتشفي","اللعبة","جرّبي","تذكّري"],stageIcons=["✦","Aa","🎯","✍","🧠"];
const names={italian:"الإيطالية",french:"الفرنسية"};
const toast=$("toast");let toastTimer;
function showToast(s){toast.textContent=s;toast.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove("show"),2600)}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function key(){return "linguapop-progress-"+state.language}
function save(){try{localStorage.setItem(key(),JSON.stringify({index:state.index,completed:state.completed,answers:state.answers}))}catch{}}
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
async function enterWorld(lang){
 try{
  const response=await fetch("data/"+lang+".json");if(!response.ok)throw Error();
  const data=await response.json();if(!data.entries?.length)throw Error();
  state.language=lang;state.entries=data.entries;
  let saved={};try{saved=JSON.parse(localStorage.getItem(key())||"{}")}catch{}
  state.index=Math.min(saved.index||0,state.entries.length-1);state.completed=saved.completed||{};state.answers=saved.answers||{};state.stage=0;
  $("world-label").textContent=lang==="italian"?"☀️ مقهى صغير في روما":"🌙 مخبز دافئ في باريس";
  $("lesson-eyebrow").textContent="العالم "+data.language_name_ar+" · المستوى "+data.level;
  document.querySelector(".hero").hidden=true;document.querySelector(".language-section").hidden=true;$("learning-view").hidden=false;
  render();window.scrollTo({top:0,behavior:"smooth"});
 }catch(e){showToast("تعذر تحميل الدرس. أعيدي المحاولة بعد التأكد من الاتصال.")}
}
function render(){
 const e=state.entries[state.index];$("lesson-title").textContent="مهمة: "+e.meaning_ar;$("lesson-count").textContent=(state.index+1)+" / "+state.entries.length;
 $("lesson-progress").style.width=((state.index+(state.completed[e.id]?1:0))/state.entries.length*100)+"%";
 $("previous-stage").disabled=state.stage===0;$("next-stage").textContent=state.stage===4?"الكلمة التالية ←":"التالي ←";$("lesson-feedback").textContent="";
 $("stage-dots").innerHTML=stageNames.map((n,i)=>'<span class="stage-dot '+(i<state.stage?"done":i===state.stage?"active":"")+'" title="'+n+'">'+stageIcons[i]+"</span>").join("");
 const card=$("lesson-card"),w=esc(e.word),lang=state.language==="italian"?"it":"fr";
 if(state.stage===0)card.innerHTML='<div class="scene-art '+state.language+'"><span class="scene-spark">✦</span><span class="scene-object">'+(lang==="it"?"☕":"🥐")+'</span><span class="scene-caption">'+(lang==="it"?"Un piccolo momento a Roma":"Un matin à Paris")+'</span></div><p class="stage-kicker">المرحلة الأولى · شاهدي المعنى</p><h3>تخيّلي هذا الموقف</h3><p class="stage-description">'+esc(e.usage_ar)+'</p><div class="scene-hint">نربط الكلمة بموقف حقيقي قبل حفظها.</div>';
 else if(state.stage===1){card.innerHTML='<p class="stage-kicker">المرحلة الثانية · اكتشفي</p><div class="big-word" lang="'+lang+'" dir="ltr">'+w+'</div><div class="meaning-pill">'+esc(e.meaning_ar)+'</div><p class="pronunciation">🔊 النطق التقريبي: <strong>'+esc(e.pronunciation_ar)+'</strong></p><div class="example-box"><span>مثال في جملة</span><p lang="'+lang+'" dir="ltr">'+esc(e.example)+'</p><p>'+esc(e.example_ar)+'</p></div><p class="stage-description">'+esc(e.usage_ar)+'</p><button class="sound-button" id="speak-word" type="button">🔈 استمعي إلى النطق</button>';$("speak-word").onclick=()=>speak(e.word,lang)}
 else if(state.stage===2){
  const options=shuffle([e,...shuffle(state.entries.filter(x=>x.id!==e.id)).slice(0,3)]);
  card.innerHTML='<p class="stage-kicker">المرحلة الثالثة · لعبة الاختيار</p><h3>أي كلمة تعني «'+esc(e.meaning_ar)+'»؟</h3><div class="quiz-options">'+options.map(x=>'<button class="quiz-option" data-answer="'+esc(x.id)+'" type="button">'+esc(x.word)+'</button>').join("")+'</div><p class="small-hint">اختاري إجابة واحدة. الخطأ فرصة ثانية، مش نهاية العالم.</p>';
  card.querySelectorAll("[data-answer]").forEach(b=>b.onclick=()=>{let ok=b.dataset.answer===e.id;card.querySelectorAll("[data-answer]").forEach(x=>{x.disabled=true;if(x.dataset.answer===e.id)x.classList.add("correct")});if(!ok)b.classList.add("wrong");$("lesson-feedback").textContent=ok?"إجابة صحيحة!":"الإجابة الصحيحة: "+e.word+". ستعود الكلمة في مراجعة أخرى.";state.answers[e.id+"-game"]=ok;save()});
 }else if(state.stage===3){
  const tokens=shuffle(e.example.replace(/[!?.,]/g,"").split(" "));
  card.innerHTML='<p class="stage-kicker">المرحلة الرابعة · رتّبي الجملة</p><h3>كوّني المثال بنفسك</h3><div class="sentence-target" id="sentence-target">اضغطي الكلمات بالترتيب</div><div class="word-bank">'+tokens.map((t,i)=>'<button class="word-chip" data-token="'+i+'" type="button">'+esc(t)+'</button>').join("")+'</div><button class="check-button" id="check-sentence" type="button">تحققي من الجملة</button><p class="small-hint">'+esc(e.example_ar)+'</p>';
  let chosen=[];card.querySelectorAll("[data-token]").forEach(b=>b.onclick=()=>{b.disabled=true;chosen.push(b.textContent);$("sentence-target").textContent=chosen.join(" ")});
  $("check-sentence").onclick=()=>{let norm=s=>s.toLowerCase().replace(/[!?.,]/g,"").trim().replace(/\s+/g," ");let ok=norm(chosen.join(" "))===norm(e.example);state.answers[e.id+"-sentence"]=ok;save();$("lesson-feedback").textContent=ok?"ممتاز، كوّنتِ الجملة!":"الترتيب غير صحيح بعد. ستعود الجملة في المراجعة."};
 }else{
  card.innerHTML='<p class="stage-kicker">المرحلة الخامسة · استرجاع من الذاكرة</p><h3>بدون مساعدة هذه المرة</h3><p class="stage-description">اكتبي الكلمة التي تعني: <strong>'+esc(e.meaning_ar)+'</strong></p><label class="answer-label" for="recall-answer">الكلمة باللغة '+names[state.language]+'</label><input class="recall-input" id="recall-answer" autocomplete="off" spellcheck="false" placeholder="اكتبي إجابتك هنا"><button class="check-button" id="check-recall" type="button">تحققي من الإجابة</button><div class="recall-example" id="recall-result"></div>';
  $("check-recall").onclick=()=>{let ok=$("recall-answer").value.trim().toLowerCase()===e.word.toLowerCase();state.answers[e.id+"-recall"]=ok;if(ok)state.completed[e.id]=true;save();$("recall-result").textContent=ok?"أُتقنت هذه الجولة! ستعود الكلمة في مراجعة لاحقة.":"الإجابة: "+e.word+". لا بأس، ستعود في نشاط مختلف."; $("lesson-feedback").textContent=ok?"استرجاع صحيح!":"تم تسجيل المحاولة."; $("lesson-progress").style.width=((state.index+(ok?1:0))/state.entries.length*100)+"%"};
  $("recall-answer").onkeydown=ev=>{if(ev.key==="Enter")$("check-recall").click()};
 }
}
function speak(word,lang){if(!("speechSynthesis"in window)){showToast("الصوت غير مدعوم في هذا المتصفح.");return}speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(word);u.lang=lang==="it"?"it-IT":"fr-FR";u.rate=.82;speechSynthesis.speak(u)}
function next(){if(state.stage<4){state.stage++;render();return}if(state.index<state.entries.length-1){state.index++;state.stage=0;save();render()}else{$("lesson-card").innerHTML='<div class="finish-art">🎉</div><h3>انتهت الجولة الأولى!</h3><p class="stage-description">مررتِ على '+state.entries.length+' كلمات في عالم '+names[state.language]+'. تقدمك محفوظ على هذا الجهاز.</p><button class="primary-button" id="restart-world" type="button">إعادة الجولة</button>';$("lesson-controls").hidden=true;$("restart-world").onclick=()=>{state.index=0;state.stage=0;$("lesson-controls").hidden=false;render()}}}
document.querySelectorAll("[data-language]").forEach(b=>b.addEventListener("click",()=>enterWorld(b.dataset.language)));
$("back-home").onclick=()=>{save();$("learning-view").hidden=true;document.querySelector(".language-section").hidden=false;document.querySelector(".hero").hidden=false;$("lesson-controls").hidden=false;window.scrollTo({top:0,behavior:"smooth"})};
$("next-stage").onclick=next;$("previous-stage").onclick=()=>{if(state.stage>0){state.stage--;render()}};
const toggle=$("theme-toggle"),icon=toggle.querySelector(".theme-icon"),label=toggle.querySelector(".theme-label");
function applyTheme(dark){document.body.classList.toggle("dark-mode",dark);toggle.setAttribute("aria-checked",String(dark));toggle.setAttribute("aria-label",dark?"الوضع الليلي مفعّل، اضغطي لإيقافه":"الوضع الليلي متوقف، اضغطي لتفعيله");toggle.title=dark?"الوضع النهاري":"الوضع الليلي";icon.textContent=dark?"☀":"☾";label.textContent=dark?"نهاري":"ليلي"}
let theme="light";try{theme=localStorage.getItem("linguapop-theme")||"light"}catch{}applyTheme(theme==="dark");
toggle.onclick=()=>{let dark=!document.body.classList.contains("dark-mode");applyTheme(dark);try{localStorage.setItem("linguapop-theme",dark?"dark":"light")}catch{}};
