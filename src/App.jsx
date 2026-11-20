import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import ClienteDetalhe from './pages/ClienteDetalhe';
import Vendas from './pages/Vendas';
import Configuracoes from './pages/Configuracoes';
import Backup from './pages/Backup';
import Navbar from './components/Navbar';
import OfflineNotice from './components/OfflineNotice';
import InstallAppButton from './components/InstallAppButton';

function App() {
  return (
    <Router>
      <OfflineNotice />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/clientes/:clienteId" element={<ClienteDetalhe />} />
        <Route path="/vendas" element={<Vendas />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="/configuracoes/backup" element={<Backup />} />
        <Route path="/backup" element={<Backup />} />
      </Routes>
      <InstallAppButton />
      <Navbar />
    </Router>
  );
}

export default App;
