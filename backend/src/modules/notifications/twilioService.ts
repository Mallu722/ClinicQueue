import { config } from '../../config'

export interface SendMessageOptions {
  to: string
  message: string
  isWhatsApp?: boolean
}

export async function sendTwilioMessage({
  to,
  message,
  isWhatsApp = true,
}: SendMessageOptions): Promise<{ success: boolean; sid?: string; error?: string }> {
  const { accountSid, authToken, whatsappFrom, phoneNumber } = config.twilio

  if (!accountSid || !authToken) {
    console.warn('[Twilio] Credentials not configured. Skipping live dispatch.')
    return { success: false, error: 'Twilio credentials not configured' }
  }

  try {
    const cleanNumber = to.replace(/[^\d+]/g, '')
    const formattedTo = isWhatsApp
      ? (cleanNumber.startsWith('whatsapp:') ? cleanNumber : `whatsapp:${cleanNumber.startsWith('+') ? cleanNumber : `+91${cleanNumber}`}`)
      : (cleanNumber.startsWith('+') ? cleanNumber : `+91${cleanNumber}`)

    const fromNumber = isWhatsApp ? whatsappFrom : phoneNumber

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`

    const params = new URLSearchParams()
    params.append('To', formattedTo)
    params.append('From', fromNumber)
    params.append('Body', message)

    const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString('base64')

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    const data: any = await response.json()

    if (!response.ok) {
      console.error('[Twilio Error]', data)
      return { success: false, error: data.message || 'Twilio API request failed' }
    }

    console.log(`[Twilio Success] Message dispatched to ${formattedTo}. SID: ${data.sid}`)
    return { success: true, sid: data.sid }
  } catch (err: any) {
    console.error('[Twilio Exception]', err)
    return { success: false, error: err.message || 'Unknown network error' }
  }
}
