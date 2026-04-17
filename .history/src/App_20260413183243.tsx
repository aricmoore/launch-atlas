import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { RacePage } from '@/pages/RacePage'
import { DetailPage } from '@/pages/DetailPage'

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<RacePage />} />
        <Route path="/detail" element={<DetailPage />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}
