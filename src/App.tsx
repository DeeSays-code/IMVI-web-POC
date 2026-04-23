import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Shell } from './components/Shell';
import { Login } from './screens/Login';
import { CheckEmail } from './screens/CheckEmail';
import { Dashboard } from './screens/Dashboard';
import { ReviewQueue } from './screens/ReviewQueue';
import { DesignWorkspace } from './screens/DesignWorkspace';
import { TeamsDirectory } from './screens/TeamsDirectory';
import { BulkOnboarding } from './screens/BulkOnboarding';
import { PlayerDetail } from './screens/PlayerDetail';
import { ImviPlus } from './screens/ImviPlus';
import { ViewportGate } from './components/ViewportGate';
import { AppStateProvider } from './state/AppState';

export default function App() {
  return (
    <ViewportGate>
      <AppStateProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/check-email" element={<CheckEmail />} />

            <Route element={<Shell />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/review" element={<ReviewQueue />} />
              <Route path="/design/new" element={<DesignWorkspace />} />
              <Route path="/design/:teamId" element={<DesignWorkspace />} />

              {/* Phase 2B — Teams, Bulk, Player Detail */}
              <Route path="/teams" element={<TeamsDirectory />} />
              <Route path="/bulk" element={<BulkOnboarding />} />
              <Route path="/player/:athleteId" element={<PlayerDetail />} />

              {/*
                v1.6 consolidation: Media / Users / Sponsorships no longer have
                standalone screens. Management controls for those concerns live
                inside Team drawer (§4.6) and Player Detail (§4.12). Legacy
                deep-links redirect to /teams so prior hrefs don't 404.
              */}
              <Route path="/media" element={<Navigate to="/teams" replace />} />
              <Route path="/users" element={<Navigate to="/teams" replace />} />
              <Route path="/sponsorships" element={<Navigate to="/teams" replace />} />

              <Route path="/imvi-plus" element={<ImviPlus />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AppStateProvider>
    </ViewportGate>
  );
}
