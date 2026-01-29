import { useState } from 'react'

const moods = [
  { id: 'happy', emoji: '😊', label: 'Happy', color: 'bg-happy', hoverColor: 'hover:bg-yellow-300' },
  { id: 'sad', emoji: '😢', label: 'Sad', color: 'bg-sad', hoverColor: 'hover:bg-blue-300' },
  { id: 'mad', emoji: '😠', label: 'Mad', color: 'bg-mad', hoverColor: 'hover:bg-red-300' },
  { id: 'worried', emoji: '😰', label: 'Worried', color: 'bg-worried', hoverColor: 'hover:bg-purple-300' },
  { id: 'excited', emoji: '🎉', label: 'Excited', color: 'bg-excited', hoverColor: 'hover:bg-green-300' },
  { id: 'confused', emoji: '🤔', label: 'Confused', color: 'bg-confused', hoverColor: 'hover:bg-orange-300' },
]

export default function MoodSelector({ onSelect, selectedMood }) {
  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">
        How are you feeling right now?
      </h2>
      <div className="grid grid-cols-3 gap-4">
        {moods.map((mood) => (
          <button
            key={mood.id}
            onClick={() => onSelect(mood.id)}
            className={`mood-btn flex flex-col items-center justify-center p-4 rounded-2xl ${mood.color} ${mood.hoverColor}
              ${selectedMood === mood.id ? 'ring-4 ring-gray-800 ring-offset-2' : ''}
              shadow-lg transition-all duration-200`}
          >
            <span className="text-5xl mb-2">{mood.emoji}</span>
            <span className="text-lg font-bold text-gray-800">{mood.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
