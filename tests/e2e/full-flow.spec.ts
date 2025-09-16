import { test, expect } from './fixtures/auth.fixture'
import { testContacts, testCampaigns, testUsers } from './utils/test-data'

test.describe('Full Application Flow', () => {
  test('should complete full user journey from login to campaign execution', async ({
    page,
    authHelper,
    pageHelpers,
  }) => {
    // 1. Login
    await authHelper.login('user')
    await expect(page).toHaveURL(/.*dashboard/)

    // 2. Navigate to contacts and add a contact
    await pageHelpers.navigateViaSidebar('Contatos')
    await pageHelpers.clickAndWait('[data-testid="add-contact-button"]')

    const contact = testContacts[0]
    await pageHelpers.fillField('[data-testid="contact-name"]', contact.name)
    await pageHelpers.fillField('[data-testid="contact-phone"]', contact.phone)
    await pageHelpers.fillField('[data-testid="contact-email"]', contact.email)

    await pageHelpers.clickAndWait('[data-testid="save-contact-button"]')
    await pageHelpers.waitForToast()

    // 3. Navigate to WhatsApp chat and send a message
    await pageHelpers.navigateViaSidebar('Chat WhatsApp')
    await pageHelpers.waitForLoadingToComplete()

    // Select the contact we just created
    await pageHelpers.clickAndWait('[data-testid="contact-item"]:first-child')

    const chatMessage = 'Hello from the test!'
    await pageHelpers.fillField('[data-testid="message-input"]', chatMessage)
    await pageHelpers.clickAndWait('[data-testid="send-button"]')

    // Verify message was sent
    await expect(
      page.locator('[data-testid="message-outbound"]').last()
    ).toContainText(chatMessage)

    // 4. Navigate to campaigns and create a campaign
    await pageHelpers.navigateViaSidebar('Campanhas')
    await pageHelpers.clickAndWait('[data-testid="create-campaign-button"]')

    const campaign = testCampaigns[0]
    await pageHelpers.fillField('[data-testid="campaign-name"]', campaign.name)
    await pageHelpers.fillField(
      '[data-testid="campaign-message"]',
      campaign.message
    )

    // Select recipients
    await pageHelpers.clickAndWait('[data-testid="recipient-selector"]')
    const contactCheckbox = page.locator(
      `[data-testid="contact-checkbox"][data-phone="${contact.phone}"]`
    )
    if (
      await pageHelpers.elementExists(
        `[data-testid="contact-checkbox"][data-phone="${contact.phone}"]`
      )
    ) {
      await contactCheckbox.check()
    }

    await pageHelpers.clickAndWait('[data-testid="save-campaign-button"]')
    await pageHelpers.waitForToast()

    // 5. Navigate to team chat and send a team message
    await pageHelpers.navigateViaSidebar('Equipe')
    await pageHelpers.waitForLoadingToComplete()

    const teamMessage = 'Team message from E2E test'
    await pageHelpers.fillField(
      '[data-testid="team-message-input"]',
      teamMessage
    )
    await pageHelpers.clickAndWait('[data-testid="team-send-button"]')

    // Verify team message was sent
    await expect(
      page.locator('[data-testid="team-message-outbound"]').last()
    ).toContainText(teamMessage)

    // 6. Navigate to settings and configure Z-API
    await pageHelpers.navigateViaSidebar('Configurações')
    await pageHelpers.waitForLoadingToComplete()

    // Check if Z-API configuration is available
    if (await pageHelpers.elementExists('[data-testid="z-api-config"]')) {
      await pageHelpers.clickAndWait('[data-testid="z-api-config"]')

      await pageHelpers.fillField('[data-testid="api-key"]', 'test-api-key')
      await pageHelpers.fillField(
        '[data-testid="instance-id"]',
        'test-instance'
      )

      await pageHelpers.clickAndWait('[data-testid="test-connection-button"]')
      await pageHelpers.waitForToast()
    }

    // 7. Logout
    await authHelper.logout()
    await expect(page).toHaveURL(/.*login/)
  })

  test('should handle multiple user sessions', async ({ browser }) => {
    // Create two browser contexts for different users
    const context1 = await browser.newContext()
    const context2 = await browser.newContext()

    const page1 = await context1.newPage()
    const page2 = await context2.newPage()

    const { AuthHelper } = await import('./utils/auth-helper')
    const authHelper1 = new AuthHelper(page1)
    const authHelper2 = new AuthHelper(page2)

    // Login with different users
    await authHelper1.login('user')
    await authHelper2.login('admin')

    // Verify both users are logged in
    await expect(page1.locator('[data-testid="user-menu"]')).toBeVisible()
    await expect(page2.locator('[data-testid="user-menu"]')).toBeVisible()

    // Send team message from user 1
    await page1.goto('/dashboard/team')
    await page1.fill(
      '[data-testid="team-message-input"]',
      'Message from user 1'
    )
    await page1.click('[data-testid="team-send-button"]')

    // Check if message appears for user 2 (real-time sync)
    await page2.goto('/dashboard/team')
    await page2.waitForSelector('[data-testid="team-message-inbound"]', {
      timeout: 10000,
    })
    await expect(
      page2.locator('[data-testid="team-message-inbound"]').last()
    ).toContainText('Message from user 1')

    await context1.close()
    await context2.close()
  })

  test('should handle network interruptions gracefully', async ({
    page,
    authHelper,
    pageHelpers,
  }) => {
    // Login first
    await authHelper.login('user')

    // Navigate to WhatsApp chat
    await pageHelpers.navigateViaSidebar('Chat WhatsApp')
    await pageHelpers.waitForLoadingToComplete()

    // Simulate network interruption
    await page.context().setOffline(true)

    // Try to send a message
    await pageHelpers.clickAndWait('[data-testid="contact-item"]:first-child')
    await pageHelpers.fillField(
      '[data-testid="message-input"]',
      'Message during network issue'
    )
    await pageHelpers.clickAndWait('[data-testid="send-button"]')

    // Should show error message
    await pageHelpers.waitForToast()
    await expect(
      page.locator('[data-testid="toast"], .toast, [role="alert"]')
    ).toContainText(/error|offline|network/i)

    // Restore network
    await page.context().setOffline(false)

    // Should show reconnection message
    await pageHelpers.waitForToast()
    await expect(
      page.locator('[data-testid="toast"], .toast, [role="alert"]')
    ).toContainText(/connected|online/i)
  })

  test('should maintain state across page refreshes', async ({
    page,
    authHelper,
    pageHelpers,
  }) => {
    // Login and navigate to a specific page
    await authHelper.login('user')
    await pageHelpers.navigateViaSidebar('Campanhas')

    // Create a campaign
    await pageHelpers.clickAndWait('[data-testid="create-campaign-button"]')
    await pageHelpers.fillField(
      '[data-testid="campaign-name"]',
      'Persistent Campaign'
    )
    await pageHelpers.fillField(
      '[data-testid="campaign-message"]',
      'This campaign should persist'
    )
    await pageHelpers.clickAndWait('[data-testid="save-campaign-button"]')
    await pageHelpers.waitForToast()

    // Refresh the page
    await page.reload()
    await pageHelpers.waitForLoadingToComplete()

    // Campaign should still be there
    await expect(page.locator('[data-testid="campaign-item"]')).toContainText(
      'Persistent Campaign'
    )

    // User should still be authenticated
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
  })

  test('should handle concurrent operations', async ({
    page,
    authHelper,
    pageHelpers,
  }) => {
    // Login
    await authHelper.login('user')

    // Open multiple tabs
    const page2 = await page.context().newPage()
    await page2.goto('/dashboard')

    // Perform operations on both tabs simultaneously
    const operations = [
      // Tab 1: Create contact
      async () => {
        await pageHelpers.navigateViaSidebar('Contatos')
        await pageHelpers.clickAndWait('[data-testid="add-contact-button"]')
        await pageHelpers.fillField(
          '[data-testid="contact-name"]',
          'Concurrent Contact 1'
        )
        await pageHelpers.fillField(
          '[data-testid="contact-phone"]',
          '+5511111111111'
        )
        await pageHelpers.clickAndWait('[data-testid="save-contact-button"]')
      },

      // Tab 2: Send team message
      async () => {
        await page2.goto('/dashboard/team')
        await page2.fill(
          '[data-testid="team-message-input"]',
          'Concurrent team message'
        )
        await page2.click('[data-testid="team-send-button"]')
      },
    ]

    // Execute operations concurrently
    await Promise.all(operations.map((op) => op()))

    // Both operations should complete successfully
    await pageHelpers.waitForToast()
    await expect(
      page2.locator('[data-testid="team-message-outbound"]').last()
    ).toContainText('Concurrent team message')

    await page2.close()
  })
})
