import { NextRequest, NextResponse } from 'next/server'
import { getAbandonedCartsForEmail, markEmailAsSent } from '@/lib/abandoned-carts'
import { sendAbandonedCartEmail } from '@/lib/email/resend'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.error('❌ Cron authentication failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('\n📧 === ABANDONED CART EMAIL CRON JOB STARTED ===')

    const carts = await getAbandonedCartsForEmail()
    console.log(`📧 Found ${carts.length} abandoned carts to email`)

    let emailsSent = 0
    let emailsFailed = 0

    for (const cart of carts) {
      try {
        const sent = await sendAbandonedCartEmail({
          email: cart.customerEmail,
          items: cart.cartItems,
          totalAmount: cart.totalPrice,
        })

        if (sent) {
          await markEmailAsSent(cart.cartId)
          emailsSent++
        } else {
          emailsFailed++
        }
      } catch (error) {
        console.error(`❌ Failed to process cart ${cart.cartId}:`, error)
        emailsFailed++
      }
    }

    console.log(`✅ === CRON JOB COMPLETE ===`)
    console.log(`📊 Results: ${emailsSent} sent, ${emailsFailed} failed\n`)

    return NextResponse.json({
      success: true,
      emailsSent,
      emailsFailed,
    })
  } catch (error) {
    console.error('❌ Cron job error:', error)
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 }
    )
  }
}