const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector(".main-navigation");

if (menuButton && navigation) {
  menuButton.addEventListener("click", () => {
    const isOpen = navigation.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navigation.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    });
  });
}

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12
    }
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
} else {
  revealElements.forEach((element) => {
    element.classList.add("visible");
  });
}

document.querySelectorAll("[data-copy-target]").forEach((button) => {
  button.addEventListener("click", async () => {
    const target = document.getElementById(button.dataset.copyTarget);

    if (!target) {
      return;
    }

    try {
      await navigator.clipboard.writeText(target.textContent.trim());

      const originalText = button.textContent;
      button.textContent = "COPIADO";
      button.classList.add("copied");

      window.setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove("copied");
      }, 1600);
    } catch (error) {
      console.error("Não foi possível copiar o conteúdo.", error);
      button.textContent = "ERRO";
    }
  });
});

const apiElements = {
  indicator: document.querySelector("#api-indicator"),
  status: document.querySelector("#api-status"),
  title: document.querySelector("#status-title"),
  description: document.querySelector("#status-description"),
  environment: document.querySelector("#app-environment"),
  version: document.querySelector("#app-version"),
  securityMode: document.querySelector("#security-mode"),
  lastCheck: document.querySelector("#last-check"),
  button: document.querySelector("#check-api-button")
};

function formatTime(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(date);
}

function setCheckingState() {
  apiElements.button.disabled = true;
  apiElements.button.textContent = "VERIFICANDO...";
  apiElements.indicator.classList.remove("offline");
  apiElements.status.textContent = "CHECKING";
  apiElements.title.textContent = "Verificando API...";
  apiElements.description.textContent =
    "Aguardando resposta do serviço backend.";
}

function setOnlineState(data) {
  apiElements.indicator.classList.remove("offline");
  apiElements.status.textContent = "ONLINE";
  apiElements.title.textContent = "Aplicação operacional.";
  apiElements.description.textContent =
    "O frontend está conectado ao backend por meio do serviço interno.";
  apiElements.environment.textContent =
    data.environment ?? "não informado";
  apiElements.version.textContent =
    data.version ?? "não informada";
  apiElements.securityMode.textContent =
    data.security_mode ?? "não informado";
  apiElements.lastCheck.textContent = formatTime(new Date());
}

function setOfflineState(error) {
  apiElements.indicator.classList.add("offline");
  apiElements.status.textContent = "OFFLINE";
  apiElements.title.textContent = "Backend indisponível.";
  apiElements.description.textContent =
    "A interface foi carregada, mas a API não respondeu.";
  apiElements.environment.textContent = "--";
  apiElements.version.textContent = "--";
  apiElements.securityMode.textContent = "--";
  apiElements.lastCheck.textContent = formatTime(new Date());

  console.error("Erro ao consultar a API:", error);
}

async function checkApi() {
  setCheckingState();

  try {
    const response = await fetch("/api/status", {
      method: "GET",
      headers: {
        Accept: "application/json"
      },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Resposta HTTP ${response.status}`);
    }

    const data = await response.json();
    setOnlineState(data);
  } catch (error) {
    setOfflineState(error);
  } finally {
    apiElements.button.disabled = false;
    apiElements.button.textContent = "VERIFICAR NOVAMENTE";
  }
}

apiElements.button.addEventListener("click", checkApi);
window.addEventListener("DOMContentLoaded", checkApi);
