import React, { useState, useEffect, useCallback } from 'react';
import { goalApi } from '../../api/goal.api';

export default function GoalsWidget({ variant = 'todo', onOpenCreateRoom }) {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'active' | 'completed'
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchGoals = useCallback(async () => {
    try {
      const response = await goalApi.getGoals();
      setGoals(response.data?.goals || []);
    } catch (err) {
      console.error('[Goals] Failed to fetch goals:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const response = await goalApi.getGoals();
        if (!ignore) {
          setGoals(response.data?.goals || []);
        }
      } catch (err) {
        console.error('[Goals] Failed to fetch goals:', err);
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const handleAddGoal = async (e) => {
    if (e) e.preventDefault();
    const trimmed = newTitle.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    try {
      const response = await goalApi.createGoal({
        title: trimmed,
        targetCount: Number(newTarget) || 1,
        category: 'STUDY',
      });
      const created = response.data?.goal;
      if (created) {
        setGoals((prev) => [created, ...prev]);
        setNewTitle('');
        setNewTarget(1);
        setShowAddForm(false);
      }
    } catch (err) {
      alert(err.message || 'Failed to add goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (goalId) => {
    // Optimistic update
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        const nextCompleted = !g.completed;
        return {
          ...g,
          completed: nextCompleted,
          currentCount: nextCompleted ? g.targetCount : Math.max(0, g.currentCount - 1),
        };
      })
    );

    try {
      await goalApi.toggleGoal(goalId);
    } catch (err) {
      console.error('[Goals] Error toggling goal:', err);
      // Rollback on error
      fetchGoals();
    }
  };

  const handleIncrement = async (goal, e) => {
    e.stopPropagation();
    if (goal.completed) return;

    const nextCount = goal.currentCount + 1;
    const isNowCompleted = nextCount >= goal.targetCount;

    // Optimistic update
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goal.id
          ? { ...g, currentCount: nextCount, completed: isNowCompleted }
          : g
      )
    );

    try {
      await goalApi.updateGoal(goal.id, { currentCount: nextCount });
    } catch (err) {
      console.error('[Goals] Error updating goal:', err);
      fetchGoals();
    }
  };

  const handleDelete = async (goalId, e) => {
    if (e) e.stopPropagation();
    // Optimistic remove
    setGoals((prev) => prev.filter((g) => g.id !== goalId));

    try {
      await goalApi.deleteGoal(goalId);
    } catch (err) {
      console.error('[Goals] Error deleting goal:', err);
      fetchGoals();
    }
  };

  const filteredGoals = goals.filter((g) => {
    if (activeTab === 'active') return !g.completed;
    if (activeTab === 'completed') return g.completed;
    return true;
  });

  const completedCount = goals.filter((g) => g.completed).length;
  const totalCount = goals.length;
  const overallPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Todo list variant
  if (variant === 'todo') {
    return (
      <div className="bg-white dark:bg-[#1C1E25] border border-[#EAE5DE] dark:border-[#2D303A] rounded-3xl p-5 shadow-xs space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">🎯</span>
            <h3 className="font-heading font-extrabold text-base text-[#18191F] dark:text-[#F3F4F6]">
              My Goals & To-Dos
            </h3>
          </div>
          <span className="text-xs font-bold text-[#543FE3] dark:text-[#A798FF] bg-[#F3EEFE] dark:bg-[#2A2445] px-2.5 py-0.5 rounded-full border border-[#E5DBFD] dark:border-[#3D3466]">
            {completedCount}/{totalCount} done
          </span>
        </div>

        {/* Overall Progress Bar */}
        {totalCount > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-[#717382] dark:text-[#9A9CA8] font-medium">
              <span>Progress</span>
              <span>{overallPct}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#543FE3] transition-all duration-300"
                style={{ width: `${overallPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Quick Add To-Do Input */}
        <form onSubmit={handleAddGoal} className="flex items-center gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add a goal or task... (Press Enter)"
            className="flex-1 bg-[#FAF9F6] dark:bg-[#252833] border border-[#E5E1D8] dark:border-[#383B47] text-xs text-[#18191F] dark:text-[#F3F4F6] rounded-xl px-3 py-2 outline-none focus:border-[#543FE3] transition-colors placeholder:text-[#A0A2B0]"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={!newTitle.trim() || isSubmitting}
            className="px-3.5 py-2 rounded-xl bg-[#543FE3] hover:bg-[#432ec4] disabled:opacity-40 text-white font-bold text-xs transition-all cursor-pointer shrink-0 shadow-2xs"
          >
            + Add
          </button>
        </form>

        {/* Filter Tabs */}
        {totalCount > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] border-b border-gray-100 dark:border-gray-800 pb-2">
            {[
              { id: 'all', label: `All (${totalCount})` },
              { id: 'active', label: `Pending (${totalCount - completedCount})` },
              { id: 'completed', label: `Completed (${completedCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#543FE3] text-white'
                    : 'text-[#717382] dark:text-[#9A9CA8] hover:bg-gray-100 dark:hover:bg-[#252833]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* To-Do List */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="py-6 text-center text-xs text-[#717382] dark:text-[#9A9CA8]">
              Loading your tasks...
            </div>
          ) : filteredGoals.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#717382] dark:text-[#9A9CA8]">
              {totalCount === 0
                ? 'No tasks yet. Add your first goal above!'
                : `No ${activeTab} goals found.`}
            </div>
          ) : (
            filteredGoals.map((goal) => {
              const pct = Math.min(
                100,
                Math.round(((goal.currentCount || 0) / (goal.targetCount || 1)) * 100)
              );

              return (
                <div
                  key={goal.id}
                  onClick={() => handleToggle(goal.id)}
                  className={`group p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2.5 cursor-pointer select-none ${
                    goal.completed
                      ? 'bg-gray-50/70 dark:bg-[#181920]/60 border-gray-200 dark:border-gray-800 opacity-60'
                      : 'bg-[#FAF9F6] dark:bg-[#242732] border-[#EAE5DE] dark:border-[#2D303A] hover:border-[#543FE3]/50'
                  }`}
                >
                  {/* Left: Custom Checkbox + Title */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center transition-all shrink-0 ${
                        goal.completed
                          ? 'bg-[#543FE3] text-white border border-[#543FE3]'
                          : 'border-2 border-gray-400 dark:border-gray-600 group-hover:border-[#543FE3]'
                      }`}
                    >
                      {goal.completed && <span className="text-[10px] font-black leading-none">✓</span>}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs font-semibold truncate ${
                          goal.completed
                            ? 'line-through text-gray-500 dark:text-gray-400'
                            : 'text-[#18191F] dark:text-[#F3F4F6]'
                        }`}
                      >
                        {goal.title}
                      </p>
                      {goal.targetCount > 1 && (
                        <span className="text-[10px] text-[#717382] dark:text-[#9A9CA8]">
                          {goal.currentCount}/{goal.targetCount} ({pct}%)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Actions: Quick Increment + Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    {goal.targetCount > 1 && !goal.completed && (
                      <button
                        type="button"
                        onClick={(e) => handleIncrement(goal, e)}
                        title="Increment progress"
                        className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-[#543FE3] dark:text-[#B6A8FF] text-xs font-bold flex items-center justify-center hover:scale-110 transition-transform"
                      >
                        +
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleDelete(goal.id, e)}
                      title="Delete goal"
                      className="text-gray-400 hover:text-rose-500 text-xs px-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // Milestones & goals variant
  return (
    <div className="bg-white dark:bg-[#1D1F26] border border-[#EAE5DE] dark:border-[#2D303A] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#18191F] dark:text-[#F3F4F6]">
          Milestones & Goals
        </h3>
        <button
          type="button"
          onClick={() => setShowAddForm((prev) => !prev)}
          className="text-xs font-bold text-[#543FE3] dark:text-[#A798FF] hover:underline cursor-pointer"
        >
          {showAddForm ? '✕ Close' : '+ Set New Goal'}
        </button>
      </div>

      {/* Inline Goal Creation Form */}
      {showAddForm && (
        <form onSubmit={handleAddGoal} className="p-3.5 rounded-2xl bg-[#F8F6F2] dark:bg-[#252833] border border-[#E5E1D8] dark:border-[#383B47] space-y-3">
          <div className="text-xs font-bold text-[#18191F] dark:text-[#F3F4F6]">
            Create a Personal Learning Goal
          </div>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Goal title (e.g. Host 3 Study Rooms, Master Graphs)"
            className="w-full bg-white dark:bg-[#1D1F26] border border-[#E5E1D8] dark:border-[#383B47] text-xs text-[#18191F] dark:text-[#F3F4F6] rounded-xl px-3 py-2 outline-none focus:border-[#543FE3]"
            autoFocus
          />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 flex-1">
              <label className="text-[11px] font-semibold text-[#717382] dark:text-[#9A9CA8] shrink-0">
                Target:
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={newTarget}
                onChange={(e) => setNewTarget(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 bg-white dark:bg-[#1D1F26] border border-[#E5E1D8] dark:border-[#383B47] text-xs text-center text-[#18191F] dark:text-[#F3F4F6] rounded-lg py-1 outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={!newTitle.trim() || isSubmitting}
              className="px-4 py-1.5 rounded-full bg-[#543FE3] hover:bg-[#432ec4] disabled:opacity-40 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
            >
              Save Goal
            </button>
          </div>
        </form>
      )}

      {/* Goal Items */}
      <div className="space-y-3.5">
        {isLoading ? (
          <div className="py-6 text-center text-xs text-[#717382] dark:text-[#9A9CA8]">
            Loading milestones...
          </div>
        ) : goals.length === 0 ? (
          <div className="py-6 text-center space-y-2">
            <p className="text-xs text-[#717382] dark:text-[#9A9CA8]">
              No custom goals set yet. Set your learning milestones above!
            </p>
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 rounded-full bg-[#543FE3] text-white text-xs font-bold hover:bg-[#432ec4] transition-all cursor-pointer shadow-xs"
            >
              + Add My First Goal
            </button>
          </div>
        ) : (
          goals.map((m) => {
            const current = m.currentCount || 0;
            const target = m.targetCount || 1;
            const pct = Math.min(100, Math.round((current / target) * 100));

            return (
              <div
                key={m.id}
                className={`space-y-1.5 p-3 rounded-2xl border transition-all ${
                  m.completed
                    ? 'bg-purple-50/40 dark:bg-[#201D2D]/40 border-purple-200 dark:border-purple-900/40'
                    : 'bg-[#FAF9F6] dark:bg-[#242732] border-[#EAE5DE] dark:border-[#2D303A]'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggle(m.id)}
                      className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 cursor-pointer ${
                        m.completed
                          ? 'bg-[#543FE3] text-white'
                          : 'border-2 border-gray-400 hover:border-[#543FE3]'
                      }`}
                    >
                      {m.completed && <span className="text-[9px] font-black leading-none">✓</span>}
                    </button>
                    <span
                      className={`font-bold truncate ${
                        m.completed
                          ? 'line-through text-gray-400 dark:text-gray-500'
                          : 'text-[#18191F] dark:text-[#F3F4F6]'
                      }`}
                    >
                      {m.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-bold text-[#543FE3] dark:text-[#B6A8FF]">
                      {pct}%
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(m.id, e)}
                      title="Delete goal"
                      className="text-gray-400 hover:text-rose-500 text-xs px-1"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#717382] dark:text-[#9A9CA8]">
                  <span>
                    {current} / {target} achieved
                  </span>
                  <div className="flex items-center gap-2">
                    {!m.completed && (
                      <button
                        type="button"
                        onClick={(e) => handleIncrement(m, e)}
                        className="text-[10px] font-bold text-[#543FE3] dark:text-[#B6A8FF] hover:underline cursor-pointer"
                      >
                        + Progress
                      </button>
                    )}
                    <span>{m.completed ? 'Completed 🎉' : `${100 - pct}% to go`}</span>
                  </div>
                </div>

                <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#543FE3] transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Button to Create Room */}
      {onOpenCreateRoom && (
        <button
          type="button"
          onClick={onOpenCreateRoom}
          className="w-full py-2.5 rounded-full border border-[#D5D0C6] dark:border-[#3D404E] text-xs font-semibold text-[#18191F] dark:text-[#F3F4F6] hover:bg-gray-50 dark:hover:bg-[#252833] transition-colors mt-2 cursor-pointer"
        >
          + Create New Study Room
        </button>
      )}
    </div>
  );
}

