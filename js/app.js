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