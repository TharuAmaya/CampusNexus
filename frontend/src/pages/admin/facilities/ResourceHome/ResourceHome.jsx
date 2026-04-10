import { Link } from 'react-router-dom';
import DashboardLayout from '../../../../components/DashboardLayout.jsx';

function ResourceHome() {
  return (
    <DashboardLayout>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl backdrop-blur sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Facilities Management</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-800 sm:text-5xl">Resource Management Hub</h1>
        <p className="mt-5 max-w-2xl text-base text-slate-600 sm:text-lg">
          Add and maintain campus resources such as lecture halls, labs, meeting rooms, and equipment.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link
            to="/addresource"
            className="rounded-2xl bg-slate-900 px-6 py-4 text-center text-base font-semibold text-white transition hover:bg-slate-700"
          >
            Add New Resource
          </Link>
          <Link
            to="/displayresource"
            className="rounded-2xl border border-slate-300 bg-white px-6 py-4 text-center text-base font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            View All Resources
          </Link>
          <Link
            to="/"
            className="rounded-2xl border border-slate-300 bg-white px-6 py-4 text-center text-base font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Back To Home
          </Link>
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
}

export default ResourceHome;