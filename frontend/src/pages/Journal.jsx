import { useState } from 'react'
import { ArrowLeft, Plus, Save, Trash2, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navigation from '../components/Navigation'

export default function Journal({ entries, setEntries, messages }) {
  const [isWriting, setIsWriting] = useState(false)
  const [currentEntry, setCurrentEntry] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState(null)

  const emojis = ['😊', '😢', '😠', '😰', '🎉', '🤔', '💭', '💖', '🌟', '🌈']

  const saveEntry = () => {
    if (currentEntry.trim()) {
      const newEntry = {
        id: Date.now(),
        content: currentEntry.trim(),
        emoji: selectedEmoji,
        date: new Date().toISOString(),
        type: 'journal',
      }
      setEntries([newEntry, ...entries])
      setCurrentEntry('')
      setSelectedEmoji(null)
      setIsWriting(false)
    }
  }

  const saveConversation = () => {
    if (messages.length > 0) {
      const newEntry = {
        id: Date.now(),
        content: messages.map(m => `${m.role === 'user' ? 'Me' : 'Friend'}: ${m.content}`).join('\n\n'),
        emoji: '💬',
        date: new Date().toISOString(),
        type: 'conversation',
      }
      setEntries([newEntry, ...entries])
    }
  }

  const deleteEntry = (id) => {
    setEntries(entries.filter(e => e.id !== id))
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  if (isWriting) {
    return (
      <div className="min-h-screen pb-24">
        <header className="flex items-center justify-between p-4 bg-white/80 backdrop-blur border-b border-pink-100">
          <button
            onClick={() => setIsWriting(false)}
            className="p-2 hover:bg-pink-50 rounded-full"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">New Entry</h1>
          <button
            onClick={saveEntry}
            disabled={!currentEntry.trim()}
            className="p-2 hover:bg-pink-50 rounded-full disabled:opacity-50"
          >
            <Save size={24} className="text-primary-500" />
          </button>
        </header>

        <main className="p-4 max-w-md mx-auto">
          {/* Emoji Selector */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">How are you feeling?</p>
            <div className="flex flex-wrap gap-2">
              {emojis.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`text-2xl p-2 rounded-xl transition-all ${
                    selectedEmoji === emoji
                      ? 'bg-primary-100 scale-110'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Text Area */}
          <textarea
            value={currentEntry}
            onChange={(e) => setCurrentEntry(e.target.value)}
            placeholder="What's on your mind today?"
            className="w-full h-64 p-4 rounded-2xl border-2 border-pink-200 focus:border-primary-400 focus:outline-none text-lg resize-none"
            autoFocus
          />

          <p className="text-sm text-gray-500 mt-2 text-center">
            This is your private space. Write anything you want!
          </p>
        </main>

        <Navigation />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="flex items-center justify-between p-4 bg-white/80 backdrop-blur border-b border-pink-100">
        <Link to="/" className="p-2 hover:bg-pink-50 rounded-full">
          <ArrowLeft size={24} className="text-gray-600" />
        </Link>
        <h1 className="text-xl font-bold text-gray-800">My Journal</h1>
        <button
          onClick={() => setIsWriting(true)}
          className="p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600"
        >
          <Plus size={24} />
        </button>
      </header>

      <main className="p-4 max-w-md mx-auto">
        {/* Save Conversation Button */}
        {messages.length > 0 && (
          <button
            onClick={saveConversation}
            className="w-full flex items-center justify-center gap-2 bg-purple-100 text-purple-700 p-4 rounded-2xl mb-4 font-bold hover:bg-purple-200 transition-all"
          >
            <MessageCircle size={20} />
            Save today's conversation
          </button>
        )}

        {/* Entries List */}
        {entries.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl block mb-4">📔</span>
            <p className="text-gray-600 mb-4">Your journal is empty</p>
            <button
              onClick={() => setIsWriting(true)}
              className="bg-primary-500 text-white px-6 py-3 rounded-full font-bold hover:bg-primary-600"
            >
              Write your first entry
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map(entry => (
              <div
                key={entry.id}
                className="bg-white/80 backdrop-blur rounded-2xl p-4 shadow-lg"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{entry.emoji || '📝'}</span>
                    <span className="text-sm text-gray-500">{formatDate(entry.date)}</span>
                  </div>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {entry.content.length > 200
                    ? entry.content.slice(0, 200) + '...'
                    : entry.content}
                </p>
                {entry.type === 'conversation' && (
                  <span className="inline-block mt-2 text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                    Saved conversation
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <Navigation />
    </div>
  )
}
