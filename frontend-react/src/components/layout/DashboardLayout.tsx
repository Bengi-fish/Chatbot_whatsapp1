import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ExportMenu } from '../ExportMenu';
import { AccesibilityMenu } from '../AccesibilityMenu';
import './DashboardLayout.css';

export function DashboardLayout() {
  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <main className="main-content">
        <Header />
        <div className="content-area">
          <Outlet />
        </div>
      </main>
      <ExportMenu />
      <AccesibilityMenu />
    </div>
  );
}
