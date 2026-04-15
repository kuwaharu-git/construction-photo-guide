import { useState } from 'react'
import { AppProvider } from './context/AppContext'
import { HomeScreen } from './screens/HomeScreen'
import { CameraScreen } from './screens/CameraScreen'

type Screen = 'home' | 'camera'

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home')

  return (
    <AppProvider>
      {currentScreen === 'home' ? (
        <HomeScreen onStartCamera={() => setCurrentScreen('camera')} />
      ) : (
        <CameraScreen onBack={() => setCurrentScreen('home')} />
      )}
    </AppProvider>
  )
}

export default App
