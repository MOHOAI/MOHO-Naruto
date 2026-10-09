const BASE_SERVER = 'https://server.sanime.net/Video2/512/';
const episodeUrl = (number) => `${BASE_SERVER}${number}.mp4`;
const ARC_NAMES = ['آرك إنقاذ الكازيكاغي غارا','آرك استعادة ساسكي ولمّ الشمل','آرك نينجا الحراس الاثني عشر','آرك هيدان وكاكوزو','آرك ظهور ذي الذيول الثلاثة','آرك مطاردة إيتاتشي','آرك قصة جيرايا الشجاع','آرك هجوم باين','آرك قمة الكاجي الخمسة','آرك الحرب العظمى الرابعة'];
const episodeData = Array.from({ length: 500 }, (_, index) => {
  const n = index + 1;
  const season = Math.min(10, Math.ceil(n / 50));
  const filler = [54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255,256,257,258,259,260,261,262,263,264,265,266,267,268,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285,286,287,288,289,290,291,292,303,304,305,306,307,308,309,310,311,312,313,314,315,316,317,318,319,320,321,322,323,324,325,326,327,328,329,330,331,332,333,334,335,336,337,338,339,340,341,342,343,344,345,346,347,348,349,350,351,352,353,354,355,356,357,358,359,360,361,362,363,364,365,366,367,368,369,370,371,372,373,374,375,376,377,378,379,380,381,382,383,384,385,386,387,388,389,390,391,392,393,394,395,396,397,398,399,400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499,500].includes(n);
  return { n, season, type: filler ? 'filler' : 'canon', arc: ARC_NAMES[Math.min(ARC_NAMES.length - 1, Math.floor((n - 1) / 52))] };
});

const getProgress = () => { try { return JSON.parse(localStorage.getItem('moho_progress')) || { current: 8, time: 0, watched: [] }; } catch { return { current: 8, time: 0, watched: [] }; } };
const saveProgress = (data) => { try { localStorage.setItem('moho_progress', JSON.stringify(data)); } catch {} };
const userProgress = getProgress();

const state = { season: 'all', type: 'all', search: '', limit: 24, current: userProgress.current };
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const toast = (message) => { const el = $('#toast'); el.textContent = message; el.classList.add('show'); window.clearTimeout(toast.timer); toast.timer = window.setTimeout(() => el.classList.remove('show'), 2600); };

function markWatched(episodeNum) {
  if (!userProgress.watched.includes(episodeNum)) {
    userProgress.watched.push(episodeNum);
    saveProgress(userProgress);
    renderEpisodes();
  }
}

function getFilteredEpisodes() {
  const query = state.search.trim().toLowerCase();
  return episodeData.filter((episode) => {
    const matchesSeason = state.season === 'all' || episode.season === Number(state.season);
    const matchesType = state.type === 'all' || episode.type === state.type;
    const matchesSearch = !query || String(episode.n).includes(query) || episode.arc.toLowerCase().includes(query);
    return matchesSeason && matchesType && matchesSearch;
  });
}

function renderSeasonTabs() {
  const tabsContainer = $('#seasonTabs');
  if (!tabsContainer) return;
  const tabs = [{ id: 'all', label: 'الكل' }, ...Array.from({ length: 10 }, (_, i) => ({ id: String(i + 1), label: `م${i + 1}` }))];
  tabsContainer.innerHTML = tabs.map((tab) => `<button class="season-tab ${String(state.season) === tab.id ? 'active' : ''}" data-season="${tab.id}">${tab.label}</button>`).join('');
  $$('.season-tab').forEach((tab) => tab.addEventListener('click', () => { state.season = tab.dataset.season; state.limit = 24; render(); }));
}

function episodeCard(episode) {
  const active = episode.n === state.current;
  const isWatched = userProgress.watched.includes(episode.n);
  const typeLabel = episode.type === 'canon' ? 'مانغا' : 'فلر';
  return `<article class="episode-card ${active ? 'active' : ''} ${isWatched ? 'watched' : ''}" data-episode="${episode.n}" tabindex="0" aria-label="الحلقة ${episode.n}">
    <div class="ep-top"><span class="ep-num">${String(episode.n).padStart(2, '0')}</span><span class="ep-type ${episode.type}">${typeLabel}</span></div>
    <div class="ep-title">${episode.arc}</div>
    <div class="ep-bottom"><span>23 دقيقة</span><span class="ep-play">${isWatched ? '✓' : (active ? '●' : '▶')}</span></div>
  </article>`;
}

function renderEpisodes() {
  const grid = $('#episodesGrid');
  if (!grid) return;
  const filtered = getFilteredEpisodes();
  const visible = filtered.slice(0, state.limit);
  grid.innerHTML = visible.length ? visible.map(episodeCard).join('') : `<div class="empty-state">لا توجد نتائج بهذا البحث. جرّب رقمًا آخر أو أعد التصفية.</div>`;
  const countEl = $('#episodesCount'); if (countEl) countEl.textContent = `عرض ${visible.length} من ${filtered.length} حلقة`;
  const titleEl = $('#episodesTitle'); if (titleEl) titleEl.textContent = state.search ? `نتائج البحث: ${state.search}` : state.season === 'all' ? 'كل الحلقات' : `الموسم ${state.season}`;
  const loadMoreBtn = $('#loadMore'); if (loadMoreBtn) loadMoreBtn.style.display = visible.length < filtered.length ? 'block' : 'none';
  $$('.episode-card').forEach((card) => { card.addEventListener('click', () => selectEpisode(Number(card.dataset.episode))); card.addEventListener('keydown', (event) => { if (event.key === 'Enter') selectEpisode(Number(card.dataset.episode)); }); });
}

function render() { renderSeasonTabs(); renderEpisodes(); }

function selectEpisode(number) {
  const episode = episodeData[number - 1];
  if (!episode) return;
  state.current = number;
  userProgress.current = number;
  userProgress.time = 0;
  saveProgress(userProgress);
  const nowPlayingTitle = $('#nowPlayingTitle');
  if (nowPlayingTitle) nowPlayingTitle.innerHTML = `الحلقة ${number} <span>— ${episode.arc}</span>`;
  const nowPlayingMeta = $('#nowPlayingMeta');
  if (nowPlayingMeta) nowPlayingMeta.textContent = `الموسم ${episode.season} · ${episode.type === 'canon' ? 'قصة المانغا' : 'فلر'} · 23 دقيقة`;
  const directUrl = episodeUrl(number);
  const singleDownload = $('#singleDownload');
  if (singleDownload) {
    singleDownload.href = directUrl;
    singleDownload.download = `moho-shippuden-${String(number).padStart(3, '0')}.mp4`;
  }
  const player = $('#videoPlayer'); 
  if (player) {
    player.pause(); 
    const source = $('#videoSource');
    if (source) source.src = directUrl; 
    player.load();
    player.currentTime = 0;
  }
  renderEpisodes();
  updateNextPrev();
  updateContinueCard();
  const playerCard = document.querySelector('#playerCard');
  if (playerCard) playerCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
  toast(`تم اختيار الحلقة ${number}`);
}

function updateNextPrev() {
  const nextBtn = $('#nextEpisodeBtn');
  const prevBtn = $('#prevEpisodeBtn');
  if (nextBtn) { nextBtn.disabled = state.current >= 500; nextBtn.onclick = () => selectEpisode(state.current + 1); }
  if (prevBtn) { prevBtn.disabled = state.current <= 1; prevBtn.onclick = () => selectEpisode(state.current - 1); }
}

function updateContinueCard() {
  const card = document.querySelector('.continue-card');
  if (!card) return;
  const ep = episodeData[userProgress.current - 1];
  if (!ep) return;
  const artSpan = card.querySelector('.continue-art span');
  if (artSpan) artSpan.textContent = String(ep.n).padStart(2, '0');
  const copyStrong = card.querySelector('.continue-copy strong');
  if (copyStrong) copyStrong.textContent = ep.arc;
  const mins = Math.floor(userProgress.time / 60);
  const secs = Math.floor(userProgress.time % 60);
  const copySpan = card.querySelector('.continue-copy span');
  if (copySpan) copySpan.textContent = `توقفت عند ${mins}:${String(secs).padStart(2,'0')} من 23:00`;
  const duration = 23 * 60;
  const pct = Math.min(100, (userProgress.time / duration) * 100);
  const progressBar = card.querySelector('.mini-progress i');
  if (progressBar) progressBar.style.width = `${pct}%`;
  const btn = $('#continueButton');
  if (btn) btn.onclick = () => selectEpisode(userProgress.current);
}

// Download bulk feature disabled on static version
$('#searchInput')?.addEventListener('input', (event) => { state.search = event.target.value; state.limit = 24; renderEpisodes(); });
$$('.filter-button').forEach((button) => button.addEventListener('click', () => { state.type = button.dataset.type; $$('.filter-button').forEach((item) => item.classList.toggle('active', item === button)); state.limit = 24; renderEpisodes(); }));
$('#loadMore')?.addEventListener('click', () => { state.limit += 24; renderEpisodes(); });
$('#resetFilters')?.addEventListener('click', () => { state.season = 'all'; state.type = 'all'; state.search = ''; state.limit = 24; $('#searchInput').value = ''; $$('.filter-button').forEach((item) => item.classList.toggle('active', item.dataset.type === 'all')); render(); });
$('#fullscreenButton')?.addEventListener('click', () => { const frame = $('#videoFrame'); if (document.fullscreenElement) document.exitFullscreen(); else frame?.requestFullscreen?.(); });
const playerEl = $('#videoPlayer');
if (playerEl) {
  $('#videoOverlay')?.addEventListener('click', () => playerEl.play());
  playerEl.addEventListener('play', () => $('#videoOverlay')?.classList.add('hidden'));
  playerEl.addEventListener('pause', () => $('#videoOverlay')?.classList.remove('hidden'));
  playerEl.addEventListener('loadedmetadata', () => {
    if (userProgress.time > 0 && userProgress.current === state.current) {
      playerEl.currentTime = userProgress.time;
    }
  });
  playerEl.addEventListener('timeupdate', () => {
    userProgress.time = playerEl.currentTime;
    saveProgress(userProgress);
    if (playerEl.duration && playerEl.currentTime > playerEl.duration * 0.9) {
      markWatched(state.current);
    }
    updateContinueCard();
  });
  playerEl.addEventListener('ended', () => {
    if (state.current < 500) selectEpisode(state.current + 1);
  });
}
$('#startWatching')?.addEventListener('click', () => { window.location.href = '/episodes.html'; });
$('#continueButton')?.addEventListener('click', () => selectEpisode(userProgress.current));
$$('[data-scroll="watch"]').forEach((button) => button.addEventListener('click', () => {
  const watchSection = document.querySelector('#watch');
  if (watchSection) watchSection.scrollIntoView({ behavior: 'smooth' });
  else window.location.href = '/episodes.html#watch';
}));
$$('[data-unavailable]').forEach((button) => button.addEventListener('click', () => toast(`${button.dataset.unavailable} غير متاح حاليًا — سنخبرك عند توفره`)));
$('#themeHint')?.addEventListener('click', () => toast('موهو في وضع العرض الداكن — مصمم للمشاهدة الطويلة'));
document.addEventListener('keydown', (event) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { const input = $('#searchInput'); if (input) { event.preventDefault(); input.focus(); } } });
render();
updateNextPrev();
updateContinueCard();
