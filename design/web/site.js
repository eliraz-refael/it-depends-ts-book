'use strict';
const menu = document.querySelector('.contents-menu');
const summary = menu.querySelector('summary');
const close = menu.querySelector('.drawer-close');
close.hidden = false;
const dismiss = () => { menu.open = false; summary.focus(); };
close.addEventListener('click', dismiss);
menu.addEventListener('keydown', event => {
  if (event.key === 'Escape') { event.preventDefault(); dismiss(); }
});
document.addEventListener('click', event => {
  if (menu.open && !menu.contains(event.target)) menu.open = false;
});
const bar = document.querySelector('.reading-progress > div');
const article = document.querySelector('article.book-body');
const update = () => {
  if (!article) return;
  const start = article.offsetTop;
  const distance = Math.max(1, article.offsetHeight - window.innerHeight);
  bar.style.width = `${Math.min(100, Math.max(0, (window.scrollY - start) / distance * 100))}%`;
};
window.addEventListener('scroll', update, {passive:true});
window.addEventListener('resize', update);
update();
