import { Page, expect } from '@playwright/test'

/**
 * Common page helper functions for E2E tests
 */
export class PageHelpers {
  constructor(private page: Page) {}

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle')
    await this.page.waitForSelector('body')
  }

  /**
   * Take screenshot with timestamp
   */
  async takeScreenshot(name: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    await this.page.screenshot({
      path: `test-results/screenshots/${name}-${timestamp}.png`,
      fullPage: true,
    })
  }

  /**
   * Wait for element to be visible and clickable
   */
  async waitForClickable(selector: string, timeout = 10000) {
    await this.page.waitForSelector(selector, { state: 'visible', timeout })
    await this.page.waitForSelector(selector, { state: 'attached', timeout })
  }

  /**
   * Fill form field with validation
   */
  async fillField(selector: string, value: string) {
    await this.waitForClickable(selector)
    await this.page.fill(selector, value)

    // Verify the value was set
    const fieldValue = await this.page.inputValue(selector)
    expect(fieldValue).toBe(value)
  }

  /**
   * Click button and wait for action to complete
   */
  async clickAndWait(selector: string, waitForSelector?: string) {
    await this.waitForClickable(selector)
    await this.page.click(selector)

    if (waitForSelector) {
      await this.page.waitForSelector(waitForSelector, { state: 'visible' })
    }
  }

  /**
   * Wait for toast notification
   */
  async waitForToast(message?: string) {
    const toastSelector = '[data-testid="toast"], .toast, [role="alert"]'
    await this.page.waitForSelector(toastSelector, { state: 'visible' })

    if (message) {
      await expect(this.page.locator(toastSelector)).toContainText(message)
    }
  }

  /**
   * Wait for loading spinner to disappear
   */
  async waitForLoadingToComplete() {
    const loadingSelectors = [
      '[data-testid="loading"]',
      '.loading',
      '.spinner',
      '[aria-label="Loading"]',
    ]

    for (const selector of loadingSelectors) {
      try {
        await this.page.waitForSelector(selector, {
          state: 'hidden',
          timeout: 5000,
        })
      } catch {
        // Ignore if selector doesn't exist
      }
    }
  }

  /**
   * Navigate using sidebar menu
   */
  async navigateViaSidebar(menuItem: string) {
    const sidebarSelector = `[data-testid="sidebar"] a:has-text("${menuItem}")`
    await this.clickAndWait(sidebarSelector)
    await this.waitForPageLoad()
  }

  /**
   * Check if element exists without throwing error
   */
  async elementExists(selector: string): Promise<boolean> {
    try {
      await this.page.waitForSelector(selector, { timeout: 1000 })
      return true
    } catch {
      return false
    }
  }

  /**
   * Get text content from element
   */
  async getText(selector: string): Promise<string> {
    await this.waitForClickable(selector)
    return (await this.page.textContent(selector)) || ''
  }

  /**
   * Wait for network request to complete
   */
  async waitForNetworkRequest(urlPattern: string | RegExp) {
    await this.page.waitForResponse((response) => {
      const url = response.url()
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern)
      }
      return urlPattern.test(url)
    })
  }
}
