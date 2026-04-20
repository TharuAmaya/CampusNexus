import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import DashboardLayout from '../../../components/DashboardLayout.jsx';
import { FaCalendarAlt, FaPlusCircle } from 'react-icons/fa';

const API_BASE_URL = 'http://localhost:8081';

const toDateInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const toDateTimeInput = (date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

const startOfDay = (dateText) => `${dateText}T00:00:00`;
const endOfDay = (dateText) => `${dateText}T23:59:59`;

const addDays = (dateText, days) => {
  const date = new Date(`${dateText}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toDateInput(date);
};

const getMonthRange = (dateText) => {
  const date = new Date(`${dateText}T00:00:00`);
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { from: toDateInput(first), to: toDateInput(last) };
};

const getToken = () => localStorage.getItem('token');
const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const getUserRole = () => {
  try {
    const token = getToken();
    if (!token) return null;
    return jwtDecode(token)?.role || null;
  } catch {
    return null;
  }
};

function ResourceAvailabilityCalendar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [resources, setResources] = useState([]);
  const [resourceId, setResourceId] = useState(searchParams.get('resourceId') || '');
  const [weekStartDate, setWeekStartDate] = useState(toDateInput(new Date()));
  const [viewMode, setViewMode] = useState('week');
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    startAt: toDateTimeInput(new Date()),
    endAt: toDateTimeInput(new Date(Date.now() + 60 * 60 * 1000)),
    type: 'AVAILABLE',
    note: '',
  });
  const [saving, setSaving] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState(null);
  const [editForm, setEditForm] = useState({
    startAt: '',
    endAt: '',
    type: 'AVAILABLE',
    note: '',
  });

  const role = getUserRole();
  const isAdmin = role === 'ROLE_ADMIN';

  useEffect(() => {
    const loadResources = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/resources`, {
          headers: {
            ...getAuthHeaders(),
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load resources for availability view.');
        }

        const data = await response.json();
        const list = Array.isArray(data) ? data : [];
        setResources(list);

        if (!resourceId && list.length > 0) {
          const defaultId = String(list[0].resourceId);
          setResourceId(defaultId);
          setSearchParams({ resourceId: defaultId });
        }
      } catch (err) {
        setError(err.message || 'Unable to load resources.');
      }
    };

    loadResources();
  }, []);

  const range = useMemo(() => {
    if (viewMode === 'month') {
      const month = getMonthRange(weekStartDate);
      return {
        from: startOfDay(month.from),
        to: endOfDay(month.to),
      };
    }

    const from = startOfDay(weekStartDate);
    const to = endOfDay(addDays(weekStartDate, 6));
    return { from, to };
  }, [weekStartDate, viewMode]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, index) => {
      const dateText = addDays(weekStartDate, index);
      const dateObj = new Date(`${dateText}T00:00:00`);
      return {
        dateText,
        label: dateObj.toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
      };
    });
  }, [weekStartDate]);

  const monthCells = useMemo(() => {
    const month = getMonthRange(weekStartDate);
    const first = new Date(`${month.from}T00:00:00`);
    const totalDays = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const leading = first.getDay();

    const cells = [];
    for (let i = 0; i < leading; i += 1) {
      cells.push({ key: `empty-${i}`, empty: true });
    }

    for (let day = 1; day <= totalDays; day += 1) {
      const date = new Date(first.getFullYear(), first.getMonth(), day);
      const dateText = toDateInput(date);
      cells.push({
        key: dateText,
        empty: false,
        day,
        dateText,
      });
    }

    return cells;
  }, [weekStartDate]);

  const loadBlocks = async () => {
    if (!resourceId) {
      setBlocks([]);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const query = `from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`;
      const response = await fetch(`${API_BASE_URL}/resources/${resourceId}/availability-blocks?${query}`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load availability blocks.');
      }

      const data = await response.json();
      setBlocks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Unable to load availability blocks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (resourceId) {
      setSearchParams({ resourceId: String(resourceId) });
    }
    loadBlocks();
  }, [resourceId, range.from, range.to]);

  const blocksByDay = useMemo(() => {
    const map = {};

    blocks.forEach((block) => {
      const startDate = new Date(block.startAt);
      const endDate = new Date(block.endAt);
      const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const endDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

      while (cursor <= endDay) {
        const key = toDateInput(cursor);
        if (!map[key]) {
          map[key] = [];
        }
        map[key].push(block);
        cursor.setDate(cursor.getDate() + 1);
      }
    });

    return map;
  }, [blocks]);

  const weeklyCards = useMemo(() => {
    return weekDays.map((day) => ({
      ...day,
      items: blocksByDay[day.dateText] || [],
    }));
  }, [weekDays, blocksByDay]);

  const selectedResource = useMemo(
    () => resources.find((item) => String(item.resourceId) === String(resourceId)),
    [resources, resourceId],
  );

  const handleCreateBlock = async (event) => {
    event.preventDefault();
    if (!isAdmin || !resourceId) return;

    try {
      setSaving(true);
      setError('');

      const response = await fetch(`${API_BASE_URL}/resources/${resourceId}/availability-blocks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          startAt: form.startAt,
          endAt: form.endAt,
          type: form.type,
          note: form.note,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody?.message || 'Failed to create availability block.');
      }

      await loadBlocks();
      setForm((prev) => ({ ...prev, note: '' }));
    } catch (err) {
      setError(err.message || 'Unable to create availability block.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBlock = async (blockId) => {
    if (!isAdmin || !resourceId) return;

    const shouldDelete = window.confirm('Are you sure you want to delete this availability block?');
    if (!shouldDelete) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/resources/${resourceId}/availability-blocks/${blockId}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody?.message || 'Failed to delete availability block.');
      }

      await loadBlocks();
    } catch (err) {
      setError(err.message || 'Unable to delete availability block.');
    }
  };

  const handleStartEdit = (block) => {
    setEditingBlockId(block.id);
    setEditForm({
      startAt: toDateTimeInput(new Date(block.startAt)),
      endAt: toDateTimeInput(new Date(block.endAt)),
      type: block.type,
      note: block.note || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingBlockId(null);
    setEditForm({
      startAt: '',
      endAt: '',
      type: 'AVAILABLE',
      note: '',
    });
  };

  const handleUpdateBlock = async (blockId) => {
    if (!isAdmin || !resourceId) return;

    try {
      setError('');

      const response = await fetch(`${API_BASE_URL}/resources/${resourceId}/availability-blocks/${blockId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody?.message || 'Failed to update availability block.');
      }

      handleCancelEdit();
      await loadBlocks();
    } catch (err) {
      setError(err.message || 'Unable to update availability block.');
    }
  };

  const getTagClass = (type) => {
    if (type === 'AVAILABLE') return 'bg-emerald-100 text-emerald-700';
    if (type === 'MAINTENANCE') return 'bg-amber-100 text-amber-800';
    return 'bg-rose-100 text-rose-700';
  };

  const renderBlock = (block) => {
    const isEditing = editingBlockId === block.id;

    if (isEditing) {
      return (
        <div key={block.id} className="rounded-xl border border-blue-200 bg-blue-50 p-3">
          <div className="grid gap-2">
            <input
              type="datetime-local"
              value={editForm.startAt}
              onChange={(e) => setEditForm((prev) => ({ ...prev, startAt: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
            />
            <input
              type="datetime-local"
              value={editForm.endAt}
              onChange={(e) => setEditForm((prev) => ({ ...prev, endAt: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
            />
          </div>
          <select
            value={editForm.type}
            onChange={(e) => setEditForm((prev) => ({ ...prev, type: e.target.value }))}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
          >
            <option value="AVAILABLE">Available</option>
            <option value="UNAVAILABLE">Unavailable</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
          <textarea
            rows={2}
            maxLength={500}
            value={editForm.note}
            onChange={(e) => setEditForm((prev) => ({ ...prev, note: e.target.value }))}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800"
            placeholder="Note"
          />
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleUpdateBlock(block.id)}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 active:translate-y-px active:scale-[0.98]"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 active:translate-y-px active:scale-[0.98]"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    return (
      <div key={block.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getTagClass(block.type)}`}>
            {block.type}
          </span>
          {isAdmin ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleStartEdit(block)}
                className="text-xs font-semibold text-blue-600 transition hover:text-blue-700 active:translate-y-px"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDeleteBlock(block.id)}
                className="text-xs font-semibold text-rose-600 transition hover:text-rose-700 active:translate-y-px"
              >
                Delete
              </button>
            </div>
          ) : null}
        </div>
        <p className="mt-2 text-xs text-slate-700">
          {new Date(block.startAt).toLocaleString()} - {new Date(block.endAt).toLocaleString()}
        </p>
        {block.note ? <p className="mt-1 text-xs text-slate-600">{block.note}</p> : null}
      </div>
    );
  };

  return (
    <DashboardLayout title="Resource Availability Calendar">
      <div className="space-y-6">
        <style>{`@keyframes facilitiesFadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-cyan-50 via-white to-blue-100 p-5 shadow-sm" style={{ animation: 'facilitiesFadeUp 420ms ease-out both' }}>
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-200/45 blur-2xl" />
          <div className="absolute -bottom-10 left-16 h-36 w-36 rounded-full bg-blue-200/35 blur-2xl" />
          <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Planner</p>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-800"><FaCalendarAlt className="text-cyan-700" /> Resource Availability Calendar</h2>
          <p className="mt-1 text-sm text-slate-600">
            View weekly availability windows and maintenance blocks per resource.
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <select
              value={resourceId}
              onChange={(e) => setResourceId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <option value="">Select a resource</option>
              {resources.map((item) => (
                <option key={item.resourceId} value={item.resourceId}>
                  #{item.resourceId} - {item.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={weekStartDate}
              onChange={(e) => setWeekStartDate(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />

            <div className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm text-slate-700">
              {selectedResource
                ? `${selectedResource.name} | ${selectedResource.type}`
                : 'Choose a resource to view schedule'}
            </div>
          </div>

          <div className="mt-3 inline-flex rounded-xl border border-slate-300 bg-white p-1">
            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition active:translate-y-px active:scale-[0.98] ${viewMode === 'week' ? 'bg-cyan-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Week View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('month')}
              className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition active:translate-y-px active:scale-[0.98] ${viewMode === 'month' ? 'bg-cyan-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Month View
            </button>
          </div>
          </div>
        </div>

        {isAdmin && resourceId ? (
          <form onSubmit={handleCreateBlock} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200" style={{ animation: 'facilitiesFadeUp 520ms ease-out both' }}>
            <h3 className="inline-flex items-center gap-2 text-base font-semibold text-slate-800"><FaPlusCircle className="text-cyan-700" /> Add Availability Block</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-12">
              <input
                type="datetime-local"
                value={form.startAt}
                onChange={(e) => setForm((prev) => ({ ...prev, startAt: e.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 xl:col-span-4"
                required
              />
              <input
                type="datetime-local"
                value={form.endAt}
                onChange={(e) => setForm((prev) => ({ ...prev, endAt: e.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 xl:col-span-4"
                required
              />
              <select
                value={form.type}
                onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 xl:col-span-2"
              >
                <option value="AVAILABLE">Available</option>
                <option value="UNAVAILABLE">Unavailable</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-cyan-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-cyan-800 active:translate-y-px active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 xl:col-span-2"
              >
                {saving ? 'Saving...' : 'Add Block'}
              </button>
            </div>
            <textarea
              value={form.note}
              onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
              placeholder="Optional note (e.g., Maintenance block due to electrical checks)"
              maxLength={500}
              className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              rows={2}
            />
          </form>
        ) : null}

        {loading ? <div className="text-slate-600">Loading calendar...</div> : null}
        {error ? <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">{error}</div> : null}

        {!loading && resourceId && viewMode === 'week' ? (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {weeklyCards.map((day) => (
              <div key={day.dateText} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-800">{day.label}</h4>
                  <span className="text-xs text-slate-500">{day.items.length} blocks</span>
                </div>

                <div className="mt-3 space-y-2">
                  {day.items.length ? (
                    day.items.map((block) => renderBlock(block))
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-xs text-slate-500">
                      <div className="mb-2 h-6 w-6 rounded border border-slate-400" />
                      No blocks for this day.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {!loading && resourceId && viewMode === 'month' ? (
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="mb-3 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {monthCells.map((cell) => {
                if (cell.empty) {
                  return <div key={cell.key} className="min-h-28 rounded-lg border border-transparent" />;
                }

                const items = blocksByDay[cell.dateText] || [];
                return (
                  <div key={cell.key} className="min-h-28 rounded-lg border border-slate-200 bg-slate-50 p-2">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-800">{cell.day}</span>
                      <span className="text-[10px] text-slate-500">{items.length}</span>
                    </div>
                    <div className="space-y-1">
                      {items.slice(0, 2).map((block) => (
                        isAdmin ? (
                          <button
                            key={`${cell.key}-${block.id}`}
                            type="button"
                            onClick={() => handleStartEdit(block)}
                            className={`w-full truncate rounded px-2 py-1 text-left text-[10px] font-semibold transition active:scale-[0.98] ${getTagClass(block.type)}`}
                            title={`${block.type} | ${new Date(block.startAt).toLocaleString()} - ${new Date(block.endAt).toLocaleString()}`}
                          >
                            {block.type}
                          </button>
                        ) : (
                          <div
                            key={`${cell.key}-${block.id}`}
                            className={`w-full truncate rounded px-2 py-1 text-left text-[10px] font-semibold ${getTagClass(block.type)}`}
                            title={`${block.type} | ${new Date(block.startAt).toLocaleString()} - ${new Date(block.endAt).toLocaleString()}`}
                          >
                            {block.type}
                          </div>
                        )
                      ))}
                      {items.length > 2 ? (
                        <div className="text-[10px] text-slate-500">+{items.length - 2} more</div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-slate-500">Tip: Use Week View to edit and manage individual blocks.</p>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}

export default ResourceAvailabilityCalendar;
