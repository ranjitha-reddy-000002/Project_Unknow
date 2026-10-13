const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

    // Mobile navigation
    const menuToggle = $('#menuToggle');
    const navLinks = $('#navLinks');
    menuToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
      menuToggle.textContent = isOpen ? '×' : '☰';
    });
    $$('#navLinks a').forEach(link => link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.textContent = '☰';
    }));

    // Reusable interest / enrollment modal
    const backdrop = $('#modalBackdrop');
    const form = $('#interestForm');
    const formSuccess = $('#formSuccess');
    const modalTitle = $('#modalTitle');
    const modalSubtitle = $('#modalSubtitle');
    const interest = $('#interest');
    const modalCopy = {
      create: ['Let’s make something meaningful.', 'Tell us what kind of surprise you have in mind.', 'surprise'],
      join: ['Be part of the story.', 'Leave your details to express interest in the Afterglow community.', 'community'],
      hunt: ['Ready for a little mystery?', 'Register your interest in future treasure-hunt announcements.', 'treasure'],
      memory: ['A letter to your future self.', 'Tell us about the memory capsule you would like to create.', 'memory']
    };
    function openModal(type = 'create') {
      const copy = modalCopy[type] || modalCopy.create;
      modalTitle.textContent = copy[0];
      modalSubtitle.textContent = copy[1];
      interest.value = copy[2];
      form.style.display = 'block';
      formSuccess.classList.remove('show');
      backdrop.classList.add('open');
      document.body.classList.add('modal-open');
      setTimeout(() => $('#name').focus(), 80);
    }
    function closeModal() {
      backdrop.classList.remove('open');
      document.body.classList.remove('modal-open');
    }
    $$('[data-open-modal]').forEach(el => el.addEventListener('click', event => {
      event.preventDefault();
      openModal(el.dataset.openModal);
    }));
    $('#modalClose').addEventListener('click', closeModal);
    backdrop.addEventListener('click', event => { if (event.target === backdrop) closeModal(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && backdrop.classList.contains('open')) closeModal(); });

    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      form.style.display = 'none';
      formSuccess.classList.add('show');
      form.reset();
      showToast('Demo submission complete — nothing was sent to a server.');
    });

    // Subtle scroll reveals, with graceful fallback if IntersectionObserver is unavailable
    const revealItems = $$('.reveal');
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      revealItems.forEach(item => observer.observe(item));
    } else {
      revealItems.forEach(item => item.classList.add('visible'));
    }

    // Back-to-top control
    const backTop = $('#backTop');
    window.addEventListener('scroll', () => {
      backTop.classList.toggle('visible', window.scrollY > 600);
    }, { passive: true });
    backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // Small toast and current year
    let toastTimer;
    function showToast(message) {
      const toast = $('#toast');
      toast.textContent = message;
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
    }
    $('#year').textContent = new Date().getFullYear();

    // Sample treasure hunt listings (prototype only)
    const sampleHunts = [
      {
        id: "city-mystery",
        title: "The City Mystery",
        description: "Solve a series of riddles inspired by everyday city landmarks.",
        location: "Location to be announced",
        difficulty: "Beginner",
        status: "Coming soon",
        rules: "Follow only publicly accessible routes. Do not enter private property or restricted areas. No live event is currently scheduled."
      },
      {
        id: "memory-trail",
        title: "The Memory Trail",
        description: "Explore a story through clues about places, moments and memories.",
        location: "Location to be announced",
        difficulty: "Beginner",
        status: "Coming soon",
        rules: "This is a concept listing. An approved route and event rules must be published before participation opens."
      },
      {
        id: "puzzle-challenge",
        title: "The Puzzle Challenge",
        description: "Test your observation skills with a sequence of brain teasers.",
        location: "Online concept",
        difficulty: "Intermediate",
        status: "Prototype",
        rules: "This sample listing is for development and testing only. No prize or live competition is offered."
      }
    ];

    const huntList = document.querySelector("#hunt-list");
    const huntDetails = document.querySelector("#hunt-details");
    const huntDetailsContent = document.querySelector("#hunt-details-content");

    function renderHunts() {
      huntList.innerHTML = sampleHunts.map(hunt => `
        <article class="hunt-list-card">
          <span class="hunt-list-status">${hunt.status}</span>
          <h3>${hunt.title}</h3>
          <p>${hunt.description}</p>
          <div class="hunt-list-meta">
            ${hunt.location}<br>
            Difficulty: ${hunt.difficulty}
          </div>
          <button class="btn btn-dark" type="button" data-hunt-id="${hunt.id}">
            View details →
          </button>
        </article>
      `).join("");
    }

    huntList.addEventListener("click", event => {
      const button = event.target.closest("[data-hunt-id]");
      if (!button) return;
      const hunt = sampleHunts.find(item => item.id === button.dataset.huntId);
      if (!hunt) return;

      huntDetailsContent.replaceChildren();
      const heading = document.createElement("h3");
      heading.textContent = hunt.title;
      const description = document.createElement("p");
      description.textContent = hunt.description;
      const location = document.createElement("p");
      location.textContent = `Location: ${hunt.location}`;
      const difficulty = document.createElement("p");
      difficulty.textContent = `Difficulty: ${hunt.difficulty}`;
      const rulesHeading = document.createElement("h3");
      rulesHeading.textContent = "Rules and availability";
      const rules = document.createElement("p");
      rules.textContent = hunt.rules;
      huntDetailsContent.append(heading, description, location, difficulty, rulesHeading, rules);
      huntList.hidden = true;
      huntDetails.hidden = false;
      huntDetails.scrollIntoView({ behavior: "smooth" });
    });

    document.querySelector("#close-hunt-details").addEventListener("click", () => {
      huntDetails.hidden = true;
      huntList.hidden = false;
      huntList.scrollIntoView({ behavior: "smooth" });
    });
    renderHunts();


    // If a user clicks a demo-only mail link, explain that email delivery is not wired up.
    $$('a[href="mailto:hello@example.com"]').forEach(link => link.addEventListener('click', event => {
      event.preventDefault();
      showToast('Demo contact link — replace hello@example.com with your real email.');
    }));