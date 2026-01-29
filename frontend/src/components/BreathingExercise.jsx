import { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'

const BREATH_CYCLE = {
  inhale: { duration: 4000, text: 'Breathe In', color: 'from-blue-300 to-blue-400' },
  hold: { duration: 4000, text: 'Hold', color: 'from-purple-300 to-purple-400' },
  exhale: { duration: 4000, text: 'Breathe Out', color: 'from-pink-300 to-pink-400' },
}

export default function BreathingExercise() {
  const [isActive, setIsActive] = useState(false)
  const [phase, setPhase] = useState('inhale')
  const [cycles, setCycles] = useState(0)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    if (!isActive) return

    const phases = ['inhale', 'hold', 'exhale']
    let currentIndex = phases.indexOf(phase)

    const timer = setTimeout(() => {
      const nextIndex = (currentIndex + 1) % phases.length
      const nextPhase = phases[nextIndex]
      setPhase(nextPhase)

      if (nextPhase === 'inhale') {
        setCycles(c => c + 1)
      }
    }, BREATH_CYCLE[phase].duration)

    return () => clearTimeout(timer)
  }, [isActive, phase])

  useEffect(() => {
    if (!isActive) {
      setScale(1)
      return
    }

    if (phase === 'inhale') {
      setScale(1.4)
    } else if (phase === 'exhale') {
      setScale(1)
    }
  }, [phase, isActive])

  const reset = () => {
    setIsActive(false)
    setPhase('inhale')
    setCycles(0)
    setScale(1)
  }

  const currentPhase = BREATH_CYCLE[phase]

  return (
    <div className="text-center py-6">
      <h3 className="text-xl font-bold text-gray-700 mb-6">Breathing Exercise</h3>

      {/* Breathing Circle */}
      <div className="relative w-48 h-48 mx-auto mb-6">
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${currentPhase.color} shadow-lg flex items-center justify-center transition-transform`}
          style={{
            transform: `scale(${scale})`,
            transitionDuration: `${currentPhase.duration}ms`,
            transitionTimingFunction: 'ease-in-out'
          }}
        >
          <span className="text-white text-xl font-bold">
            {isActive ? currentPhase.text : 'Ready?'}
          </span>
        </div>
      </div>

      {/* Cycle Counter */}
      {cycles > 0 && (
        <p className="text-gray-600 mb-4">
          Completed: <span className="font-bold text-primary-500">{cycles}</span> cycle{cycles !== 1 ? 's' : ''}
        </p>
      )}

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setIsActive(!isActive)}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
            isActive
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'bg-primary-500 text-white hover:bg-primary-600'
          }`}
        >
          {isActive ? <Pause size={20} /> : <Play size={20} />}
          {isActive ? 'Pause' : 'Start'}
        </button>

        <button
          onClick={reset}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 font-bold transition-all"
        >
          <RotateCcw size={20} />
          Reset
        </button>
      </div>

      <p className="text-sm text-gray-500 mt-6">
        Try to complete 3-5 cycles for best results!
      </p>
    </div>
  )
}
