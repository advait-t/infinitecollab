import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import Whiteboard from './board/Whiteboard'

const router = createBrowserRouter([
  { path: '/', element: <App/> },
  { path: '/board/:id', element: <Whiteboard/> },
])
export default router
