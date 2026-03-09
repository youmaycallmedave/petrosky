const anchors = document.querySelectorAll('.process_anchor');
const steps = document.querySelectorAll('.process_step');
const lottieWrap = document.querySelector('.process_sticky-lottie-wrap');

gsap.set(steps, { opacity: 0 });
gsap.set(steps[0], { opacity: 1 });
gsap.set(lottieWrap, { opacity: 0 });

anchors.forEach((anchor, index) => {
  const currentStep = steps[index];
  if (!currentStep) return;
  
  const prevStep = index > 0 ? steps[index - 1] : steps[0];
  
  gsap.to(anchor, {
    scrollTrigger: {
      trigger: anchor,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => {
        gsap.to(steps, { opacity: 0, duration: 0.2 });
        gsap.to(currentStep, { opacity: 1, duration: 0.2 });
        
        const lottiePlay = currentStep.querySelector('.process_lottie-play');
        if (lottiePlay) lottiePlay.click();
        
        if (index >= 1) {
          gsap.to(lottieWrap, { opacity: 1, duration: 0.2 });
        } else {
          gsap.to(lottieWrap, { opacity: 0, duration: 0.2 });
        }
      },
      onEnterBack: () => {
        gsap.to(steps, { opacity: 0, duration: 0.2 });
        gsap.to(currentStep, { opacity: 1, duration: 0.2 });
        
        const lottiePlay = currentStep.querySelector('.process_lottie-play');
        if (lottiePlay) lottiePlay.click();
        
        if (index >= 1) {
          gsap.to(lottieWrap, { opacity: 1, duration: 0.2 });
        } else {
          gsap.to(lottieWrap, { opacity: 0, duration: 0.2 });
        }
      },
      onLeaveBack: () => {
        gsap.to(steps, { opacity: 0, duration: 0.2 });
        gsap.to(prevStep, { opacity: 1, duration: 0.2 });
        
        if (index === 1) {
          gsap.to(lottieWrap, { opacity: 0, duration: 0.2 });
        }
      }
    }
  });
});
