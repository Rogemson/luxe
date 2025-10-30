import { ImageResponse } from '@vercel/og'

export const runtime = 'edge'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Get product data from query params
    const title = searchParams.get('title') || 'LUXE'
    const price = searchParams.get('price') || '$0.00'
    const image = searchParams.get('image') || 'https://zoster.vercel.app/og-image.png'
    const availability = searchParams.get('availability') || 'In Stock'
    const isAvailable = availability === 'In Stock'

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            backgroundImage: `linear-gradient(135deg, #000000 0%, #1a1a1a 100%)`,
            padding: '40px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {/* Container */}
          <div
            style={{
              display: 'flex',
              width: '100%',
              height: '100%',
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            {/* Product Image Section */}
            <div
              style={{
                display: 'flex',
                width: '50%',
                backgroundColor: '#f5f5f5',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              <img
                src={image}
                alt={title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              {/* Availability Badge */}
              <div
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  backgroundColor: isAvailable ? '#10b981' : '#ef4444',
                  color: '#ffffff',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                {availability}
              </div>
            </div>

            {/* Product Info Section */}
            <div
              style={{
                display: 'flex',
                width: '50%',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '60px 50px',
                backgroundColor: '#ffffff',
              }}
            >
              {/* LUXE Logo */}
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#000000',
                  marginBottom: '30px',
                  letterSpacing: '2px',
                }}
              >
                LUXE
              </div>

              {/* Product Title */}
              <div
                style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: '#000000',
                  marginBottom: '20px',
                  lineHeight: '1.2',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {title}
              </div>

              {/* Price */}
              <div
                style={{
                  fontSize: '56px',
                  fontWeight: 'bold',
                  color: '#000000',
                  marginBottom: '40px',
                }}
              >
                {price}
              </div>

              {/* Call to Action */}
              <div
                style={{
                  fontSize: '18px',
                  color: '#666666',
                  fontStyle: 'italic',
                }}
              >
                Shop now on LUXE →
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=3600, immutable',
        },
      }
    )
  } catch (error) {
    console.error('OG Image generation error:', error)
    return new Response('Failed to generate OG image', { status: 500 })
  }
}
