document.addEventListener('DOMContentLoaded', () => {
  // Переключение сайдбара на мобильных
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebarToggle');
  if (toggleBtn && sidebar){
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // Подсветка активной ссылки (если совпадает путь)
  const currentPath = location.pathname.split('/').pop();
  document.querySelectorAll('.nav-section a[href]')
    .forEach(a => {
      const hrefFile = a.getAttribute('href').split('#')[0];
      if (hrefFile === currentPath){
        a.classList.add('active');
        a.setAttribute('aria-current','page');
      }
    });

  // Табы и предпросмотр на странице примеров
  const tabs = document.querySelectorAll('[data-tab]');
  const codeBlocks = document.querySelectorAll('[data-code]');
  // предпросмотр через iframe больше не используется — открываем в новой вкладке

  function activate(name){
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name));
    codeBlocks.forEach(cb => cb.hidden = cb.dataset.code !== name);
    // здесь ничего менять не нужно: кнопки «Просмотреть» имеют статические href
  }

  if (tabs.length){
    tabs.forEach(t => t.addEventListener('click', () => activate(t.dataset.tab)));
    activate('index');
  }

  // Кнопки копирования кода
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-copy');
      const el = document.getElementById(targetId);
      if (!el) return;
      const text = el.innerText;
      if (navigator.clipboard){
        navigator.clipboard.writeText(text).then(() => {
          btn.textContent = 'Скопировано!';
          setTimeout(() => btn.textContent = 'Скопировать', 1200);
        });
      } else {
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        try { document.execCommand('copy'); } catch(e) {}
        sel.removeAllRanges();
        btn.textContent = 'Скопировано!';
        setTimeout(() => btn.textContent = 'Скопировать', 1200);
      }
    });
  });

  // Живая демонстрация CSS на странице css.html
  const liveBox = document.getElementById('liveBox');
  if (liveBox){
    document.querySelectorAll('[data-toggle-class]').forEach(chk => {
      chk.addEventListener('change', () => {
        const cls = chk.getAttribute('data-toggle-class');
        liveBox.classList.toggle(cls, chk.checked);
      });
    });
  }

  // Автогенерация списка домашних заданий через /api/homeworks
  const menuUl = document.getElementById('homeworkMenu');
  const listUl = document.getElementById('homeworkList');
  if (menuUl){
    fetch('/api/homeworks')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        if (!data || !Array.isArray(data.homeworks)) return;
        data.homeworks.forEach(hw => {
          const numMatch = hw.folder.match(/homework(\d+)/);
          const num = numMatch ? numMatch[1] : hw.folder;
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = hw.folder + '/index.html';
          a.target = '_blank';
          a.rel = 'noopener';
          a.textContent = hw.title || `Домашнее задание ${num}`;
          li.appendChild(a);
          menuUl.appendChild(li);
          if (listUl){
            const li2 = document.createElement('li');
            const link = document.createElement('a');
            link.href = a.href;
            link.target = '_blank';
            link.rel = 'noopener';
            link.textContent = a.textContent;
            li2.appendChild(link);
            listUl.appendChild(li2);
          }
        });
      })
      .catch(() => {/* молча */});
  }
});
