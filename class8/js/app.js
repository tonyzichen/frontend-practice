const menuButton = document.querySelector('.menu-button');
const siteNav = document.querySelector('#site-nav');

if (menuButton && siteNav) {
  const closeMenu = () => {
    siteNav.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
  };

  menuButton.addEventListener('click', () => {
    const willOpen = !siteNav.classList.contains('is-open');
    siteNav.classList.toggle('is-open', willOpen);
    menuButton.setAttribute('aria-expanded', String(willOpen));
  });

  siteNav.addEventListener('click', (event) => {
    if (event.target.matches('a')) closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.matchMedia('(min-width: 44.0625rem)').matches) closeMenu();
  });
}
