/* Scroll-triggered fade-ins */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);

function observeFadeIns() {
  document.querySelectorAll('.fade-in').forEach((el) => {
    if (!el.classList.contains('visible')) {
      observer.observe(el);
    }
  });
}

/* Highlight active nav link based on current page */
const currentPath = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach((link) => {
  const linkPage = link.getAttribute('href').split('/').pop();
  if (linkPage === currentPath) link.classList.add('active');
});

/* Mobile nav toggle */
const hamburger = document.querySelector('.nav-hamburger');
const navLinks = document.querySelector('.nav-links');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.setAttribute(
      'aria-expanded',
      navLinks.classList.contains('open')
    );
  });
  /* Close when a link is clicked */
  navLinks.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => navLinks.classList.remove('open'))
  );
}

/* Change color theme */
const savedTheme = localStorage.getItem('theme');

if (savedTheme) {
  document.body.className = savedTheme;
}

const buttons = document.querySelectorAll('.theme-btn');

buttons.forEach(button => {
  button.addEventListener('click', () => {
    const theme = button.dataset.theme;
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  });
});

if (!document.getElementById('projects-container')) {
  observeFadeIns();
}