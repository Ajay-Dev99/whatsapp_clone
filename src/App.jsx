import LandingPage from "./pages/LandingPage"
import HomePage from "./pages/HomePage";
import { RouterProvider } from "react-router-dom";
import router from "./Router/Route";


function App() {

  return (
    <RouterProvider router={router} />
  )
}

export default App
