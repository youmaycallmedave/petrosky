document.addEventListener('DOMContentLoaded', function() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.utils.toArray('[data-line-animation-wrap]').forEach(section => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top center',
      end: 'bottom bottom',
      markers: false,
      onEnter: () => animateLines(section),
      onEnterBack: () => animateLines(section)
    });
  });

  function animateLines(section) {
    const groups = section.querySelectorAll('.fetures_item-line-list');
      const firstItem = section.querySelector('.features_item');
      if (!firstItem) return;
      const lineList = firstItem.querySelector('.fetures_item-line-list');
      if (!lineList) return;
      const wrap = lineList.querySelector('.fetures_item-line-wrap');
      let timeline = gsap.timeline();
      const items = section.querySelectorAll('.features_item');
      let allLines = [];
      items.forEach(item => {
        const lineList = item.querySelector('.fetures_item-line-list');
        if (lineList) {
          allLines = allLines.concat(Array.from(lineList.children));
        }
      });
      allLines.forEach(child => {
        if (child.classList.contains('fetures_item-line-wrap')) {
          child.style.transform = 'translateY(100%)';
        }
      });
      gsap.set(allLines, {y: '100%'});
      allLines.forEach((line, idx) => {
        const duration = 1 + Math.random() * 0.5; // от 0.5 до 1 сек
        const delay = idx * (1 / allLines.length);
        gsap.to(line, {
          y: '0%',
          duration: duration,
          delay: delay,
          ease: 'power1.out',
          onStart: function() {
            if (line.classList.contains('fetures_item-line-wrap')) {
              line.style.transform = '';
            }
          }
        });
      });
  }
});
