'use client';

declare global {
  interface Window {
    DePayWidgets: {
      Payment: (config: Record<string, unknown>) => void;
    };
  }
}

export default function TestPayPage() {
  const handlePay = () => {
    if (!window.DePayWidgets) {
      alert('DePay widget not loaded yet. Try again in a moment.');
      return;
    }

    window.DePayWidgets.Payment({
      integration: '2e9894f4-3099-4192-a941-5ca0671e5da5',
      payload: {
        test: true,
        spotNumber: 1,
        amount: 1,
      },
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '24px', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 600 }}>DePay Test</h1>
      <p style={{ color: '#666' }}>Click to test the payment widget</p>
      <button
        onClick={handlePay}
        style={{
          padding: '12px 32px',
          fontSize: '16px',
          fontWeight: 600,
          background: '#000',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
      >
        Pay $1 with Crypto
      </button>
    </div>
  );
}
