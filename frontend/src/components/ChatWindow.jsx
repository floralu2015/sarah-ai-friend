import { useState, useRef, useEffect } from 'react'
import { Send, Mic, MicOff, Volume2 } from 'lucide-react'
import VoiceMode from './VoiceMode'

export default function ChatWindow({ messages, onSendMessage, isLoading }) {
  const [input, setInput] = useState('')
  const [voiceMode, setVoiceMode] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim())
      setInput('')
    }
  }

  const handleVoiceMessage = (text) => {
    if (text.trim()) {
      onSendMessage(text.trim())
    }
  }

  return (
    <div className="flex flex-col h-full bg-white/80 backdrop-blur rounded-3xl shadow-xl overflow-hidden">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 chat-scroll space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <span className="text-6xl block mb-4">💭</span>
            <p className="text-lg">Tell me what's on your mind!</p>
            <p className="text-sm">I'm here to listen and help.</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`message-bubble flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-primary-400 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}
            >
              {message.role === 'assistant' && (
                <span className="text-2xl mr-2">🤗</span>
              )}
              <p className="inline">{message.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-4 rounded-2xl rounded-bl-none">
              <span className="text-2xl mr-2">🤗</span>
              <span className="inline-flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice Mode Toggle */}
      {voiceMode && (
        <VoiceMode
          onMessage={handleVoiceMessage}
          onClose={() => setVoiceMode(false)}
          lastAssistantMessage={messages.filter(m => m.role === 'assistant').slice(-1)[0]?.content}
        />
      )}

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-pink-100">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setVoiceMode(!voiceMode)}
            className={`p-3 rounded-full transition-all ${
              voiceMode
                ? 'bg-primary-500 text-white voice-pulse'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {voiceMode ? <MicOff size={24} /> : <Mic size={24} />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-3 rounded-full border-2 border-pink-200 focus:border-primary-400 focus:outline-none text-lg"
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 bg-primary-500 text-white rounded-full hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send size={24} />
          </button>
        </div>
      </form>
    </div>
  )
}
