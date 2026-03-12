import React from 'react'
import { MissionControl } from './modules/dashboard/MissionControl'
import './App.css'
import { Connect } from '@stacks/connect'
import { userSession, appConfig } from './lib/stacks-client'

function App() {
  return (
    <Connect authOptions={{
      appDetails: { name: 'Stacks Aegis', icon: window.location.origin + '/aegis-logo.png' },
      redirectTo: '/',
      userSession,
    }}>
      <div className="min-h-screen bg-[#E5E7EB]">
        <MissionControl />
      </div>
    </Connect>
  )
}

export default App
