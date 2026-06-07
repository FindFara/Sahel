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

const balloonField = document.querySelector('[data-balloon-field]');
const balloonStorageKey = 'sahelReleasedBalloons';
const balloonPalette = [
  '#ff007d', '#ffc400', '#35d4ff', '#7c4dff', '#ff8a00', '#54e37a', '#ff5fbf', '#ffffff'
];
const balloonLayout = [
  [6, 10], [17, 7], [29, 12], [42, 8], [55, 13], [68, 7], [81, 11], [94, 8],
  [10, 27], [23, 23], [35, 31], [49, 25], [61, 33], [74, 24], [88, 30], [97, 24],
  [4, 47], [16, 43], [28, 51], [40, 45], [52, 54], [65, 46], [78, 52], [91, 44],
  [9, 68], [21, 62], [34, 71], [47, 64], [59, 73], [72, 65], [85, 70], [96, 62],
  [14, 86], [31, 82], [50, 88], [69, 81], [87, 86]
];

function loadReleasedBalloons() {
  try {
    return new Set(JSON.parse(window.localStorage.getItem(balloonStorageKey) || '[]'));
  } catch {
    return new Set();
  }
}

function saveReleasedBalloons(releasedBalloons) {
  try {
    window.localStorage.setItem(balloonStorageKey, JSON.stringify([...releasedBalloons]));
  } catch {
    // If storage is unavailable, balloons still leave the current page when touched.
  }
}

function floatBalloonAway(balloon, releaseDelay = 0) {
  if (balloon.classList.contains('is-released')) {
    return;
  }

  balloon.style.setProperty('--release-delay', `${releaseDelay}s`);
  balloon.classList.add('is-released');
  balloon.setAttribute('aria-hidden', 'true');
  balloon.tabIndex = -1;
  balloon.addEventListener('animationend', () => balloon.remove(), { once: true });
}

function releaseAllBalloons(releasedBalloons) {
  const balloons = [...balloonField.querySelectorAll('.touch-balloon')];

  if (balloons.length === 0) {
    return;
  }

  balloonLayout.forEach((_, index) => releasedBalloons.add(`balloon-${index}`));
  saveReleasedBalloons(releasedBalloons);

  balloons.forEach((balloon, index) => {
    floatBalloonAway(balloon, index * .08);
  });
}

function createBalloons() {
  if (!balloonField) {
    return;
  }

  const releasedBalloons = loadReleasedBalloons();

  balloonLayout.forEach(([x, y], index) => {
    const balloonId = `balloon-${index}`;

    if (releasedBalloons.has(balloonId)) {
      return;
    }

    const balloon = document.createElement('button');
    const color = balloonPalette[index % balloonPalette.length];
    balloon.type = 'button';
    balloon.className = 'touch-balloon';
    balloon.dataset.balloonId = balloonId;
    balloon.setAttribute('aria-label', 'بادکنک را لمس کن تا بالا برود');
    balloon.style.setProperty('--balloon-x', `${x}%`);
    balloon.style.setProperty('--balloon-y', `${y}%`);
    balloon.style.setProperty('--balloon-color', color);
    balloon.style.setProperty('--balloon-tilt', `${(index % 7 - 3) * 3}deg`);
    balloon.style.setProperty('--balloon-speed', `${3.1 + (index % 5) * .35}s`);
    balloon.style.setProperty('--balloon-delay', `${(index % 8) * -.24}s`);
    balloon.style.setProperty('--balloon-size', `clamp(3.1rem, ${5.7 + (index % 4) * .55}vw, 7.6rem)`);
    balloon.innerHTML = '<span class="balloon-knot" aria-hidden="true"></span>';
    balloon.addEventListener('pointerdown', () => releaseAllBalloons(releasedBalloons));
    balloon.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        releaseAllBalloons(releasedBalloons);
      }
    });
    balloonField.appendChild(balloon);
  });
}

createBalloons();
