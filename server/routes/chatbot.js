import { getChatbotReply } from '../controllers/chatController.js'

export const chatbotRoutes = [
  {
    method: 'POST',
    path: '/api/chatbot',
    async handle({ body }) {
      return { status: 200, body: getChatbotReply(body.message) }
    },
  },
]
