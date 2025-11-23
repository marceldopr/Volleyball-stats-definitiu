import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Dashboard } from '@/pages/Dashboard';
import { Teams } from '@/pages/Teams';
import { Players } from '@/pages/Players';
import { PlayerDetail } from '@/pages/PlayerDetail';
import { SettingsPage } from '@/pages/Settings';
import { About } from '@/pages/About';
import { Analytics } from '@/pages/Analytics';
import { Exports } from '@/pages/Exports';
import { NewMatch } from '@/pages/NewMatch';
import { Matches } from '@/pages/Matches';
import { MatchAnalysis } from '@/pages/MatchAnalysis';
import { Login } from '@/pages/Login';
import { ProtectedRoute } from '@/components/routing/ProtectedRoute';
import { useThemeStore } from '@/stores/themeStore';

function App() {
  const { isDarkMode } = useThemeStore();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <Router>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
                  <Sidebar />
                  <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/players" element={<Players />} />
                      <Route path="/players/:id" element={<PlayerDetail />} />
                      <Route path="/teams" element={<Teams />} />
                      <Route path="/matches" element={<Matches />} />
                      <Route path="/matches/new" element={<NewMatch />} />
                      <Route path="/matches/:id/analysis" element={<MatchAnalysis />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/exports" element={<Exports />} />
                      <Route path="/about" element={<About />} />
                      {/* Fallback */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;