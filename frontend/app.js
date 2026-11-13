function setField(id, value) {
  document.getElementById(id).textContent = value || "—";
}

function showStatusError(text) {
  const node = document.getElementById("status-error");
  node.hidden = !text;
  node.textContent = text;
}

async function readJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`${path} ответил ${response.status}`);
  }
  return response.json();
}

async function loadStatus() {
  showStatusError("");
  try {
    const [home, health, info] = await Promise.all([
      readJson("/api/"),
      readJson("/api/health"),
      readJson("/api/info"),
    ]);
    setField("message", home.message);
    setField("health", health.status);
    setField("hostname", info.hostname);
    setField("python", info.python_version);
    setField("platform", info.platform);
    const architecture = Array.isArray(info.architecture)
      ? info.architecture.filter(Boolean).join(", ")
      : info.architecture;
    setField("architecture", architecture);
    setField("processor", info.processor);
    setField("workdir", info.working_directory);
    setField("user", info.user);
    setField("timestamp", home.timestamp);
  } catch (error) {
    showStatusError("Не удалось спросить backend. Проверьте, что оба сервиса запущены: " + error.message);
  }
}

function wholeNumber(value) {
  if (!/^-?\d+$/.test(value.trim())) {
    return null;
  }
  return value.trim();
}

async function calculate(op) {
  const a = wholeNumber(document.getElementById("a").value);
  const b = wholeNumber(document.getElementById("b").value);
  const route = document.getElementById("route");
  const result = document.getElementById("result");

  if (a === null || b === null) {
    route.textContent = "";
    result.textContent = "Нужны целые числа: так устроены маршруты Flask.";
    return;
  }

  const path = `/api/${op}/${a}/${b}`;
  route.textContent = `frontend → backend:5000/${op}/${a}/${b}`;

  try {
    const response = await fetch(path);
    if (!response.ok) {
      result.textContent = `Ошибка ${response.status}. На ноль делить нельзя.`;
      return;
    }
    const data = await response.json();
    result.textContent = data.result;
  } catch (error) {
    result.textContent = "Запрос не дошёл: " + error.message;
  }
}

document.getElementById("refresh").addEventListener("click", loadStatus);

document.getElementById("calc-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const op = event.submitter?.dataset.op;
  if (op) {
    calculate(op);
  }
});

loadStatus();
