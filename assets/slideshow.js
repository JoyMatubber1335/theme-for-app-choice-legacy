if (!customElements.get("image-slideshow")) {
  class ImageSlideshow extends HTMLElement {
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
        // Get autoplay settings from data attributes
        const autoplayEnabled = this.dataset.autoplay === "true";
        const autoplayDelay = parseInt(this.dataset.autoplayDelay) || 3000;
        const pauseOnHover = this.dataset.pauseOnHover === "true";

        const swiperConfig = {
          // Required for navigation buttons to work
          navigation: {
            nextEl: this.querySelector(".swiper-button-next"),
            prevEl: this.querySelector(".swiper-button-prev"),
          },
          // --- Mobile-first approach ---
          slidesPerView: 1, // Mobile: Show only 1 full slide
          centeredSlides: true, // Center the active slide
          spaceBetween: 0, // Mobile: No space between slides
          // Optional: Loop mode
          loop: true,
          // Responsive breakpoints - mobile first
          breakpoints: {
            // when window width is >= 769px (above mobile)
            769: {
              slidesPerView: 1.2, // Show 1 full slide and 20% of next/prev
              spaceBetween: 20, // Add space between slides
            },
            // when window width is >= 1024px
            1024: {
              slidesPerView: 1.32,
              spaceBetween: 16,
            },
          },
        };

        // Add autoplay configuration if enabled
        if (autoplayEnabled) {
          swiperConfig.autoplay = {
            delay: autoplayDelay,
            disableOnInteraction: false, // Continue autoplay after user interactions
            pauseOnMouseEnter: pauseOnHover, // Pause on hover if enabled
          };
        }

        this.swiper = new Swiper(swiperContainer, swiperConfig);
      }
    }
  }

  // Register the custom element
  if (!customElements.get("image-slideshow")) {
    customElements.define("image-slideshow", ImageSlideshow);
  }
}
