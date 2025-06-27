import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client for server-side
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

// SMS Service using Twilio
class SMSService {
  private twilioClient: any = null

  constructor() {
    if (process.env.TWILIO_ACCOUNT_SID) {
      try {
        const twilio = require('twilio')
        this.twilioClient = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        )
      } catch (error) {
        console.log('Twilio not available:', error)
      }
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

  async sendCriticalAlert(to: string, alert: any): Promise<boolean> {
    const message = `🚨 RESTMAN ALERT: ${alert.grocery_name} expires in ${alert.days_until_expiry} days. Risk: $${alert.estimated_loss}. Take action now!`
    return this.sendSMS(to, message)
  }
}

// Email Service using Nodemailer
class EmailService {
  private transporter: any = null

  constructor() {
    if (process.env.SMTP_HOST) {
      try {
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
      } catch (error) {
        console.log('Nodemailer not available:', error)
      }
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

// Notification Service
class NotificationService {
  private smsService = new SMSService()
  private emailService = new EmailService()

  async sendStaleAlert(alert: any): Promise<void> {
    try {
      // Get restaurant ID from alert
      const { data: grocery } = await supabase
        .from('groceries')
        .select('restaurant_id')
        .eq('id', alert.grocery_id)
        .single()

      if (!grocery) return

      // Get users who should be notified
      const { data: users } = await supabase
        .from('users')
        .select('phone, email, role, notification_preferences')
        .eq('restaurant_id', grocery.restaurant_id)
        .eq('is_active', true)

      if (!users) return

      for (const user of users) {
        // Check if user should be notified based on role
        const shouldNotify = this.shouldNotifyUser(user.role, alert)
        if (!shouldNotify) continue

        // Check user preferences
        const preferences = user.notification_preferences || {}
        if (preferences.sms_enabled !== false && user.phone) {
          await this.smsService.sendCriticalAlert(user.phone, alert)
        }

        if (preferences.email_enabled !== false && user.email) {
          await this.emailService.sendEmail(
            user.email,
            'Critical Inventory Alert',
            this.generateStaleAlertEmail(alert)
          )
        }
      }
    } catch (error) {
      console.error('Error sending stale alert notifications:', error)
    }
  }

  async sendLowStockAlert(groceryName: string, currentAmount: number): Promise<void> {
    try {
      // Get restaurant ID from current context (you might need to pass this)
      const { data: managers } = await supabase
        .from('users')
        .select('phone, email, notification_preferences')
        .eq('role', 'manager')
        .eq('is_active', true)

      if (!managers) return

      const message = `📦 RESTMAN: ${groceryName} running low (${currentAmount}kg left). Reorder needed.`

      for (const manager of managers) {
        const preferences = manager.notification_preferences || {}
        
        if (preferences.sms_enabled !== false && manager.phone) {
          await this.smsService.sendSMS(manager.phone, message)
        }
        
        if (preferences.email_enabled !== false && manager.email) {
          await this.emailService.sendEmail(
            manager.email,
            'Low Stock Alert',
            `<h3>Low Stock Alert</h3><p>${groceryName} is running low (${currentAmount}kg remaining).</p>`
          )
        }
      }
    } catch (error) {
      console.error('Error sending low stock notifications:', error)
    }
  }

  async sendOrderReadyNotification(tableNumber: string, waiterPhone?: string): Promise<void> {
    if (!waiterPhone) return

    const message = `🔔 RESTMAN: Order ready for Table ${tableNumber}. Please collect from kitchen.`
    await this.smsService.sendSMS(waiterPhone, message)
  }

  async sendDailyReport(): Promise<void> {
    try {
      const { data: owners } = await supabase
        .from('users')
        .select('email, notification_preferences')
        .eq('role', 'owner')
        .eq('is_active', true)

      if (!owners) return

      // Generate report data
      const reportData = await this.generateDailyReportData()

      for (const owner of owners) {
        const preferences = owner.notification_preferences || {}
        
        if (preferences.email_enabled !== false && owner.email) {
          await this.emailService.sendDailyReport(owner.email, reportData)
        }
      }
    } catch (error) {
      console.error('Error sending daily reports:', error)
    }
  }

  private shouldNotifyUser(role: string, alert: any): boolean {
    const notificationRules = {
      owner: alert.severity === 'CRITICAL',
      manager: alert.severity === 'HIGH' || alert.severity === 'CRITICAL',
      chef: alert.severity === 'MEDIUM' || alert.severity === 'HIGH' || alert.severity === 'CRITICAL',
      waiter: false
    }

    return notificationRules[role as keyof typeof notificationRules] || false
  }

  private generateStaleAlertEmail(alert: any): string {
    return `
      <h2>🚨 Critical Inventory Alert</h2>
      <p><strong>Item:</strong> ${alert.grocery_name}</p>
      <p><strong>Risk:</strong> ${alert.quantity_at_risk}kg expires in ${alert.days_until_expiry} days</p>
      <p><strong>Estimated Loss:</strong> $${alert.estimated_loss}</p>
      <p><strong>Action Required:</strong> Please take immediate action to prevent waste.</p>
      <hr>
      <p><small>Sent by RestMan - Restaurant Management System</small></p>
    `
  }

  private async generateDailyReportData(): Promise<any> {
    // This would fetch actual data from the database
    return {
      criticalAlerts: 3,
      wasteValue: 125.50,
      ordersProcessed: 45
    }
  }
}

const notificationService = new NotificationService()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    switch (type) {
      case 'stale_alert':
        await notificationService.sendStaleAlert(data)
        break
      
      case 'low_stock_alert':
        await notificationService.sendLowStockAlert(data.groceryName, data.currentAmount)
        break
      
      case 'order_ready':
        await notificationService.sendOrderReadyNotification(data.tableNumber, data.waiterPhone)
        break
      
      case 'daily_report':
        await notificationService.sendDailyReport()
        break
      
      default:
        return NextResponse.json({ error: 'Unknown notification type' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Notification API error:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' }, 
      { status: 500 }
    )
  }
} 