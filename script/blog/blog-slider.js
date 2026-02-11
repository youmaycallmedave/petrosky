{
  const swiperBlock = document.querySelector(".swiper_block.is-blog");

  const swiper = new Swiper(swiperBlock.querySelector(".swiper"), {
    slidesPerView: "auto",
    followFinger: true,
    freeMode: false,
    slideToClickedSlide: false,
    centeredSlides: false,
    //initialSlide: 2,
    speed: 300, 
    loop: false,
    slideActiveClass: "is-active",
    slideDuplicateActiveClass: "is-active",

    mousewheel: {
      forceToAxis: true,
    },
    
    keyboard: {
      enabled: true,
      onlyInViewport: true,
    },
    
    navigation: {
      nextEl: swiperBlock.querySelector("[data-swiper-next]"),
      prevEl: swiperBlock.querySelector("[data-swiper-prev]"),
    },

  });
}
