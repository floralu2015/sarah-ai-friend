import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Home from './pages/Home'
import Chat from './pages/Chat'
import Journal from './pages/Journal'
import Activities from './pages/Activities'
import Parent from './pages/Parent'

function App() {
  const [currentMood, setCurrentMood] = useState(null)
  const [messages, setMessages] = useState([])
  const [journalEntries, setJournalEntries] = useState([])
  const [moodHistory, setMoodHistory] = useState([])

  const logMood = (mood) => {
    setCurrentMood(mood)
    setMoodHistory(prev => [...prev, { mood, timestamp: new Date().toISOString() }])
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                currentMood={currentMood}
                onMoodSelect={logMood}
                moodHistory={moodHistory}
              />
            }
          />
          <Route
            path="/chat"
            element={
              <Chat
                currentMood={currentMood}
                messages={messages}
                setMessages={setMessages}
              />
            }
          />
          <Route
            path="/journal"
            element={
              <Journal
                entries={journalEntries}
                setEntries={setJournalEntries}
                messages={messages}
              />
            }
          />
          <Route path="/activities" element={<Activities />} />
          <Route
            path="/parent"
            element={
              <Parent
                moodHistory={moodHistory}
                messages={messages}
              />
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
