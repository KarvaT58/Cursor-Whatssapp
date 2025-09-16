import logger from './logger'

export interface AuditLogData {
  userId: string
  teamId?: string
  action: string
  resource: string
  resourceId?: string
  details?: Record<string, unknown>
  ip?: string
  userAgent?: string
  timestamp?: Date
}

export class AuditLogger {
  static log(data: AuditLogData) {
    const auditData = {
      ...data,
      timestamp: data.timestamp || new Date(),
      type: 'audit',
    }

    logger.info('Audit Log', auditData)
  }

  static logUserAction(
    userId: string,
    action: string,
    resource: string,
    details?: Record<string, unknown>
  ) {
    this.log({
      userId,
      action,
      resource,
      details,
    })
  }

  static logTeamAction(
    userId: string,
    teamId: string,
    action: string,
    resource: string,
    details?: Record<string, unknown>
  ) {
    this.log({
      userId,
      teamId,
      action,
      resource,
      details,
    })
  }

  static logSecurityEvent(
    userId: string,
    action: string,
    details?: Record<string, unknown>
  ) {
    this.log({
      userId,
      action,
      resource: 'security',
      details,
    })
  }

  static logDataAccess(
    userId: string,
    action: string,
    resource: string,
    resourceId?: string,
    details?: Record<string, unknown>
  ) {
    this.log({
      userId,
      action,
      resource,
      resourceId,
      details,
    })
  }
}

// Convenience functions for common audit events
export const auditLog = {
  user: {
    login: (userId: string, details?: Record<string, unknown>) =>
      AuditLogger.logUserAction(userId, 'login', 'user', details),
    
    logout: (userId: string, details?: Record<string, unknown>) =>
      AuditLogger.logUserAction(userId, 'logout', 'user', details),
    
    profileUpdate: (userId: string, details?: Record<string, unknown>) =>
      AuditLogger.logUserAction(userId, 'update', 'profile', details),
  },

  team: {
    create: (userId: string, teamId: string, details?: Record<string, any>) =>
      AuditLogger.logTeamAction(userId, teamId, 'create', 'team', details),
    
    update: (userId: string, teamId: string, details?: Record<string, any>) =>
      AuditLogger.logTeamAction(userId, teamId, 'update', 'team', details),
    
    delete: (userId: string, teamId: string, details?: Record<string, any>) =>
      AuditLogger.logTeamAction(userId, teamId, 'delete', 'team', details),
    
    memberAdd: (userId: string, teamId: string, memberId: string) =>
      AuditLogger.logTeamAction(userId, teamId, 'add_member', 'team_member', {
        memberId,
      }),
    
    memberRemove: (userId: string, teamId: string, memberId: string) =>
      AuditLogger.logTeamAction(userId, teamId, 'remove_member', 'team_member', {
        memberId,
      }),
  },

  campaign: {
    create: (userId: string, campaignId: string, details?: Record<string, any>) =>
      AuditLogger.logDataAccess(userId, 'create', 'campaign', campaignId, details),
    
    update: (userId: string, campaignId: string, details?: Record<string, any>) =>
      AuditLogger.logDataAccess(userId, 'update', 'campaign', campaignId, details),
    
    delete: (userId: string, campaignId: string, details?: Record<string, any>) =>
      AuditLogger.logDataAccess(userId, 'delete', 'campaign', campaignId, details),
    
    start: (userId: string, campaignId: string, details?: Record<string, any>) =>
      AuditLogger.logDataAccess(userId, 'start', 'campaign', campaignId, details),
    
    stop: (userId: string, campaignId: string, details?: Record<string, any>) =>
      AuditLogger.logDataAccess(userId, 'stop', 'campaign', campaignId, details),
  },

  contact: {
    create: (userId: string, contactId: string, details?: Record<string, any>) =>
      AuditLogger.logDataAccess(userId, 'create', 'contact', contactId, details),
    
    update: (userId: string, contactId: string, details?: Record<string, any>) =>
      AuditLogger.logDataAccess(userId, 'update', 'contact', contactId, details),
    
    delete: (userId: string, contactId: string, details?: Record<string, any>) =>
      AuditLogger.logDataAccess(userId, 'delete', 'contact', contactId, details),
    
    import: (userId: string, count: number, details?: Record<string, any>) =>
      AuditLogger.logDataAccess(userId, 'import', 'contacts', undefined, {
        count,
        ...details,
      }),
    
    export: (userId: string, count: number, details?: Record<string, any>) =>
      AuditLogger.logDataAccess(userId, 'export', 'contacts', undefined, {
        count,
        ...details,
      }),
  },

  security: {
    failedLogin: (email: string, ip?: string) =>
      AuditLogger.logSecurityEvent('anonymous', 'failed_login', {
        email,
        ip,
      }),
    
    suspiciousActivity: (userId: string, details?: Record<string, any>) =>
      AuditLogger.logSecurityEvent(userId, 'suspicious_activity', details),
    
    permissionDenied: (userId: string, resource: string, details?: Record<string, any>) =>
      AuditLogger.logSecurityEvent(userId, 'permission_denied', {
        resource,
        ...details,
      }),
  },
}
