'use client'

import { Suspense } from 'react'
import AIChatAssistant from './ai-chat'

function AIChatFallback() {
  return null // or a loading spinner if you prefer
}

export default function AIChatWrapper() {
  return (
    <Suspense fallback={<AIChatFallback />}>
      <AIChatAssistant />
    </Suspense>
  )
}
