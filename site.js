// Three small things: the clip viewer, the index that follows your scroll, and j / k between projects.

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const projects = [...document.querySelectorAll("article.project")];
const navLinks = new Map([...document.querySelectorAll(".side nav a")].map(a => [a.hash.slice(1), a]));

// The clip viewer: only the chosen GIF downloads; its preview frame shows until it arrives.
for (const viewer of document.querySelectorAll("[data-viewer]")) {
  const screen = viewer.querySelector(".screen img");
  const links = [...viewer.querySelectorAll(".clips a")];
  screen.addEventListener("load", () => viewer.classList.remove("loading"));
  for (const link of links) {
    link.addEventListener("click", event => {
      event.preventDefault();
      if (link.getAttribute("aria-current") === "true") return;
      for (const other of links) other.removeAttribute("aria-current");
      link.setAttribute("aria-current", "true");
      viewer.classList.add("loading");
      screen.style.backgroundImage = `url(${link.dataset.poster})`;
      screen.alt = link.dataset.alt;
      screen.src = link.getAttribute("href");
    });
  }
}

// The index marks the project you're reading.
function markCurrent(id) {
  for (const [key, link] of navLinks) {
    if (key === id) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  }
}

function currentIndex() {
  let index = -1;
  projects.forEach((project, i) => {
    if (project.getBoundingClientRect().top <= window.innerHeight * 0.35) index = i;
  });
  return index;
}

let ticking = false;
function update() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    const i = currentIndex();
    markCurrent(i >= 0 ? projects[i].id : null);
  });
}
window.addEventListener("scroll", update, { passive: true });
window.addEventListener("resize", update);
window.addEventListener("load", update);
update();

// j / k step through the projects.
document.addEventListener("keydown", event => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.target.closest("input, textarea, select, [contenteditable]")) return;
  const step = event.key === "j" ? 1 : event.key === "k" ? -1 : 0;
  if (!step) return;
  const here = currentIndex();
  const next = Math.min(projects.length - 1, Math.max(0, here + step));
  if (next === here && here !== -1) return;
  projects[next].scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  history.replaceState(null, "", "#" + projects[next].id);
});
