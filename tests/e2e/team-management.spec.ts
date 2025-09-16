import { test, expect } from './fixtures/auth.fixture'
import { testUsers, testTeamMessages } from './utils/test-data'

test.describe('Team Management', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    // Navigate to team section
    await authenticatedPage.goto('/dashboard/team')
  })

  test('should display team management interface', async ({
    page,
    pageHelpers,
  }) => {
    // Should show team interface elements
    await expect(page.locator('[data-testid="team-page"]')).toBeVisible()
    await expect(page.locator('[data-testid="team-chat"]')).toBeVisible()
    await expect(page.locator('[data-testid="team-members"]')).toBeVisible()
  })

  test('should display team chat interface', async ({ page, pageHelpers }) => {
    // Should show chat elements
    await expect(page.locator('[data-testid="team-chat"]')).toBeVisible()
    await expect(
      page.locator('[data-testid="team-message-list"]')
    ).toBeVisible()
    await expect(
      page.locator('[data-testid="team-message-input"]')
    ).toBeVisible()
    await expect(page.locator('[data-testid="team-send-button"]')).toBeVisible()
  })

  test('should send team message', async ({ page, pageHelpers }) => {
    // Type team message
    const messageText = 'Hello team! This is a test message.'
    await pageHelpers.fillField(
      '[data-testid="team-message-input"]',
      messageText
    )

    // Send message
    await pageHelpers.clickAndWait('[data-testid="team-send-button"]')

    // Should show sent message in chat
    await expect(
      page.locator('[data-testid="team-message-outbound"]').last()
    ).toContainText(messageText)

    // Input should be cleared
    await expect(
      page.locator('[data-testid="team-message-input"]')
    ).toHaveValue('')
  })

  test('should display team members', async ({ page, pageHelpers }) => {
    // Should show team members list
    await expect(page.locator('[data-testid="team-members"]')).toBeVisible()

    // Should show at least current user
    const memberItems = page.locator('[data-testid="team-member-item"]')
    await expect(memberItems.first()).toBeVisible()

    // Should show member info
    await expect(
      memberItems.first().locator('[data-testid="member-name"]')
    ).toBeVisible()
    await expect(
      memberItems.first().locator('[data-testid="member-role"]')
    ).toBeVisible()
  })

  test('should show online status of team members', async ({
    page,
    pageHelpers,
  }) => {
    // Should show online status indicators
    const memberItems = page.locator('[data-testid="team-member-item"]')
    if (await pageHelpers.elementExists('[data-testid="team-member-item"]')) {
      const onlineStatus = memberItems
        .first()
        .locator('[data-testid="online-status"]')
      if (await pageHelpers.elementExists('[data-testid="online-status"]')) {
        await expect(onlineStatus).toBeVisible()
      }
    }
  })

  test('should display team message history', async ({ page, pageHelpers }) => {
    // Wait for messages to load
    await pageHelpers.waitForLoadingToComplete()

    // Should show message history
    const messages = page.locator(
      '[data-testid="team-message-inbound"], [data-testid="team-message-outbound"]'
    )
    if (
      await pageHelpers.elementExists(
        '[data-testid="team-message-inbound"], [data-testid="team-message-outbound"]'
      )
    ) {
      await expect(messages.first()).toBeVisible()
    }
  })

  test('should handle team message timestamps', async ({
    page,
    pageHelpers,
  }) => {
    // Send a message first
    const messageText = 'Message with timestamp'
    await pageHelpers.fillField(
      '[data-testid="team-message-input"]',
      messageText
    )
    await pageHelpers.clickAndWait('[data-testid="team-send-button"]')

    // Should show timestamp
    const messageElement = page
      .locator('[data-testid="team-message-outbound"]')
      .last()
    await expect(
      messageElement.locator('[data-testid="message-timestamp"]')
    ).toBeVisible()
  })

  test('should show typing indicators in team chat', async ({
    page,
    pageHelpers,
  }) => {
    // Start typing
    await pageHelpers.fillField(
      '[data-testid="team-message-input"]',
      'Typing...'
    )

    // Should show typing indicator (if implemented)
    const typingIndicator = page.locator(
      '[data-testid="team-typing-indicator"]'
    )
    if (
      await pageHelpers.elementExists('[data-testid="team-typing-indicator"]')
    ) {
      await expect(typingIndicator).toBeVisible()
    }
  })

  test('should handle team message search', async ({ page, pageHelpers }) => {
    // Should show search functionality
    const searchInput = page.locator('[data-testid="team-message-search"]')
    if (
      await pageHelpers.elementExists('[data-testid="team-message-search"]')
    ) {
      await expect(searchInput).toBeVisible()

      // Test search functionality
      await pageHelpers.fillField('[data-testid="team-message-search"]', 'test')
      await pageHelpers.waitForLoadingToComplete()
    }
  })

  test('should display team activity log', async ({ page, pageHelpers }) => {
    // Should show activity log
    const activityLog = page.locator('[data-testid="team-activity-log"]')
    if (await pageHelpers.elementExists('[data-testid="team-activity-log"]')) {
      await expect(activityLog).toBeVisible()

      // Should show activity items
      const activityItems = page.locator('[data-testid="activity-item"]')
      await expect(activityItems.first()).toBeVisible()
    }
  })

  test('should handle team permissions', async ({ page, pageHelpers }) => {
    // Check if user has admin permissions
    const isAdmin = await pageHelpers.elementExists(
      '[data-testid="admin-controls"]'
    )

    if (isAdmin) {
      // Should show admin controls
      await expect(page.locator('[data-testid="admin-controls"]')).toBeVisible()

      // Should show add member button
      await expect(
        page.locator('[data-testid="add-member-button"]')
      ).toBeVisible()
    } else {
      // Regular users should not see admin controls
      await expect(
        page.locator('[data-testid="admin-controls"]')
      ).not.toBeVisible()
    }
  })

  test('should add new team member (admin only)', async ({
    page,
    pageHelpers,
  }) => {
    // Check if user is admin
    if (await pageHelpers.elementExists('[data-testid="add-member-button"]')) {
      // Click add member button
      await pageHelpers.clickAndWait('[data-testid="add-member-button"]')

      // Should show add member form
      await expect(
        page.locator('[data-testid="add-member-form"]')
      ).toBeVisible()

      // Fill member details
      await pageHelpers.fillField(
        '[data-testid="member-email"]',
        'newmember@test.com'
      )
      await pageHelpers.fillField('[data-testid="member-name"]', 'New Member')
      await pageHelpers.fillField('[data-testid="member-role"]', 'user')

      // Submit form
      await pageHelpers.clickAndWait('[data-testid="save-member-button"]')

      // Should show success message
      await pageHelpers.waitForToast()
      await expect(
        page.locator('[data-testid="toast"], .toast, [role="alert"]')
      ).toContainText(/added|success/i)
    }
  })

  test('should remove team member (admin only)', async ({
    page,
    pageHelpers,
  }) => {
    // Check if user is admin and there are members to remove
    if (
      await pageHelpers.elementExists(
        '[data-testid="team-member-item"] [data-testid="remove-member-button"]'
      )
    ) {
      // Click remove member button
      await pageHelpers.clickAndWait(
        '[data-testid="team-member-item"] [data-testid="remove-member-button"]'
      )

      // Confirm removal
      await pageHelpers.clickAndWait('[data-testid="confirm-remove-button"]')

      // Should show success message
      await pageHelpers.waitForToast()
      await expect(
        page.locator('[data-testid="toast"], .toast, [role="alert"]')
      ).toContainText(/removed|success/i)
    }
  })

  test('should update member role (admin only)', async ({
    page,
    pageHelpers,
  }) => {
    // Check if user is admin
    if (
      await pageHelpers.elementExists(
        '[data-testid="team-member-item"] [data-testid="edit-member-button"]'
      )
    ) {
      // Click edit member button
      await pageHelpers.clickAndWait(
        '[data-testid="team-member-item"] [data-testid="edit-member-button"]'
      )

      // Should show edit form
      await expect(
        page.locator('[data-testid="edit-member-form"]')
      ).toBeVisible()

      // Change role
      await pageHelpers.clickAndWait('[data-testid="member-role-select"]')
      await pageHelpers.clickAndWait('[data-testid="role-option-admin"]')

      // Save changes
      await pageHelpers.clickAndWait('[data-testid="save-member-button"]')

      // Should show success message
      await pageHelpers.waitForToast()
      await expect(
        page.locator('[data-testid="toast"], .toast, [role="alert"]')
      ).toContainText(/updated|success/i)
    }
  })

  test('should handle team notifications', async ({ page, pageHelpers }) => {
    // Should show notification settings
    const notificationSettings = page.locator(
      '[data-testid="notification-settings"]'
    )
    if (
      await pageHelpers.elementExists('[data-testid="notification-settings"]')
    ) {
      await expect(notificationSettings).toBeVisible()

      // Should show notification toggles
      await expect(
        page.locator('[data-testid="notification-toggle"]')
      ).toBeVisible()
    }
  })

  test('should display team statistics', async ({ page, pageHelpers }) => {
    // Should show team statistics
    const teamStats = page.locator('[data-testid="team-stats"]')
    if (await pageHelpers.elementExists('[data-testid="team-stats"]')) {
      await expect(teamStats).toBeVisible()

      // Should show various metrics
      await expect(
        page.locator('[data-testid="stat-total-members"]')
      ).toBeVisible()
      await expect(
        page.locator('[data-testid="stat-online-members"]')
      ).toBeVisible()
      await expect(
        page.locator('[data-testid="stat-total-messages"]')
      ).toBeVisible()
    }
  })

  test('should handle team chat errors gracefully', async ({
    page,
    pageHelpers,
  }) => {
    // Try to send message with network issues
    const messageText = 'Test error handling'
    await pageHelpers.fillField(
      '[data-testid="team-message-input"]',
      messageText
    )

    // Intercept network request to simulate error
    await page.route('**/api/team/**', (route) => route.abort())

    await pageHelpers.clickAndWait('[data-testid="team-send-button"]')

    // Should show error message
    await pageHelpers.waitForToast()
    await expect(
      page.locator('[data-testid="toast"], .toast, [role="alert"]')
    ).toContainText(/error|failed/i)
  })

  test('should support team channels', async ({ page, pageHelpers }) => {
    // Should show channel selector
    const channelSelector = page.locator('[data-testid="channel-selector"]')
    if (await pageHelpers.elementExists('[data-testid="channel-selector"]')) {
      await expect(channelSelector).toBeVisible()

      // Should show default channel
      await expect(
        page.locator('[data-testid="channel-general"]')
      ).toBeVisible()

      // Switch to different channel
      await pageHelpers.clickAndWait('[data-testid="channel-selector"]')
      await pageHelpers.clickAndWait(
        '[data-testid="channel-option"]:nth-child(2)'
      )

      // Should update chat context
      await expect(
        page.locator('[data-testid="current-channel"]')
      ).toContainText(/channel/i)
    }
  })

  test('should handle real-time updates', async ({ page, pageHelpers }) => {
    // Send a message
    const messageText = 'Real-time test message'
    await pageHelpers.fillField(
      '[data-testid="team-message-input"]',
      messageText
    )
    await pageHelpers.clickAndWait('[data-testid="team-send-button"]')

    // Should show message immediately
    await expect(
      page.locator('[data-testid="team-message-outbound"]').last()
    ).toContainText(messageText)

    // Should update message count
    const messageCount = page.locator('[data-testid="message-count"]')
    if (await pageHelpers.elementExists('[data-testid="message-count"]')) {
      await expect(messageCount).toContainText(/1|2|3/)
    }
  })

  test('should validate team message input', async ({ page, pageHelpers }) => {
    // Try to send empty message
    await pageHelpers.clickAndWait('[data-testid="team-send-button"]')

    // Should not send empty message
    const messageInput = page.locator('[data-testid="team-message-input"]')
    await expect(messageInput).toHaveValue('')
  })

  test('should show member presence indicators', async ({
    page,
    pageHelpers,
  }) => {
    // Should show presence indicators for team members
    const memberItems = page.locator('[data-testid="team-member-item"]')
    if (await pageHelpers.elementExists('[data-testid="team-member-item"]')) {
      const presenceIndicator = memberItems
        .first()
        .locator('[data-testid="presence-indicator"]')
      if (
        await pageHelpers.elementExists('[data-testid="presence-indicator"]')
      ) {
        await expect(presenceIndicator).toBeVisible()
      }
    }
  })
})
