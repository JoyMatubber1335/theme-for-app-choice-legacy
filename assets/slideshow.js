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
        this.swiper = new Swiper(swiperContainer, {
          // Required for navigation buttons to work
          navigation: {
            nextEl: this.querySelector(".swiper-button-next"),
            prevEl: this.querySelector(".swiper-button-prev"),
          },
          // --- Key options for partial view ---
          slidesPerView: 1.2, // Show 1 full slide and 20% of the next/prev
          centeredSlides: true, // Center the active slide
          spaceBetween: 20, // Space between slides in pixels
          // Optional: Loop mode
          loop: true,
          // Optional: Responsive breakpoints
          breakpoints: {
            // when window width is >= 768px
            768: {
              slidesPerView: 1.5,
              spaceBetween: 30,
            },
            // when window width is >= 1024px
            1024: {
              slidesPerView: 1.8,
              spaceBetween: 40,
            },
          },
        });
      }
    }
  }

  // Register the custom element
  if (!customElements.get("image-slideshow")) {
    customElements.define("image-slideshow", ImageSlideshow);
  }
}
