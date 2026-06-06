const revealElements = document.querySelectorAll('.reveal');
const parallaxElements = document.querySelectorAll('[data-parallax]');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
    }
  });
}, { threshold: 0.18 });

revealElements.forEach((element) => revealObserver.observe(element));

let ticking = false;

function animateOnScroll() {
  const viewportCenter = window.innerHeight / 2;

  parallaxElements.forEach((element) => {
    const speed = Number.parseFloat(element.dataset.parallax || '0');
    const rect = element.getBoundingClientRect();
    const distance = rect.top + rect.height / 2 - viewportCenter;
    element.style.setProperty('--scroll-y', `${distance * speed}px`);
  });

  ticking = false;
}

function requestScrollAnimation() {
  if (!ticking) {
    window.requestAnimationFrame(animateOnScroll);
    ticking = true;
  }
}

window.addEventListener('scroll', requestScrollAnimation, { passive: true });
window.addEventListener('resize', requestScrollAnimation);
requestScrollAnimation();
