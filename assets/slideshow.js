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
        const showPartialSlides = this.dataset.showPartialSlides === "true";
        const showProgressBar = this.dataset.showProgressBar === "true";
        const carouselMode = this.dataset.carouselMode === "true"; // New carousel mode

        const slidesPerViewForFullSlides =
          parseInt(this.dataset.slidesPerViewDesktop) || 1;

        const customNextButton = this.querySelector(
          ".slideshow-nav-button-next"
        );
        const customPrevButton = this.querySelector(
          ".slideshow-nav-button-prev"
        );

        const swiperConfig = {
          navigation: {
            nextEl: customNextButton,
            prevEl: customPrevButton,
          },
          loop: true,
        };

        if (showProgressBar) {
          swiperConfig.pagination = {
            el: ".custom-pagination",
            type: "progressbar",
          };
        }

        // Carousel mode configuration
        if (carouselMode) {
          // Free mode allows continuous scrolling based on drag distance
          swiperConfig.freeMode = {
            enabled: true,
            sticky: false, // Don't snap to slides
            momentumRatio: 1,
            momentumVelocityRatio: 1,
            momentumBounceRatio: 1,
          };

          // Disable loop for carousel mode as it interferes with free scrolling
          swiperConfig.loop = false;

          // Enable grabCursor for better UX
          swiperConfig.grabCursor = true;

          // Set resistance for better feel when reaching edges
          swiperConfig.resistanceRatio = 0.85;

          // Configure slides per view for carousel
          swiperConfig.slidesPerView = showPartialSlides
            ? 1.2
            : slidesPerViewForFullSlides;
          swiperConfig.spaceBetween = showPartialSlides ? 20 : 16;
          swiperConfig.centeredSlides = showPartialSlides;

          swiperConfig.breakpoints = {
            769: {
              slidesPerView: showPartialSlides
                ? 1.2
                : slidesPerViewForFullSlides,
              spaceBetween: showPartialSlides ? 20 : 16,
              centeredSlides: showPartialSlides,
            },
            1024: {
              slidesPerView: slidesPerViewForFullSlides,
              spaceBetween: 16,
              centeredSlides: false,
            },
          };
        } else {
          // Original slideshow behavior
          swiperConfig.slidesPerView = slidesPerViewForFullSlides;
          swiperConfig.spaceBetween = 16;
          swiperConfig.centeredSlides = false;

          swiperConfig.breakpoints = {
            769: {
              slidesPerView: showPartialSlides
                ? 1.2
                : slidesPerViewForFullSlides,
              spaceBetween: showPartialSlides ? 20 : 16,
              centeredSlides: showPartialSlides,
            },
          };
        }

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
