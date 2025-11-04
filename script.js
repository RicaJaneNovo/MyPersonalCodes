function showSection(sectionId) {
  const sections = document.querySelectorAll("section");
  sections.forEach(section => section.classList.remove("active"));
  document.getElementById(sectionId).classList.add("active");
}

function toggleTheme() {
  document.body.classList.toggle("dark");
  const themeBtn = document.querySelector(".theme-toggle");
  themeBtn.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
}

// Optional animation or interactivity for "Read More" buttons
document.querySelectorAll(".read-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    alert("✨ Coming soon! Stay tuned for more book details.");
  });
});
