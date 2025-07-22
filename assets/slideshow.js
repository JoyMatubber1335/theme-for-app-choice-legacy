if (!customElements.get("slideshow-component")) {
  class SlideshowComponent extends HTMLElement {
    constructor() {
      super();
      this.swiper = null;
    }

    connectedCallback() {
      this.initializeSwiper();
    }

    disconnectedCallback() {
      if (this.swiper) {
        this.swiper.destroy();
      }
    }

    initializeSwiper() {
      const swiperContainer = this.querySelector(".swiper-container");
      if (swiperContainer) {
        const autoplayEnabled = this.dataset.autoplay === "true";
        const autoplayDelay = parseInt(this.dataset.autoplayDelay) || 3000;
        const pauseOnHover = this.dataset.pauseOnHover === "true";

        // --- Get your custom navigation button elements ---
        const customNextButton = this.querySelector(
          ".custom-swiper-button-next"
        );
        const customPrevButton = this.querySelector(
          ".custom-swiper-button-prev"
        );

        const swiperConfig = {
          // --- Update navigation to point to your custom elements ---
          navigation: {
            nextEl: customNextButton, // Use your custom next button
            prevEl: customPrevButton, // Use your custom previous button
          },
          slidesPerView: 1,
          centeredSlides: true,
          spaceBetween: 0,
          loop: true,
          breakpoints: {
            769: {
              slidesPerView: 1.2,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 1.32,
              spaceBetween: 16,
            },
          },
        };

        if (autoplayEnabled) {
          swiperConfig.autoplay = {
            delay: autoplayDelay,
            disableOnInteraction: false,
            pauseOnMouseEnter: pauseOnHover,
          };
        }

        this.swiper = new Swiper(swiperContainer, swiperConfig);
      }
    }
  }

  customElements.define("slideshow-component", SlideshowComponent);
}
