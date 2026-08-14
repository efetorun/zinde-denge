// Denge — Kişisel Takip (namespaced module, embeddable in shell app)
// Çok dilli (TR/EN/DE) arayüz — window.DengeApp.init(rootId) ve dönen setLang(lang) ile kullanılır.
// FOOD_DB (foods.js) TR/EN/DE çok dilli yiyecek/içecek veritabanını kullanır.
window.DengeApp = (function(){
  const STORAGE_KEY = 'denge-app-data-v1';
  const APP_LANG_KEY = 'app-lang-v1';
  const FOOD_LANG_KEY = 'denge-app-lang-v1';
  const LANG_FIELD = { tr:'t', en:'e', de:'d' };
  const LOCALE = { tr:'tr-TR', en:'en-US', de:'de-DE' };

  const MAX_SAFE_KG_PER_WEEK = 0.75;
  const MIN_SAFE_KCAL = 1200;
  const KCAL_PER_KG = 7700;

  const STRINGS = {
    tr: {
      onboardIntro:'Başlamadan önce birkaç bilgiye ihtiyacım var.',
      labelHeight:'Boy (cm)', phHeight:'örn. 178',
      labelWeight:'Mevcut kilo (kg)', phWeight:'örn. 82',
      labelGoalWeight:'Hedef kilo (kg)', phGoalWeight:'örn. 75',
      labelAge:'Yaş', phAge:'örn. 34',
      labelSex:'Cinsiyet', sexMale:'Erkek', sexFemale:'Kadın', sexUnspec:'Belirtmiyorum',
      labelActivity:'Aktivite seviyesi',
      activityLow:'Az hareketli (çoğunlukla masa başı)',
      activityMid:'Orta aktif (haftada birkaç egzersiz)',
      activityHigh:'Aktif (günlük egzersiz / fiziksel iş)',
      labelWeeks:'Bu hedefe kaç haftada ulaşmak istersin?', phWeeks:'örn. 4',
      onboardNote:'Not: Haftada 0,5–1 kg dışına çıkan hedefleri otomatik olarak güvenli bir tempoya göre ayarlarım, gerçekçi bir süre önerisiyle.',
      start:'Başla',
      onboardDisclaimer:'Bu araç genel bilgi amaçlıdır, tıbbi tavsiye yerine geçmez. Önemli kilo hedefleri için bir doktor veya diyetisyene danışman iyi olur.',
      alertFillFields:'Lütfen boy, kilo, hedef kilo ve yaş alanlarını doldur.',
      settingsTooltip:'Profili düzenle',
      tabToday:'Bugün', tabWeight:'Kilo', tabTips:'Öneriler',
      pillOver:'biraz aştın, sorun değil', pillGood:'yolunda gidiyorsun',
      foodSectionTitle:'Bugün ne yedin?',
      langNote:'≈5000 yiyecek/içecek, 3 dilde aranabilir',
      foodPlaceholder:'ör. elma / apple / Apfel',
      foodHint:'Listeden bir öneriye dokunursan kalori otomatik dolar. Listede yoksa kalori kısmını elle gir.',
      add:'Ekle', entryEmpty:'Henüz kayıt yok.',
      weightSectionTitle:'Kilo takibi',
      weightChartEmpty:'En az 2 kilo ölçümü girince burada bir grafik göreceksin.',
      weightLabel:'Bugünkü kilon (kg)', save:'Kaydet',
      tipsTitle1:'Genel beslenme önerileri',
      tips1:[
        'Her öğünde protein bulunmasına dikkat et (yumurta, yoğurt, baklagiller, yağsız et/balık) — tokluk süresini uzatır.',
        'Sebze ve tam tahılları öncelikli tut, işlenmiş/şekerli gıdaları azalt.',
        'Yeterli su iç; bazen susuzluk açlıkla karışabilir.',
        'Aşırı kısıtlama yerine dengeli, sürdürülebilir porsiyonlar hedefle — uzun vadede işe yarayan budur.',
      ],
      tipsTitle2:'Basit hareket önerileri',
      tips2:[
        'Günde 7.000–10.000 adım iyi bir temel hedeftir; kısa yürüyüşlerle bölebilirsin.',
        'Haftada 2-3 gün temel kuvvet çalışması (squat, plank, bantla direnç) kas kütlesini korur.',
        'Merdiven kullanmak, kısa mesafeleri yürümek gibi küçük alışkanlıklar toplamda fark yaratır.',
      ],
      tipsDisclaimer:'Bu genel öneriler tıbbi/diyetisyen tavsiyesinin yerini tutmaz.',
      kcalRemaining:(r)=>`${r} kcal kaldı`,
      kcalOver:(x)=>`${x} kcal hedefin üzerinde`,
      overNote:(steps)=>`Bugün biraz fazla oldu, önemli değil — tek gün büyük resmi değiştirmez. İstersen dengelemek için ~${steps} adımlık bir yürüyüş iyi gelebilir.`,
      planCapped:(w,kg,rw)=>`Girdiğin sürede (${w} hafta) ${kg} kg vermek sağlıklı hız sınırını aşıyor. Bunun yerine güvenli bir tempo uyguladım — bu hedefe gerçekçi süre yaklaşık <b>${rw} hafta</b>.`,
      planFloor:(min)=>`Hesaplanan hedef çok düşük çıktığı için günlük kaloriyi güvenli alt sınıra (${min} kcal) sabitledim.`,
      weightGoalLine:(g)=>`hedef ${g} kg`,
      weightNote:(s,g,so)=>`Başlangıç: ${s} kg · Hedef: ${g} kg · Şu ana kadar: ${so} kg`,
    },
    en: {
      onboardIntro:'I need a few details before we start.',
      labelHeight:'Height (cm)', phHeight:'e.g. 178',
      labelWeight:'Current weight (kg)', phWeight:'e.g. 82',
      labelGoalWeight:'Goal weight (kg)', phGoalWeight:'e.g. 75',
      labelAge:'Age', phAge:'e.g. 34',
      labelSex:'Sex', sexMale:'Male', sexFemale:'Female', sexUnspec:'Prefer not to say',
      labelActivity:'Activity level',
      activityLow:'Low activity (mostly desk-based)',
      activityMid:'Moderately active (a few workouts a week)',
      activityHigh:'Active (daily exercise / physical job)',
      labelWeeks:'In how many weeks do you want to reach this goal?', phWeeks:'e.g. 4',
      onboardNote:"Note: if your goal exceeds a safe pace of 0.5–1 kg per week, I'll automatically adjust it to a safer pace and suggest a realistic timeframe.",
      start:'Start',
      onboardDisclaimer:'This tool is for general information only and is not medical advice. For significant weight goals, consider consulting a doctor or dietitian.',
      alertFillFields:'Please fill in height, weight, goal weight, and age.',
      settingsTooltip:'Edit profile',
      tabToday:'Today', tabWeight:'Weight', tabTips:'Tips',
      pillOver:"a bit over, that's okay", pillGood:"you're on track",
      foodSectionTitle:'What did you eat today?',
      langNote:'≈5000 foods/drinks, searchable in 3 languages',
      foodPlaceholder:'e.g. elma / apple / Apfel',
      foodHint:"Tap a suggestion from the list and the calories fill in automatically. If it's not listed, enter the calories manually.",
      add:'Add', entryEmpty:'No entries yet.',
      weightSectionTitle:'Weight tracking',
      weightChartEmpty:'Once you log at least 2 weight entries, a chart will appear here.',
      weightLabel:"Today's weight (kg)", save:'Save',
      tipsTitle1:'General nutrition tips',
      tips1:[
        'Make sure each meal includes protein (eggs, yogurt, legumes, lean meat/fish) — it keeps you fuller for longer.',
        'Prioritize vegetables and whole grains, and cut back on processed/sugary foods.',
        'Drink enough water; thirst is sometimes mistaken for hunger.',
        "Aim for balanced, sustainable portions instead of extreme restriction — that's what works long-term.",
      ],
      tipsTitle2:'Simple movement tips',
      tips2:[
        '7,000–10,000 steps a day is a solid baseline goal; you can split it into short walks.',
        'Basic strength work 2-3 days a week (squats, planks, resistance bands) helps preserve muscle mass.',
        'Small habits like taking the stairs or walking short distances add up over time.',
      ],
      tipsDisclaimer:'These general tips are not a substitute for medical or dietitian advice.',
      kcalRemaining:(r)=>`${r} kcal left`,
      kcalOver:(x)=>`${x} kcal over target`,
      overNote:(steps)=>`Today went a bit over, no big deal — one day doesn't change the big picture. If you'd like to balance it out, a walk of about ${steps} steps could help.`,
      planCapped:(w,kg,rw)=>`Losing ${kg} kg in the time you set (${w} weeks) exceeds a healthy pace. I applied a safer pace instead — a realistic timeframe for this goal is about <b>${rw} weeks</b>.`,
      planFloor:(min)=>`Since the calculated target was too low, I capped your daily calories at the safe minimum (${min} kcal).`,
      weightGoalLine:(g)=>`goal ${g} kg`,
      weightNote:(s,g,so)=>`Starting: ${s} kg · Goal: ${g} kg · So far: ${so} kg`,
    },
    de: {
      onboardIntro:'Bevor wir starten, brauche ich ein paar Angaben.',
      labelHeight:'Größe (cm)', phHeight:'z.B. 178',
      labelWeight:'Aktuelles Gewicht (kg)', phWeight:'z.B. 82',
      labelGoalWeight:'Zielgewicht (kg)', phGoalWeight:'z.B. 75',
      labelAge:'Alter', phAge:'z.B. 34',
      labelSex:'Geschlecht', sexMale:'Männlich', sexFemale:'Weiblich', sexUnspec:'Keine Angabe',
      labelActivity:'Aktivitätslevel',
      activityLow:'Wenig aktiv (überwiegend sitzend)',
      activityMid:'Mäßig aktiv (einige Workouts pro Woche)',
      activityHigh:'Aktiv (tägliches Training / körperliche Arbeit)',
      labelWeeks:'In wie vielen Wochen möchtest du dieses Ziel erreichen?', phWeeks:'z.B. 4',
      onboardNote:'Hinweis: Ziele, die mehr als 0,5–1 kg pro Woche vorsehen, passe ich automatisch auf ein sicheres Tempo an und schlage einen realistischen Zeitraum vor.',
      start:'Starten',
      onboardDisclaimer:'Dieses Tool dient nur zur allgemeinen Information und ersetzt keine medizinische Beratung. Bei größeren Gewichtszielen ist es sinnvoll, einen Arzt oder Ernährungsberater zu konsultieren.',
      alertFillFields:'Bitte Größe, Gewicht, Zielgewicht und Alter ausfüllen.',
      settingsTooltip:'Profil bearbeiten',
      tabToday:'Heute', tabWeight:'Gewicht', tabTips:'Tipps',
      pillOver:'etwas drüber, kein Problem', pillGood:'du bist auf Kurs',
      foodSectionTitle:'Was hast du heute gegessen?',
      langNote:'≈5000 Lebensmittel/Getränke, in 3 Sprachen durchsuchbar',
      foodPlaceholder:'z.B. elma / apple / Apfel',
      foodHint:'Tippe auf einen Vorschlag aus der Liste, dann werden die Kalorien automatisch ausgefüllt. Falls nicht gelistet, gib die Kalorien manuell ein.',
      add:'Hinzufügen', entryEmpty:'Noch keine Einträge.',
      weightSectionTitle:'Gewichtsverlauf',
      weightChartEmpty:'Sobald du mindestens 2 Gewichtswerte eingetragen hast, erscheint hier ein Diagramm.',
      weightLabel:'Heutiges Gewicht (kg)', save:'Speichern',
      tipsTitle1:'Allgemeine Ernährungstipps',
      tips1:[
        'Achte darauf, dass jede Mahlzeit Protein enthält (Eier, Joghurt, Hülsenfrüchte, mageres Fleisch/Fisch) — das hält länger satt.',
        'Bevorzuge Gemüse und Vollkornprodukte, reduziere verarbeitete/zuckerhaltige Lebensmittel.',
        'Trinke ausreichend Wasser; Durst wird manchmal mit Hunger verwechselt.',
        'Setze auf ausgewogene, nachhaltige Portionen statt extremer Einschränkung — das funktioniert langfristig.',
      ],
      tipsTitle2:'Einfache Bewegungstipps',
      tips2:[
        '7.000–10.000 Schritte am Tag sind ein gutes Grundziel; du kannst es auf kurze Spaziergänge aufteilen.',
        'Grundlegendes Krafttraining an 2-3 Tagen pro Woche (Kniebeugen, Plank, Widerstandsbänder) erhält die Muskelmasse.',
        'Kleine Gewohnheiten wie Treppensteigen oder kurze Strecken zu Fuß machen in der Summe einen Unterschied.',
      ],
      tipsDisclaimer:'Diese allgemeinen Tipps ersetzen keine ärztliche oder ernährungsberaterische Beratung.',
      kcalRemaining:(r)=>`noch ${r} kcal`,
      kcalOver:(x)=>`${x} kcal über dem Ziel`,
      overNote:(steps)=>`Heute war etwas zu viel, kein Problem — ein einzelner Tag ändert nichts am großen Ganzen. Wenn du ausgleichen möchtest, könnten etwa ${steps} Schritte spazieren helfen.`,
      planCapped:(w,kg,rw)=>`${kg} kg in der von dir angegebenen Zeit (${w} Wochen) zu verlieren, übersteigt ein gesundes Tempo. Ich habe stattdessen ein sicheres Tempo angewendet — ein realistischer Zeitraum für dieses Ziel liegt bei etwa <b>${rw} Wochen</b>.`,
      planFloor:(min)=>`Da das berechnete Ziel zu niedrig war, habe ich die Tageskalorien auf das sichere Minimum (${min} kcal) begrenzt.`,
      weightGoalLine:(g)=>`Ziel ${g} kg`,
      weightNote:(s,g,so)=>`Start: ${s} kg · Ziel: ${g} kg · Bisher: ${so} kg`,
    },
  };

  function init(rootId){
    const root = document.getElementById(rootId);
    if(!root) return;

    let data = null;
    let activeTab = 'today';
    let foodLang = 'tr';
    let lang = 'tr';

    function t(key){ return (STRINGS[lang] || STRINGS.tr)[key]; }
    function todayKey(){ return new Date().toISOString().slice(0,10); }
    function fmtDate(k){
      const d = new Date(k+'T00:00:00');
      return d.toLocaleDateString(LOCALE[lang] || 'tr-TR', {day:'numeric', month:'long'});
    }

    function loadData(){
      try{
        const raw = localStorage.getItem(STORAGE_KEY);
        data = raw ? JSON.parse(raw) : { profile:null, days:{} };
      }catch(e){
        data = { profile:null, days:{} };
      }
      try{ foodLang = localStorage.getItem(FOOD_LANG_KEY) || 'tr'; }catch(e){ foodLang = 'tr'; }
      try{ lang = localStorage.getItem(APP_LANG_KEY) || 'tr'; }catch(e){ lang = 'tr'; }
      render();
    }

    function persist(){
      try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
      catch(e){ console.error('Kaydetme hatası', e); }
    }
    function persistFoodLang(){
      try{ localStorage.setItem(FOOD_LANG_KEY, foodLang); }catch(e){}
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
        <div class="d-sub">${t('onboardIntro')}</div>
        <div class="d-card">
          <label>${t('labelHeight')}</label>
          <input id="d-ob-height" type="number" placeholder="${t('phHeight')}" inputmode="decimal">
          <div class="d-grid2">
            <div>
              <label>${t('labelWeight')}</label>
              <input id="d-ob-weight" type="number" placeholder="${t('phWeight')}" inputmode="decimal">
            </div>
            <div>
              <label>${t('labelGoalWeight')}</label>
              <input id="d-ob-goal" type="number" placeholder="${t('phGoalWeight')}" inputmode="decimal">
            </div>
          </div>
          <div class="d-grid2">
            <div>
              <label>${t('labelAge')}</label>
              <input id="d-ob-age" type="number" placeholder="${t('phAge')}" inputmode="numeric">
            </div>
            <div>
              <label>${t('labelSex')}</label>
              <select id="d-ob-sex">
                <option value="erkek">${t('sexMale')}</option>
                <option value="kadin">${t('sexFemale')}</option>
                <option value="belirtmiyorum">${t('sexUnspec')}</option>
              </select>
            </div>
          </div>
          <label>${t('labelActivity')}</label>
          <select id="d-ob-activity">
            <option value="az">${t('activityLow')}</option>
            <option value="orta" selected>${t('activityMid')}</option>
            <option value="aktif">${t('activityHigh')}</option>
          </select>
          <label>${t('labelWeeks')}</label>
          <input id="d-ob-weeks" type="number" placeholder="${t('phWeeks')}" inputmode="numeric">
          <div class="d-note">${t('onboardNote')}</div>
          <button class="d-btn-primary" id="d-ob-submit">${t('start')}</button>
        </div>
        <div class="d-disclaimer">${t('onboardDisclaimer')}</div>
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
          alert(t('alertFillFields'));
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
        return `<div class="d-empty" style="text-align:center;padding:24px 0;">${t('weightChartEmpty')}</div>`;
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
          <text x="${w-pad}" y="${goalY-6}" text-anchor="end" font-size="11" fill="var(--d-warn)">${t('weightGoalLine')(goal)}</text>
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
        planNote = `<div class="d-note warn">${t('planCapped')(plan.requestedWeeks, plan.kgToLose.toFixed(1), plan.realWeeks)}</div>`;
      } else if(plan.adjustedForFloor){
        planNote = `<div class="d-note warn">${t('planFloor')(MIN_SAFE_KCAL)}</div>`;
      }

      return `
        <div class="d-row">
          <div>
            <h1 class="d-h1">Denge</h1>
            <div class="d-sub">${fmtDate(key)}</div>
          </div>
          <button class="d-gear" id="d-open-settings" title="${t('settingsTooltip')}">⚙︎</button>
        </div>

        <div class="d-tabbar">
          <button data-tab="today" class="${activeTab==='today'?'active':''}">${t('tabToday')}</button>
          <button data-tab="weight" class="${activeTab==='weight'?'active':''}">${t('tabWeight')}</button>
          <button data-tab="tips" class="${activeTab==='tips'?'active':''}">${t('tabTips')}</button>
        </div>

        ${activeTab==='today' ? `
        <div class="d-card">
          <div class="d-ring-wrap">
            ${ringSVG(pct, over)}
            <div class="d-ring-nums">
              <div class="d-kcal-big">${consumed} <span style="font-size:16px;color:var(--d-ink-soft);font-weight:500;">/ ${plan.target} kcal</span></div>
              <div class="d-kcal-label">${over ? t('kcalOver')(Math.abs(remaining)) : t('kcalRemaining')(remaining)}</div>
              <div class="d-pill ${over?'warn':''}">${over ? t('pillOver') : t('pillGood')}</div>
            </div>
          </div>
          ${over ? overNote(Math.abs(remaining), p.weight) : ''}
          ${planNote}
        </div>

        <div class="d-card">
          <div class="d-section-title">${t('foodSectionTitle')}</div>
          <div class="d-lang-pills">
            <button data-lang="tr" class="${foodLang==='tr'?'active':''}">TR</button>
            <button data-lang="en" class="${foodLang==='en'?'active':''}">EN</button>
            <button data-lang="de" class="${foodLang==='de'?'active':''}">DE</button>
            <span class="d-lang-note">${t('langNote')}</span>
          </div>
          <div class="d-grid2" style="margin-top:10px;">
            <div style="position:relative;">
              <input id="d-new-food" type="text" placeholder="${t('foodPlaceholder')}" autocomplete="off">
              <div id="d-suggestions" class="d-suggestions"></div>
            </div>
            <input id="d-new-kcal" type="number" placeholder="kcal" inputmode="numeric">
          </div>
          <div class="d-note" style="margin-top:8px;">${t('foodHint')}</div>
          <button class="d-btn-primary" id="d-add-entry">${t('add')}</button>
          <div class="d-entry-list">
            ${day.entries.length === 0 ? `<div class="d-empty">${t('entryEmpty')}</div>` :
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
          <div class="d-section-title">${t('weightSectionTitle')}</div>
          ${buildWeightSVG()}
          <label>${t('weightLabel')}</label>
          <div class="d-row" style="gap:10px;align-items:stretch;">
            <input id="d-weight-input" type="number" inputmode="decimal" value="${day.weight ?? ''}" placeholder="örn. 80.5">
            <button class="d-btn-primary" style="width:auto;margin-top:0;" id="d-save-weight">${t('save')}</button>
          </div>
          <div class="d-note">${t('weightNote')(p.startWeight, p.goalWeight, (p.startWeight - (day.weight ?? p.weight)).toFixed(1))}</div>
        </div>
        ` : ''}

        ${activeTab==='tips' ? `
        <div class="d-card">
          <div class="d-section-title">${t('tipsTitle1')}</div>
          <ul class="d-tips">
            ${t('tips1').map(x => `<li>${x}</li>`).join('')}
          </ul>
          <div class="d-section-title" style="margin-top:16px;">${t('tipsTitle2')}</div>
          <ul class="d-tips">
            ${t('tips2').map(x => `<li>${x}</li>`).join('')}
          </ul>
          <div class="d-disclaimer" style="margin-top:16px;">${t('tipsDisclaimer')}</div>
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
      return `<div class="d-note">${t('overNote')(steps)}</div>`;
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
          persistFoodLang();
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

    return {
      setLang(l){ lang = l; render(); },
    };
  }

  return { init };
})();
