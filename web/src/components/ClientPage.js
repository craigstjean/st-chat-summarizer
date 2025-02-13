"use client";

import ChatApp from '@/components/ChatApp';

export default function ClientPage({ apiBaseUrl }) {
  return <ChatApp apiBaseUrl={apiBaseUrl} />;
}

