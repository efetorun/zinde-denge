// Zinde — Ev Antrenmanı (namespaced module, embeddable in shell app)
window.ZindeApp = (function(){
  const STORAGE_KEY = 'zinde-app-data-v1';

  const DEFAULT_GOALS = [
    { id:'situp',    name:'Mekik',            emoji:'🔥', target:50, unit:'tekrar',
      how:'Sırt üstü uzan, dizlerini bük ve ayaklarını yere bas. Ellerini göğsünde çaprazla ya da başının arkasında hafifçe tut. Karın kaslarını sıkarak üst gövdeni dizlerine doğru kaldır, tepede bir an dur, sonra kontrollü şekilde sırt üstüne geri in. Boynu çekmeden, hareketi karınla yap.' },
    { id:'pushup',   name:'Şınav',            emoji:'💪', target:30, unit:'tekrar',
      how:'Yüzüstü pozisyonda ellerini omuz genişliğinde yere yasla, vücudun baştan topuğa düz bir çizgi oluştursun. Dirseklerini bükerek göğsünü yere yaklaştır, sonra kollarını iterek başlangıç pozisyonuna dön. Kalçanı düşürme, karnını sıkı tut. Zor geliyorsa dizlerin üzerinde yapabilirsin.' },
    { id:'squat',    name:'Squat',            emoji:'🦵', target:50, unit:'tekrar',
      how:'Ayaklarını omuz genişliğinde aç, sırtını düz tut. Sanki arkanda bir sandalyeye oturuyormuş gibi kalçanı geriye ve aşağı it, dizlerin ayak uçlarını geçmesin. Uyluklar yere paralel olunca topuklarından güç alarak ayağa kalk.' },
    { id:'plank',    name:'Plank',            emoji:'🧘', target:60, unit:'saniye',
      how:'Dirseklerini ve ön kollarını yere koy, dirsekler omuz hizasında olsun. Ayak uçların üzerinde yüksel ve vücudunu baştan topuğa kadar düz bir çizgi halinde tut. Kalçanı ne yukarı kaldır ne de düşür; karın ve kalça kaslarını sıkarak süreyi tamamla.' },
    { id:'jj',       name:'Jumping Jack',     emoji:'🤸', target:50, unit:'tekrar',
      how:'Ayakta dik dur, kollar yanda. Zıplayarak bacaklarını omuz genişliğinden dışarı aç ve aynı anda kollarını başının üstünde birleştir. Ardından zıplayarak başlangıç pozisyonuna dön. Akıcı ve ritmik bir tempoda tekrarla.' },
    { id:'burpee',   name:'Burpee',           emoji:'⚡', target:20, unit:'tekrar',
      how:'Ayakta başla, çömel ve ellerini yere koy. Bacaklarını arkaya fırlatarak plank pozisyonuna geç, istersen bir şınav çek. Bacaklarını tekrar ellerine doğru çek, çömelme pozisyonuna dön ve zıplayarak ayağa kalk. Akıcı tek bir hareket gibi yap.' },
    { id:'lunge',    name:'Lunge',            emoji:'🚶', target:40, unit:'tekrar',
      how:'Bir ayağını öne uzun bir adım at. Her iki dizini de yaklaşık 90 derece bükerek çök; arka diz yere yakın ama değmesin, ön diz ayak ucunu geçmesin. Ön ayağınla itki alarak başlangıç pozisyonuna dön, bacak değiştir.' },
    { id:'mountain', name:'Mountain Climber', emoji:'⛰️', target:40, unit:'tekrar',
      how:'Şınav/plank pozisyonunda başla, eller omuz hizasında yere basılı. Dizlerini sırayla, koşar gibi hızlı hareketle göğsüne doğru çek, sonra geri uzat. Kalçan sabit ve düz kalsın, tempoyu hızlı tut.' },
    { id:'highknees',name:'Yüksek Diz',       emoji:'🏃', target:50, unit:'tekrar',
      how:'Yerinde koşar gibi adım at, her adımda dizini kalça hizasına kadar hızla yukarı kaldır. Kollarını koşar gibi öne-arkaya salla, gövdeni dik tut ve tempoyu canlı tutmaya çalış.' },
    { id:'bridge',   name:'Kalça Köprüsü',    emoji:'🌉', target:40, unit:'tekrar',
      how:'Sırt üstü uzan, dizlerini bük ve ayaklarını kalça genişliğinde yere bas. Topuklarından itki alarak kalçanı yukarı kaldır, omuzdan dize düz bir çizgi oluşana kadar. Tepede kalça kaslarını sık, sonra kontrollü şekilde in.' },
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

    function todayKey(){ return new Date().toISOString().slice(0,10); }
    function fmtDate(k){
      const d = new Date(k+'T00:00:00');
      return d.toLocaleDateString('tr-TR', {weekday:'long', day:'numeric', month:'long'});
    }

    function loadData(){
      try{
        const raw = localStorage.getItem(STORAGE_KEY);
        data = raw ? JSON.parse(raw) : { goals: DEFAULT_GOALS.map(g => ({...g})), days: {} };
        if(!data.goals || !data.goals.length) data.goals = DEFAULT_GOALS.map(g => ({...g}));
        data.goals = data.goals.map(g => {
          const def = DEFAULT_GOALS.find(d => d.id === g.id);
          return def ? { ...def, ...g, how: g.how || def.how } : g;
        });
      }catch(e){
        data = { goals: DEFAULT_GOALS.map(g => ({...g})), days: {} };
      }
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
          <button class="z-gear" id="z-open-settings" title="Hedefleri düzenle">⚙︎</button>
        </div>

        <div class="z-tabbar">
          <button data-tab="today" class="${activeTab==='today'?'active':''}">Bugün</button>
          <button data-tab="history" class="${activeTab==='history'?'active':''}">Geçmiş</button>
          <button data-tab="goals" class="${activeTab==='goals'?'active':''}">Hedefler</button>
        </div>

        ${activeTab==='today' ? `
        <div class="z-card">
          <div class="z-ring-wrap">
            ${ringSVG(pct, done)}
            <div class="z-ring-nums">
              <div class="z-big">${pct}%</div>
              <div class="z-big-label">günlük hedeflerin tamamlandı</div>
              <div class="z-pill ${done?'good':''}">${done ? 'bugünü tamamladın 🎉' : 'devam et'}</div>
            </div>
          </div>
        </div>
        ${data.goals.map(g => exerciseCardHTML(g, day)).join('')}
        ` : ''}

        ${activeTab==='history' ? historyHTML() : ''}

        ${activeTab==='goals' ? goalsHTML() : ''}

        <div class="z-disclaimer">Ağırlıksız ev egzersizleri genel bir öneridir; sağlık durumuna göre tempoyu kendine göre ayarla.</div>
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
      return `
        <div class="z-ex-card">
          <div class="z-ex-top">
            <div class="z-ex-emoji">${g.emoji}</div>
            <div>
              <div class="z-ex-name">${g.name}</div>
              <div class="z-ex-target">hedef: ${g.target} ${g.unit}</div>
            </div>
          </div>
          <div class="z-ex-bar-track"><div class="z-ex-bar-fill ${done?'done':''}" style="width:${pct}%"></div></div>
          <div class="z-ex-controls">
            <button class="z-ex-btn minus" data-minus="${g.id}">−</button>
            <div class="z-ex-count">${count}</div>
            <button class="z-ex-btn" data-plus="${g.id}">+</button>
          </div>
          ${g.how ? `
            <button class="z-how-toggle" data-how="${g.id}">${howOpen ? 'Nasıl yapılır? ▴' : 'Nasıl yapılır? ▾'}</button>
            ${howOpen ? `<div class="z-how-box">${howSVG(g.id)}${g.how}</div>` : ''}
          ` : ''}
        </div>
      `;
    }

    function historyHTML(){
      const keys = Object.keys(data.days)
        .filter(k => Object.values(data.days[k].counts || {}).some(v => v > 0))
        .sort((a,b) => b.localeCompare(a));
      if(!keys.length){
        return `<div class="z-card"><div class="z-empty">Henüz geçmiş kayıt yok. Bugünkü hareketlerini ekleyince burada görünecek.</div></div>`;
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
                  return `<div class="z-hist-line"><span>${g.emoji} ${g.name}</span><b>${c} / ${g.target} ${g.unit}</b></div>`;
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
          <div class="z-sub" style="margin-bottom:8px;">Günlük hedef sayılarını kendine göre ayarla.</div>
          ${data.goals.map(g => `
            <div class="z-goal-row">
              <div class="z-ex-emoji">${g.emoji}</div>
              <div class="z-goal-name">${g.name} <span style="color:var(--z-ink-soft);font-weight:400;">(${g.unit})</span></div>
              <input type="number" min="1" data-goal-target="${g.id}" value="${g.target}">
            </div>
          `).join('')}
          <button class="z-btn-primary" id="z-save-goals">Kaydet</button>
        </div>
      `;
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
  }

  return { init };
})();
