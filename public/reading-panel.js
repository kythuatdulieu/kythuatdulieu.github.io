// Panel "Tùy chỉnh đọc": Sáng/Tối/Sepia, cỡ chữ, độ rộng dòng, font, chế độ tập trung.
// Lưu localStorage (dehb-*), áp qua data-* trên <html>. Pre-paint ở CustomHead.astro.
(function () {
  var LS = {
    get: function (k, d) { try { return localStorage.getItem(k) || d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var root = document.documentElement;

  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    LS.set('dehb-theme', t);
    // Đồng bộ ngược cho ThemeSelect mặc định của Starlight (chỉ hiểu light/dark)
    LS.set('starlight-theme', t === 'sepia' ? 'dark' : t);
  }
  function applyMeasure(m) { root.setAttribute('data-measure', m); LS.set('dehb-measure', m); }
  function applyFont(f) { root.setAttribute('data-font', f); LS.set('dehb-font', f); }
  function applyScale(s) { root.style.setProperty('--reading-font-scale', s); LS.set('dehb-font-scale', s); }

  function seg(label, key, options, current, onPick) {
    var wrap = document.createElement('div'); wrap.className = 'rp-row';
    var lab = document.createElement('span'); lab.className = 'rp-label'; lab.textContent = label; wrap.appendChild(lab);
    var seg = document.createElement('div'); seg.className = 'rp-seg';
    options.forEach(function (o) {
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = o.label;
      b.setAttribute('aria-pressed', String(o.value === current));
      b.addEventListener('click', function () {
        seg.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        onPick(o.value);
      });
      seg.appendChild(b);
    });
    wrap.appendChild(seg); return wrap;
  }

  function buildPanel() {
    var p = document.createElement('div');
    p.className = 'reading-panel'; p.setAttribute('role', 'dialog');
    p.setAttribute('aria-label', 'Tùy chỉnh đọc'); p.hidden = true;

    var head = document.createElement('div'); head.className = 'rp-head';
    var h = document.createElement('h3'); h.textContent = 'Tùy chỉnh đọc';
    var close = document.createElement('button'); close.className = 'rp-close';
    close.setAttribute('aria-label', 'Đóng'); close.innerHTML = '×';
    close.addEventListener('click', function () { p.hidden = true; });
    head.appendChild(h); head.appendChild(close); p.appendChild(head);

    var theme = LS.get('dehb-theme', root.getAttribute('data-theme') || 'light');
    p.appendChild(seg('Giao diện', 'theme',
      [{ value: 'light', label: 'Sáng' }, { value: 'dark', label: 'Tối' }, { value: 'sepia', label: 'Sepia' }],
      theme, applyTheme));

    // Cỡ chữ
    var sRow = document.createElement('div'); sRow.className = 'rp-row';
    var sLab = document.createElement('span'); sLab.className = 'rp-label'; sLab.textContent = 'Cỡ chữ'; sRow.appendChild(sLab);
    var range = document.createElement('input');
    range.type = 'range'; range.min = '0.85'; range.max = '1.3'; range.step = '0.05';
    range.value = LS.get('dehb-font-scale', '1'); range.className = 'rp-range';
    range.addEventListener('input', function () { applyScale(range.value); });
    sRow.appendChild(range); p.appendChild(sRow);

    p.appendChild(seg('Độ rộng dòng', 'measure',
      [{ value: 'narrow', label: 'Hẹp' }, { value: 'medium', label: 'Vừa' }, { value: 'wide', label: 'Rộng' }],
      LS.get('dehb-measure', 'medium'), applyMeasure));

    p.appendChild(seg('Font', 'font',
      [{ value: 'sans', label: 'Mặc định' }, { value: 'serif', label: 'Serif' }],
      LS.get('dehb-font', 'sans'), applyFont));

    // Chế độ tập trung: bấm nút focus sẵn có nếu tồn tại
    var fRow = document.createElement('div'); fRow.className = 'rp-row';
    var fl = document.createElement('label'); fl.className = 'rp-check';
    fl.textContent = 'Chế độ tập trung (ẩn sidebar)';
    var cb = document.createElement('input'); cb.type = 'checkbox';
    cb.addEventListener('change', function () {
      var fb = document.getElementById('focus-toggle-btn');
      if (fb) fb.click();
    });
    fl.appendChild(cb); fRow.appendChild(fl); p.appendChild(fRow);

    return p;
  }

  function init() {
    if (document.getElementById('reading-toggle-btn')) return;
    // Bỏ check .sl-markdown-content để hiện nút trên mọi trang (quiz, blog, home)

    var btn = document.createElement('button');
    btn.id = 'reading-toggle-btn'; btn.className = 'reading-toggle-btn';
    btn.title = 'Tùy chỉnh đọc'; btn.setAttribute('aria-label', 'Tùy chỉnh đọc');
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>';

    var panel = buildPanel();
    document.body.appendChild(panel);

    function place() {
      var r = btn.getBoundingClientRect();
      panel.style.right = Math.max(16, window.innerWidth - r.right) + 'px';
      if (r.top < window.innerHeight / 2) {
        // Nút trên header: panel mở xuống dưới
        panel.style.bottom = 'auto';
        panel.style.top = (r.bottom + 8) + 'px';
      } else {
        // Nút nổi góc phải dưới: panel mở lên trên
        panel.style.top = 'auto';
        panel.style.bottom = (window.innerHeight - r.top + 8) + 'px';
      }
    }
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      panel.hidden = !panel.hidden;
      if (!panel.hidden) place();
    });
    document.addEventListener('click', function (e) {
      if (!panel.hidden && !panel.contains(e.target) && !btn.contains(e.target)) panel.hidden = true;
    });

    // Đặt cạnh nút đổi theme trên header; màn hẹp (right-group của Starlight ẩn
    // dưới 50rem) thì rơi về nút nổi góc phải dưới.
    var mq = window.matchMedia('(min-width: 50rem)');
    function mount() {
      var themeSel = document.querySelector('starlight-theme-select');
      var quizHeaderRight = document.querySelector('.header-right');
      if (mq.matches && themeSel && themeSel.parentElement) {
        btn.classList.add('in-header');
        themeSel.parentElement.insertBefore(btn, themeSel);
      } else if (quizHeaderRight) {
        btn.classList.add('in-header');
        quizHeaderRight.appendChild(btn);
      } else {
        btn.classList.remove('in-header');
        document.body.appendChild(btn);
      }
      panel.hidden = true;
    }
    mount();
    if (mq.addEventListener) mq.addEventListener('change', mount);
  }

  // Starlight ThemeSelect chỉ biết light/dark và re-apply theme của nó khi khởi tạo —
  // nếu người dùng đã chọn sepia thì giành lại quyền, còn khi họ đổi theme bằng
  // select của Starlight thì cập nhật dehb-theme để lựa chọn đó thắng.
  document.addEventListener('change', function (e) {
    if (e.target && e.target.closest && e.target.closest('starlight-theme-select')) {
      var v = e.target.value;
      if (v === 'light' || v === 'dark') LS.set('dehb-theme', v);
      else { try { localStorage.removeItem('dehb-theme'); } catch (err) {} }
    }
  });
  new MutationObserver(function () {
    var want = LS.get('dehb-theme', '');
    if (want && root.getAttribute('data-theme') !== want) {
      root.setAttribute('data-theme', want);
    }
  }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

  document.addEventListener('DOMContentLoaded', init);
  document.addEventListener('astro:page-load', init);
})();
