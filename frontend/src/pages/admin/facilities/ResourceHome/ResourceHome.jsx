import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../../../components/DashboardLayout.jsx';

const API_BASE_URL = 'http://localhost:8081';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

function ResourceHome() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadResources = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(`${API_BASE_URL}/resources`, {
          method: 'GET',
          headers: {
            ...getAuthHeaders(),
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load resource statistics.');
        }

        const data = await response.json();
        setResources(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Unable to load resource statistics.');
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, []);

  const stats = useMemo(() => {
    const total = resources.length;
    const active = resources.filter((r) => r?.status === 'ACTIVE').length;
    const outOfService = resources.filter((r) => r?.status === 'OUT_OF_SERVICE').length;
    const totalCapacity = resources.reduce((sum, r) => sum + (Number(r?.capacity) || 0), 0);
    const avgCapacity = total > 0 ? Math.round(totalCapacity / total) : 0;

    return {
      total,
      active,
      outOfService,
      totalCapacity,
      avgCapacity,
    };
  }, [resources]);

  const typeBreakdown = useMemo(() => {
    const counts = resources.reduce((acc, item) => {
      const type = item?.type || 'UNKNOWN';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({ type, count }));
  }, [resources]);

  return (
    <DashboardLayout>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl backdrop-blur sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Facilities Management</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-800 sm:text-5xl">Resource Management Hub</h1>
        <p className="mt-5 max-w-2xl text-base text-slate-600 sm:text-lg">
          Add and maintain campus resources such as lecture halls, labs, meeting rooms, and equipment.
        </p>

        <div className="mt-8">
          {loading ? <p className="text-sm text-slate-500">Loading statistics...</p> : null}
          {!loading && error ? <p className="text-sm text-red-600">{error}</p> : null}

          {!loading && !error ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase text-slate-500">Total Resources</p>
                  <p className="mt-2 text-2xl font-bold text-slate-800">{stats.total}</p>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-xs font-semibold uppercase text-emerald-700">Active</p>
                  <p className="mt-2 text-2xl font-bold text-emerald-800">{stats.active}</p>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-xs font-semibold uppercase text-amber-700">Out Of Service</p>
                  <p className="mt-2 text-2xl font-bold text-amber-800">{stats.outOfService}</p>
                </div>
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                  <p className="text-xs font-semibold uppercase text-blue-700">Total Capacity</p>
                  <p className="mt-2 text-2xl font-bold text-blue-800">{stats.totalCapacity}</p>
                </div>
                <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
                  <p className="text-xs font-semibold uppercase text-violet-700">Avg Capacity</p>
                  <p className="mt-2 text-2xl font-bold text-violet-800">{stats.avgCapacity}</p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">Resources By Type</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {typeBreakdown.length ? (
                    typeBreakdown.map((entry) => (
                      <span
                        key={entry.type}
                        className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700"
                      >
                        {entry.type}: {entry.count}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">No resources yet.</span>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>

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