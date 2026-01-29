import { useState } from 'react'
import { RefreshCw, Heart } from 'lucide-react'

const affirmations = [
  "I am enough, just as I am.",
  "I can handle whatever comes my way.",
  "My feelings are valid and important.",
  "I am worthy of love and kindness.",
  "It's okay to take things one step at a time.",
  "I am learning and growing every day.",
  "I can ask for help when I need it.",
  "I am brave, even when I feel scared.",
  "My best is good enough.",
  "I deserve to be happy.",
  "I am a good friend to others and myself.",
  "Mistakes help me learn and grow.",
  "I am proud of who I am becoming.",
  "I can do hard things.",
  "My thoughts and ideas matter.",
  "I am unique and that's my superpower.",
  "Today, I choose to be kind to myself.",
  "I am stronger than I think.",
]

export default function Affirmations() {
  const [currentIndex, setCurrentIndex] = useState(
    Math.floor(Math.random() * affirmations.length)
  )
  const [favorites, setFavorites] = useState([])
  const [showFavorites, setShowFavorites] = useState(false)

  const nextAffirmation = () => {
    let newIndex
    do {
      newIndex = Math.floor(Math.random() * affirmations.length)
    } while (newIndex === currentIndex && affirmations.length > 1)
    setCurrentIndex(newIndex)
  }

  const toggleFavorite = () => {
    const current = affirmations[currentIndex]
    if (favorites.includes(current)) {
      setFavorites(favorites.filter(f => f !== current))
    } else {
      setFavorites([...favorites, current])
    }
  }

  const isFavorite = favorites.includes(affirmations[currentIndex])

  if (showFavorites) {
    return (
      <div className="py-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-700">My Favorite Affirmations</h3>
          <button
            onClick={() => setShowFavorites(false)}
            className="text-primary-500 font-medium"
          >
            Back
          </button>
        </div>

        {favorites.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No favorites yet! Tap the heart on affirmations you love.
          </p>
        ) : (
          <ul className="space-y-3">
            {favorites.map((fav, i) => (
              <li
                key={i}
                className="bg-pink-50 border border-pink-200 rounded-xl p-4 text-gray-700"
              >
                "{fav}"
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  return (
    <div className="py-6 text-center">
      <h3 className="text-xl font-bold text-gray-700 mb-2">Positive Affirmations</h3>
      <p className="text-sm text-gray-500 mb-6">
        Say this out loud or in your head 3 times!
      </p>

      {/* Affirmation Card */}
      <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-8 mb-6 shadow-lg">
        <span className="text-4xl block mb-4">💜</span>
        <p className="text-2xl font-bold text-gray-700 leading-relaxed">
          "{affirmations[currentIndex]}"
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={toggleFavorite}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
            isFavorite
              ? 'bg-red-100 text-red-500 border-2 border-red-300'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
          {isFavorite ? 'Saved!' : 'Save'}
        </button>

        <button
          onClick={nextAffirmation}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary-500 text-white hover:bg-primary-600 font-bold transition-all"
        >
          <RefreshCw size={20} />
          New One
        </button>
      </div>

      {/* View Favorites */}
      {favorites.length > 0 && (
        <button
          onClick={() => setShowFavorites(true)}
          className="text-primary-500 font-medium underline"
        >
          View my {favorites.length} favorite{favorites.length !== 1 ? 's' : ''}
        </button>
      )}
    </div>
  )
}
