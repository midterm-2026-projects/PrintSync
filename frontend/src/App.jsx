import { BrowserRouter, Route, Routes } from "react-router"
import AppHeader from "./features/components/AppHeader"
import Inventory from "./pages/Inventory"
import POS from "./pages/POS"
import Analytics from "./pages/Analytics"

export function AppRoutes() {
    return (
        <>
            <AppHeader />
            <Routes>
                <Route path="/" element={<Inventory />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/pos" element={<POS />} />
                <Route path="/analytics" element={<Analytics />} />
            </Routes>
        </>
    )
}

function App() {
    return (
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    )
}

export default App
