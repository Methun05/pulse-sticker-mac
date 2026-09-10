import DePayWidgets from '@depay/widgets';

export default function DePayButton() {
  const handlePay = () => {
    DePayWidgets.Payment({
      integration: '2e9894f4-3099-4192-a941-5ca0671e5da5',
      payload: {
        test: true,
        spotNumber: 1,
        amount: 1,
      },
    });
  };

  return (
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
  );
}
