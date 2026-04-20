import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CreateProjectPage from './pages/CreateProjectPage';
import ImportDatasetsPage from './pages/ImportDatasetsPage';
import BubbleMapPage from './pages/BubbleMapPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/create" element={<CreateProjectPage />} />
        <Route path="/import/:projectId" element={<ImportDatasetsPage />} />
        <Route path="/view/:projectId" element={<BubbleMapPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
