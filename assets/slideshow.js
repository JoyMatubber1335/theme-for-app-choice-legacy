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
        const isSingleSlideView = this.dataset.singleSlideView === "true";

        const showProgressBar = this.dataset.showProgressBar === "true";

        const slidesPerViewDesired =
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

        if (isSingleSlideView) {
          // If true, it means we want a "full slide" view without partial next/prev
          // The actual number of visible items is controlled by slidesPerViewDesired
          swiperConfig.slidesPerView = slidesPerViewDesired; // This will be 3 for mobile
          swiperConfig.spaceBetween = 10; // Space between items in the "single slide view"
          swiperConfig.centeredSlides = false; // Important: set to false for multi-item view
          swiperConfig.breakpoints = {}; // Clear any breakpoints that might interfere
        } else {
          // This block would be used if you wanted partial prev/next items
          // Based on your request "no prev and next slide portion", this else block
          // for the slideshow-component is likely not what you want for mobile.
          // However, keeping it for clarity if the component is used elsewhere.
          swiperConfig.slidesPerView = slidesPerViewDesired;
          swiperConfig.spaceBetween = 16;
          swiperConfig.centeredSlides = false;
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
