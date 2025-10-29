import { NextRequest, NextResponse } from 'next/server'

const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY
const KLAVIYO_LIST_ID = process.env.KLAVIYO_LIST_ID

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 STEP 1: Checking credentials...')
    console.log('  KLAVIYO_API_KEY exists?', !!KLAVIYO_API_KEY)
    console.log('  KLAVIYO_LIST_ID exists?', !!KLAVIYO_LIST_ID)

    if (!KLAVIYO_API_KEY || !KLAVIYO_LIST_ID) {
      return NextResponse.json(
        { error: 'Server configuration error - missing credentials' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    console.log(`📧 Newsletter subscribe attempt: ${email}`)
    console.log('🔍 STEP 4: Calling Klaviyo API...')
    console.log(`   Endpoint: /api/profile-subscription-bulk-create-jobs/`)

    const response = await fetch(
      `https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
          revision: '2024-10-15',
        },
        body: JSON.stringify({
          data: {
            type: 'profile-subscription-bulk-create-job',
            attributes: {
              profiles: {
                data: [
                  {
                    type: 'profile',
                    attributes: {
                      email: email,
                      subscriptions: {
                        email: {
                          marketing: {
                            consent: 'SUBSCRIBED',
                          },
                        },
                      },
                    },
                  },
                ],
              },
            },
            relationships: {
              list: {
                data: {
                  type: 'list',
                  id: KLAVIYO_LIST_ID,
                },
              },
            },
          },
        }),
      }
    )

    console.log('🔍 STEP 6: Checking Klaviyo response...')
    console.log('  Status:', response.status)

    // 202 Accepted means the job was queued successfully (no response body)
    if (response.status === 202) {
      console.log(`✅ Newsletter subscriber queued: ${email}`)
      return NextResponse.json(
        { success: true, message: 'Successfully subscribed to our newsletter!', email },
        { status: 200 }
      )
    }

    // For other status codes, try to parse JSON
    let responseData
    try {
      responseData = await response.json()
      console.log('  Response Data:', JSON.stringify(responseData, null, 2))
    } catch (parseError) {
      console.log('  No JSON response body')
      responseData = null
    }

    if (!response.ok) {
      console.error('❌ Klaviyo API returned error:')
      console.error(JSON.stringify(responseData, null, 2))
      return NextResponse.json(
        { error: 'Klaviyo API Error', status: response.status, details: responseData },
        { status: 500 }
      )
    }

    console.log(`✅ Newsletter subscriber added: ${email}`)
    return NextResponse.json(
      { success: true, message: 'Successfully subscribed to our newsletter!', email },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ Newsletter subscribe error:', error)
    return NextResponse.json(
      {
        error: 'Server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}