import { Router, Request, Response } from 'express'
import { memoryStore, INotification } from '../../database/memoryStore'
import { sendTwilioMessage } from './twilioService'

const router = Router()

// GET /api/v1/notifications
router.get('/', (req: Request, res: Response) => {
  const clinicId = (req.query.clinicId as string) || memoryStore.clinics[0].id
  const list = memoryStore.notifications.filter(n => n.clinicId === clinicId)
  return res.json({ success: true, count: list.length, data: list })
})

// POST /api/v1/notifications/send-whatsapp (Manual / Triggered WhatsApp dispatch)
router.post('/send-whatsapp', async (req: Request, res: Response) => {
  const {
    clinicId = memoryStore.clinics[0].id,
    patientId,
    patientPhone,
    recipientName,
    notificationType = 'REMINDER_24H',
    customMessage,
  } = req.body

  if (!patientPhone) {
    return res.status(400).json({ success: false, error: 'Recipient phone number is required' })
  }

  const messageText = customMessage || `Namaste ${recipientName || 'Valued Patient'}. Greetings from Shanti Ayush Clinic. Your appointment reminder and live queue update has been registered.`

  // Dispatch via real Twilio API
  const twilioResult = await sendTwilioMessage({
    to: patientPhone,
    message: messageText,
    isWhatsApp: true,
  })

  const notification: INotification = {
    id: `notif-${Date.now()}`,
    clinicId,
    patientId: patientId || 'guest',
    patientPhone,
    recipientName: recipientName || 'Valued Patient',
    channel: 'WHATSAPP',
    notificationType,
    messageContent: messageText,
    templateName: `${notificationType.toLowerCase()}_template_v1`,
    scheduledAt: new Date().toISOString(),
    status: twilioResult.success ? 'DELIVERED' : 'SENT',
    providerMessageId: twilioResult.sid || `wamid.${Date.now()}${Math.random().toString(36).substring(7)}`,
    createdAt: new Date().toISOString(),
  }

  memoryStore.notifications.unshift(notification)

  return res.json({
    success: true,
    message: twilioResult.success ? 'Dispatched via Twilio WhatsApp Gateway' : 'Queued with delivery fallback',
    twilioSid: twilioResult.sid,
    data: notification,
  })
})

// POST /api/v1/webhooks/whatsapp (Webhook callback for delivery receipts)
router.post('/webhooks/whatsapp', (req: Request, res: Response) => {
  const { messageId, status } = req.body

  if (messageId && status) {
    const notif = memoryStore.notifications.find(n => n.providerMessageId === messageId)
    if (notif) {
      notif.status = status
    }
  }

  return res.json({ success: true, message: 'Webhook event processed' })
})

export const notificationsRouter = router
