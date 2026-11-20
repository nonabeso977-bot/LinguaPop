const toast = document.getElementById("toast");
let toastTimer;

const languageNames = {
  italian: "الإيطالية",
  french: "الفرنسية"
};

document.querySelectorAll("[data-language]").forEach((card) => {
  card.addEventListener("click", () => {
    const language = card.dataset.language;
    showToast(`اخترتِ ${languageNames[language]}. سنجهّز عالمها ودروسها في المرحلة التالية.`);
  });
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2800);
}

// Theme preference: remember the visitor's choice on this device.
const themeToggle = document.getElementById("theme-toggle");
const themeIcon = themeToggle.querySelector(".theme-icon");
const themeLabel = themeToggle.querySelector(".theme-label");

function applyTheme(isDark) {
  document.body.classList.toggle("dark-mode", isDark);
  themeToggle.setAttribute("aria-checked", String(isDark));
  themeToggle.setAttribute("aria-label", isDark ? "الوضع الليلي مفعّل، اضغطي لإيقافه" : "الوضع الليلي متوقف، اضغطي لتفعيله");
  themeToggle.title = isDark ? "الوضع النهاري" : "الوضع الليلي";
  themeIcon.textContent = isDark ? "☀" : "☾";
  themeLabel.textContent = isDark ? "نهاري" : "ليلي";
}

let savedTheme = "light";
try {
  savedTheme = localStorage.getItem("linguapop-theme") || "light";
} catch (error) {
  // The toggle still works if browser storage is unavailable.
}
applyTheme(savedTheme === "dark");

themeToggle.addEventListener("click", () => {
  const isDark = !document.body.classList.contains("dark-mode");
  applyTheme(isDark);
  try {
    localStorage.setItem("linguapop-theme", isDark ? "dark" : "light");
  } catch (error) {
    // Theme changes remain active until the page is refreshed.
  }
});
