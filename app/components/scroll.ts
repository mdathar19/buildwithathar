export function smoothScrollTo(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  const top = target.getBoundingClientRect().top + window.scrollY - 50;
  window.scrollTo({ top, behavior: "smooth" });
}
