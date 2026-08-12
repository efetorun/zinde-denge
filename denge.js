// Denge — Kişisel Takip (namespaced module, embeddable in shell app)
// FOOD_DB (foods.js) TR/EN/DE çok dilli yiyecek/içecek veritabanını kullanır.
window.DengeApp = (function(){
  const STORAGE_KEY = 'denge-app-data-v1';
  const LANG_KEY_KEY = 'denge-app-lang-v1';
  const LANG_FIELD = { tr:'t', en:'e', de:'d' };
  const LANG_LABEL = { tr:'TR', en:'EN', de:'DE' };

  const MAX_SAFE_KG_PER_WEEK = 0.75;
  const MIN_SAFE_KCAL = 1200;
  const KCAL_PER_KG = 7700;

  function init(rootId){
    const root = document.getElementById(rootId);
    if(!root) return;

    let data = null;
    let activeTab = 'today';
    let foodLang = 'tr';

    function todayKey(){ return new Date().toISOString().slice(0,10); }
    function fmtDate(k){
      const d = new Date(k+'T00:00:00');
      return d.toLocaleDateString('tr-TR', {day:'numeric', month:'long'});
    }

    function loadData(){
      try{
        const raw = localStorage.getItem(STORAGE_KEY);
        data = raw ? JSON.parse(raw) : { profile:null, days:{} };
      }catch(e){
        data = { profile:null, days:{} };
      }
      try{
        foodLang = localStorage.getItem(LANG_KEY_KEY) || 'tr';
      }catch(e){ foodLang = 'tr'; }
      render();
    }

    function persist(){
      try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
      catch(e){ console.error('Kaydetme hatası', e); }
    }
    function persistLang(){
      try{ localStorage.setItem(LANG_KEY_KEY, foodLang); }catch(e){}
    }

    function getDay(key){
      if(!data.days[key]) data.days[key] = { entries: [], weight: null };
      return data.days[key];
    }

    // ---- hesaplamalar ----
    function calcBMR(p){
      const base = 10*p.weight + 6.25*p.height - 5*p.age;
      if(p.sex === 'erkek') return base + 5;
      if(p.sex === 'kadin') return base - 161;
      return base - 78;
    }
    function calcTDEE(p){
      const mult = { az:1.2, orta:1.4, aktif:1.6 }[p.activity] || 1.4;
      return calcBMR(p) * mult;
    }
    function calcPlan(p){
      const tdee = calcTDEE(p);
      const kgToLose = Math.max(0, p.weight - p.goalWeight);
      const requestedWeeks = p.goalWeeks || 4;
      const requestedPace = kgToLose / requestedWeeks;
      const pace = Math.min(requestedPace, MAX_SAFE_KG_PER_WEEK) || 0;
      let dailyDeficit = (pace * KCAL_PER_KG) / 7;
      let target = Math.round(tdee - dailyDeficit);
      let adjustedForFloor = false;
      if(target < MIN_SAFE_KCAL){
        target = MIN_SAFE_KCAL;
        adjustedForFloor = true;
      }
      const actualDeficit = tdee - target;
      const actualPaceWeek = (actualDeficit * 7) / KCAL_PER_KG;
      const realWeeks = actualPaceWeek > 0 ? Math.ceil(kgToLose / actualPaceWeek) : null;
      const wasCapped = requestedPace > MAX_SAFE_KG_PER_WEEK + 0.01;
      return { tdee: Math.round(tdee), target, kgToLose, requestedWeeks, realWeeks, wasCapped, adjustedForFloor };
    }

    // ---- yemek arama ----
    function labelOf(item){ return item[LANG_FIELD[foodLang]]; }
    function filterFoods(q){
      const s = (q||'').trim().toLowerCase();
      if(s.length < 2 || typeof FOOD_DB === 'undefined') return [];
      const out = [];
      for(let i=0;i<FOOD_DB.length && out.length<30;i++){
        const it = FOOD_DB[i];
        if(it.t.toLowerCase().includes(s) || it.e.toLowerCase().includes(s) || it.d.toLowerCase().includes(s)){
          out.push(it);
        }
      }
      return out;
    }

    // ---- render ----
    function render(){
      if(!data.profile){ root.innerHTML = onboardingHTML(); bindOnboarding(); return; }
      root.innerHTML = dashboardHTML();
      bindDashboard();
    }

    function onboardingHTML(){
      return `
        <h1 class="d-h1">Denge</h1>
        <div class="d-sub">Başlamadan önce birkaç bilgiye ihtiyacım var.</div>
        <div class="d-card">
          <label>Boy (cm)</label>
          <input id="d-ob-height" type="number" placeholder="örn. 178" inputmode="decimal">
          <div class="d-grid2">
            <div>
              <label>Mevcut kilo (kg)</label>
              <input id="d-ob-weight" type="number" placeholder="örn. 82" inputmode="decimal">
            </div>
            <div>
              <label>Hedef kilo (kg)</label>
              <input id="d-ob-goal" type="number" placeholder="örn. 75" inputmode="decimal">
            </div>
          </div>
          <div class="d-grid2">
            <div>
              <label>Yaş</label>
              <input id="d-ob-age" type="number" placeholder="örn. 34" inputmode="numeric">
            </div>
            <div>
              <label>Cinsiyet</label>
              <select id="d-ob-sex">
                <option value="erkek">Erkek</option>
                <option value="kadin">Kadın</option>
                <option value="belirtmiyorum">Belirtmiyorum</option>
              </select>
            </div>
          </div>
          <label>Aktivite seviyesi</label>
          <select id="d-ob-activity">
            <option value="az">Az hareketli (çoğunlukla masa başı)</option>
            <option value="orta" selected>Orta aktif (haftada birkaç egzersiz)</option>
            <option value="aktif">Aktif (günlük egzersiz / fiziksel iş)</option>
          </select>
          <label>Bu hedefe kaç haftada ulaşmak istersin?</label>
          <input id="d-ob-weeks" type="number" placeholder="örn. 4" inputmode="numeric">
          <div class="d-note">Not: Haftada 0,5–1 kg dışına çıkan hedefleri otomatik olarak güvenli bir tempoya göre ayarlarım, gerçekçi bir süre önerisiyle.</div>
          <button class="d-btn-primary" id="d-ob-submit">Başla</button>
        </div>
        <div class="d-disclaimer">Bu araç genel bilgi amaçlıdır, tıbbi tavsiye yerine geçmez. Önemli kilo hedefleri için bir doktor veya diyetisyene danışman iyi olur.</div>
      `;
    }

    function readOnboardingForm(){
      const height = parseFloat(root.querySelector('#d-ob-height').value);
      const weight = parseFloat(root.querySelector('#d-ob-weight').value);
      const goalWeight = parseFloat(root.querySelector('#d-ob-goal').value);
      const age = parseInt(root.querySelector('#d-ob-age').value);
      const sex = root.querySelector('#d-ob-sex').value;
      const activity = root.querySelector('#d-ob-activity').value;
      const goalWeeks = parseInt(root.querySelector('#d-ob-weeks').value) || 4;
      return { height, weight, goalWeight, age, sex, activity, goalWeeks };
    }

    function bindOnboarding(){
      root.querySelector('#d-ob-submit').onclick = () => {
        const f = readOnboardingForm();
        if(!f.height || !f.weight || !f.goalWeight || !f.age){
          alert('Lütfen boy, kilo, hedef kilo ve yaş alanlarını doldur.');
          return;
        }
        data.profile = { ...f, startWeight: f.weight, startDate: todayKey() };
        persist();
        render();
      };
    }

    function buildWeightSVG(){
      const days = Object.keys(data.days).filter(k => data.days[k].weight != null).sort();
      const w = 480, h = 130, pad = 24;
      if(days.length < 2){
        return `<div class="d-empty" style="text-align:center;padding:24px 0;">En az 2 kilo ölçümü girince burada bir grafik göreceksin.</div>`;
      }
      const weights = days.map(k => data.days[k].weight);
      const goal = data.profile.goalWeight;
      const allVals = weights.concat([goal]);
      const min = Math.min(...allVals) - 1, max = Math.max(...allVals) + 1;
      const x = i => pad + (i/(days.length-1)) * (w - pad*2);
      const y = v => h - pad - ((v-min)/(max-min)) * (h - pad*2);
      const pathD = weights.map((v,i) => `${i===0?'M':'L'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
      const goalY = y(goal).toFixed(1);
      const dots = weights.map((v,i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="3.5" fill="var(--d-accent)"/>`).join('');
      return `
        <svg viewBox="0 0 ${w} ${h}" style="width:100%;height:${h}px;">
          <line x1="${pad}" y1="${goalY}" x2="${w-pad}" y2="${goalY}" stroke="var(--d-warn)" stroke-dasharray="4 4" stroke-width="1.5"/>
          <text x="${w-pad}" y="${goalY-6}" text-anchor="end" font-size="11" fill="var(--d-warn)">hedef ${goal} kg</text>
          <path d="${pathD}" fill="none" stroke="var(--d-accent)" stroke-width="2.5"/>
          ${dots}
        </svg>
      `;
    }

    function dashboardHTML(){
      const p = data.profile;
      const plan = calcPlan(p);
      const key = todayKey();
      const day = getDay(key);
      const consumed = day.entries.reduce((s,e) => s + e.kcal, 0);
      const remaining = plan.target - consumed;
      const over = remaining < 0;
      const pct = Math.min(100, Math.round((consumed / plan.target) * 100));

      let planNote = '';
      if(plan.wasCapped){
        planNote = `<div class="d-note warn">Girdiğin sürede (${plan.requestedWeeks} hafta) ${plan.kgToLose.toFixed(1)} kg vermek sağlıklı hız sınırını aşıyor. Bunun yerine güvenli bir tempo uyguladım — bu hedefe gerçekçi süre yaklaşık <b>${plan.realWeeks} hafta</b>.</div>`;
      } else if(plan.adjustedForFloor){
        planNote = `<div class="d-note warn">Hesaplanan hedef çok düşük çıktığı için günlük kaloriyi güvenli alt sınıra (${MIN_SAFE_KCAL} kcal) sabitledim.</div>`;
      }

      return `
        <div class="d-row">
          <div>
            <h1 class="d-h1">Denge</h1>
            <div class="d-sub">${fmtDate(key)}</div>
          </div>
          <button class="d-gear" id="d-open-settings" title="Profili düzenle">⚙︎</button>
        </div>

        <div class="d-tabbar">
          <button data-tab="today" class="${activeTab==='today'?'active':''}">Bugün</button>
          <button data-tab="weight" class="${activeTab==='weight'?'active':''}">Kilo</button>
          <button data-tab="tips" class="${activeTab==='tips'?'active':''}">Öneriler</button>
        </div>

        ${activeTab==='today' ? `
        <div class="d-card">
          <div class="d-ring-wrap">
            ${ringSVG(pct, over)}
            <div class="d-ring-nums">
              <div class="d-kcal-big">${consumed} <span style="font-size:16px;color:var(--d-ink-soft);font-weight:500;">/ ${plan.target} kcal</span></div>
              <div class="d-kcal-label">${over ? `${Math.abs(remaining)} kcal hedefin üzerinde` : `${remaining} kcal kaldı`}</div>
              <div class="d-pill ${over?'warn':''}">${over ? 'biraz aştın, sorun değil' : 'yolunda gidiyorsun'}</div>
            </div>
          </div>
          ${over ? overNote(Math.abs(remaining), p.weight) : ''}
          ${planNote}
        </div>

        <div class="d-card">
          <div class="d-section-title">Bugün ne yedin?</div>
          <div class="d-lang-pills">
            <button data-lang="tr" class="${foodLang==='tr'?'active':''}">TR</button>
            <button data-lang="en" class="${foodLang==='en'?'active':''}">EN</button>
            <button data-lang="de" class="${foodLang==='de'?'active':''}">DE</button>
            <span class="d-lang-note">≈5000 yiyecek/içecek, 3 dilde aranabilir</span>
          </div>
          <div class="d-grid2" style="margin-top:10px;">
            <div style="position:relative;">
              <input id="d-new-food" type="text" placeholder="ör. elma / apple / Apfel" autocomplete="off">
              <div id="d-suggestions" class="d-suggestions"></div>
            </div>
            <input id="d-new-kcal" type="number" placeholder="kcal" inputmode="numeric">
          </div>
          <div class="d-note" style="margin-top:8px;">Listeden bir öneriye dokunursan kalori otomatik dolar. Listede yoksa kalori kısmını elle gir.</div>
          <button class="d-btn-primary" id="d-add-entry">Ekle</button>
          <div class="d-entry-list">
            ${day.entries.length === 0 ? '<div class="d-empty">Henüz kayıt yok.</div>' :
              day.entries.map(e => `
                <div class="d-entry">
                  <span>${e.name}</span>
                  <span style="display:flex;align-items:center;gap:8px;">
                    <span style="color:var(--d-ink-soft);">${e.kcal} kcal</span>
                    <button class="d-entry-del" data-id="${e.id}">✕</button>
                  </span>
                </div>`).join('')}
          </div>
        </div>
        ` : ''}

        ${activeTab==='weight' ? `
        <div class="d-card">
          <div class="d-section-title">Kilo takibi</div>
          ${buildWeightSVG()}
          <label>Bugünkü kilon (kg)</label>
          <div class="d-row" style="gap:10px;align-items:stretch;">
            <input id="d-weight-input" type="number" inputmode="decimal" value="${day.weight ?? ''}" placeholder="örn. 80.5">
            <button class="d-btn-primary" style="width:auto;margin-top:0;" id="d-save-weight">Kaydet</button>
          </div>
          <div class="d-note">Başlangıç: ${p.startWeight} kg · Hedef: ${p.goalWeight} kg · Şu ana kadar: ${(p.startWeight - (day.weight ?? p.weight)).toFixed(1)} kg</div>
        </div>
        ` : ''}

        ${activeTab==='tips' ? `
        <div class="d-card">
          <div class="d-section-title">Genel beslenme önerileri</div>
          <ul class="d-tips">
            <li>Her öğünde protein bulunmasına dikkat et (yumurta, yoğurt, baklagiller, yağsız et/balık) — tokluk süresini uzatır.</li>
            <li>Sebze ve tam tahılları öncelikli tut, işlenmiş/şekerli gıdaları azalt.</li>
            <li>Yeterli su iç; bazen susuzluk açlıkla karışabilir.</li>
            <li>Aşırı kısıtlama yerine dengeli, sürdürülebilir porsiyonlar hedefle — uzun vadede işe yarayan budur.</li>
          </ul>
          <div class="d-section-title" style="margin-top:16px;">Basit hareket önerileri</div>
          <ul class="d-tips">
            <li>Günde 7.000–10.000 adım iyi bir temel hedeftir; kısa yürüyüşlerle bölebilirsin.</li>
            <li>Haftada 2-3 gün temel kuvvet çalışması (squat, plank, bantla direnç) kas kütlesini korur.</li>
            <li>Merdiven kullanmak, kısa mesafeleri yürümek gibi küçük alışkanlıklar toplamda fark yaratır.</li>
          </ul>
          <div class="d-disclaimer" style="margin-top:16px;">Bu genel öneriler tıbbi/diyetisyen tavsiyesinin yerini tutmaz.</div>
        </div>
        ` : ''}
      `;
    }

    function ringSVG(pct, over){
      const r = 42, c = 2*Math.PI*r;
      const offset = c - (Math.min(pct,100)/100)*c;
      const color = over ? 'var(--d-warn)' : 'var(--d-accent)';
      return `
        <svg width="100" height="100" viewBox="0 0 100 100" style="flex-shrink:0;">
          <circle cx="50" cy="50" r="${r}" fill="none" stroke="var(--d-border)" stroke-width="9"/>
          <circle cx="50" cy="50" r="${r}" fill="none" stroke="${color}" stroke-width="9"
            stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${offset}"
            transform="rotate(-90 50 50)"/>
          <text x="50" y="55" text-anchor="middle" font-size="18" font-weight="700" fill="var(--d-ink)">${pct}%</text>
        </svg>
      `;
    }

    function overNote(excessKcal, weightKg){
      const kcalPerStep = weightKg * 0.0005;
      let steps = Math.round(excessKcal / kcalPerStep);
      steps = Math.min(steps, 6000);
      steps = Math.round(steps/100)*100;
      return `<div class="d-note">Bugün biraz fazla oldu, önemli değil — tek gün büyük resmi değiştirmez. İstersen dengelemek için ~${steps} adımlık bir yürüyüş iyi gelebilir.</div>`;
    }

    function renderSuggestions(query){
      const box = root.querySelector('#d-suggestions');
      if(!box) return;
      const matches = filterFoods(query);
      if(!matches.length){ box.innerHTML=''; box.style.display='none'; return; }
      box.style.display = 'block';
      box.innerHTML = matches.map((it,i) => `<div class="d-sugg-item" data-idx="${i}">${labelOf(it)} <span class="d-sugg-kcal">${it.k} kcal</span></div>`).join('');
      box.querySelectorAll('.d-sugg-item').forEach((el,i) => {
        el.onclick = () => {
          const it = matches[i];
          const foodInput = root.querySelector('#d-new-food');
          const kcalInput = root.querySelector('#d-new-kcal');
          foodInput.value = labelOf(it);
          kcalInput.value = it.k;
          box.innerHTML = '';
          box.style.display = 'none';
        };
      });
    }

    function bindDashboard(){
      const settingsBtn = root.querySelector('#d-open-settings');
      if(settingsBtn) settingsBtn.onclick = () => {
        const prev = data.profile;
        data.profile = null;
        render();
        root.querySelector('#d-ob-height').value = prev.height;
        root.querySelector('#d-ob-weight').value = prev.weight;
        root.querySelector('#d-ob-goal').value = prev.goalWeight;
        root.querySelector('#d-ob-age').value = prev.age;
        root.querySelector('#d-ob-sex').value = prev.sex;
        root.querySelector('#d-ob-activity').value = prev.activity;
        root.querySelector('#d-ob-weeks').value = prev.goalWeeks;
        root.querySelector('#d-ob-submit').onclick = () => {
          const f = readOnboardingForm();
          data.profile = { ...prev, ...f };
          persist();
          render();
        };
      };

      root.querySelectorAll('.d-tabbar button').forEach(btn => {
        btn.onclick = () => { activeTab = btn.dataset.tab; render(); };
      });

      root.querySelectorAll('.d-lang-pills button[data-lang]').forEach(btn => {
        btn.onclick = () => {
          foodLang = btn.dataset.lang;
          persistLang();
          root.querySelectorAll('.d-lang-pills button[data-lang]').forEach(b => b.classList.toggle('active', b.dataset.lang===foodLang));
          const foodInput = root.querySelector('#d-new-food');
          if(foodInput && foodInput.value) renderSuggestions(foodInput.value);
        };
      });

      const foodInput = root.querySelector('#d-new-food');
      const kcalInput = root.querySelector('#d-new-kcal');
      if(foodInput){
        foodInput.addEventListener('input', () => renderSuggestions(foodInput.value));
        foodInput.addEventListener('blur', () => {
          setTimeout(() => {
            const box = root.querySelector('#d-suggestions');
            if(box){ box.innerHTML=''; box.style.display='none'; }
          }, 150);
        });
      }

      const addBtn = root.querySelector('#d-add-entry');
      if(addBtn) addBtn.onclick = () => {
        const name = foodInput.value.trim();
        const kcal = parseInt(kcalInput.value);
        if(!name || !kcal){ return; }
        const day = getDay(todayKey());
        day.entries.push({ id: Date.now(), name, kcal });
        persist();
        render();
      };

      root.querySelectorAll('.d-entry-del').forEach(btn => {
        btn.onclick = () => {
          const day = getDay(todayKey());
          day.entries = day.entries.filter(e => e.id !== parseInt(btn.dataset.id));
          persist();
          render();
        };
      });

      const saveWeightBtn = root.querySelector('#d-save-weight');
      if(saveWeightBtn) saveWeightBtn.onclick = () => {
        const val = parseFloat(root.querySelector('#d-weight-input').value);
        if(!val) return;
        const day = getDay(todayKey());
        day.weight = val;
        data.profile.weight = val;
        persist();
        render();
      };
    }

    loadData();
  }

  return { init };
})();
