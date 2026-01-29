import { useState } from 'react'
import { Check, ChevronRight, RotateCcw } from 'lucide-react'

const steps = [
  { sense: '👀 See', count: 5, prompt: 'Name 5 things you can SEE right now', color: 'bg-blue-100 border-blue-300' },
  { sense: '✋ Touch', count: 4, prompt: 'Name 4 things you can TOUCH or FEEL', color: 'bg-green-100 border-green-300' },
  { sense: '👂 Hear', count: 3, prompt: 'Name 3 things you can HEAR', color: 'bg-yellow-100 border-yellow-300' },
  { sense: '👃 Smell', count: 2, prompt: 'Name 2 things you can SMELL', color: 'bg-purple-100 border-purple-300' },
  { sense: '👅 Taste', count: 1, prompt: 'Name 1 thing you can TASTE', color: 'bg-pink-100 border-pink-300' },
]

export default function GroundingExercise() {
  const [currentStep, setCurrentStep] = useState(0)
  const [completed, setCompleted] = useState([])
  const [isFinished, setIsFinished] = useState(false)

  const handleComplete = () => {
    const newCompleted = [...completed, currentStep]
    setCompleted(newCompleted)

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setIsFinished(true)
    }
  }

  const reset = () => {
    setCurrentStep(0)
    setCompleted([])
    setIsFinished(false)
  }

  if (isFinished) {
    return (
      <div className="text-center py-8">
        <span className="text-6xl block mb-4">🎉</span>
        <h3 className="text-2xl font-bold text-gray-700 mb-2">Amazing job!</h3>
        <p className="text-gray-600 mb-6">
          You completed the 5-4-3-2-1 grounding exercise!<br />
          How do you feel now?
        </p>
        <button
          onClick={reset}
          className="flex items-center gap-2 mx-auto px-6 py-3 rounded-full bg-primary-500 text-white hover:bg-primary-600 font-bold transition-all"
        >
          <RotateCcw size={20} />
          Do it again
        </button>
      </div>
    )
  }

  const step = steps[currentStep]

  return (
    <div className="py-6">
      <h3 className="text-xl font-bold text-gray-700 mb-2 text-center">
        5-4-3-2-1 Grounding
      </h3>
      <p className="text-sm text-gray-500 text-center mb-6">
        This helps you feel calm and present
      </p>

      {/* Progress */}
      <div className="flex justify-center gap-2 mb-6">
        {steps.map((s, i) => (
          <div
            key={i}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all ${
              completed.includes(i)
                ? 'bg-excited text-white'
                : i === currentStep
                ? 'bg-primary-500 text-white scale-110'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            {completed.includes(i) ? <Check size={20} /> : s.count}
          </div>
        ))}
      </div>

      {/* Current Step Card */}
      <div className={`${step.color} border-2 rounded-2xl p-6 text-center mb-6`}>
        <span className="text-4xl block mb-3">{step.sense.split(' ')[0]}</span>
        <p className="text-xl font-bold text-gray-700 mb-2">{step.prompt}</p>
        <p className="text-gray-600">
          Think of {step.count} thing{step.count > 1 ? 's' : ''}, then tap the button below!
        </p>
      </div>

      {/* Action Button */}
      <button
        onClick={handleComplete}
        className="flex items-center gap-2 mx-auto px-8 py-4 rounded-full bg-primary-500 text-white hover:bg-primary-600 font-bold text-lg transition-all"
      >
        I did it!
        <ChevronRight size={24} />
      </button>
    </div>
  )
}
