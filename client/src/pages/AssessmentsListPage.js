import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const ICONS = { Design: '🎨', Writing: '✍️', Data: '📊', 'Social Media': '📱', Video: '🎬', Coding: '💻', Research: '🔍', Excel: '📈', Canva: '🖼️' };

const AssessmentsListPage = () => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/assessments').then(({ data }) => { setAssessments(data); setLoading(false); });
  }, []);

  const verified = user?.verifiedSkills || [];

  return (
    <div className="page-wrap">
      <div className="container">
        <h1 className="page-title">Skill Assessments</h1>
        <p className="page-sub">Pass a test to get a verified badge — unlock premium tasks and higher business trust</p>

        <div className="alert alert-info" style={{ marginBottom: 28 }}>
          Verified skill badges appear on your public profile and increase your chances of being selected for high-value tasks by 3×.
        </div>

        {loading ? <div className="spinner-wrap"><div className="spinner" /></div> : (
          <div className="three-col">
            {assessments.map(a => {
              const isVerified = verified.includes(a.skill);
              return (
                <div key={a._id} className="card card-hover" style={{ position: 'relative' }}>
                  {isVerified && (
                    <div style={{ position: 'absolute', top: 14, right: 14 }}>
                      <span className="badge badge-emerald">✓ Verified</span>
                    </div>
                  )}
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{ICONS[a.skill] || '📝'}</div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{a.skill}</h3>
                  <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 16, lineHeight: 1.5 }}>{a.description}</p>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 16, fontSize: 12, color: 'var(--ink-3)' }}>
                    <span>📋 {a.questions?.length || 10} questions</span>
                    <span>⏱ {a.duration} mins</span>
                    <span>🎯 Pass: {a.passMark}%</span>
                  </div>
                  {isVerified ? (
                    <button className="btn btn-outline btn-full" disabled style={{ opacity: .6 }}>Already verified ✓</button>
                  ) : (
                    <Link to={`/assessments/${a.skill}`}>
                      <button className="btn btn-primary btn-full">Take Assessment →</button>
                    </Link>
                  )}
                </div>
              );
            })}
            {assessments.length === 0 && (
              <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                <h3>No assessments available yet</h3>
                <p>Check back soon — new skill tests are added regularly.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentsListPage;
