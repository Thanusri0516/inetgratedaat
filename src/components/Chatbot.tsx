import { useCallback, useRef, useState } from 'react'
import { sendChatMessage } from '../api/chat'
import { IconChat } from './DashboardIcons'

type Msg = { role: 'user' | 'assistant'; text: string }

const QUICK_ACTIONS: { label: string; message: string }[] = [
  { label: "What's the forecast?", message: "What's the temperature forecast?" },
  { label: "Today's trend", message: 'Summarize the temperature trend for the current chart window.' },
  { label: 'Is it unusual?', message: 'Does the current reading look hot, cold, or normal?' },
]

export function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'assistant',
      text: 'Hi — ask about the dashboard or temperature data. Connect your backend to receive real replies.',
    },
  ])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  const scrollToEnd = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const sendText = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || busy) return
      setError(null)
      setMessages((m) => [...m, { role: 'user', text: trimmed }])
      setBusy(true)
      try {
        const { reply } = await sendChatMessage(trimmed)
        setMessages((m) => [...m, { role: 'assistant', text: reply }])
        queueMicrotask(scrollToEnd)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Chat request failed')
      } finally {
        setBusy(false)
      }
    },
    [busy, scrollToEnd],
  )

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || busy) return
    setInput('')
    await sendText(text)
  }, [busy, input, sendText])

  return (
    <>
      <button
        type="button"
        className={`dash-assistant-fab${open ? ' dash-assistant-fab--hidden' : ''}`}
        onClick={() => setOpen(true)}
        aria-label="Open assistant"
        aria-expanded={open}
      >
        <IconChat />
      </button>

      {open ? (
        <button
          type="button"
          className="dash-assistant-backdrop"
          aria-label="Close assistant"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={`dash-assistant-panel${open ? ' dash-assistant-panel--open' : ''}`}
        aria-hidden={!open}
      >
        <div className="dash-assistant-panel__top">
          <div className="dash-assistant-panel__title">
            <span className="dash-assistant-panel__icon" aria-hidden>
              <IconChat />
            </span>
            <div>
              <h2 className="dash-assistant-panel__heading">Assistant</h2>
              <p className="dash-assistant-panel__sub">Quick questions below — or type your own.</p>
            </div>
          </div>
          <button
            type="button"
            className="dash-assistant-close"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="dash-assistant-quick" role="group" aria-label="Quick prompts">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.label}
              type="button"
              className="dash-assistant-pill"
              disabled={busy}
              onClick={() => void sendText(a.message)}
            >
              {a.label}
            </button>
          ))}
        </div>

        <div className="dash-chat-log" role="log" aria-live="polite" aria-relevant="additions">
          {messages.map((m, i) => (
            <div
              key={`${i}-${m.role}`}
              className={m.role === 'user' ? 'dash-chat-bubble dash-chat-bubble--user' : 'dash-chat-bubble'}
            >
              {m.text}
            </div>
          ))}
          <div ref={endRef} />
        </div>
        {error ? <p className="dash-error dash-chat-error">{error}</p> : null}
        <form
          className="dash-chat-form"
          onSubmit={(e) => {
            e.preventDefault()
            void send()
          }}
        >
          <label className="visually-hidden" htmlFor="chat-input">
            Message
          </label>
          <input
            id="chat-input"
            className="dash-chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything…"
            autoComplete="off"
            disabled={busy}
          />
          <button type="submit" className="dash-chat-send" disabled={busy || !input.trim()}>
            {busy ? (
              <span className="dash-chat-send__busy" aria-hidden />
            ) : (
              'Send'
            )}
            {busy ? <span className="visually-hidden">Sending</span> : null}
          </button>
        </form>
      </aside>
    </>
  )
}
