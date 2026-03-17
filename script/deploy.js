// ── Deployment Animation ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  const frame = document.querySelector('.deploy_tabs-frame');
  if (!frame) return;

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    .deploy-anim-card *,
    .deploy-anim-card *::before,
    .deploy-anim-card *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'JetBrains Mono', monospace;
      line-height: normal;
    }
    .deploy_tabs-frame { height: 100%; }
    .deploy-anim-card {
      width: 100%;
      height: 100%;
      background: #0D0E0F;
      border-radius: 4px;
      padding: 20px;
      font-family: 'JetBrains Mono', monospace;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .deploy-anim-card .da-top { display: flex; flex-direction: column; }
    .deploy-anim-card .shell-bar { display:flex; align-items:center; gap:8px; margin-bottom:14px; }
    .deploy-anim-card .shell-sq  { width:8px; height:8px; background:#397DFE; flex-shrink:0; }
    .deploy-anim-card .shell-label { color:#808792; font-size:10px; font-weight:500; }
    .deploy-anim-card .title-block { margin-bottom:14px; }
    .deploy-anim-card .title-main { color:#F5F6F9; font-size:13px; font-weight:700; }
    .deploy-anim-card .title-sub  { color:#808792; font-size:10px; font-weight:400; margin-top:3px; }
    .deploy-anim-card .da-divider { width:100%; border:none; border-top:1px dashed #252526; }
    .deploy-anim-card .steps      { display:flex; flex-direction:column; margin-top:4px; }
    .deploy-anim-card .step       { display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px solid rgba(37,37,38,0.7); opacity:0; transform:translateY(4px); transition:opacity 0.3s ease, transform 0.3s ease; }
    .deploy-anim-card .step:last-child { border-bottom:none; }
    .deploy-anim-card .step.visible  { opacity:1; transform:translateY(0); }
    .deploy-anim-card .step-arrow    { font-size:11px; color:rgba(255,255,255,0.4); flex-shrink:0; width:12px; text-align:center; }
    .deploy-anim-card .step.active  .step-arrow  { color:#fff; animation:da-blink 0.6s steps(1) infinite; }
    .deploy-anim-card .step.success .step-arrow  { color:#397DFE; animation:none; }
    .deploy-anim-card .step-spinner { display:none; width:9px; height:9px; border:1.5px solid rgba(255,255,255,0.1); border-top-color:#fff; border-radius:50%; flex-shrink:0; animation:da-spin 0.65s linear infinite; }
    .deploy-anim-card .step.active .step-spinner { display:block; }
    .deploy-anim-card .step-text    { flex:1; font-size:11px; font-weight:400; color:rgba(255,255,255,0.25); transition:color 0.3s; }
    .deploy-anim-card .step.active  .step-text  { color:rgba(255,255,255,1); }
    .deploy-anim-card .step.done    .step-text  { color:rgba(255,255,255,1); }
    .deploy-anim-card .step.success .step-text  { color:#397DFE; font-weight:600; }
    .deploy-anim-card .progress-wrap { margin-top: 3rem; flex-shrink: 0; }
    .deploy-anim-card .progress-meta { display:flex; justify-content:space-between; margin-bottom:7px; }
    .deploy-anim-card .p-label { font-size:9.5px; font-weight:500; color:#fff; }
    .deploy-anim-card .p-pct   { font-size:9.5px; font-weight:500; color:#fff; }
    .deploy-anim-card .progress-bar-wrap { width:100%; height:8px; position:relative; overflow:hidden; }
    .deploy-anim-card .progress-bg   { position:absolute; inset:0; background:rgba(255,255,255,0.07); }
    .deploy-anim-card .progress-fill { position:absolute; top:0; left:0; height:100%; width:0%; background:#fff; transition:none; }
    @keyframes da-spin  { to { transform:rotate(360deg); } }
    @keyframes da-blink { 0%,100%{opacity:1} 50%{opacity:0} }
    .deploy-anim-card .da-complete-btn {
      display: block;
      width: 100%;
      overflow: hidden;
      max-height: 0;
      margin-top: 0;
      padding: 0 14px;
      background: rgba(57,125,254,0.15);
      border: 1px solid transparent;
      border-radius: 0;
      color: #397DFE;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      font-weight: 500;
      text-align: center;
      cursor: default;
      opacity: 0;
      transition: max-height 0.4s ease, padding 0.4s ease, margin-top 0.4s ease, opacity 0.4s ease, border-color 0.4s ease;
    }
    .deploy-anim-card .da-complete-btn.visible {
      max-height: 60px;
      padding: 14px;
      margin-top: 12px;
      opacity: 1;
      border-color: #397DFE;
    }
  `;
  document.head.appendChild(style);

  // Inject HTML
  frame.innerHTML = `
    <div class="deploy-anim-card">
      <div class="da-top">
      <div class="shell-bar">
        <div class="shell-sq"></div>
        <span class="shell-label">petrosky-cloud-shell</span>
      </div>
      <div class="title-block">
        <div class="title-main">Deploying n8n Automation</div>
        <div class="title-sub">Target: MTL-1 &bull; NVMe Pool</div>
      </div>
      <hr class="da-divider">
      <div class="steps">
        <div class="step" id="da-s0"><span class="step-arrow">&gt;</span><div class="step-spinner"></div><div class="step-text">Allocating instance in region: MTL-1...</div></div>
        <div class="step" id="da-s1"><span class="step-arrow">&gt;</span><div class="step-spinner"></div><div class="step-text">Pulling container image...</div></div>
        <div class="step" id="da-s2"><span class="step-arrow">&gt;</span><div class="step-spinner"></div><div class="step-text">Configuring network interface (virtio)...</div></div>
        <div class="step" id="da-s3"><span class="step-arrow">&gt;</span><div class="step-spinner"></div><div class="step-text">Assigning public IPv4...</div></div>
        <div class="step" id="da-s4"><span class="step-arrow">&gt;</span><div class="step-spinner"></div><div class="step-text">Running cloud-init scripts...</div></div>
        <div class="step" id="da-s5"><span class="step-arrow">&gt;</span><div class="step-spinner"></div><div class="step-text">Verifying health checks...</div></div>
        <div class="step" id="da-s6"><span class="step-arrow">&gt;</span><div class="step-spinner"></div><div class="step-text">Finalizing configuration...</div></div>
        <div class="step" id="da-s-ok"><span class="step-arrow">&gt;</span><div class="step-text">SUCCESS: Instance is ready.</div></div>
      </div>
      <hr class="da-divider" style="margin-top:4px;">
      </div>
      <div class="progress-wrap">
        <div class="progress-meta">
          <span class="p-label">DEPLOYMENT PROGRESS</span>
          <span class="p-pct" id="da-p-pct">0%</span>
        </div>
        <div class="progress-bar-wrap">
          <div class="progress-bg"></div>
          <div class="progress-fill" id="da-progress-fill"></div>
        </div>
        <button class="da-complete-btn" id="da-complete-btn">Deployment Complete</button>
      </div>
    </div>
  `;

  // Animation logic
  const DA_N = 7;
  const DA_STEP_DELAY = 490;
  const daFill    = document.getElementById('da-progress-fill');
  const daPct     = document.getElementById('da-p-pct');
  const daSuccess = document.getElementById('da-s-ok');
  const daSteps   = Array.from({length: DA_N}, (_, i) => document.getElementById('da-s' + i));
  let daCurPct    = 0;
  let daFrame     = null;

  function daEaseOut(t) { return 1 - Math.pow(1 - t, 3); }

  function daAnimateTo(target, duration, onDone) {
    const start = daCurPct;
    const t0 = performance.now();
    if (daFrame) cancelAnimationFrame(daFrame);
    (function tick(now) {
      const t  = Math.min((now - t0) / duration, 1);
      const p  = start + (target - start) * daEaseOut(t);
      daFill.style.width = p.toFixed(2) + '%';
      daPct.textContent  = Math.round(p) + '%';
      daCurPct = p;
      if (t < 1) { daFrame = requestAnimationFrame(tick); }
      else {
        daCurPct = target;
        daFill.style.width = target + '%';
        daPct.textContent  = Math.round(target) + '%';
        if (onDone) onDone();
      }
    })(t0);
  }

  function daRunStep(i) {
    if (i >= DA_N) {
      setTimeout(function () {
        daSuccess.classList.add('visible', 'success');
        daAnimateTo(100, 800, function () {
          var btn = document.getElementById('da-complete-btn');
          if (btn) setTimeout(function () { btn.classList.add('visible'); }, 200);
        });
      }, 150);
      return;
    }
    daSteps[i].classList.add('visible', 'active');
    daAnimateTo(((i + 1) / DA_N) * 100, DA_STEP_DELAY * 0.88);
    setTimeout(function () {
      daSteps[i].classList.remove('active');
      daSteps[i].classList.add('done');
      setTimeout(function () { daRunStep(i + 1); }, 100);
    }, DA_STEP_DELAY);
  }

  function daReset() {
    if (daFrame) { cancelAnimationFrame(daFrame); daFrame = null; }
    daCurPct = 0;
    daFill.style.width = '0%';
    daPct.textContent  = '0%';
    daSteps.forEach(function (s) { s.className = 'step'; });
    daSuccess.className = 'step';
    var btn = document.getElementById('da-complete-btn');
    if (btn) btn.classList.remove('visible');
  }

  function daRestart(titleText) {
    if (titleText) {
      frame.querySelector('.title-main').textContent = 'Deploying ' + titleText;
    }
    daReset();
    setTimeout(function () { daRunStep(0); }, 400);
  }

  // ── Deploy list active toggle ───────────────────────────────────────────────
  document.querySelectorAll('.deploy_list-wrap').forEach(function (wrap) {
    wrap.querySelectorAll('.deploy_item').forEach(function (item) {
      item.addEventListener('click', function () {
        wrap.querySelectorAll('.deploy_item').forEach(function (el) {
          el.classList.remove('is-active');
        });
        item.classList.add('is-active');
        var titleEl = item.querySelector('.deploy_item-title');
        daRestart(titleEl ? titleEl.textContent.trim() : null);
      });
    });
  });

  setTimeout(function () { daRunStep(0); }, 400);
});


