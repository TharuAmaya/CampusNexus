import { Outlet } from 'react-router-dom';
import Navigation from '../components/common/Navigation';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(198,119,119,0.2),rgba(255,255,255,0))] text-slate-50">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
