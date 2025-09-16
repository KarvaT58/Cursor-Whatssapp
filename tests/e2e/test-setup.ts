import { test as base } from '@playwright/test'

/**
 * Global test setup for E2E tests
 */

// Global setup - runs once before all tests
test.beforeAll(async () => {
  console.log('🚀 Starting E2E test suite...')
})

// Global teardown - runs once after all tests
test.afterAll(async () => {
  console.log('✅ E2E test suite completed')
})

// Setup before each test
test.beforeEach(async ({ page }) => {
  // Set default timeout
  test.setTimeout(60000)

  // Set viewport size
  await page.setViewportSize({ width: 1280, height: 720 })

  // Set user agent
  await page.setExtraHTTPHeaders({
    'User-Agent': 'Playwright E2E Test',
  })
})

// Teardown after each test
test.afterEach(async ({ page }, testInfo) => {
  // Take screenshot on failure
  if (testInfo.status === 'failed') {
    const screenshot = await page.screenshot({
      path: `test-results/screenshots/failed-${testInfo.title.replace(/\s+/g, '-')}.png`,
      fullPage: true,
    })
    console.log(`📸 Screenshot saved for failed test: ${testInfo.title}`)
  }

  // Clear all cookies and local storage
  await page.context().clearCookies()
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
})

export { test } from '@playwright/test'
