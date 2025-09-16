import { test, expect } from './fixtures/auth.fixture'
import { testCampaigns, testContacts } from './utils/test-data'

test.describe('Campaign Management', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    // Navigate to campaigns section
    await authenticatedPage.goto('/dashboard/campaigns')
  })

  test('should display campaigns interface', async ({ page, pageHelpers }) => {
    // Should show campaigns interface elements
    await expect(page.locator('[data-testid="campaigns-page"]')).toBeVisible()
    await expect(
      page.locator('[data-testid="create-campaign-button"]')
    ).toBeVisible()
    await expect(page.locator('[data-testid="campaigns-list"]')).toBeVisible()
  })

  test('should create new campaign', async ({ page, pageHelpers }) => {
    // Click create campaign button
    await pageHelpers.clickAndWait('[data-testid="create-campaign-button"]')

    // Should show campaign form
    await expect(page.locator('[data-testid="campaign-form"]')).toBeVisible()

    // Fill campaign details
    const campaign = testCampaigns[0]
    await pageHelpers.fillField('[data-testid="campaign-name"]', campaign.name)
    await pageHelpers.fillField(
      '[data-testid="campaign-message"]',
      campaign.message
    )

    // Select recipients
    await pageHelpers.clickAndWait('[data-testid="recipient-selector"]')

    // Select contacts
    for (const contact of campaign.recipients) {
      const contactCheckbox = page.locator(
        `[data-testid="contact-checkbox"][data-phone="${contact}"]`
      )
      if (
        await pageHelpers.elementExists(
          `[data-testid="contact-checkbox"][data-phone="${contact}"]`
        )
      ) {
        await contactCheckbox.check()
      }
    }

    // Save campaign
    await pageHelpers.clickAndWait('[data-testid="save-campaign-button"]')

    // Should show success message
    await pageHelpers.waitForToast()
    await expect(
      page.locator('[data-testid="toast"], .toast, [role="alert"]')
    ).toContainText(/created|success/i)

    // Should return to campaigns list
    await expect(page.locator('[data-testid="campaigns-list"]')).toBeVisible()
  })

  test('should display campaign list', async ({ page, pageHelpers }) => {
    // Wait for campaigns to load
    await pageHelpers.waitForLoadingToComplete()

    // Should show campaigns list
    await expect(page.locator('[data-testid="campaigns-list"]')).toBeVisible()

    // Should show campaign items
    const campaignItems = page.locator('[data-testid="campaign-item"]')
    await expect(campaignItems.first()).toBeVisible()
  })

  test('should edit existing campaign', async ({ page, pageHelpers }) => {
    // Wait for campaigns to load
    await pageHelpers.waitForLoadingToComplete()

    // Click on first campaign
    const firstCampaign = page.locator('[data-testid="campaign-item"]').first()
    await pageHelpers.clickAndWait(
      '[data-testid="campaign-item"]:first-child [data-testid="edit-button"]'
    )

    // Should show campaign form with existing data
    await expect(page.locator('[data-testid="campaign-form"]')).toBeVisible()

    // Modify campaign name
    const newName = 'Updated Campaign Name'
    await pageHelpers.fillField('[data-testid="campaign-name"]', newName)

    // Save changes
    await pageHelpers.clickAndWait('[data-testid="save-campaign-button"]')

    // Should show success message
    await pageHelpers.waitForToast()
    await expect(
      page.locator('[data-testid="toast"], .toast, [role="alert"]')
    ).toContainText(/updated|success/i)
  })

  test('should schedule campaign', async ({ page, pageHelpers }) => {
    // Create a new campaign first
    await pageHelpers.clickAndWait('[data-testid="create-campaign-button"]')

    const campaign = testCampaigns[1]
    await pageHelpers.fillField('[data-testid="campaign-name"]', campaign.name)
    await pageHelpers.fillField(
      '[data-testid="campaign-message"]',
      campaign.message
    )

    // Set schedule
    await pageHelpers.clickAndWait('[data-testid="schedule-toggle"]')
    await expect(
      page.locator('[data-testid="schedule-datetime"]')
    ).toBeVisible()

    // Set future date
    const futureDate = new Date()
    futureDate.setHours(futureDate.getHours() + 1)
    const dateString = futureDate.toISOString().slice(0, 16)

    await pageHelpers.fillField('[data-testid="schedule-datetime"]', dateString)

    // Save scheduled campaign
    await pageHelpers.clickAndWait('[data-testid="save-campaign-button"]')

    // Should show success message
    await pageHelpers.waitForToast()
    await expect(
      page.locator('[data-testid="toast"], .toast, [role="alert"]')
    ).toContainText(/scheduled|success/i)
  })

  test('should execute campaign immediately', async ({ page, pageHelpers }) => {
    // Wait for campaigns to load
    await pageHelpers.waitForLoadingToComplete()

    // Find a draft campaign
    const draftCampaign = page
      .locator('[data-testid="campaign-item"][data-status="draft"]')
      .first()
    if (
      await pageHelpers.elementExists(
        '[data-testid="campaign-item"][data-status="draft"]'
      )
    ) {
      // Click execute button
      await pageHelpers.clickAndWait(
        '[data-testid="campaign-item"][data-status="draft"] [data-testid="execute-button"]'
      )

      // Confirm execution
      await pageHelpers.clickAndWait('[data-testid="confirm-execute-button"]')

      // Should show success message
      await pageHelpers.waitForToast()
      await expect(
        page.locator('[data-testid="toast"], .toast, [role="alert"]')
      ).toContainText(/started|executing/i)
    }
  })

  test('should display campaign statistics', async ({ page, pageHelpers }) => {
    // Wait for campaigns to load
    await pageHelpers.waitForLoadingToComplete()

    // Click on a campaign to view details
    await pageHelpers.clickAndWait('[data-testid="campaign-item"]:first-child')

    // Should show campaign statistics
    await expect(page.locator('[data-testid="campaign-stats"]')).toBeVisible()

    // Should show metrics
    await expect(page.locator('[data-testid="stat-total"]')).toBeVisible()
    await expect(page.locator('[data-testid="stat-sent"]')).toBeVisible()
    await expect(page.locator('[data-testid="stat-delivered"]')).toBeVisible()
    await expect(page.locator('[data-testid="stat-read"]')).toBeVisible()
    await expect(page.locator('[data-testid="stat-failed"]')).toBeVisible()
  })

  test('should show campaign progress', async ({ page, pageHelpers }) => {
    // Wait for campaigns to load
    await pageHelpers.waitForLoadingToComplete()

    // Find a running campaign
    const runningCampaign = page
      .locator('[data-testid="campaign-item"][data-status="running"]')
      .first()
    if (
      await pageHelpers.elementExists(
        '[data-testid="campaign-item"][data-status="running"]'
      )
    ) {
      // Should show progress bar
      await expect(
        runningCampaign.locator('[data-testid="progress-bar"]')
      ).toBeVisible()

      // Should show progress percentage
      await expect(
        runningCampaign.locator('[data-testid="progress-percentage"]')
      ).toBeVisible()
    }
  })

  test('should handle campaign deletion', async ({ page, pageHelpers }) => {
    // Wait for campaigns to load
    await pageHelpers.waitForLoadingToComplete()

    // Find a draft campaign to delete
    const draftCampaign = page
      .locator('[data-testid="campaign-item"][data-status="draft"]')
      .first()
    if (
      await pageHelpers.elementExists(
        '[data-testid="campaign-item"][data-status="draft"]'
      )
    ) {
      // Click delete button
      await pageHelpers.clickAndWait(
        '[data-testid="campaign-item"][data-status="draft"] [data-testid="delete-button"]'
      )

      // Confirm deletion
      await pageHelpers.clickAndWait('[data-testid="confirm-delete-button"]')

      // Should show success message
      await pageHelpers.waitForToast()
      await expect(
        page.locator('[data-testid="toast"], .toast, [role="alert"]')
      ).toContainText(/deleted|success/i)
    }
  })

  test('should filter campaigns by status', async ({ page, pageHelpers }) => {
    // Should show status filter
    const statusFilter = page.locator('[data-testid="status-filter"]')
    if (await pageHelpers.elementExists('[data-testid="status-filter"]')) {
      await expect(statusFilter).toBeVisible()

      // Filter by draft status
      await pageHelpers.clickAndWait('[data-testid="status-filter"]')
      await pageHelpers.clickAndWait('[data-testid="status-option-draft"]')

      // Should show only draft campaigns
      const campaignItems = page.locator('[data-testid="campaign-item"]')
      const draftCampaigns = page.locator(
        '[data-testid="campaign-item"][data-status="draft"]'
      )

      if (await pageHelpers.elementExists('[data-testid="campaign-item"]')) {
        await expect(draftCampaigns).toHaveCount(await campaignItems.count())
      }
    }
  })

  test('should search campaigns', async ({ page, pageHelpers }) => {
    // Should show search input
    const searchInput = page.locator('[data-testid="campaign-search"]')
    if (await pageHelpers.elementExists('[data-testid="campaign-search"]')) {
      await expect(searchInput).toBeVisible()

      // Search for campaign
      await pageHelpers.fillField('[data-testid="campaign-search"]', 'test')
      await pageHelpers.waitForLoadingToComplete()

      // Should filter results
      const campaignItems = page.locator('[data-testid="campaign-item"]')
      await expect(campaignItems.first()).toBeVisible()
    }
  })

  test('should validate campaign form', async ({ page, pageHelpers }) => {
    // Click create campaign button
    await pageHelpers.clickAndWait('[data-testid="create-campaign-button"]')

    // Try to save without required fields
    await pageHelpers.clickAndWait('[data-testid="save-campaign-button"]')

    // Should show validation errors
    await expect(
      page.locator('[data-testid="campaign-name"]:invalid')
    ).toBeVisible()
    await expect(
      page.locator('[data-testid="campaign-message"]:invalid')
    ).toBeVisible()
  })

  test('should handle campaign errors gracefully', async ({
    page,
    pageHelpers,
  }) => {
    // Create campaign with invalid data
    await pageHelpers.clickAndWait('[data-testid="create-campaign-button"]')

    // Fill with invalid data
    await pageHelpers.fillField('[data-testid="campaign-name"]', '')
    await pageHelpers.fillField('[data-testid="campaign-message"]', '')

    // Intercept network request to simulate error
    await page.route('**/api/campaigns/**', (route) => route.abort())

    // Try to save
    await pageHelpers.clickAndWait('[data-testid="save-campaign-button"]')

    // Should show error message
    await pageHelpers.waitForToast()
    await expect(
      page.locator('[data-testid="toast"], .toast, [role="alert"]')
    ).toContainText(/error|failed/i)
  })

  test('should show campaign templates', async ({ page, pageHelpers }) => {
    // Should show template options
    const templateSelector = page.locator('[data-testid="template-selector"]')
    if (await pageHelpers.elementExists('[data-testid="template-selector"]')) {
      await expect(templateSelector).toBeVisible()

      // Select a template
      await pageHelpers.clickAndWait('[data-testid="template-selector"]')
      await pageHelpers.clickAndWait(
        '[data-testid="template-option"]:first-child'
      )

      // Should populate message field
      const messageField = page.locator('[data-testid="campaign-message"]')
      await expect(messageField).toHaveValue(/.+/)
    }
  })

  test('should handle rate limiting', async ({ page, pageHelpers }) => {
    // Wait for campaigns to load
    await pageHelpers.waitForLoadingToComplete()

    // Check if rate limit status is shown
    const rateLimitStatus = page.locator('[data-testid="rate-limit-status"]')
    if (await pageHelpers.elementExists('[data-testid="rate-limit-status"]')) {
      await expect(rateLimitStatus).toBeVisible()

      // Should show current rate limit status
      await expect(rateLimitStatus).toContainText(/limit|quota|rate/i)
    }
  })
})
