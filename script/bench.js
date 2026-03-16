
window.addEventListener('DOMContentLoaded', function() {
  const containers = document.querySelectorAll('.bench_item-result-lines');
  containers.forEach(container => {
    for (let i = 0; i < 100; i++) {
      const line = document.createElement('div');
      line.className = 'bench_item-result-line';
      container.appendChild(line);
    }
  });

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    const cardConfigs = [
      { lines: 41, color: '#F94226' },
      { lines: 61, color: '#E8C01F' },
      { lines: 91, color: '#F5F6F9' }
    ];

    const cards = document.querySelectorAll('.bench_item');
    cards.forEach((card, idx) => {
      const linesWrap = card.querySelector('.bench_item-result-lines');
      if (!linesWrap) return;
      const lines = Array.from(linesWrap.querySelectorAll('.bench_item-result-line'));
      const config = cardConfigs[idx] || cardConfigs[cardConfigs.length - 1];

      lines.forEach(line => {
        line.style.backgroundColor = '';
      });

      ScrollTrigger.create({
        trigger: card,
        start: 'top 80%',
        onEnter: () => {
          gsap.to(lines.slice(0, config.lines), {
            backgroundColor: config.color,
            stagger: 1 / config.lines,
            duration: 0.12,
            ease: 'power1.out',
            onUpdate: function() {
              const filled = lines.slice(0, config.lines).filter(line => line.style.backgroundColor === config.color || line.style.backgroundColor === "rgb(249, 66, 38)" || line.style.backgroundColor === "rgb(232, 192, 31)" || line.style.backgroundColor === "rgb(245, 246, 249)").length;
              const percent = Math.round((filled / 100) * 100);
              const valueEl = card.querySelector('.bench_item-result-text-value');
              if (valueEl) valueEl.textContent = percent + '%';
            }
          });

          const valueEl = card.querySelector('.bench_item-result-text-value');
          if (valueEl) {
            gsap.to({val: 0}, {
              val: config.lines,
              duration: (config.lines * (1 / config.lines)) + 0.1,
              ease: 'none',
              onUpdate: function() {
                valueEl.textContent = Math.round(this.targets()[0].val) + '%';
              },
              onComplete: function() {
                valueEl.textContent = config.lines + '%';
              }
            });
          }
        }
      });
    });
  }
});
