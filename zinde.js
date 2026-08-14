// Zinde — Ev Antrenmanı (namespaced module, embeddable in shell app)
// Çok dilli (TR/EN/DE) — window.ZindeApp.init(rootId) ve setLang(lang) ile kullanılır.
window.ZindeApp = (function(){
  const STORAGE_KEY = 'zinde-app-data-v1';
  const LANG_KEY = 'app-lang-v1';
  const LOCALE = { tr:'tr-TR', en:'en-US', de:'de-DE' };

  const STRINGS = {
    tr: {
      tabToday:'Bugün', tabHistory:'Geçmiş', tabGoals:'Hedefler',
      settingsTooltip:'Hedefleri düzenle',
      ringLabel:'günlük hedeflerin tamamlandı',
      pillDone:'bugünü tamamladın 🎉', pillContinue:'devam et',
      target:'hedef:',
      howToggle:'Nasıl yapılır?',
      historyEmpty:'Henüz geçmiş kayıt yok. Bugünkü hareketlerini ekleyince burada görünecek.',
      goalsIntro:'Günlük hedef sayılarını kendine göre ayarla.',
      save:'Kaydet',
      disclaimer:'Ağırlıksız ev egzersizleri genel bir öneridir; sağlık durumuna göre tempoyu kendine göre ayarla.',
    },
    en: {
      tabToday:'Today', tabHistory:'History', tabGoals:'Goals',
      settingsTooltip:'Edit goals',
      ringLabel:'of daily goals completed',
      pillDone:'you completed today 🎉', pillContinue:'keep going',
      target:'target:',
      howToggle:'How to do it?',
      historyEmpty:"No history yet. It will appear here once you log today's activity.",
      goalsIntro:'Adjust your daily goal numbers to fit you.',
      save:'Save',
      disclaimer:'These bodyweight home exercises are a general suggestion; adjust the pace to fit your own health condition.',
    },
    de: {
      tabToday:'Heute', tabHistory:'Verlauf', tabGoals:'Ziele',
      settingsTooltip:'Ziele bearbeiten',
      ringLabel:'der Tagesziele erreicht',
      pillDone:'Heute geschafft 🎉', pillContinue:'weiter so',
      target:'Ziel:',
      howToggle:'Wie geht das?',
      historyEmpty:'Noch kein Verlauf. Er erscheint hier, sobald du deine heutigen Aktivitäten einträgst.',
      goalsIntro:'Passe deine täglichen Zielwerte an dich an.',
      save:'Speichern',
      disclaimer:'Diese Bodyweight-Übungen für zuhause sind ein allgemeiner Vorschlag; passe das Tempo an deinen eigenen Gesundheitszustand an.',
    },
  };

  const DEFAULT_GOALS = [
    { id:'situp', emoji:'🔥', target:50,
      name:{tr:'Mekik', en:'Sit-up', de:'Sit-up'},
      unit:{tr:'tekrar', en:'reps', de:'Wiederholungen'},
      how:{
        tr:'Sırt üstü uzan, dizlerini bük ve ayaklarını yere bas. Ellerini göğsünde çaprazla ya da başının arkasında hafifçe tut. Karın kaslarını sıkarak üst gövdeni dizlerine doğru kaldır, tepede bir an dur, sonra kontrollü şekilde sırt üstüne geri in. Boynu çekmeden, hareketi karınla yap.',
        en:'Lie on your back with knees bent and feet flat on the floor. Cross your arms over your chest or hold them lightly behind your head. Engage your abs to lift your upper body toward your knees, pause briefly at the top, then lower back down with control. Avoid pulling on your neck — let your core do the work.',
        de:'Lege dich auf den Rücken, Knie gebeugt, Füße flach auf dem Boden. Verschränke die Arme vor der Brust oder halte sie locker hinter dem Kopf. Spanne die Bauchmuskeln an und hebe den Oberkörper Richtung Knie, halte oben kurz, senke dich dann kontrolliert wieder ab. Ziehe nicht am Nacken — die Bewegung kommt aus der Körpermitte.',
      } },
    { id:'pushup', emoji:'💪', target:30,
      name:{tr:'Şınav', en:'Push-up', de:'Liegestütz'},
      unit:{tr:'tekrar', en:'reps', de:'Wiederholungen'},
      how:{
        tr:'Yüzüstü pozisyonda ellerini omuz genişliğinde yere yasla, vücudun baştan topuğa düz bir çizgi oluştursun. Dirseklerini bükerek göğsünü yere yaklaştır, sonra kollarını iterek başlangıç pozisyonuna dön. Kalçanı düşürme, karnını sıkı tut. Zor geliyorsa dizlerin üzerinde yapabilirsin.',
        en:"Get into a plank position with hands slightly wider than shoulder-width, body in a straight line from head to heels. Bend your elbows to lower your chest toward the floor, then push back up to the start. Keep your hips level and your core tight. If it's too hard, do it from your knees.",
        de:'Gehe in die Liegestützposition, Hände etwas breiter als schulterbreit, Körper von Kopf bis Ferse eine gerade Linie. Beuge die Ellbogen und senke die Brust Richtung Boden, drücke dich dann wieder hoch. Halte die Hüfte auf gleicher Höhe und den Rumpf angespannt. Bei Bedarf von den Knien aus ausführen.',
      } },
    { id:'squat', emoji:'🦵', target:50,
      name:{tr:'Squat', en:'Squat', de:'Kniebeuge'},
      unit:{tr:'tekrar', en:'reps', de:'Wiederholungen'},
      how:{
        tr:'Ayaklarını omuz genişliğinde aç, sırtını düz tut. Sanki arkanda bir sandalyeye oturuyormuş gibi kalçanı geriye ve aşağı it, dizlerin ayak uçlarını geçmesin. Uyluklar yere paralel olunca topuklarından güç alarak ayağa kalk.',
        en:'Stand with feet shoulder-width apart, back straight. Push your hips back and down as if sitting into a chair, keeping your knees behind your toes. Once your thighs are parallel to the floor, drive through your heels to stand back up.',
        de:'Stelle dich mit schulterbreiten Füßen hin, Rücken gerade. Schiebe die Hüfte nach hinten und unten, als würdest du dich auf einen Stuhl setzen, die Knie bleiben hinter den Zehen. Wenn die Oberschenkel parallel zum Boden sind, drücke dich über die Fersen wieder nach oben.',
      } },
    { id:'plank', emoji:'🧘', target:60,
      name:{tr:'Plank', en:'Plank', de:'Unterarmstütz'},
      unit:{tr:'saniye', en:'seconds', de:'Sekunden'},
      how:{
        tr:'Dirseklerini ve ön kollarını yere koy, dirsekler omuz hizasında olsun. Ayak uçların üzerinde yüksel ve vücudunu baştan topuğa kadar düz bir çizgi halinde tut. Kalçanı ne yukarı kaldır ne de düşür; karın ve kalça kaslarını sıkarak süreyi tamamla.',
        en:"Rest on your forearms and toes, elbows under your shoulders, body in a straight line from head to heels. Don't let your hips sag or pike up — keep your core and glutes engaged for the full hold.",
        de:'Stütze dich auf Unterarme und Zehenspitzen, Ellbogen unter den Schultern, Körper von Kopf bis Ferse eine gerade Linie. Lasse die Hüfte weder absacken noch nach oben wandern — halte Rumpf und Gesäß während der gesamten Zeit angespannt.',
      } },
    { id:'jj', emoji:'🤸', target:50,
      name:{tr:'Jumping Jack', en:'Jumping Jack', de:'Jumping Jack'},
      unit:{tr:'tekrar', en:'reps', de:'Wiederholungen'},
      how:{
        tr:'Ayakta dik dur, kollar yanda. Zıplayarak bacaklarını omuz genişliğinden dışarı aç ve aynı anda kollarını başının üstünde birleştir. Ardından zıplayarak başlangıç pozisyonuna dön. Akıcı ve ritmik bir tempoda tekrarla.',
        en:'Stand tall with arms at your sides. Jump your feet out wider than shoulder-width while raising your arms overhead, then jump back to the start position. Keep a steady, rhythmic pace.',
        de:'Stehe aufrecht, Arme an den Seiten. Springe mit den Füßen weiter als schulterbreit auseinander und hebe gleichzeitig die Arme über den Kopf, dann zurückspringen. Halte ein gleichmäßiges Tempo.',
      } },
    { id:'burpee', emoji:'⚡', target:20,
      name:{tr:'Burpee', en:'Burpee', de:'Burpee'},
      unit:{tr:'tekrar', en:'reps', de:'Wiederholungen'},
      how:{
        tr:'Ayakta başla, çömel ve ellerini yere koy. Bacaklarını arkaya fırlatarak plank pozisyonuna geç, istersen bir şınav çek. Bacaklarını tekrar ellerine doğru çek, çömelme pozisyonuna dön ve zıplayarak ayağa kalk. Akıcı tek bir hareket gibi yap.',
        en:'Start standing, squat down and place your hands on the floor. Kick your feet back into a plank, do a push-up if you like, then jump your feet back to your hands and explode up into a jump. Keep it as one smooth motion.',
        de:'Beginne im Stand, gehe in die Hocke und setze die Hände auf den Boden. Springe mit den Füßen nach hinten in die Liegestützposition, mache optional einen Liegestütz, springe dann mit den Füßen zurück zu den Händen und explosiv nach oben in einen Sprung. Als eine fließende Bewegung ausführen.',
      } },
    { id:'lunge', emoji:'🚶', target:40,
      name:{tr:'Lunge', en:'Lunge', de:'Ausfallschritt'},
      unit:{tr:'tekrar', en:'reps', de:'Wiederholungen'},
      how:{
        tr:'Bir ayağını öne uzun bir adım at. Her iki dizini de yaklaşık 90 derece bükerek çök; arka diz yere yakın ama değmesin, ön diz ayak ucunu geçmesin. Ön ayağınla itki alarak başlangıç pozisyonuna dön, bacak değiştir.',
        en:'Step one leg forward into a long stride. Bend both knees to about 90 degrees, keeping the back knee close to the floor without touching and the front knee behind your toes. Push off your front foot to return to standing, then switch legs.',
        de:'Mache einen großen Schritt nach vorne. Beuge beide Knie auf etwa 90 Grad, das hintere Knie bleibt knapp über dem Boden, ohne ihn zu berühren, das vordere Knie bleibt hinter den Zehen. Drücke dich über den vorderen Fuß wieder hoch und wechsle die Seite.',
      } },
    { id:'mountain', emoji:'⛰️', target:40,
      name:{tr:'Mountain Climber', en:'Mountain Climber', de:'Mountain Climber'},
      unit:{tr:'tekrar', en:'reps', de:'Wiederholungen'},
      how:{
        tr:'Şınav/plank pozisyonunda başla, eller omuz hizasında yere basılı. Dizlerini sırayla, koşar gibi hızlı hareketle göğsüne doğru çek, sonra geri uzat. Kalçan sabit ve düz kalsın, tempoyu hızlı tut.',
        en:'Start in a push-up/plank position with hands under your shoulders. Quickly drive your knees toward your chest one at a time, like running in place. Keep your hips steady and level, and keep the pace brisk.',
        de:'Beginne in der Liegestütz-/Plank-Position, Hände unter den Schultern. Ziehe abwechselnd schnell die Knie Richtung Brust, wie beim Laufen an Ort und Stelle. Halte die Hüfte stabil und auf gleicher Höhe, Tempo zügig halten.',
      } },
    { id:'highknees', emoji:'🏃', target:50,
      name:{tr:'Yüksek Diz', en:'High Knees', de:'Kniehebelauf'},
      unit:{tr:'tekrar', en:'reps', de:'Wiederholungen'},
      how:{
        tr:'Yerinde koşar gibi adım at, her adımda dizini kalça hizasına kadar hızla yukarı kaldır. Kollarını koşar gibi öne-arkaya salla, gövdeni dik tut ve tempoyu canlı tutmaya çalış.',
        en:'Jog in place, driving each knee up to hip height as quickly as you can. Pump your arms as if running and keep your torso upright with a lively pace.',
        de:'Laufe auf der Stelle und ziehe jedes Knie so schnell wie möglich bis zur Hüfthöhe hoch. Bewege die Arme wie beim Laufen und halte den Oberkörper aufrecht in zügigem Tempo.',
      } },
    { id:'bridge', emoji:'🌉', target:40,
      name:{tr:'Kalça Köprüsü', en:'Glute Bridge', de:'Hüftheben'},
      unit:{tr:'tekrar', en:'reps', de:'Wiederholungen'},
      how:{
        tr:'Sırt üstü uzan, dizlerini bük ve ayaklarını kalça genişliğinde yere bas. Topuklarından itki alarak kalçanı yukarı kaldır, omuzdan dize düz bir çizgi oluşana kadar. Tepede kalça kaslarını sık, sonra kontrollü şekilde in.',
        en:'Lie on your back with knees bent and feet hip-width apart on the floor. Drive through your heels to lift your hips until your body forms a straight line from shoulders to knees. Squeeze your glutes at the top, then lower back down with control.',
        de:'Lege dich auf den Rücken, Knie gebeugt, Füße hüftbreit auf dem Boden. Drücke dich über die Fersen hoch, bis Schultern, Hüfte und Knie eine gerade Linie bilden. Presse oben das Gesäß zusammen, senke dich dann kontrolliert wieder ab.',
      } },
    { id:'water', emoji:'💧', target:10,
      name:{tr:'Su', en:'Water', de:'Wasser'},
      unit:{tr:'bardak', en:'glasses', de:'Gläser'},
      how:null },
    { id:'kegel', emoji:'🌸', target:15,
      name:{tr:'Farkındalık Egzersizi', en:'Awareness Exercise', de:'Achtsamkeitsübung'},
      unit:{tr:'tekrar', en:'reps', de:'Wiederholungen'},
      how:{
        tr:'Pelvik taban kaslarını (idrarı kesme hissi veren kaslar) sıkarak 3-5 saniye kasılı tut, sonra aynı süre boyunca gevşet. Otururken, ayaktayken ya da yatarken fark ettirmeden yapılabilir. Nefesini tutma, karın ve kalça kaslarını sıkmamaya dikkat et.',
        en:"Squeeze the pelvic floor muscles (the ones you'd use to stop urine flow) and hold for 3-5 seconds, then release for the same amount of time. Can be done discreetly while sitting, standing, or lying down. Don't hold your breath, and avoid tensing your abs or glutes instead.",
        de:'Spanne die Beckenbodenmuskulatur an (die Muskeln, mit denen man den Harnfluss stoppen würde) und halte 3-5 Sekunden, löse dann für die gleiche Zeit. Kann unauffällig im Sitzen, Stehen oder Liegen ausgeführt werden. Nicht die Luft anhalten und nicht stattdessen Bauch oder Gesäß anspannen.',
      } },
  ];

  // ---- basit stick-figure pozları (hareket görselleri) ----
  const POSE = {
    STAND:   { head:[45,15], lines:[[45,23,45,50],[45,28,30,45],[45,28,60,45],[45,50,35,80],[45,50,55,80]] },
    SQUAT:   { head:[45,25], lines:[[45,33,48,55],[45,36,25,50],[45,36,65,50],[48,55,35,68],[35,68,35,80],[48,55,61,68],[61,68,61,80]] },
    LUNGE:   { head:[40,20], lines:[[40,28,42,50],[42,32,30,48],[42,32,54,48],[42,50,60,62],[60,62,60,80],[42,50,25,68],[25,68,20,78]] },
    PLANK:   { head:[15,30], lines:[[15,30,22,33],[22,33,50,38],[50,38,82,44],[22,33,22,80]] },
    PUSHDOWN:{ head:[15,38], lines:[[15,38,20,40],[20,40,50,44],[50,44,82,48],[20,40,20,80]] },
    LYING:   { head:[20,74], lines:[[27,76,55,76],[55,76,55,60],[55,60,70,76],[27,76,15,76]] },
    SITUP:   { head:[35,50], lines:[[40,54,55,76],[55,76,55,60],[55,60,70,76],[35,50,45,58]] },
    BRIDGE:  { head:[12,76], lines:[[20,76,45,58],[45,58,60,72],[60,72,72,80],[12,76,20,76]] },
    HIGHKNEE:{ head:[45,20], lines:[[45,28,45,50],[45,50,40,65],[40,65,40,80],[45,50,60,48],[60,48,60,65],[45,30,30,35],[30,35,25,45],[45,30,58,40],[58,40,65,50]] },
    JJ_IN:   { head:[45,20], lines:[[45,28,45,50],[45,28,40,48],[45,28,50,48],[45,50,42,80],[45,50,48,80]] },
    JJ_OUT:  { head:[45,20], lines:[[45,28,45,50],[45,28,25,10],[45,28,65,10],[45,50,20,80],[45,50,70,80]] },
    MOUNTAIN:{ head:[15,30], lines:[[15,30,22,33],[22,33,50,38],[50,38,82,44],[22,33,22,80],[50,38,60,55],[60,55,55,70]] },
    JUMP:    { head:[45,15], lines:[[45,23,45,45],[45,25,30,5],[45,25,60,5],[45,45,35,65],[35,65,35,78],[45,45,55,65],[55,65,55,78]] },
  };

  const POSE_PAIRS = {
    situp:     ['LYING','SITUP'],
    pushup:    ['PLANK','PUSHDOWN'],
    squat:     ['STAND','SQUAT'],
    plank:     ['PLANK', null],
    jj:        ['JJ_IN','JJ_OUT'],
    burpee:    ['PLANK','JUMP'],
    lunge:     ['STAND','LUNGE'],
    mountain:  ['PLANK','MOUNTAIN'],
    highknees: ['STAND','HIGHKNEE'],
    bridge:    ['LYING','BRIDGE'],
  };

  function poseGroup(pose, offsetX){
    const [hx,hy] = pose.head;
    let s = `<g transform="translate(${offsetX},0)">`;
    s += `<line x1="4" y1="82" x2="86" y2="82" stroke="var(--z-border)" stroke-width="3"/>`;
    pose.lines.forEach(([x1,y1,x2,y2]) => {
      s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--z-ink)" stroke-width="5" stroke-linecap="round"/>`;
    });
    s += `<circle cx="${hx}" cy="${hy}" r="7" fill="none" stroke="var(--z-ink)" stroke-width="5"/>`;
    s += `</g>`;
    return s;
  }

  function howSVG(id){
    const pair = POSE_PAIRS[id];
    if(!pair) return '';
    const [aKey, bKey] = pair;
    const a = POSE[aKey];
    if(!bKey){
      return `<svg viewBox="0 0 90 90" style="width:120px;display:block;margin:0 auto 10px;">${poseGroup(a,0)}</svg>`;
    }
    const b = POSE[bKey];
    return `
      <svg viewBox="0 0 200 90" style="width:100%;max-width:280px;display:block;margin:0 auto 10px;">
        ${poseGroup(a,0)}
        <line x1="90" y1="45" x2="112" y2="45" stroke="var(--z-accent)" stroke-width="3"/>
        <polygon points="112,39 122,45 112,51" fill="var(--z-accent)"/>
        ${poseGroup(b,112)}
      </svg>
    `;
  }

  function init(rootId){
    const root = document.getElementById(rootId);
    if(!root) return;

    let data = null;
    let activeTab = 'today';
    let openHistDate = null;
    let openHowId = null;
    let lang = 'tr';

    function todayKey(){ return new Date().toISOString().slice(0,10); }
    function fmtDate(k){
      const d = new Date(k+'T00:00:00');
      return d.toLocaleDateString(LOCALE[lang] || 'tr-TR', {weekday:'long', day:'numeric', month:'long'});
    }
    function t(key){ return (STRINGS[lang] || STRINGS.tr)[key]; }

    function loadData(){
      try{
        const raw = localStorage.getItem(STORAGE_KEY);
        data = raw ? JSON.parse(raw) : { goals: DEFAULT_GOALS.map(g => ({...g})), days: {} };
        if(!data.goals || !data.goals.length) data.goals = DEFAULT_GOALS.map(g => ({...g}));
        data.goals = data.goals.map(g => {
          const def = DEFAULT_GOALS.find(d => d.id === g.id);
          return def ? { ...def, ...g, name: def.name, unit: def.unit, how: def.how } : g;
        });
        DEFAULT_GOALS.forEach(def => {
          if(!data.goals.find(g => g.id === def.id)) data.goals.push({...def});
        });
      }catch(e){
        data = { goals: DEFAULT_GOALS.map(g => ({...g})), days: {} };
      }
      try{ lang = localStorage.getItem(LANG_KEY) || 'tr'; }catch(e){ lang = 'tr'; }
      render();
    }

    function persist(){
      try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
      catch(e){ console.error('Kaydetme hatası', e); }
    }

    function getDay(key){
      if(!data.days[key]) data.days[key] = { counts: {} };
      return data.days[key];
    }

    function dayPct(day){
      const goals = data.goals;
      if(!goals.length) return 0;
      let sum = 0;
      goals.forEach(g => {
        const c = (day.counts && day.counts[g.id]) || 0;
        sum += Math.min(100, Math.round((c / g.target) * 100));
      });
      return Math.round(sum / goals.length);
    }

    function render(){
      root.innerHTML = shellHTML();
      bindShell();
    }

    function shellHTML(){
      const key = todayKey();
      const day = getDay(key);
      const pct = dayPct(day);
      const done = pct >= 100;

      return `
        <div class="z-row">
          <div>
            <h1 class="z-h1">Zinde</h1>
            <div class="z-sub">${fmtDate(key)}</div>
          </div>
          <button class="z-gear" id="z-open-settings" title="${t('settingsTooltip')}">⚙︎</button>
        </div>

        <div class="z-tabbar">
          <button data-tab="today" class="${activeTab==='today'?'active':''}">${t('tabToday')}</button>
          <button data-tab="history" class="${activeTab==='history'?'active':''}">${t('tabHistory')}</button>
          <button data-tab="goals" class="${activeTab==='goals'?'active':''}">${t('tabGoals')}</button>
        </div>

        ${activeTab==='today' ? `
        <div class="z-card">
          <div class="z-ring-wrap">
            ${ringSVG(pct, done)}
            <div class="z-ring-nums">
              <div class="z-big">${pct}%</div>
              <div class="z-big-label">${t('ringLabel')}</div>
              <div class="z-pill ${done?'good':''}">${done ? t('pillDone') : t('pillContinue')}</div>
            </div>
          </div>
        </div>
        ${data.goals.map(g => exerciseCardHTML(g, day)).join('')}
        ` : ''}

        ${activeTab==='history' ? historyHTML() : ''}

        ${activeTab==='goals' ? goalsHTML() : ''}

        <div class="z-disclaimer">${t('disclaimer')}</div>
      `;
    }

    function ringSVG(pct, done){
      const r = 40, c = 2*Math.PI*r;
      const offset = c - (Math.min(pct,100)/100)*c;
      const color = done ? 'var(--z-good)' : 'var(--z-accent)';
      return `
        <svg width="96" height="96" viewBox="0 0 96 96" style="flex-shrink:0;">
          <circle cx="48" cy="48" r="${r}" fill="none" stroke="var(--z-border)" stroke-width="9"/>
          <circle cx="48" cy="48" r="${r}" fill="none" stroke="${color}" stroke-width="9"
            stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${offset}"
            transform="rotate(-90 48 48)"/>
          <text x="48" y="53" text-anchor="middle" font-size="17" font-weight="700" fill="var(--z-ink)">${pct}%</text>
        </svg>
      `;
    }

    function exerciseCardHTML(g, day){
      const count = (day.counts && day.counts[g.id]) || 0;
      const pct = Math.min(100, Math.round((count / g.target) * 100));
      const done = count >= g.target;
      const howOpen = openHowId === g.id;
      const howText = g.how ? (g.how[lang] || g.how.tr) : null;
      return `
        <div class="z-ex-card">
          <div class="z-ex-top">
            <div class="z-ex-emoji">${g.emoji}</div>
            <div>
              <div class="z-ex-name">${g.name[lang] || g.name.tr}</div>
              <div class="z-ex-target">${t('target')} ${g.target} ${g.unit[lang] || g.unit.tr}</div>
            </div>
          </div>
          <div class="z-ex-bar-track"><div class="z-ex-bar-fill ${done?'done':''}" style="width:${pct}%"></div></div>
          <div class="z-ex-controls">
            <button class="z-ex-btn minus" data-minus="${g.id}">−</button>
            <input class="z-ex-count-input" type="number" inputmode="numeric" min="0" step="1" data-count-input="${g.id}" value="${count}">
            <button class="z-ex-btn" data-plus="${g.id}">+</button>
          </div>
          ${howText ? `
            <button class="z-how-toggle" data-how="${g.id}">${t('howToggle')} ${howOpen ? '▴' : '▾'}</button>
            ${howOpen ? `<div class="z-how-box">${howSVG(g.id)}${howText}</div>` : ''}
          ` : ''}
        </div>
      `;
    }

    function historyHTML(){
      const keys = Object.keys(data.days)
        .filter(k => Object.values(data.days[k].counts || {}).some(v => v > 0))
        .sort((a,b) => b.localeCompare(a));
      if(!keys.length){
        return `<div class="z-card"><div class="z-empty">${t('historyEmpty')}</div></div>`;
      }
      return keys.map(k => {
        const day = data.days[k];
        const pct = dayPct(day);
        const open = openHistDate === k;
        return `
          <div class="z-hist-item" data-hist="${k}">
            <div class="z-hist-head">
              <div class="z-hist-date">${fmtDate(k)}</div>
              <div class="z-hist-pct" style="color:${pct>=100?'var(--z-good)':'var(--z-accent)'}">${pct}%</div>
            </div>
            ${open ? `
              <div class="z-hist-detail">
                ${data.goals.map(g => {
                  const c = (day.counts && day.counts[g.id]) || 0;
                  return `<div class="z-hist-line"><span>${g.emoji} ${g.name[lang] || g.name.tr}</span><b>${c} / ${g.target} ${g.unit[lang] || g.unit.tr}</b></div>`;
                }).join('')}
              </div>
            ` : ''}
          </div>
        `;
      }).join('');
    }

    function goalsHTML(){
      return `
        <div class="z-card">
          <div class="z-sub" style="margin-bottom:8px;">${t('goalsIntro')}</div>
          ${data.goals.map(g => `
            <div class="z-goal-row">
              <div class="z-ex-emoji">${g.emoji}</div>
              <div class="z-goal-name">${g.name[lang] || g.name.tr} <span style="color:var(--z-ink-soft);font-weight:400;">(${g.unit[lang] || g.unit.tr})</span></div>
              <input type="number" min="1" data-goal-target="${g.id}" value="${g.target}">
            </div>
          `).join('')}
          <button class="z-btn-primary" id="z-save-goals">${t('save')}</button>
        </div>
      `;
    }

    function commitCount(id, rawVal){
      const day = getDay(todayKey());
      let val = parseInt(rawVal, 10);
      if(isNaN(val) || val < 0) val = 0;
      day.counts[id] = val;
      persist();
      render();
    }

    function bindShell(){
      root.querySelectorAll('.z-tabbar button').forEach(btn => {
        btn.onclick = () => { activeTab = btn.dataset.tab; render(); };
      });

      const settingsBtn = root.querySelector('#z-open-settings');
      if(settingsBtn) settingsBtn.onclick = () => { activeTab = 'goals'; render(); };

      root.querySelectorAll('[data-plus]').forEach(btn => {
        btn.onclick = () => {
          const id = btn.dataset.plus;
          const day = getDay(todayKey());
          day.counts[id] = (day.counts[id] || 0) + 1;
          persist();
          render();
        };
      });

      root.querySelectorAll('[data-minus]').forEach(btn => {
        btn.onclick = () => {
          const id = btn.dataset.minus;
          const day = getDay(todayKey());
          day.counts[id] = Math.max(0, (day.counts[id] || 0) - 1);
          persist();
          render();
        };
      });

      root.querySelectorAll('[data-count-input]').forEach(inp => {
        inp.addEventListener('change', () => commitCount(inp.dataset.countInput, inp.value));
        inp.addEventListener('keydown', (e) => { if(e.key === 'Enter') inp.blur(); });
      });

      root.querySelectorAll('[data-hist]').forEach(el => {
        el.onclick = () => {
          const k = el.dataset.hist;
          openHistDate = openHistDate === k ? null : k;
          render();
        };
      });

      root.querySelectorAll('[data-how]').forEach(btn => {
        btn.onclick = () => {
          const id = btn.dataset.how;
          openHowId = openHowId === id ? null : id;
          render();
        };
      });

      const saveGoalsBtn = root.querySelector('#z-save-goals');
      if(saveGoalsBtn) saveGoalsBtn.onclick = () => {
        data.goals.forEach(g => {
          const input = root.querySelector(`[data-goal-target="${g.id}"]`);
          if(input){
            const val = parseInt(input.value);
            if(val && val > 0) g.target = val;
          }
        });
        persist();
        activeTab = 'today';
        render();
      };
    }

    loadData();

    return {
      setLang(l){ lang = l; render(); },
    };
  }

  return { init };
})();
