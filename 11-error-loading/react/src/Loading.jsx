import React from 'react';

/**
 * 수동 Loading fallback
 * - Suspense의 fallback prop으로 명시 배치
 * - Next의 loading.tsx 자동 주입과 대비
 */
export default function Loading() {
  return <div style={{ padding: 24 }}>Loading... (수동 Suspense fallback)</div>;
}
