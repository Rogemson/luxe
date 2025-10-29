import { Resend } from 'resend'
import { AbandonedCartTemplate } from './abandoned-cart-template'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendAbandonedCartEmail({
  email,
  items,
  totalAmount,
}: {
  email: string
  items: Array<{ title: string; price: string; quantity: number }>
  totalAmount: number
}): Promise<boolean> {
  try {
    const response = await resend.emails.send({
      from: 'noreply@zoster.com',
      to: email,
      subject: 'You left items in your cart 🛒',
      react: AbandonedCartTemplate({
        email,
        items,
        totalAmount,
      }),
    })

    if (response.error) {
      console.error('❌ Resend API error:', response.error)
      return false
    }

    console.log(`✅ Sent abandoned cart email to ${email}`)
    return true
  } catch (error) {
    console.error('❌ Error sending abandoned cart email:', error)
    return false
  }
}