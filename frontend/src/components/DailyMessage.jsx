import { useState, useEffect } from 'react'

const messages = [
  { text: "You are braver than you believe, stronger than you seem, and smarter than you think!", emoji: "💪" },
  { text: "Today is a brand new day full of possibilities!", emoji: "🌟" },
  { text: "You are loved just the way you are.", emoji: "💖" },
  { text: "It's okay to make mistakes - that's how we learn and grow!", emoji: "🌱" },
  { text: "Your feelings matter, and so do you!", emoji: "🤗" },
  { text: "You can do hard things. I believe in you!", emoji: "⭐" },
  { text: "Being kind to yourself is just as important as being kind to others.", emoji: "🦋" },
  { text: "Every day is a chance to try something new!", emoji: "🎨" },
  { text: "It's okay to ask for help when you need it.", emoji: "🤝" },
  { text: "You make the world a better place just by being you!", emoji: "🌈" },
  { text: "Take a deep breath. You've got this!", emoji: "🌸" },
  { text: "Your smile can brighten someone's day - including your own!", emoji: "😊" },
  { text: "Remember: progress, not perfection!", emoji: "🎯" },
  { text: "You are worthy of good things!", emoji: "✨" },
]

export default function DailyMessage() {
  const [message, setMessage] = useState(null)

  useEffect(() => {
    // Use the day of year to get a consistent message for the whole day
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 0)
    const diff = now - start
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
    const index = dayOfYear % messages.length
    setMessage(messages[index])
  }, [])

  if (!message) return null

  return (
    <div className="bg-gradient-to-r from-yellow-100 via-pink-100 to-purple-100 rounded-2xl p-6 shadow-lg">
      <div className="text-center">
        <span className="text-5xl block mb-3">{message.emoji}</span>
        <h3 className="text-sm font-bold text-primary-600 uppercase tracking-wide mb-2">
          Today's Message
        </h3>
        <p className="text-xl text-gray-700 font-medium leading-relaxed">
          {message.text}
        </p>
      </div>
    </div>
  )
}
