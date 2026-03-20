import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import TaskCard from '../components/TaskCard';
import api from '../utils/api';

const CATEGORIES = ['All', 'Design', 'Writing', 'Data', 'Social Media', 'Video', 'Coding', 'Research'];

const TasksPage = () => {
  const [params, setParams] = useSearchParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(params.get('category') || 'All');

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (category !== 'All') q.set('category', category);
      if (search) q.set('search', search);
      const { data } = await api.get(`/tasks?${q.toString()}`);
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleCategory = (cat) => {
    setCategory(cat);
    setParams(cat !== 'All' ? { category: cat } : {});
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Browse Tasks</h1>
            <p style={styles.sub}>{tasks.length} tasks available right now</p>
          </div>
          <div style={styles.searchWrap}>
            <input
              className="form-input"
              placeholder="🔍 Search tasks…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 260 }}
            />
          </div>
        </div>

        {/* Category filters */}
        <div className="tag-row" style={{ marginBottom: 28 }}>
          {CATEGORIES.map((cat) => (
            <button key={cat} className={`tag ${category === cat ? 'active' : ''}`}
              onClick={() => handleCategory(cat)}>
              {cat}
            </button>
          ))}
        </div>

        {/* Task grid */}
        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <h3>No tasks found</h3>
            <p>Try changing the category or search term.</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {tasks.map((task) => <TaskCard key={task._id} task={task} />)}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 },
  title: { fontSize: 26, fontWeight: 700 },
  sub: { fontSize: 14, color: '#6B6A64', marginTop: 4 },
  searchWrap: { display: 'flex', gap: 8 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 },
};

export default TasksPage;
