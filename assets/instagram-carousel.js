/**
 * Instagram Carousel - Simple and Reliable Implementation
 */

(function() {
  'use strict';

  function initCarousel(container) {
    const track = container.querySelector('.instagram-carousel__track');
    const slides = container.querySelectorAll('.instagram-carousel__slide');
    
    if (!track || slides.length === 0) return;

    let isScrolling = false;
    let scrollTimeout = null;
    let startX = 0;
    let startScrollLeft = 0;
    let isDragging = false;

    // Setup basic carousel properties
    track.style.scrollBehavior = 'smooth';
    track.setAttribute('tabindex', '0');
    track.setAttribute('role', 'region');
    track.setAttribute('aria-label', 'Instagram photos carousel');

    // Touch/Mouse drag functionality
    function handleStart(e) {
      isDragging = true;
      startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
      startScrollLeft = track.scrollLeft;
      track.style.scrollBehavior = 'auto';
      track.style.cursor = 'grabbing';
    }

    function handleMove(e) {
      if (!isDragging) return;
      
      e.preventDefault();
      const currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
      const deltaX = startX - currentX;
      track.scrollLeft = startScrollLeft + deltaX;
    }

    function handleEnd() {
      if (!isDragging) return;
      
      isDragging = false;
      track.style.scrollBehavior = 'smooth';
      track.style.cursor = 'grab';
      
      // Snap to nearest slide
      setTimeout(() => snapToNearestSlide(), 50);
    }

    // Snap to nearest slide
    function snapToNearestSlide() {
      if (isScrolling) return;
      
      const slideWidth = slides[0].offsetWidth;
      const gap = 16; // 1rem gap
      const slideWithGap = slideWidth + gap;
      const scrollLeft = track.scrollLeft;
      
      const nearestIndex = Math.round(scrollLeft / slideWithGap);
      const clampedIndex = Math.max(0, Math.min(nearestIndex, slides.length - 1));
      const targetScrollLeft = clampedIndex * slideWithGap;
      
      track.scrollTo({
        left: targetScrollLeft,
        behavior: 'smooth'
      });
    }

    // Handle scroll events
    function handleScroll() {
      isScrolling = true;
      clearTimeout(scrollTimeout);
      
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 150);
    }

    // Keyboard navigation
    function handleKeydown(e) {
      const slideWidth = slides[0].offsetWidth;
      const gap = 16;
      const slideWithGap = slideWidth + gap;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          track.scrollBy({ left: -slideWithGap, behavior: 'smooth' });
          break;
        case 'ArrowRight':
          e.preventDefault();
          track.scrollBy({ left: slideWithGap, behavior: 'smooth' });
          break;
        case 'Home':
          e.preventDefault();
          track.scrollTo({ left: 0, behavior: 'smooth' });
          break;
        case 'End':
          e.preventDefault();
          track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' });
          break;
      }
    }

    // Mouse wheel horizontal scrolling
    function handleWheel(e) {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        track.scrollLeft += e.deltaY;
        
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => snapToNearestSlide(), 150);
      }
    }

    // Bind events
    // Touch events
    track.addEventListener('touchstart', handleStart, { passive: true });
    track.addEventListener('touchmove', handleMove, { passive: false });
    track.addEventListener('touchend', handleEnd, { passive: true });
    
    // Mouse events
    track.addEventListener('mousedown', handleStart);
    track.addEventListener('mousemove', handleMove);
    track.addEventListener('mouseup', handleEnd);
    track.addEventListener('mouseleave', handleEnd);
    
    // Other events
    track.addEventListener('scroll', handleScroll, { passive: true });
    track.addEventListener('keydown', handleKeydown);
    track.addEventListener('wheel', handleWheel, { passive: false });

    // Prevent context menu on long press
    track.addEventListener('contextmenu', (e) => {
      if (isDragging) e.preventDefault();
    });

    // Set initial cursor
    track.style.cursor = 'grab';
    
    console.log('Instagram carousel initialized with', slides.length, 'slides');
  }

  // Initialize all carousels
  function initAllCarousels() {
    // Look for both custom elements and regular divs
    const customElements = document.querySelectorAll('instagram-carousel');
    const regularElements = document.querySelectorAll('.instagram-carousel-section');
    
    [...customElements, ...regularElements].forEach(container => {
      if (!container.dataset.initialized) {
        initCarousel(container);
        container.dataset.initialized = 'true';
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllCarousels);
  } else {
    initAllCarousels();
  }

  // Handle Shopify theme editor
  if (typeof Shopify !== 'undefined' && Shopify.designMode) {
    document.addEventListener('shopify:section:load', () => {
      setTimeout(initAllCarousels, 100);
    });
  }

  // Expose init function globally for manual initialization
  window.initInstagramCarousels = initAllCarousels;

})();