import { supabase } from './supabase'
import { authService } from './auth-service'
import { StaleAlert } from './stale-alerts'

// SMS Service using Twilio (commercial but industry standard)
class SMSService {
  private twilioClient: any = null

  constructor() {
    // Initialize Twilio if credentials are available
    if (typeof window === 'undefined' && process.env.TWILIO_ACCOUNT_SID) {
      const twilio = require('twilio')
      this.twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      )
    }
  }

  async sendSMS(to: string, message: string): Promise<boolean> {
    try {
      if (!this.twilioClient) {
        console.log('SMS not configured - skipping SMS send')
        return false
      }

      await this.twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: to
      })

      console.log(`SMS sent to ${to}`)
      return true
    } catch (error) {
      console.error('SMS send failed:', error)
      return false
    }
  }

  async sendCriticalAlert(to: string, alert: StaleAlert): Promise<boolean> {
    const message = `🚨 RESTMAN ALERT: ${alert.grocery_name} expires in ${alert.days_until_expiry} days. Risk: $${alert.estimated_loss}. Take action now!`
    return this.sendSMS(to, message)
  }
}

// Email Service using Nodemailer (open source)
class EmailService {
  private transporter: any = null

  constructor() {
    if (typeof window === 'undefined' && process.env.SMTP_HOST) {
      const nodemailer = require('nodemailer')
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      })
    }
  }

  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      if (!this.transporter) {
        console.log('Email not configured - skipping email send')
        return false
      }

      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to: to,
        subject: subject,
        html: html
      })

      console.log(`Email sent to ${to}`)
      return true
    } catch (error) {
      console.error('Email send failed:', error)
      return false
    }
  }

  async sendDailyReport(to: string, reportData: any): Promise<boolean> {
    const html = `
      <h2>RestMan Daily Report</h2>
      <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      <p><strong>Critical Alerts:</strong> ${reportData.criticalAlerts}</p>
      <p><strong>Waste Value:</strong> $${reportData.wasteValue}</p>
      <p><strong>Orders Processed:</strong> ${reportData.ordersProcessed}</p>
    `
    return this.sendEmail(to, 'RestMan Daily Report', html)
  }
}

// Push Notification Service using Web Push (open source)
class PushNotificationService {
  async sendPushNotification(subscription: any, payload: any): Promise<boolean> {
    try {
      if (typeof window === 'undefined' && process.env.VAPID_PRIVATE_KEY) {
        const webpush = require('web-push')
        
        webpush.setVapidDetails(
          'mailto:' + process.env.SMTP_USER,
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
          process.env.VAPID_PRIVATE_KEY
        )

        await webpush.sendNotification(subscription, JSON.stringify(payload))
        console.log('Push notification sent')
        return true
      }
      return false
    } catch (error) {
      console.error('Push notification failed:', error)
      return false
    }
  }
}

// Client-side notification service that calls API routes
export class NotificationService {
  private smsService = new SMSService()
  private emailService = new EmailService()
  private pushService = new PushNotificationService()

  // Send critical stale alerts to relevant roles
  async sendStaleAlert(alert: StaleAlert): Promise<void> {
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'stale_alert',
          data: alert
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send stale alert notification')
      }

      console.log('Stale alert notification sent')
    } catch (error) {
      console.error('Error sending stale alert notifications:', error)
    }
  }

  // Send low stock alerts to managers
  async sendLowStockAlert(groceryName: string, currentAmount: number): Promise<void> {
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'low_stock_alert',
          data: { groceryName, currentAmount }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send low stock notification')
      }

      console.log('Low stock notification sent')
    } catch (error) {
      console.error('Error sending low stock notifications:', error)
    }
  }

  // Send order ready notifications to waiters
  async sendOrderReadyNotification(tableNumber: string, waiterPhone?: string): Promise<void> {
    if (!waiterPhone) return

    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'order_ready',
          data: { tableNumber, waiterPhone }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send order ready notification')
      }

      console.log('Order ready notification sent')
    } catch (error) {
      console.error('Error sending order ready notification:', error)
    }
  }

  // Send daily reports to owners
  async sendDailyReport(): Promise<void> {
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'daily_report'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send daily report')
      }

      console.log('Daily report sent')
    } catch (error) {
      console.error('Error sending daily reports:', error)
    }
  }

  // Check notification settings for a user
  async getUserNotificationSettings(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('phone, email, notification_preferences')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching notification settings:', error)
      return null
    }
  }

  // Update user notification preferences
  async updateNotificationPreferences(userId: string, preferences: {
    sms_enabled: boolean
    email_enabled: boolean
    push_enabled: boolean
    critical_alerts: boolean
    daily_reports: boolean
    low_stock_alerts: boolean
  }) {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          notification_preferences: preferences
        })
        .eq('id', userId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error updating notification preferences:', error)
      return false
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService() 