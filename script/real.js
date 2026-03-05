if (window.matchMedia('(min-width: 992px)').matches) {
	const links = document.querySelectorAll('.real_tab-link');
	let prevCurrent = null;
	const observer = new MutationObserver(() => {
		links.forEach(link => {
			if (link.classList.contains('w--current') && link !== prevCurrent) {
				prevCurrent = link;
				// ...existing code...
				const images = document.querySelectorAll('.real_visual');
				images.forEach(img => img.classList.remove('is-active'));
				if (link.classList.contains('is-link-1')) {
					const img = document.querySelector('.real_visual.is-image-1');
					if (img) img.classList.add('is-active');
				} else if (link.classList.contains('is-link-2')) {
					const img = document.querySelector('.real_visual.is-image-2');
					if (img) img.classList.add('is-active');
				} else if (link.classList.contains('is-link-3')) {
					const img = document.querySelector('.real_visual.is-image-3');
					if (img) img.classList.add('is-active');
				}
			}
		});
	});
	links.forEach(link => {
		observer.observe(link, { attributes: true, attributeFilter: ['class'] });
	});

	const section = document.querySelector('.real_section');

	if (section && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
		const infoWraps = section.querySelectorAll('.real_info-wrap');
		const visuals = section.querySelectorAll('.real_visual');

		infoWraps.forEach((wrap, index) => {
			const image = visuals[index];
			if (!image) return;

			gsap.fromTo(
				image,
				{ scale: 1, transformOrigin: '50% 50%' },
				{
					scale: 1.2,
					ease: 'none',
					scrollTrigger: {
						trigger: wrap,
						start: 'top center',
						end: 'bottom center',
						scrub: true,
					},
				}
			);
		});
	}
}
