
/* Load projects from JSON */
const projectsContainer = document.getElementById('projects-container');
const projectTags = new Set();
const filterBar = document.getElementById('filter-bar');

function createFilterBar() {
  if (!filterBar) return;

  projectTags.forEach(tag => {
    const btn = document.createElement('a');
    btn.className = 'filter-btn';
    btn.dataset.filter = tag;
    btn.textContent = tag;
    filterBar.appendChild(btn);
  });

  const btn = document.createElement('a');
  btn.className = 'filter-btn';
  btn.dataset.filter = 'inprogress';
  btn.textContent = 'In Progress';
  filterBar.appendChild(btn);

  const filterBtns = filterBar.querySelectorAll('.filter-btn');
  const cards = projectsContainer.querySelectorAll('.card-wrap');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      projectsContainer.classList.add('filtering');
      setTimeout(() => {
        console.log("Filter clicked:", btn.dataset.filter);
        filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;
        cards.forEach((card) => {
          console.log("Checking card:", card.dataset.tags, "for filter:", filter);
          const tags = card.dataset.tags || '';
          const show = filter === 'all' || tags.includes(filter);
          card.style.display = show ? '' : 'none';
        });

        projectsContainer.classList.remove('filtering');
      }, 250);
    });
  });
}

if (projectsContainer) {
  fetch('/assets/data/projects.json')
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(projects => {
      const featuredOnly = projectsContainer.dataset.featured === 'true';
      projects.forEach(project => {
        if (project.hidden || (featuredOnly && !project.featured)) return;

        const card = document.createElement('div');

        card.className = 'card-wrap fade-in';

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
          project.datatag.forEach(tag => projectTags.add(tag));
          card.dataset.tags = project.datatag.join(';');
        }

        let inprogress = '';
        if (project.inprogress) {
          inprogress = '<span class="card-tag inprogress">In Progress</span>';
          card.dataset.tags = (card.dataset.tags || '') + ' inprogress';
        }

        let imgTag = '';
        let cardTagsClass = 'card-tags';
        if (project.img) {
          imgTag = `<img src="${project.img}" alt="${project.title} screenshot" class="card-thumb">`;
          cardTagsClass += ' overlay';
        } else {
          card.classList.add('no-thumb');
        }


        card.innerHTML = `
          <article class="card">
          ${imgTag}
          <div class="card-content">
          <div class="${cardTagsClass}">
          <span class="card-tag">${project.tag}</span> 
          ${inprogress}
          </div>
          <h3>${project.title}</h3>
          <p>${project.description}</p>
          <div class="card-links">
              ${githublink}
              ${livelink}
          </div>
          </div>
          </article>
          `;

        projectsContainer.appendChild(card);
      });
      observeFadeIns();
      createFilterBar();
    }).catch(err => {
      console.error('Failed to load projects:', err);
      projectsContainer.innerHTML = '<p>Could not load projects.</p>';
      observeFadeIns();
    });
} else {
  observeFadeIns();
}
