import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ProjectOverviewPage from './pages/ProjectOverviewPage';
import CreateProjectPage from './pages/CreateProjectPage';
import ImportDatasetsPage from './pages/ImportDatasetsPage';
import BubbleMapPage from './pages/BubbleMapPage';
import CreateSkillMapPage from './pages/CreateSkillMapPage';
import UploadSkillsPage from './pages/UploadSkillsPage';
import PersonSkillPage from './pages/PersonSkillPage';
import SkillSearchPage from './pages/SkillSearchPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/projects" element={<ProjectOverviewPage />} />

        {/* BubbleMap Flow */}
        <Route path="/create" element={<CreateProjectPage />} />
        <Route path="/import/:projectId" element={<ImportDatasetsPage />} />
        <Route path="/view/:projectId" element={<BubbleMapPage />} />

        {/* SkillMap Flow */}
        <Route path="/skillmap/create" element={<CreateSkillMapPage />} />
        <Route path="/skillmap/:projectId/upload" element={<UploadSkillsPage />} />
        <Route path="/skillmap/:projectId/person/:personId" element={<PersonSkillPage />} />
        <Route path="/skillmap/:projectId/search" element={<SkillSearchPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


