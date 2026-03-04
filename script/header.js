gsap.to(".header_scroll-bg", {
  opacity: 1,
  scrollTrigger: {
    trigger: "body",
    start: "1px top",
    end: "2px top",
    toggleActions: "play none none reverse",
    scrub: true
  }
});

document.addEventListener("DOMContentLoaded", () => {
	gsap.registerPlugin(ScrollTrigger);

	// Добавь этот класс на секции, где хедер должен быть всегда скрыт
	const keepHeaderVisibleSelector = ".js-keep-header-visible";

	document.querySelectorAll(".header-component").forEach((component) => {
		if (component.hasAttribute("data-nav-1")) return;
		component.setAttribute("data-nav-1", "");

		let lastDirection;
		let lightThemeTimeout;
		let isLightThemeActive = false;

		const clearLightThemeTimeout = () => {
			if (!lightThemeTimeout) return;
			clearTimeout(lightThemeTimeout);
			lightThemeTimeout = null;
		};

		const addLightTheme = () => {
			if (isLightThemeActive) return;
			clearLightThemeTimeout();
			lightThemeTimeout = setTimeout(() => {
				component.classList.add("u-theme-light");
				isLightThemeActive = true;
				lightThemeTimeout = null;
			}, 500);
		};

		const removeLightTheme = () => {
			clearLightThemeTimeout();
			component.classList.remove("u-theme-light");
			isLightThemeActive = false;
		};

		const isInKeepVisibleSection = () => {
			const headerHeight = component.offsetHeight || 0;
			return Array.from(document.querySelectorAll(keepHeaderVisibleSelector)).some((section) => {
				const rect = section.getBoundingClientRect();
				return rect.top <= headerHeight && rect.bottom > 0;
			});
		};

		ScrollTrigger.create({
			trigger: document.body,
			start: "top top",
			end: "bottom bottom",
			onUpdate: (self) => {
				if (isInKeepVisibleSection()) {
					removeLightTheme();
					component.classList.add("is-hidden");
					return;
				}

				// Первые 100vh - обычный режим без u-theme-light
				if (window.scrollY < window.innerHeight) {
					removeLightTheme();
					component.classList.remove("is-hidden");
					return;
				}

				// После 100vh - добавляем u-theme-light (с задержкой при первом проходе)
				if (!isLightThemeActive && !lightThemeTimeout) {
					addLightTheme();
				}

				// is-hidden переключается по направлению скролла
				if (lastDirection === self.direction) return;
				lastDirection = self.direction;
				if (self.direction === 1) {
					component.classList.add("is-hidden");
				} else {
					component.classList.remove("is-hidden");
				}
			}
		});
	});
});
