import { useState } from 'react'
import { ArrowLeft, Wind, Eye, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import BreathingExercise from '../components/BreathingExercise'
import GroundingExercise from '../components/GroundingExercise'
import Affirmations from '../components/Affirmations'
import Navigation from '../components/Navigation'

const activities = [
  {
    id: 'breathing',
    name: 'Breathing',
    icon: Wind,
    color: 'bg-blue-100 text-blue-600',
    description: 'Calm your body',
  },
  {
    id: 'grounding',
    name: '5-4-3-2-1',
    icon: Eye,
    color: 'bg-green-100 text-green-600',
    description: 'Feel present',
  },
  {
    id: 'affirmations',
    name: 'Affirmations',
    icon: Heart,
    color: 'bg-pink-100 text-pink-600',
    description: 'Positive words',
  },
]

export default function Activities() {
  const [selectedActivity, setSelectedActivity] = useState(null)

  const renderActivity = () => {
    switch (selectedActivity) {
      case 'breathing':
        return <BreathingExercise />
      case 'grounding':
        return <GroundingExercise />
      case 'affirmations':
        return <Affirmations />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="flex items-center justify-between p-4 bg-white/80 backdrop-blur border-b border-pink-100">
        {selectedActivity ? (
          <button
            onClick={() => setSelectedActivity(null)}
            className="p-2 hover:bg-pink-50 rounded-full"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
        ) : (
          <Link to="/" className="p-2 hover:bg-pink-50 rounded-full">
            <ArrowLeft size={24} className="text-gray-600" />
          </Link>
        )}
        <h1 className="text-xl font-bold text-gray-800">
          {selectedActivity
            ? activities.find(a => a.id === selectedActivity)?.name
            : 'Calming Activities'}
        </h1>
        <div className="w-10" />
      </header>

      <main className="p-4 max-w-md mx-auto">
        {selectedActivity ? (
          <div className="bg-white/80 backdrop-blur rounded-3xl p-4 shadow-lg">
            {renderActivity()}
          </div>
        ) : (
          <>
            <p className="text-center text-gray-600 mb-6">
              Pick an activity to help you feel better! 🌟
            </p>

            <div className="space-y-4">
              {activities.map(activity => {
                const Icon = activity.icon
                return (
                  <button
                    key={activity.id}
                    onClick={() => setSelectedActivity(activity.id)}
                    className="w-full flex items-center gap-4 bg-white/80 backdrop-blur rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all text-left"
                  >
                    <div className={`p-3 rounded-xl ${activity.color}`}>
                      <Icon size={28} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-700 text-lg">
                        {activity.name}
                      </h3>
                      <p className="text-gray-500">{activity.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="mt-8 bg-yellow-50 rounded-2xl p-4 text-center">
              <span className="text-3xl block mb-2">💡</span>
              <p className="text-gray-700 text-sm">
                <strong>Tip:</strong> Try the breathing exercise when you feel
                worried, or the grounding exercise when thoughts feel too big!
              </p>
            </div>
          </>
        )}
      </main>

      <Navigation />
    </div>
  )
}
