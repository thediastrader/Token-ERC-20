import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navigation from './components/Navigation'
import SkillTree from './pages/SkillTree'
import SubmitEvidence from './pages/SubmitEvidence'
import AdminPanel from './pages/AdminPanel'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Navigation />
        <main className="container mx-auto px-4 py-10 max-w-5xl">
          <Routes>
            <Route path="/" element={<SkillTree />} />
            <Route path="/submit" element={<SubmitEvidence />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
