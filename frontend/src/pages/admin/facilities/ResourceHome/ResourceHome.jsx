import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../../../components/DashboardLayout.jsx';
import { FaBoxes, FaPlusCircle, FaListAlt, FaCalendarAlt, FaArrowLeft } from 'react-icons/fa';

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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-slate-100 px-4 py-10 sm:px-6 lg:px-8">
      <style>{`@keyframes facilitiesFadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl backdrop-blur sm:p-12" style={{ animation: 'facilitiesFadeUp 420ms ease-out both' }}>
        <div className="absolute -right-10 -top-8 h-36 w-36 rounded-full bg-cyan-200/40 blur-2xl" />
        <div className="absolute -bottom-16 left-20 h-48 w-48 rounded-full bg-blue-200/35 blur-3xl" />
        <div className="relative">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Facilities Management</p>
        <h1 className="mt-3 flex items-center gap-3 text-3xl font-bold text-slate-800 sm:text-5xl"><FaBoxes className="text-cyan-700" /> Resource Management Hub</h1>
        <p className="mt-5 max-w-2xl text-base text-slate-600 sm:text-lg">
          Add and maintain campus resources such as lecture halls, labs, meeting rooms, and equipment.
        </p>

        <div className="mt-8">
          {loading ? <p className="text-sm text-slate-500">Loading statistics...</p> : null}
          {!loading && error ? <p className="text-sm text-red-600">{error}</p> : null}

          {!loading && !error ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-sm">
                  <p className="text-xs font-semibold uppercase text-slate-500">Total Resources</p>
                  <p className="mt-2 text-2xl font-bold text-slate-800">{stats.total}</p>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 transition hover:-translate-y-0.5 hover:shadow-sm">
                  <p className="text-xs font-semibold uppercase text-emerald-700">Active</p>
                  <p className="mt-2 text-2xl font-bold text-emerald-800">{stats.active}</p>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 transition hover:-translate-y-0.5 hover:shadow-sm">
                  <p className="text-xs font-semibold uppercase text-amber-700">Out Of Service</p>
                  <p className="mt-2 text-2xl font-bold text-amber-800">{stats.outOfService}</p>
                </div>
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 transition hover:-translate-y-0.5 hover:shadow-sm">
                  <p className="text-xs font-semibold uppercase text-blue-700">Total Capacity</p>
                  <p className="mt-2 text-2xl font-bold text-blue-800">{stats.totalCapacity}</p>
                </div>
                <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 transition hover:-translate-y-0.5 hover:shadow-sm">
                  <p className="text-xs font-semibold uppercase text-cyan-700">Avg Capacity</p>
                  <p className="mt-2 text-2xl font-bold text-cyan-800">{stats.avgCapacity}</p>
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
                    <span className="inline-flex items-center gap-2 rounded-full border border-dashed border-slate-300 bg-slate-50 px-3 py-1 text-sm text-slate-500">
                      <span className="inline-block h-2 w-2 rounded-full bg-slate-400" />
                      No resources yet.
                    </span>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link
            to="/addresource"
            className="rounded-2xl bg-gradient-to-r from-slate-900 to-cyan-800 px-6 py-4 text-center text-base font-semibold text-white transition hover:from-slate-800 hover:to-cyan-700 active:translate-y-px active:scale-[0.99]"
          >
            <span className="inline-flex items-center gap-2"><FaPlusCircle /> Add New Resource</span>
          </Link>
          <Link
            to="/displayresource"
            className="rounded-2xl border border-slate-300 bg-white px-6 py-4 text-center text-base font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-100 active:translate-y-px active:scale-[0.99]"
          >
            <span className="inline-flex items-center gap-2"><FaListAlt /> View All Resources</span>
          </Link>
          <Link
            to="/resources/availability"
            className="rounded-2xl border border-cyan-300 bg-cyan-50 px-6 py-4 text-center text-base font-semibold text-cyan-700 transition hover:-translate-y-0.5 hover:bg-cyan-100 active:translate-y-px active:scale-[0.99]"
          >
            <span className="inline-flex items-center gap-2"><FaCalendarAlt /> Manage Availability Calendar</span>
          </Link>
          <Link
            to="/"
            className="rounded-2xl border border-slate-300 bg-white px-6 py-4 text-center text-base font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-100 active:translate-y-px active:scale-[0.99]"
          >
            <span className="inline-flex items-center gap-2"><FaArrowLeft /> Back To Home</span>
          </Link>
        </div>
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
}

export default ResourceHome;