import { createBrowserRouter } from 'react-router-dom'
import App from '../App'
import ClientLayout from './layouts/ClientLayout'

// Pages
import Dashboard from './dashboard/Dashboard'
import Login from './auth/Login'
import Register from './auth/Register'
import Designs from './designs/Designs'
import Booking from './booking/Booking'
import Estimate from './estimate/Estimate'
import Tracking from './tracking/Tracking'
import AiRoom from './ai-room/AiRoom'

// Temporary placeholders for remaining modules to ensure routing works
const Placeholder = ({ name }) => (
  <div className="w-full h-[60vh] flex items-center justify-center">
    <h1 className="text-3xl font-nav-style font-extrabold opacity-30">{name} Module</h1>
  </div>
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/client',
    element: <ClientLayout />,
    children: [
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'designs', element: <Designs /> },
      { path: 'booking', element: <Booking /> },
      { path: 'estimate', element: <Estimate /> },
      { path: 'tracking', element: <Tracking /> },
      { path: 'ai-room', element: <AiRoom /> },
      { path: 'chat', element: <Placeholder name="Chat & Messaging" /> },
      { path: 'wishlist', element: <Placeholder name="Wishlist" /> },
      { path: 'payment', element: <Placeholder name="Payments" /> },
      { path: 'profile', element: <Placeholder name="User Profile" /> },
    ]
  },
  {
    path: '/auth',
    element: <ClientLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
    ]
  }
])
