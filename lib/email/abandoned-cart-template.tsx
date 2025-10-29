export interface AbandonedCartEmailProps {
  email: string
  items: Array<{
    title: string
    price: string
    quantity: number
  }>
  totalAmount: number
}

export function AbandonedCartTemplate({
  email,
  items,
  totalAmount,
}: AbandonedCartEmailProps) {
  const checkoutUrl = process.env.NEXT_PUBLIC_STORE_URL

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <div
        style={{
          backgroundColor: '#f9f9f9',
          padding: '30px',
          textAlign: 'center',
          borderRadius: '8px 8px 0 0',
        }}
      >
        <h1 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>
          You left something behind! 🛒
        </h1>
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
          Complete your purchase to get your items
        </p>
      </div>

      <div style={{ padding: '30px', backgroundColor: '#fff' }}>
        <p style={{ fontSize: '16px', color: '#333', marginBottom: '20px' }}>
          Hi {email.split('@')[0]},
        </p>

        <p style={{ fontSize: '14px', color: '#666', marginBottom: '30px' }}>
          You have items waiting in your cart. Don&apos;t let them get away—complete your purchase now!
        </p>

        <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
          <h2 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: '600' }}>
            Your Items:
          </h2>

          {items.map((item) => (
            <div
              key={item.title}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '12px',
                marginBottom: '12px',
                borderBottom: '1px solid #ddd',
                fontSize: '14px',
              }}
            >
              <span style={{ color: '#333', fontWeight: '500' }}>
                {item.title}
                <span style={{ color: '#999', marginLeft: '8px' }}>
                  x{item.quantity}
                </span>
              </span>
              <span style={{ color: '#333', fontWeight: '600' }}>
                ${(parseFloat(item.price) * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '12px',
              marginTop: '12px',
              borderTop: '2px solid #333',
              fontSize: '16px',
              fontWeight: '700',
            }}
          >
            <span>Total:</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <a
            href={checkoutUrl}
            style={{
              backgroundColor: '#000',
              color: '#fff',
              padding: '14px 40px',
              textDecoration: 'none',
              borderRadius: '4px',
              display: 'inline-block',
              fontSize: '16px',
              fontWeight: '600',
            }}
          >
            Complete Your Purchase
          </a>
        </div>

        <p style={{ fontSize: '13px', color: '#999', textAlign: 'center', marginBottom: '20px' }}>
          This cart will be saved for 24 hours
        </p>
      </div>

      <div
        style={{
          backgroundColor: '#f9f9f9',
          padding: '20px',
          textAlign: 'center',
          borderRadius: '0 0 8px 8px',
          borderTop: '1px solid #ddd',
        }}
      >
        <p style={{ margin: '0', fontSize: '12px', color: '#999' }}>
          This is an automated email. Please don&apos;t reply to this message.
        </p>
      </div>
    </div>
  )
}