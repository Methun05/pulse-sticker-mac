'use client';

import dynamic from 'next/dynamic';

const DePayButton = dynamic(() => import('./DePayButton'), { ssr: false });

export default function TestPayPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '24px', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 600 }}>DePay Test</h1>
      <p style={{ color: '#666' }}>Click to test the payment widget</p>
      <DePayButton />
    </div>
  );
}
