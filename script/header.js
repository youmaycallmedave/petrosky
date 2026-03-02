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

	document.querySelectorAll(".header-component").forEach((component) => {
		if (component.hasAttribute("data-nav-1")) return;
		component.setAttribute("data-nav-1", "");

		let lastDirection;
		ScrollTrigger.create({
			trigger: document.body,
			start: "top top",
			end: "bottom bottom",
			onUpdate: (self) => {
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
