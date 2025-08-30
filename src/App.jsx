import React from 'react'
import ChatBotPage from './components/Chatbot'
import ResponsePage from './components/ResponsePage'
import './index.css'

const App = () => {
  return (
    <div className="text-white p-4">
      <ChatBotPage />
      <ResponsePage />
    </div>
  )
}

export default App