import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE_URL || "http://localhost:5173";
const OUT_DIR = new URL("./video/", import.meta.url).pathname;
mkdirSync(OUT_DIR, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const CURSOR_SCRIPT = `(() => {
  if (window.__pwCursorSetup) return;
  window.__pwCursorSetup = true;
  const mount = () => {
    if (document.getElementById("pw-cursor")) return;
    const style = document.createElement("style");
    style.textContent = [
      "#pw-cursor{position:fixed;top:0;left:0;width:26px;height:26px;z-index:2147483647;",
      "pointer-events:none;opacity:0;transition:opacity .25s ease;will-change:transform;}",
      "#pw-cursor.visible{opacity:1;}",
      "#pw-cursor svg{filter:drop-shadow(0 2px 3px rgba(0,0,0,.45));transition:transform .1s ease;}",
      "#pw-cursor.down svg{transform:scale(.8);}",
    ].join("");
    const el = document.createElement("div");
    el.id = "pw-cursor";
    el.innerHTML =
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M5.5 3.2l13.2 7.9-6 1.3 3 6.4-2.6 1.2-3-6.5-4.6 3.4V3.2z" ' +
      'fill="#ffffff" stroke="#111111" stroke-width="1.5" stroke-linejoin="round"/></svg>';
    document.head.appendChild(style);
    document.body.appendChild(el);
    document.addEventListener(
      "mousemove",
      (e) => {
        el.classList.add("visible");
        el.style.transform = "translate(" + e.clientX + "px," + e.clientY + "px)";
      },
      { passive: true }
    );
    document.addEventListener("mousedown", () => el.classList.add("down"));
    document.addEventListener("mouseup", () => el.classList.remove("down"));
  };
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();`;

async function smoothHover(page, locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error("Elemento no visible para hover");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
    steps: 18,
  });
  await sleep(280);
}

async function typeInto(locator, text, delay = 55) {
  await locator.click();
  await locator.pressSequentially(text, { delay });
}

const browser = await chromium.launch({ args: ["--force-color-profile=srgb"] });
const context = await browser.newContext({
  viewport: { width: 1280, height: 820 },
  deviceScaleFactor: 2,
  locale: "es-ES",
  permissions: ["clipboard-read", "clipboard-write"],
  recordVideo: { dir: OUT_DIR, size: { width: 1280, height: 820 } },
});
await context.addInitScript(CURSOR_SCRIPT);

const page = await context.newPage();
const log = (...a) => console.log("[demo]", ...a);

try {
  // 1. Landing
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.getByPlaceholder("What's your question?").waitFor();
  await sleep(2200);
  log("landing OK");

  // 2. Escribir la pregunta
  const question = page.getByPlaceholder("What's your question?");
  await smoothHover(page, question);
  await typeInto(question, "¿Cuál es tu lenguaje de programación favorito?");
  await sleep(700);

  // 3. Opciones
  const opt1 = page.getByPlaceholder("Option 1");
  await smoothHover(page, opt1);
  await typeInto(opt1, "JavaScript", 65);
  await sleep(400);

  const opt2 = page.getByPlaceholder("Option 2");
  await smoothHover(page, opt2);
  await typeInto(opt2, "TypeScript", 65);
  await sleep(700);
  log("pregunta y 2 opciones OK");

  // 4. Añadir tercera opción
  const addBtn = page.getByRole("button", { name: "+ Add Option" });
  await smoothHover(page, addBtn);
  await sleep(500);
  await addBtn.click();
  await sleep(800);
  const opt3 = page.getByPlaceholder("Option 3");
  await smoothHover(page, opt3);
  await typeInto(opt3, "Python", 65);
  await sleep(900);
  log("tercera opción OK");

  // 5. Crear encuesta
  const createBtn = page.getByRole("button", { name: "Create Survey!" });
  await smoothHover(page, createBtn);
  await sleep(700);
  await createBtn.click();
  await page.waitForURL(/\/[a-zA-Z0-9]{8}$/, { timeout: 15000 });
  await page.getByRole("heading", { name: /lenguaje/i }).waitFor();
  await sleep(1800);
  const surveyUrl = page.url();
  log("encuesta creada:", surveyUrl);

  // 6. Votar
  const voteBtn = page.getByRole("button", { name: "TypeScript" });
  await smoothHover(page, voteBtn);
  await sleep(600);
  await voteBtn.click();
  await page.getByText("%", { exact: false }).first().waitFor({ timeout: 10000 });
  await sleep(2200);
  log("voto emitido y resultados visibles");

  // 7. Copiar enlace
  const copyBtn = page.getByRole("button", { name: /Copiar enlace/i });
  await smoothHover(page, copyBtn);
  await sleep(500);
  await copyBtn.click();
  await sleep(1500);
  const copied = await page.getByText(/Enlace copiado/i).count();
  log("copiar enlace ->", copied > 0 ? "OK" : "sin confirmación visible");

  // 8. QR
  const qrBtn = page.getByRole("button", { name: /Show QR code/i });
  await smoothHover(page, qrBtn);
  await sleep(500);
  await qrBtn.click();
  await page.getByText("Scan to access the survey").waitFor({ timeout: 8000 });
  await sleep(2000);
  log("QR desplegado");

  // 9. Segundo votante (otra pestaña) -> actualización en tiempo real
  const voter2 = await context.newPage();
  await voter2.goto(surveyUrl, { waitUntil: "networkidle" });
  await voter2.getByRole("button", { name: "Python" }).waitFor();
  await page.bringToFront();
  await sleep(400);
  await voter2.getByRole("button", { name: "Python" }).click();
  await page
    .getByText("50%", { exact: true })
    .first()
    .waitFor({ timeout: 10000 });
  await sleep(3000);
  log("voto externo recibido en tiempo real (50%)");

  await voter2.close();
  await sleep(800);
} catch (err) {
  console.error("[demo] ERROR:", err.message);
  try {
    await page.screenshot({ path: new URL("./error.png", import.meta.url).pathname });
  } catch {}
} finally {
  const videoPath = await page.video().path();
  await context.close();
  await browser.close();
  console.log("[demo] VIDEO_RAW=" + videoPath);
}
