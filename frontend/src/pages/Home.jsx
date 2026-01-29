import { Link } from 'react-router-dom'
import { MessageCircle, BookOpen, Sparkles, TrendingUp } from 'lucide-react'
import MoodSelector from '../components/MoodSelector'
import DailyMessage from '../components/DailyMessage'
import Navigation from '../components/Navigation'

export default function Home({ currentMood, onMoodSelect, moodHistory }) {
  const streak = calculateStreak(moodHistory)

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="p-6 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Hi, Sarah! <span className="wave">👋</span>
        </h1>
        <p className="text-lg text-gray-600">Your AI Friend is here for you</p>

        {/* Streak Badge */}
        {streak > 0 && (
          <div className="inline-flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full mt-3">
            <span className="text-2xl">🔥</span>
            <span className="font-bold text-yellow-700">{streak} day streak!</span>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="px-4 space-y-6 max-w-md mx-auto">
        {/* Daily Message */}
        <DailyMessage />

        {/* Mood Check-in */}
        <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg">
          <MoodSelector onSelect={onMoodSelect} selectedMood={currentMood} />

          {currentMood && (
            <div className="mt-6 text-center">
              <p className="text-gray-600 mb-4">
                {getMoodMessage(currentMood)}
              </p>
              <Link
                to="/chat"
                className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-full font-bold hover:bg-primary-600 transition-all"
              >
                <MessageCircle size={20} />
                Let's talk about it
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            to="/chat"
            className="bg-white/80 backdrop-blur rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all"
          >
            <MessageCircle className="text-primary-500 mb-2" size={32} />
            <h3 className="font-bold text-gray-700">Chat</h3>
            <p className="text-sm text-gray-500">Talk to your AI friend</p>
          </Link>

          <Link
            to="/journal"
            className="bg-white/80 backdrop-blur rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all"
          >
            <BookOpen className="text-purple-500 mb-2" size={32} />
            <h3 className="font-bold text-gray-700">Journal</h3>
            <p className="text-sm text-gray-500">Write your thoughts</p>
          </Link>

          <Link
            to="/activities"
            className="bg-white/80 backdrop-blur rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all"
          >
            <Sparkles className="text-yellow-500 mb-2" size={32} />
            <h3 className="font-bold text-gray-700">Activities</h3>
            <p className="text-sm text-gray-500">Calm & relax</p>
          </Link>

          <Link
            to="/parent"
            className="bg-white/80 backdrop-blur rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all"
          >
            <TrendingUp className="text-green-500 mb-2" size={32} />
            <h3 className="font-bold text-gray-700">Parent View</h3>
            <p className="text-sm text-gray-500">For grown-ups</p>
          </Link>
        </div>
      </main>

      <Navigation />
    </div>
  )
}

function getMoodMessage(mood) {
  const messages = {
    happy: "That's wonderful! Let's celebrate together! 🎉",
    sad: "I'm sorry you're feeling down. Want to talk about it?",
    mad: "It's okay to feel angry sometimes. Let's work through it together.",
    worried: "Worries can feel big. I'm here to help you feel better.",
    excited: "Ooh exciting! Tell me all about it! ✨",
    confused: "Feeling confused is normal. Let's figure things out together.",
  }
  return messages[mood] || "Want to tell me more?"
}

function calculateStreak(moodHistory) {
  if (!moodHistory || moodHistory.length === 0) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const uniqueDays = new Set()
  moodHistory.forEach(entry => {
    const date = new Date(entry.timestamp)
    date.setHours(0, 0, 0, 0)
    uniqueDays.add(date.getTime())
  })

  const sortedDays = Array.from(uniqueDays).sort((a, b) => b - a)

  if (sortedDays[0] !== today.getTime()) {
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (sortedDays[0] !== yesterday.getTime()) {
      return 0
    }
  }

  let streak = 1
  for (let i = 1; i < sortedDays.length; i++) {
    const diff = sortedDays[i - 1] - sortedDays[i]
    if (diff === 24 * 60 * 60 * 1000) {
      streak++
    } else {
      break
    }
  }

  return streak
}
