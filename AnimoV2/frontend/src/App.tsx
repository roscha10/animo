import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import NecesitoAyuda from "./pages/NecesitoAyuda";
import Gracias from "./pages/Gracias";
import PsicologoLogin from "./pages/PsicologoLogin";
import PsicologoRegistro from "./pages/PsicologoRegistro";
import Dashboard from "./pages/Dashboard";
import Sesion from "./pages/Sesion";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/necesito-ayuda" element={<NecesitoAyuda />} />
        <Route path="/gracias" element={<Gracias />} />
        <Route path="/psicologo/login" element={<PsicologoLogin />} />
        <Route path="/psicologo/registro" element={<PsicologoRegistro />} />
        <Route path="/psicologo/dashboard" element={<Dashboard />} />
        <Route path="/sesion/:id" element={<Sesion />} />
      </Routes>
    </BrowserRouter>
  );
}
