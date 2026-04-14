import { API_ENDPOINTS } from '../config/apiEndpoints'
import { postJson, useMockApi } from './client'
import { mockChatReply, mockDelay } from './mock'
import type { ChatResponse } from './types'

export async function sendChatMessage(message: string): Promise<ChatResponse> {
  if (useMockApi()) {
    await mockDelay(450)
    return mockChatReply(message)
  }
  return postJson<ChatResponse>(API_ENDPOINTS.chat, { message })
}
