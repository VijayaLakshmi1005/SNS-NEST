import { createBrowserRouter } from 'react-router-dom'
import App from '../App'
import ClientLayout from './layouts/ClientLayout'
import AdminApp from '../admin/routes/AdminApp'
import DesignerApp from '../designer/routes/DesignerApp'
import { ClientRoute, AdminRoute, PublicRoute } from './components/RouteGuards'

// Pages
import Dashboard from './dashboard/Dashboard'
import FloorPlanCenter from './dashboard/FloorPlanCenter'
import DesignCenter from './dashboard/DesignCenter'
import Login from './auth/Login'
import Register from './auth/Register'
import ForgotPassword from './auth/ForgotPassword'
import Designs from './designs/Designs'
import Booking from './booking/Booking'
import Consultations from './pages/Consultations'
import Estimate from './estimate/Estimate'
import Tracking from './tracking/Tracking'
import AiRoom from './ai-room/AiRoom'
import Chat from './chat/Chat'
import Wishlist from './wishlist/Wishlist'
import Support from './support/Support'

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
    element: <ClientRoute />,
    children: [
      {
        path: '',
        element: <ClientLayout />,
        children: [
          { path: 'dashboard', element: <Dashboard /> },
          { path: 'floor-plans', element: <FloorPlanCenter /> },
          { path: 'design-center', element: <DesignCenter /> },
          { path: 'master-plan', element: <FloorPlanCenter /> },
          { path: 'designs', element: <Designs /> },
          { path: 'booking', element: <Consultations /> },
          { path: 'estimate', element: <Estimate /> },
          { path: 'tracking', element: <Tracking /> },
          { path: 'ai-room', element: <AiRoom /> },
          { path: 'chat', element: <Chat /> },
          { path: 'wishlist', element: <Wishlist /> },
          { path: 'support', element: <Support /> },
          { path: 'payment', element: <Placeholder name="Payments" /> },
          { path: 'profile', element: <Placeholder name="User Profile" /> },
        ]
      }
    ]
  },
  {
    path: '/auth',
    element: <PublicRoute />,
    children: [
      {
        path: '',
        element: <ClientLayout />,
        children: [
          { path: 'login', element: <Login /> },
          { path: 'register', element: <Register /> },
          { path: 'forgot', element: <ForgotPassword /> },
        ]
      }
    ]
  },
  {
    path: '/admin/*',
    element: <AdminRoute />,
    children: [
      { path: '*', element: <AdminApp /> }
    ]
  }
])
