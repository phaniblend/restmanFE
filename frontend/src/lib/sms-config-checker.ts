import { supabase } from './supabase'

export interface SMSConfigStatus {
  isConfigured: boolean
  reason: string
  suggestions: string[]
  canSendSMS: boolean
}

export class SMSConfigChecker {
  static async checkConfiguration(): Promise<SMSConfigStatus> {
    const status: SMSConfigStatus = {
      isConfigured: false,
      reason: '',
      suggestions: [],
      canSendSMS: false
    }

    try {
      // Check if we have the required environment variables
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey) {
        status.reason = 'Supabase environment variables not set'
        status.suggestions.push('Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env file')
        return status
      }

      // Check if we can connect to Supabase
      const { data: { user } } = await supabase.auth.getUser()
      
      // Try to get SMS provider configuration (this will work if auth is properly set up)
      const testPhone = '+1234567890' // Dummy phone for testing
      
      try {
        const { error } = await supabase.auth.signInWithOtp({
          phone: testPhone,
          options: {
            shouldCreateUser: false // Don't create a user for this test
          }
        })

        if (error) {
          if (error.message.includes('phone_provider_not_setup')) {
            status.reason = 'SMS provider not configured in Supabase'
            status.suggestions.push(
              'Go to Supabase Dashboard → Authentication → Providers → Phone',
              'Enable Phone authentication',
              'Configure SMS provider (Twilio recommended)',
              'Add your Twilio credentials (Account SID, Auth Token, Phone Number)'
            )
          } else if (error.message.includes('rate_limit')) {
            status.reason = 'Rate limit exceeded'
            status.suggestions.push('Wait a few minutes before trying again')
          } else if (error.message.includes('invalid_phone')) {
            // This is expected for our test phone
            status.isConfigured = true
            status.canSendSMS = true
            status.reason = 'SMS provider appears to be configured'
          } else {
            status.reason = `Supabase error: ${error.message}`
            status.suggestions.push('Check Supabase dashboard for configuration issues')
          }
        } else {
          status.isConfigured = true
          status.canSendSMS = true
          status.reason = 'SMS provider is properly configured'
        }
      } catch (networkError: any) {
        status.reason = `Network error: ${networkError.message}`
        status.suggestions.push(
          'Check your internet connection',
          'Verify Supabase URL is correct',
          'Check if Supabase project is active'
        )
      }

    } catch (error: any) {
      status.reason = `Configuration check failed: ${error.message}`
      status.suggestions.push('Check your environment variables and Supabase configuration')
    }

    return status
  }

  static async checkEnvironmentVariables(): Promise<{ [key: string]: boolean }> {
    const requiredVars = {
      'NEXT_PUBLIC_SUPABASE_URL': !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      'NEXT_PUBLIC_SUPABASE_ANON_KEY': !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      'SUPABASE_SERVICE_ROLE_KEY': !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      'TWILIO_ACCOUNT_SID': !!process.env.TWILIO_ACCOUNT_SID,
      'TWILIO_AUTH_TOKEN': !!process.env.TWILIO_AUTH_TOKEN,
      'TWILIO_PHONE_NUMBER': !!process.env.TWILIO_PHONE_NUMBER
    }

    return requiredVars
  }

  static getSetupInstructions(): string[] {
    return [
      '1. Check Supabase Phone Auth Settings:',
      '   - Go to Supabase Dashboard → Authentication → Providers',
      '   - Enable Phone authentication',
      '   - Configure SMS provider (Twilio recommended)',
      '',
      '2. Set up Environment Variables:',
      '   - NEXT_PUBLIC_SUPABASE_URL',
      '   - NEXT_PUBLIC_SUPABASE_ANON_KEY',
      '   - SUPABASE_SERVICE_ROLE_KEY (for server-side operations)',
      '   - TWILIO_ACCOUNT_SID',
      '   - TWILIO_AUTH_TOKEN',
      '   - TWILIO_PHONE_NUMBER',
      '',
      '3. Restart your development server after making changes',
      '',
      '4. Test with a real phone number to verify SMS delivery'
    ]
  }
} 