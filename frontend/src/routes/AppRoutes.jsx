import { Route, Routes } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import DashboardPage from '../pages/DashboardPage';
import NewRequestPage from '../pages/NewRequestPage';
import RequestDetailsPage from '../pages/RequestDetailsPage';
import SupervisorPage from '../pages/SupervisorPage';
import NotFoundPage from '../pages/NotFoundPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="requests/new" element={<NewRequestPage />} />
        <Route path="requests/:id" element={<RequestDetailsPage />} />
        <Route path="monitor" element={<SupervisorPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
