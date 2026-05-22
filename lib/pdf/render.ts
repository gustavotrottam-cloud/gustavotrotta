import { existsSync } from "node:fs";
import puppeteer, { type Browser } from "puppeteer-core";

/**
 * Renderiza uma URL como PDF A4. Funciona em dev (Chrome do sistema)
 * e em prod (Vercel via @sparticuz/chromium-min).
 *
 * Em prod: definir env CHROMIUM_PACK_URL apontando pra um tar do chromium-min.
 * Ex.: https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar
 */

const CHROME_CANDIDATE_PATHS_WIN = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
];

const CHROME_CANDIDATE_PATHS_DARWIN = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
];

const CHROME_CANDIDATE_PATHS_LINUX = [
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
];

function findLocalChrome(): string | null {
  if (process.env.CHROME_EXECUTABLE_PATH) return process.env.CHROME_EXECUTABLE_PATH;

  const candidates =
    process.platform === "win32"
      ? CHROME_CANDIDATE_PATHS_WIN
      : process.platform === "darwin"
        ? CHROME_CANDIDATE_PATHS_DARWIN
        : CHROME_CANDIDATE_PATHS_LINUX;

  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return null;
}

async function launchBrowser(): Promise<Browser> {
  const isServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;

  if (isServerless) {
    const { default: chromium } = await import("@sparticuz/chromium-min");
    const packUrl = process.env.CHROMIUM_PACK_URL;
    if (!packUrl) {
      throw new Error(
        "CHROMIUM_PACK_URL não configurado. Veja docs/pdf.md."
      );
    }
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1240, height: 1754, deviceScaleFactor: 1 },
      executablePath: await chromium.executablePath(packUrl),
      headless: true,
    });
  }

  const executablePath = findLocalChrome();
  if (!executablePath) {
    throw new Error(
      "Chrome/Edge não encontrado localmente. Defina CHROME_EXECUTABLE_PATH no .env.local."
    );
  }

  return puppeteer.launch({
    headless: true,
    executablePath,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
}

export async function renderPdfFromUrl(
  url: string,
  authHeader: string
): Promise<Buffer> {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({ "x-pdf-token": authHeader });
    await page.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 2 });

    await page.goto(url, { waitUntil: "networkidle0", timeout: 45_000 });

    // Garante render do Recharts (SVG) antes de gerar PDF
    await page.waitForFunction(
      () => {
        const svgs = document.querySelectorAll("svg");
        return svgs.length > 0;
      },
      { timeout: 10_000 }
    ).catch(() => {});

    // Pequena pausa pra fontes serif/sans finalizarem layout
    await new Promise((r) => setTimeout(r, 400));

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
