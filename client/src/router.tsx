import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { AlertsPage } from './pages/AlertsPage';
import { ConnectorsPage } from './pages/ConnectorsPage';
import { KpiExplorerPage } from './pages/KpiExplorerPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'campaigns', element: <CampaignsPage /> },
      { path: 'alerts', element: <AlertsPage /> },
      { path: 'connectors', element: <ConnectorsPage /> },
      { path: 'kpi/:kpiId', element: <KpiExplorerPage /> },
    ],
  },
]);
