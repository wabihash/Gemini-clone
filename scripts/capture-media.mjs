import { chromium } from 'playwright'
import { createServer } from 'vite'
import { writeFile, mkdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import gifenc from 'gifenc'
import { PNG } from 'pngjs'

const { GIFEncoder, quantize, applyPalette } = gifenc

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUTPUT_DIR = join(ROOT, 'public', 'screenshots')
const DEMO_GIF = join(OUTPUT_DIR, 'demo-flow.gif')

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function ensureDir(path) {
  await mkdir(path, { recursive: true })
}

async function pngToIndexedFrame(path) {
  const buffer = await readFile(path)
  const png = PNG.sync.read(buffer)
  const palette = quantize(png.data, 256)
  const index = applyPalette(png.data, palette)

  return {
    width: png.width,
    height: png.height,
    index,
    palette,
  }
}

async function buildGif(framePaths, outputPath, delayMs = 350) {
  const encoder = GIFEncoder()

  for (const framePath of framePaths) {
    const frame = await pngToIndexedFrame(framePath)
    encoder.writeFrame(frame.index, frame.width, frame.height, {
      palette: frame.palette,
      delay: delayMs,
    })
  }

  encoder.finish()
  const gif = Buffer.from(encoder.bytes())
  await writeFile(outputPath, gif)
}

async function capture() {
  await ensureDir(OUTPUT_DIR)

  const server = await createServer({
    configFile: join(ROOT, 'vite.config.js'),
    root: ROOT,
    server: {
      host: '127.0.0.1',
      port: 4173,
      strictPort: true,
    },
  })

  await server.listen()

  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: 1600, height: 1000 },
  })
  await context.addInitScript(() => {
    window.localStorage.clear()
  })

  try {
    const page = await context.newPage()
    await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' })

    await page.waitForSelector('.dashboard-shell', { timeout: 15000 })
    await page.screenshot({
      path: join(OUTPUT_DIR, 'home-dashboard.png'),
      fullPage: true,
    })

    await page.click('.go-gemini')
    await page.waitForSelector('.main', { timeout: 15000 })
    await page.waitForTimeout(600)
    await page.screenshot({
      path: join(OUTPUT_DIR, 'chat-interface.png'),
      fullPage: true,
    })

    const promptInput = page.locator('.search-box input[type="text"]')
    await promptInput.fill('Write a short profile bio for a frontend freelancer.')
    await page.waitForTimeout(250)
    await page.screenshot({
      path: join(OUTPUT_DIR, 'chat-prompt-ready.png'),
      fullPage: true,
    })

    const mobile = await context.newPage()
    await mobile.setViewportSize({ width: 420, height: 900 })
    await mobile.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' })
    await mobile.waitForSelector('.dashboard-shell', { timeout: 15000 })
    await mobile.click('.go-gemini')
    await mobile.waitForSelector('.main', { timeout: 15000 })
    await mobile.waitForTimeout(500)
    await mobile.screenshot({
      path: join(OUTPUT_DIR, 'mobile-chat.png'),
      fullPage: true,
    })

    const gifFrames = [
      join(OUTPUT_DIR, 'home-dashboard.png'),
      join(OUTPUT_DIR, 'chat-interface.png'),
      join(OUTPUT_DIR, 'chat-prompt-ready.png'),
      join(OUTPUT_DIR, 'mobile-chat.png'),
    ]

    await buildGif(gifFrames, DEMO_GIF, 450)

    await mobile.close()
    await page.close()
  } finally {
    await browser.close()
    await server.close()
  }
}

capture()
  .then(() => {
    process.stdout.write('Media generated successfully.\n')
  })
  .catch((error) => {
    process.stderr.write(`Media generation failed: ${error.message}\n`)
    process.exitCode = 1
  })
