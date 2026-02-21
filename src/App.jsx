import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import ProfileForm from './pages/ProfileForm'
import Roadmap from './pages/Roadmap'
import DashboardLayout from './layouts/DashboardLayout'
import Quiz from './pages/Quiz'
import ResumeBuilder from './pages/ResumeBuilder'
import Profile from './pages/Profile'
import Certificates from './pages/Certificates'
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="resume-builder" element={<ResumeBuilder />} />
        </Route>

        <Route path="/profile" element={<ProfileForm />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/quiz/:skill" element={<Quiz />} />
      </Routes>
    </BrowserRouter>
  )
}

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CareerPath
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition shadow-md"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
              Your Personalized Path to
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Your Dream Career
              </span>
            </h1>
            <div className="flex justify-center space-x-4 mt-8">
              <Link
                to="/signup"
                className="px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Start Your Journey
              </Link>
            </div>
          </div>
        </div>
      </div>


    </div>
  )
}

export default App
