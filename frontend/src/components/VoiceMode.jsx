import { useState, useEffect, useRef } from 'react'
import { Mic, X, Volume2, VolumeX } from 'lucide-react'

export default function VoiceMode({ onMessage, onClose, lastAssistantMessage }) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)
  const synthRef = useRef(window.speechSynthesis)

  useEffect(() => {
    // Check for browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Your browser does not support voice input. Try using Chrome!')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.continuous = false
    recognitionRef.current.interimResults = true
    recognitionRef.current.lang = 'en-US'

    recognitionRef.current.onresult = (event) => {
      const current = event.resultIndex
      const result = event.results[current]
      const text = result[0].transcript
      setTranscript(text)

      if (result.isFinal) {
        onMessage(text)
        setTranscript('')
        setIsListening(false)
      }
    }

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      if (event.error === 'not-allowed') {
        setError('Please allow microphone access to use voice mode!')
      }
    }

    recognitionRef.current.onend = () => {
      setIsListening(false)
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
      synthRef.current.cancel()
    }
  }, [onMessage])

  // Speak the last assistant message when it changes
  useEffect(() => {
    if (lastAssistantMessage && synthRef.current) {
      speakText(lastAssistantMessage)
    }
  }, [lastAssistantMessage])

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      synthRef.current.cancel() // Stop any ongoing speech
      setIsSpeaking(false)
      setTranscript('')
      recognitionRef.current?.start()
      setIsListening(true)
    }
  }

  const speakText = (text) => {
    if (!synthRef.current) return

    synthRef.current.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9 // Slightly slower for kids
    utterance.pitch = 1.1 // Slightly higher pitch for friendliness

    // Try to find a friendly voice
    const voices = synthRef.current.getVoices()
    const friendlyVoice = voices.find(v =>
      v.name.includes('Samantha') ||
      v.name.includes('Karen') ||
      v.name.includes('Female') ||
      v.lang === 'en-US'
    )
    if (friendlyVoice) {
      utterance.voice = friendlyVoice
    }

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    synthRef.current.speak(utterance)
  }

  const stopSpeaking = () => {
    synthRef.current.cancel()
    setIsSpeaking(false)
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border-t border-red-200">
        <div className="flex items-center justify-between">
          <p className="text-red-600">{error}</p>
          <button onClick={onClose} className="text-red-400 hover:text-red-600">
            <X size={20} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 border-t border-pink-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-lg font-bold text-gray-700">Voice Mode</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
      </div>

      <div className="flex items-center justify-center gap-6">
        {/* Listen Button */}
        <div className="text-center">
          <button
            onClick={toggleListening}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              isListening
                ? 'bg-primary-500 text-white voice-pulse'
                : 'bg-white text-primary-500 border-2 border-primary-300 hover:border-primary-500'
            }`}
          >
            <Mic size={28} />
          </button>
          <p className="text-sm text-gray-600 mt-2">
            {isListening ? 'Listening...' : 'Tap to talk'}
          </p>
        </div>

        {/* Speaker Button */}
        <div className="text-center">
          <button
            onClick={isSpeaking ? stopSpeaking : () => lastAssistantMessage && speakText(lastAssistantMessage)}
            disabled={!lastAssistantMessage}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              isSpeaking
                ? 'bg-excited text-white animate-pulse'
                : 'bg-white text-excited border-2 border-green-300 hover:border-green-500 disabled:opacity-50'
            }`}
          >
            {isSpeaking ? <VolumeX size={28} /> : <Volume2 size={28} />}
          </button>
          <p className="text-sm text-gray-600 mt-2">
            {isSpeaking ? 'Stop' : 'Hear again'}
          </p>
        </div>
      </div>

      {/* Transcript Display */}
      {transcript && (
        <div className="mt-4 p-3 bg-white rounded-xl text-center">
          <p className="text-gray-700 italic">"{transcript}"</p>
        </div>
      )}
    </div>
  )
}
