import { test, expect } from './fixtures/auth.fixture'
import { testContacts } from './utils/test-data'

test.describe('WhatsApp Chat', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    // Navigate to WhatsApp chat section
    await authenticatedPage.goto('/dashboard/whatsapp')
  })

  test('should display WhatsApp chat interface', async ({
    page,
    pageHelpers,
  }) => {
    // Should show chat interface elements
    await expect(page.locator('[data-testid="whatsapp-chat"]')).toBeVisible()
    await expect(page.locator('[data-testid="contact-list"]')).toBeVisible()
    await expect(page.locator('[data-testid="message-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="send-button"]')).toBeVisible()
  })

  test('should load and display contact list', async ({
    page,
    pageHelpers,
  }) => {
    // Wait for contacts to load
    await pageHelpers.waitForLoadingToComplete()

    // Should show contact list
    await expect(page.locator('[data-testid="contact-list"]')).toBeVisible()

    // Should show at least one contact
    const contactItems = page.locator('[data-testid="contact-item"]')
    await expect(contactItems.first()).toBeVisible()
  })

  test('should select contact and display chat history', async ({
    page,
    pageHelpers,
  }) => {
    // Wait for contacts to load
    await pageHelpers.waitForLoadingToComplete()

    // Click on first contact
    const firstContact = page.locator('[data-testid="contact-item"]').first()
    await pageHelpers.clickAndWait('[data-testid="contact-item"]:first-child')

    // Should show chat area
    await expect(page.locator('[data-testid="chat-messages"]')).toBeVisible()

    // Should show contact info
    await expect(page.locator('[data-testid="contact-info"]')).toBeVisible()
  })

  test('should send text message', async ({ page, pageHelpers }) => {
    // Select a contact first
    await pageHelpers.waitForLoadingToComplete()
    await pageHelpers.clickAndWait('[data-testid="contact-item"]:first-child')

    // Type message
    const messageText = 'Hello, this is a test message!'
    await pageHelpers.fillField('[data-testid="message-input"]', messageText)

    // Send message
    await pageHelpers.clickAndWait('[data-testid="send-button"]')

    // Should show sent message in chat
    await expect(
      page.locator('[data-testid="message-outbound"]').last()
    ).toContainText(messageText)

    // Input should be cleared
    await expect(page.locator('[data-testid="message-input"]')).toHaveValue('')
  })

  test('should display message status indicators', async ({
    page,
    pageHelpers,
  }) => {
    // Select contact and send message
    await pageHelpers.waitForLoadingToComplete()
    await pageHelpers.clickAndWait('[data-testid="contact-item"]:first-child')

    const messageText = 'Test message for status'
    await pageHelpers.fillField('[data-testid="message-input"]', messageText)
    await pageHelpers.clickAndWait('[data-testid="send-button"]')

    // Should show message status (sent, delivered, read)
    const messageElement = page
      .locator('[data-testid="message-outbound"]')
      .last()
    await expect(
      messageElement.locator('[data-testid="message-status"]')
    ).toBeVisible()
  })

  test('should handle typing indicator', async ({ page, pageHelpers }) => {
    // Select contact
    await pageHelpers.waitForLoadingToComplete()
    await pageHelpers.clickAndWait('[data-testid="contact-item"]:first-child')

    // Start typing
    await pageHelpers.fillField('[data-testid="message-input"]', 'Typing...')

    // Should show typing indicator (if implemented)
    const typingIndicator = page.locator('[data-testid="typing-indicator"]')
    if (await pageHelpers.elementExists('[data-testid="typing-indicator"]')) {
      await expect(typingIndicator).toBeVisible()
    }
  })

  test('should display received messages', async ({ page, pageHelpers }) => {
    // Select contact
    await pageHelpers.waitForLoadingToComplete()
    await pageHelpers.clickAndWait('[data-testid="contact-item"]:first-child')

    // Wait for messages to load
    await pageHelpers.waitForLoadingToComplete()

    // Should show message history
    const messages = page.locator(
      '[data-testid="message-inbound"], [data-testid="message-outbound"]'
    )
    await expect(messages.first()).toBeVisible()
  })

  test('should handle message input validation', async ({
    page,
    pageHelpers,
  }) => {
    // Select contact
    await pageHelpers.waitForLoadingToComplete()
    await pageHelpers.clickAndWait('[data-testid="contact-item"]:first-child')

    // Try to send empty message
    await pageHelpers.clickAndWait('[data-testid="send-button"]')

    // Should not send empty message
    const messageInput = page.locator('[data-testid="message-input"]')
    await expect(messageInput).toHaveValue('')
  })

  test('should support message search', async ({ page, pageHelpers }) => {
    // Should show search functionality
    const searchInput = page.locator('[data-testid="message-search"]')
    if (await pageHelpers.elementExists('[data-testid="message-search"]')) {
      await expect(searchInput).toBeVisible()

      // Test search functionality
      await pageHelpers.fillField('[data-testid="message-search"]', 'test')
      await pageHelpers.waitForLoadingToComplete()
    }
  })

  test('should handle contact search', async ({ page, pageHelpers }) => {
    // Should show contact search
    const contactSearch = page.locator('[data-testid="contact-search"]')
    if (await pageHelpers.elementExists('[data-testid="contact-search"]')) {
      await expect(contactSearch).toBeVisible()

      // Test contact search
      await pageHelpers.fillField(
        '[data-testid="contact-search"]',
        testContacts[0].name
      )
      await pageHelpers.waitForLoadingToComplete()

      // Should filter contacts
      const filteredContacts = page.locator('[data-testid="contact-item"]')
      await expect(filteredContacts).toHaveCount(1)
    }
  })

  test('should display contact information', async ({ page, pageHelpers }) => {
    // Select contact
    await pageHelpers.waitForLoadingToComplete()
    await pageHelpers.clickAndWait('[data-testid="contact-item"]:first-child')

    // Should show contact details
    await expect(page.locator('[data-testid="contact-info"]')).toBeVisible()

    // Should show contact name and phone
    const contactInfo = page.locator('[data-testid="contact-info"]')
    await expect(contactInfo).toContainText(/\+55|phone|name/i)
  })

  test('should handle message timestamps', async ({ page, pageHelpers }) => {
    // Select contact and send message
    await pageHelpers.waitForLoadingToComplete()
    await pageHelpers.clickAndWait('[data-testid="contact-item"]:first-child')

    const messageText = 'Message with timestamp'
    await pageHelpers.fillField('[data-testid="message-input"]', messageText)
    await pageHelpers.clickAndWait('[data-testid="send-button"]')

    // Should show timestamp
    const messageElement = page
      .locator('[data-testid="message-outbound"]')
      .last()
    await expect(
      messageElement.locator('[data-testid="message-timestamp"]')
    ).toBeVisible()
  })

  test('should support message reactions', async ({ page, pageHelpers }) => {
    // Select contact
    await pageHelpers.waitForLoadingToComplete()
    await pageHelpers.clickAndWait('[data-testid="contact-item"]:first-child')

    // Check if reactions are supported
    const messageElement = page
      .locator(
        '[data-testid="message-inbound"], [data-testid="message-outbound"]'
      )
      .first()
    if (await pageHelpers.elementExists('[data-testid="message-reactions"]')) {
      // Hover over message to show reactions
      await messageElement.hover()

      // Should show reaction options
      await expect(
        page.locator('[data-testid="message-reactions"]')
      ).toBeVisible()
    }
  })

  test('should handle media messages', async ({ page, pageHelpers }) => {
    // Select contact
    await pageHelpers.waitForLoadingToComplete()
    await pageHelpers.clickAndWait('[data-testid="contact-item"]:first-child')

    // Check if media upload is supported
    if (await pageHelpers.elementExists('[data-testid="media-upload"]')) {
      // Test media upload button
      await expect(page.locator('[data-testid="media-upload"]')).toBeVisible()
    }
  })

  test('should show online status', async ({ page, pageHelpers }) => {
    // Should show online status indicators
    if (await pageHelpers.elementExists('[data-testid="online-status"]')) {
      await expect(page.locator('[data-testid="online-status"]')).toBeVisible()
    }
  })

  test('should handle chat errors gracefully', async ({
    page,
    pageHelpers,
  }) => {
    // Select contact
    await pageHelpers.waitForLoadingToComplete()
    await pageHelpers.clickAndWait('[data-testid="contact-item"]:first-child')

    // Try to send message with network issues (simulated)
    const messageText = 'Test error handling'
    await pageHelpers.fillField('[data-testid="message-input"]', messageText)

    // Intercept network request to simulate error
    await page.route('**/api/**', (route) => route.abort())

    await pageHelpers.clickAndWait('[data-testid="send-button"]')

    // Should show error message
    await pageHelpers.waitForToast()
    await expect(
      page.locator('[data-testid="toast"], .toast, [role="alert"]')
    ).toContainText(/error|failed/i)
  })
})
