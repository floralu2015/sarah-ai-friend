import { useState } from 'react'
import { ArrowLeft, Lock, TrendingUp, AlertCircle, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'

const PARENT_PIN = '1234' // Simple PIN for demo

export default function Parent({ moodHistory, messages }) {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState(false)

  const handlePinSubmit = (e) => {
    e.preventDefault()
    if (pin === PARENT_PIN) {
      setIsUnlocked(true)
      setPinError(false)
    } else {
      setPinError(true)
      setPin('')
    }
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur rounded-3xl p-8 shadow-lg max-w-sm w-full text-center">
          <Lock className="mx-auto text-gray-400 mb-4" size={48} />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Parent Dashboard</h1>
          <p className="text-gray-600 mb-6">Enter your PIN to continue</p>

          <form onSubmit={handlePinSubmit}>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter PIN"
              maxLength={4}
              className={`w-full text-center text-2xl tracking-widest p-4 rounded-xl border-2 ${
                pinError ? 'border-red-300 bg-red-50' : 'border-gray-200'
              } focus:border-primary-400 focus:outline-none mb-4`}
            />
            {pinError && (
              <p className="text-red-500 text-sm mb-4">Incorrect PIN. Try again.</p>
            )}
            <button
              type="submit"
              className="w-full bg-primary-500 text-white py-3 rounded-xl font-bold hover:bg-primary-600"
            >
              Unlock
            </button>
          </form>

          <Link to="/" className="block mt-4 text-gray-500 hover:text-gray-700">
            Back to app
          </Link>

          <p className="text-xs text-gray-400 mt-6">Demo PIN: 1234</p>
        </div>
      </div>
    )
  }

  const moodCounts = getMoodCounts(moodHistory)
  const recentMoods = moodHistory.slice(-7)
  const themes = extractThemes(messages)

  return (
    <div className="min-h-screen pb-8">
      <header className="flex items-center justify-between p-4 bg-white/80 backdrop-blur border-b border-pink-100">
        <Link to="/" className="p-2 hover:bg-pink-50 rounded-full">
          <ArrowLeft size={24} className="text-gray-600" />
        </Link>
        <h1 className="text-xl font-bold text-gray-800">Parent Dashboard</h1>
        <button
          onClick={() => setIsUnlocked(false)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Lock
        </button>
      </header>

      <main className="p-4 max-w-2xl mx-auto space-y-6">
        {/* Overview Card */}
        <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-primary-500" size={24} />
            <h2 className="text-xl font-bold text-gray-800">Overview</h2>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-pink-50 rounded-xl p-4">
              <p className="text-3xl font-bold text-primary-500">{moodHistory.length}</p>
              <p className="text-sm text-gray-600">Check-ins</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <p className="text-3xl font-bold text-purple-500">{messages.length}</p>
              <p className="text-sm text-gray-600">Messages</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-3xl font-bold text-green-500">
                {moodCounts.happy + moodCounts.excited}
              </p>
              <p className="text-sm text-gray-600">Positive</p>
            </div>
          </div>
        </div>

        {/* Mood Distribution */}
        <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Mood Distribution</h2>

          {moodHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No mood data yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(moodCounts).map(([mood, count]) => {
                const percentage = Math.round((count / moodHistory.length) * 100)
                return (
                  <div key={mood} className="flex items-center gap-3">
                    <span className="w-20 text-sm capitalize text-gray-600">{mood}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                      <div
                        className={`h-full ${getMoodBarColor(mood)}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-12 text-sm text-gray-600 text-right">{percentage}%</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="text-blue-500" size={24} />
            <h2 className="text-xl font-bold text-gray-800">Recent Moods</h2>
          </div>

          {recentMoods.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          ) : (
            <div className="flex justify-around">
              {recentMoods.map((entry, i) => (
                <div key={i} className="text-center">
                  <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(entry.timestamp).toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Conversation Themes (without showing actual content) */}
        <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="text-yellow-500" size={24} />
            <h2 className="text-xl font-bold text-gray-800">Conversation Themes</h2>
          </div>

          <p className="text-sm text-gray-500 mb-4">
            General topics discussed (not actual conversation content)
          </p>

          {themes.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No conversations yet</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {themes.map((theme, i) => (
                <span
                  key={i}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                >
                  {theme}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Privacy Note */}
        <div className="bg-blue-50 rounded-2xl p-4 text-center">
          <p className="text-sm text-blue-700">
            <strong>Privacy Note:</strong> This dashboard shows trends and themes only.
            Sarah's actual conversations remain private to maintain trust.
          </p>
        </div>
      </main>
    </div>
  )
}

function getMoodCounts(history) {
  const counts = { happy: 0, sad: 0, mad: 0, worried: 0, excited: 0, confused: 0 }
  history.forEach(entry => {
    if (counts.hasOwnProperty(entry.mood)) {
      counts[entry.mood]++
    }
  })
  return counts
}

function getMoodBarColor(mood) {
  const colors = {
    happy: 'bg-yellow-400',
    sad: 'bg-blue-400',
    mad: 'bg-red-400',
    worried: 'bg-purple-400',
    excited: 'bg-green-400',
    confused: 'bg-orange-400',
  }
  return colors[mood] || 'bg-gray-400'
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
  return emojis[mood] || '😐'
}

function extractThemes(messages) {
  if (messages.length === 0) return []

  const themes = new Set()
  const keywords = {
    'school': ['school', 'class', 'teacher', 'homework', 'test'],
    'friends': ['friend', 'friends', 'play', 'playdate'],
    'family': ['mom', 'dad', 'sister', 'brother', 'family'],
    'feelings': ['feel', 'feeling', 'sad', 'happy', 'mad', 'angry', 'worried'],
    'activities': ['sport', 'game', 'practice', 'play'],
  }

  const text = messages.map(m => m.content.toLowerCase()).join(' ')

  Object.entries(keywords).forEach(([theme, words]) => {
    if (words.some(word => text.includes(word))) {
      themes.add(theme)
    }
  })

  return Array.from(themes)
}
