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

/* Load projects from JSON */
const projectsContainer = document.getElementById('projects-container');

if (projectsContainer) {
    fetch('/assets/data/projects.json')
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(projects => {

        projects.forEach(project => {

            const card = document.createElement('article');

            card.className = 'card fade-in';

            let githublink = '';
            if (project.github && project.github !== '') {
                githublink = `
              <a href="${project.github}" target="_blank" rel="noopener">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>
                GitHub
              </a>
              `;
            }

            let livelink = '';
            if (project.live && project.live !== '') {
                const liveTarget = project.live === '#' ? '' : 'target="_blank" rel="noopener"';
                livelink = `
              <a href="${project.live}" ${liveTarget}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                Live
              </a>
              `;
            }

            if (project.datatag) {
                card.dataset.tag = project.datatag;
            }

            let inprogress = '';
            if (project.inprogress) {
                inprogress = '<span class="card-tag inprogress">In Progress</span>';
                card.dataset.tag = (card.dataset.tag || '') + ' inprogress';
            }


            card.innerHTML = `
            <span class="card-tag">${project.tag}</span> 
            ${inprogress}
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <div class="card-links">
                ${githublink}
                ${livelink}
            </div>
            `;

            projectsContainer.appendChild(card);
        });
        observeFadeIns();
    }).catch(err => {
        console.error('Failed to load projects:', err);
        projectsContainer.innerHTML = '<p>Could not load projects.</p>';
        observeFadeIns();
    });
} else {
  observeFadeIns();
}

/* Highlight active nav link based on current page */
const currentPath = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach((link) => {
  const linkPage = link.getAttribute('href').split('/').pop();
  if (linkPage === currentPath) link.classList.add('active');
});

/* Mobile nav toggle */
const hamburger = document.querySelector('.nav-hamburger');
const navLinks  = document.querySelector('.nav-links');
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