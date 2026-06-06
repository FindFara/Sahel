const revealElements = document.querySelectorAll('.reveal');
const parallaxElements = document.querySelectorAll('[data-parallax]');
const countdownParts = document.querySelectorAll('[data-countdown-part]');

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

function div(a, b) {
  return ~~(a / b);
}

function jalaliToGregorian(jy, jm, jd) {
  jy += 1595;
  let days = -355668 + (365 * jy) + (div(jy, 33) * 8) + div(((jy % 33) + 3), 4) + jd;

  if (jm < 7) {
    days += (jm - 1) * 31;
  } else {
    days += ((jm - 7) * 30) + 186;
  }

  let gy = 400 * div(days, 146097);
  days %= 146097;

  if (days > 36524) {
    gy += 100 * div(--days, 36524);
    days %= 36524;

    if (days >= 365) {
      days++;
    }
  }

  gy += 4 * div(days, 1461);
  days %= 1461;

  if (days > 365) {
    gy += div((days - 1), 365);
    days = (days - 1) % 365;
  }

  const gd = days + 1;
  const salA = [0, 31, ((gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 0;
  let remainingDays = gd;

  for (gm = 1; gm < 13 && remainingDays > salA[gm]; gm++) {
    remainingDays -= salA[gm];
  }

  return { gy, gm, gd: remainingDays };
}

function gregorianToJalali(gy, gm, gd) {
  const gDM = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy;

  if (gy > 1600) {
    jy = 979;
    gy -= 1600;
  } else {
    jy = 0;
    gy -= 621;
  }

  const gy2 = gm > 2 ? gy + 1 : gy;
  let days = (365 * gy) + div((gy2 + 3), 4) - div((gy2 + 99), 100) + div((gy2 + 399), 400) - 80 + gd + gDM[gm - 1];
  jy += 33 * div(days, 12053);
  days %= 12053;
  jy += 4 * div(days, 1461);
  days %= 1461;

  if (days > 365) {
    jy += div((days - 1), 365);
    days = (days - 1) % 365;
  }

  const jm = days < 186 ? 1 + div(days, 31) : 7 + div((days - 186), 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);

  return { jy, jm, jd };
}

function getNextBirthday(now) {
  const today = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const targetJalaliYear = today.jm > 12 || (today.jm === 12 && today.jd >= 16) ? today.jy + 1 : today.jy;
  const nextBirthday = jalaliToGregorian(targetJalaliYear, 12, 16);

  return new Date(nextBirthday.gy, nextBirthday.gm - 1, nextBirthday.gd, 0, 0, 0, 0);
}

const persianNumber = new Intl.NumberFormat('fa-IR', { minimumIntegerDigits: 2, maximumFractionDigits: 0 });
const persianDays = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 });

function updateCountdown() {
  if (countdownParts.length === 0) {
    return;
  }

  const now = new Date();
  const target = getNextBirthday(now);
  let distance = target.getTime() - now.getTime();

  if (distance < 0) {
    distance = 0;
  }

  const seconds = Math.floor(distance / 1000) % 60;
  const minutes = Math.floor(distance / (1000 * 60)) % 60;
  const hours = Math.floor(distance / (1000 * 60 * 60)) % 24;
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const values = {
    days: persianDays.format(days),
    hours: persianNumber.format(hours),
    minutes: persianNumber.format(minutes),
    seconds: persianNumber.format(seconds),
  };

  countdownParts.forEach((part) => {
    part.textContent = values[part.dataset.countdownPart];
  });
}

window.addEventListener('scroll', requestScrollAnimation, { passive: true });
window.addEventListener('resize', requestScrollAnimation);
requestScrollAnimation();
updateCountdown();
window.setInterval(updateCountdown, 1000);
