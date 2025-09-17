import logger from '@/lib/logging/logger'

export interface BusinessMetric {
  name: string
  value: number
  timestamp: Date
  userId?: string
  teamId?: string
  campaignId?: string
  tags?: Record<string, string>
  [key: string]: unknown
}

class BusinessMetrics {
  private metrics: BusinessMetric[] = []
  private readonly maxMetrics = 5000

  recordMetric(metric: BusinessMetric) {
    this.metrics.push(metric)

    // Keep only the latest metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }

    // Log important business metrics
    logger.info('Business Metric', metric)
  }

  // User metrics
  recordUserRegistration(userId: string, teamId?: string) {
    this.recordMetric({
      name: 'user.registration',
      value: 1,
      timestamp: new Date(),
      userId,
      teamId,
    })
  }

  recordUserLogin(userId: string, teamId?: string) {
    this.recordMetric({
      name: 'user.login',
      value: 1,
      timestamp: new Date(),
      userId,
      teamId,
    })
  }

  recordUserActivity(userId: string, activity: string, teamId?: string) {
    this.recordMetric({
      name: `user.activity.${activity}`,
      value: 1,
      timestamp: new Date(),
      userId,
      teamId,
    })
  }

  // Campaign metrics
  recordCampaignCreated(campaignId: string, userId: string, teamId?: string) {
    this.recordMetric({
      name: 'campaign.created',
      value: 1,
      timestamp: new Date(),
      campaignId,
      userId,
      teamId,
    })
  }

  recordCampaignStarted(campaignId: string, userId: string, teamId?: string) {
    this.recordMetric({
      name: 'campaign.started',
      value: 1,
      timestamp: new Date(),
      campaignId,
      userId,
      teamId,
    })
  }

  recordCampaignCompleted(campaignId: string, userId: string, teamId?: string) {
    this.recordMetric({
      name: 'campaign.completed',
      value: 1,
      timestamp: new Date(),
      campaignId,
      userId,
      teamId,
    })
  }

  recordMessageSent(campaignId: string, userId: string, teamId?: string) {
    this.recordMetric({
      name: 'message.sent',
      value: 1,
      timestamp: new Date(),
      campaignId,
      userId,
      teamId,
    })
  }

  recordMessageDelivered(campaignId: string, userId: string, teamId?: string) {
    this.recordMetric({
      name: 'message.delivered',
      value: 1,
      timestamp: new Date(),
      campaignId,
      userId,
      teamId,
    })
  }

  recordMessageFailed(campaignId: string, userId: string, teamId?: string, reason?: string) {
    this.recordMetric({
      name: 'message.failed',
      value: 1,
      timestamp: new Date(),
      campaignId,
      userId,
      teamId,
      tags: reason ? { reason } : undefined,
    })
  }

  // Contact metrics
  recordContactCreated(contactId: string, userId: string, teamId?: string) {
    this.recordMetric({
      name: 'contact.created',
      value: 1,
      timestamp: new Date(),
      userId,
      teamId,
      tags: { contactId },
    })
  }

  recordContactImported(count: number, userId: string, teamId?: string) {
    this.recordMetric({
      name: 'contact.imported',
      value: count,
      timestamp: new Date(),
      userId,
      teamId,
    })
  }

  recordContactExported(count: number, userId: string, teamId?: string) {
    this.recordMetric({
      name: 'contact.exported',
      value: count,
      timestamp: new Date(),
      userId,
      teamId,
    })
  }

  // Team metrics
  recordTeamCreated(teamId: string, userId: string) {
    this.recordMetric({
      name: 'team.created',
      value: 1,
      timestamp: new Date(),
      teamId,
      userId,
    })
  }

  recordTeamMemberAdded(teamId: string, userId: string, memberId: string) {
    this.recordMetric({
      name: 'team.member.added',
      value: 1,
      timestamp: new Date(),
      teamId,
      userId,
      tags: { memberId },
    })
  }

  recordTeamMessageSent(teamId: string, userId: string) {
    this.recordMetric({
      name: 'team.message.sent',
      value: 1,
      timestamp: new Date(),
      teamId,
      userId,
    })
  }

  // Revenue metrics (if applicable)
  recordSubscriptionCreated(userId: string, plan: string, amount: number) {
    this.recordMetric({
      name: 'subscription.created',
      value: amount,
      timestamp: new Date(),
      userId,
      tags: { plan },
    })
  }

  recordSubscriptionRenewed(userId: string, plan: string, amount: number) {
    this.recordMetric({
      name: 'subscription.renewed',
      value: amount,
      timestamp: new Date(),
      userId,
      tags: { plan },
    })
  }

  // Get metrics with filters
  getMetrics(filters: {
    name?: string
    userId?: string
    teamId?: string
    campaignId?: string
    startDate?: Date
    endDate?: Date
  }): BusinessMetric[] {
    return this.metrics.filter((metric) => {
      if (filters.name && metric.name !== filters.name) return false
      if (filters.userId && metric.userId !== filters.userId) return false
      if (filters.teamId && metric.teamId !== filters.teamId) return false
      if (filters.campaignId && metric.campaignId !== filters.campaignId) return false
      if (filters.startDate && metric.timestamp < filters.startDate) return false
      if (filters.endDate && metric.timestamp > filters.endDate) return false
      return true
    })
  }

  // Get aggregated metrics
  getAggregatedMetrics(
    name: string,
    groupBy: 'day' | 'hour' | 'minute' = 'day',
    startDate?: Date,
    endDate?: Date
  ): Record<string, number> {
    const metrics = this.getMetrics({ name, startDate, endDate })
    const grouped: Record<string, number> = {}

    metrics.forEach((metric) => {
      const date = new Date(metric.timestamp)
      let key: string

      switch (groupBy) {
        case 'day':
          key = date.toISOString().split('T')[0]
          break
        case 'hour':
          key = date.toISOString().substring(0, 13)
          break
        case 'minute':
          key = date.toISOString().substring(0, 16)
          break
        default:
          key = date.toISOString().split('T')[0]
      }

      grouped[key] = (grouped[key] || 0) + metric.value
    })

    return grouped
  }

  // Get dashboard data
  getDashboardData(teamId?: string, userId?: string) {
    const filters = { teamId, userId }
    const now = new Date()
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    return {
      // Last 24 hours
      messagesSent24h: this.getMetrics({ ...filters, name: 'message.sent', startDate: last24h })
        .reduce((sum, m) => sum + m.value, 0),
      
      campaignsStarted24h: this.getMetrics({ ...filters, name: 'campaign.started', startDate: last24h })
        .reduce((sum, m) => sum + m.value, 0),
      
      // Last 7 days
      messagesSent7d: this.getMetrics({ ...filters, name: 'message.sent', startDate: last7d })
        .reduce((sum, m) => sum + m.value, 0),
      
      campaignsCreated7d: this.getMetrics({ ...filters, name: 'campaign.created', startDate: last7d })
        .reduce((sum, m) => sum + m.value, 0),
      
      // All time
      totalMessages: this.getMetrics({ ...filters, name: 'message.sent' })
        .reduce((sum, m) => sum + m.value, 0),
      
      totalCampaigns: this.getMetrics({ ...filters, name: 'campaign.created' })
        .reduce((sum, m) => sum + m.value, 0),
      
      totalContacts: this.getMetrics({ ...filters, name: 'contact.created' })
        .reduce((sum, m) => sum + m.value, 0),
    }
  }

  clear() {
    this.metrics = []
  }
}

export const businessMetrics = new BusinessMetrics()
