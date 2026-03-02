// Swiper 1 [START]
{
  const swiperBlock = document.querySelector(".swiper_block.is-hero");

  const swiper = new Swiper(swiperBlock.querySelector(".swiper"), {
    slidesPerView: "auto",
    allowTouchMove: false,
    followFinger: true,
    freeMode: false,
    slideToClickedSlide: false,
    centeredSlides: false,
    //initialSlide: 2,
    speed: 500, // увеличим скорость для плавности
    loop: false,
    slideActiveClass: "is-active",
    slideDuplicateActiveClass: "is-active",

    effect: 'fade', // включаем fade
    fadeEffect: {
      crossFade: true // включаем кроссфейд
    },

    mousewheel: {
      forceToAxis: true,
    },

    keyboard: {
      enabled: true,
      onlyInViewport: true,
    },

    /*
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    */

    navigation: {
      nextEl: swiperBlock.querySelector("[data-swiper-next]"),
      prevEl: swiperBlock.querySelector("[data-swiper-prev]"),
    },

    pagination: {
      el: swiperBlock.querySelector(".swiper_bullet-list"),
      bulletActiveClass: "is-active",
      bulletClass: "swiper_bullet",
      bulletElement: "button",
      clickable: true,
    },
  });
}
// Swiper 1 [END]
