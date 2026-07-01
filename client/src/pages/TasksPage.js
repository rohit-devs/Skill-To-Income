import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import api from '../utils/api';

const CATS = ['All','Design','Writing','Data','Social Media','Video','Coding','Research','Marketing'];
const SORTS = [['newest','Newest first'],['budget_hi','Highest pay'],['budget_lo','Lowest pay'],['deadline','Deadline soon']];

export default function TasksPage() {
  const { user }  = useAuth();
  const [params, setParams] = useSearchParams();
  const [tasks, setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [category, setCategory] = useState(params.get('category') || 'All');
  const [sort, setSort]       = useState('newest');
  const [filterStatus, setFilterStatus] = useState('open');

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (category !== 'All') q.set('category', category);
      if (search) q.set('search', search);
      if (filterStatus !== 'all') q.set('status', filterStatus);
      const { data } = await api.get(`/tasks?${q}`);
      let sorted = [...data];
      if (sort === 'budget_hi') sorted.sort((a,b) => b.budget - a.budget);
      if (sort === 'budget_lo') sorted.sort((a,b) => a.budget - b.budget);
      setTasks(sorted);
    } catch { setTasks([]); }
    finally { setLoading(false); }
  }, [category, search, sort, filterStatus]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const setcat = cat => { setCategory(cat); setParams(cat !== 'All' ? { category: cat } : {}); };

  const featured = tasks.filter(t => t.priority);
  const regular  = tasks.filter(t => !t.priority);

  return (
    <div className="page-wrap">
      {/* Page header */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '28px 0 24px', marginBottom: 28 }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
            <div>
              <h1 className="page-title">Browse Tasks</h1>
              <p style={{ fontSize: 14, color: 'var(--ink-3)' }}>
                {loading ? 'Loading...' : `${tasks.length} tasks available right now`}
                {user?.city && ` · matched for ${user.city}`}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input className="form-input" placeholder="🔍 Search tasks..." value={search}
                onChange={e => setSearch(e.target.value)} style={{ width: 220 }}/>
              <select className="form-input form-select" value={sort} onChange={e => setSort(e.target.value)} style={{ width: 160 }}>
                {SORTS.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <select className="form-input form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 140 }}>
                <option value="all">Any Status</option>
                <option value="open">Available</option>
                <option value="assigned">In Progress</option>
              </select>
            </div>
          </div>

          {/* Category chips */}
          <div className="tag-row">
            {CATS.map(cat => (
              <button key={cat} className={`tag ${category === cat ? 'active' : ''}`} onClick={() => setcat(cat)}>{cat}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="container">
        {loading ? (
          <div className="spinner-wrap"><div className="spinner"/></div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
            <h3>No tasks found</h3>
            <p>Try a different category or clear the search.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => { setSearch(''); setcat('All'); }}>Clear filters</button>
              {(user?.role === 'business' || user?.role === 'company') && (
                <Link to="/post-task"><button className="btn btn-orange">Post a Task</button></Link>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Featured tasks */}
            {featured.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <span style={{ fontSize: 18 }}>⭐</span>
                  <h2 style={{ fontSize: 17, fontWeight: 700 }}>Featured tasks</h2>
                  <span className="badge badge-orange">{featured.length} featured</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 18 }}>
                  {featured.map(t => <TaskCard key={t._id} task={t}/>)}
                </div>
              </div>
            )}

            {/* Regular tasks */}
            {regular.length > 0 && (
              <div>
                {featured.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <h2 style={{ fontSize: 17, fontWeight: 700 }}>All tasks</h2>
                    <span className="badge badge-gray">{regular.length} tasks</span>
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 18 }}>
                  {regular.map(t => <TaskCard key={t._id} task={t}/>)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
