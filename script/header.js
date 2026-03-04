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

	const keepHeaderVisibleSelector = ".js-keep-header-visible";

	document.querySelectorAll(".header-component").forEach((component) => {
		if (component.hasAttribute("data-nav-1")) return;
		component.setAttribute("data-nav-1", "");

		let lastDirection;
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
					component.classList.add("is-hidden");
					return;
				}

				if (window.scrollY < window.innerHeight) {
					component.classList.remove("is-hidden");
					return;
				}
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
