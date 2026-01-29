import { useState } from 'react'
import { ArrowLeft, Save } from 'lucide-react'
import { Link } from 'react-router-dom'
import ChatWindow from '../components/ChatWindow'
import Navigation from '../components/Navigation'

export default function Chat({ currentMood, messages, setMessages }) {
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async (content) => {
    const userMessage = { role: 'user', content }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          mood: currentMood,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      setMessages([...newMessages, { role: 'assistant', content: data.response }])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: "Oops! I had a little hiccup. Can you try saying that again?",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen flex flex-col pb-20">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white/80 backdrop-blur border-b border-pink-100">
        <Link to="/" className="p-2 hover:bg-pink-50 rounded-full">
          <ArrowLeft size={24} className="text-gray-600" />
        </Link>
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-800">Your AI Friend</h1>
          {currentMood && (
            <span className="text-sm text-gray-500">
              Feeling {currentMood} {getMoodEmoji(currentMood)}
            </span>
          )}
        </div>
        <Link
          to="/journal"
          className="p-2 hover:bg-pink-50 rounded-full"
          title="Save to journal"
        >
          <Save size={24} className="text-gray-600" />
        </Link>
      </header>

      {/* Chat Area */}
      <div className="flex-1 p-4 overflow-hidden">
        <ChatWindow
          messages={messages}
          onSendMessage={sendMessage}
          isLoading={isLoading}
        />
      </div>

      <Navigation />
    </div>
  )
}

function getMoodEmoji(mood) {
  const emojis = {
    happy: '😊',
    sad: '😢',
    mad: '😠',
    worried: '😰',
    excited: '🎉',
    confused: '🤔',
  }
  return emojis[mood] || ''
}
