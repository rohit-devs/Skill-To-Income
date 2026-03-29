import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import api, { getApiErrorMessage } from '../utils/api';

const ICONS = {
  Design: 'Design',
  Writing: 'Writing',
  Data: 'Data',
  'Social Media': 'Social',
  Video: 'Video',
  Coding: 'Code',
  Research: 'Research',
  Excel: 'Excel',
  Canva: 'Canva',
};

const AssessmentsListPage = () => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAssessments = async () => {
      setLoading(true);
      setError('');

      try {
        const { data } = await api.get('/assessments');
        setAssessments(data);
      } catch (err) {
        setAssessments([]);
        setError(getApiErrorMessage(err, 'Failed to load assessments.'));
      } finally {
        setLoading(false);
      }
    };

    loadAssessments();
  }, []);

  const verifiedSkills = user?.verifiedSkills || [];

  return (
    <div className="page-wrap">
      <div className="container">
        <h1 className="page-title">Skill Assessments</h1>
        <p className="page-sub">Pass a test to get a verified badge and unlock premium tasks.</p>

        <div className="alert alert-info" style={{ marginBottom: 28 }}>
          Verified skill badges appear on your public profile and make it easier for businesses to trust your profile.
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : (
          <div className="three-col">
            {assessments.map((assessment) => {
              const isVerified = verifiedSkills.includes(assessment.skill);

              return (
                <div key={assessment._id} className="card card-hover" style={{ position: 'relative' }}>
                  {isVerified && (
                    <div style={{ position: 'absolute', top: 14, right: 14 }}>
                      <span className="badge badge-emerald">Verified</span>
                    </div>
                  )}

                  <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
                    {ICONS[assessment.skill] || assessment.skill}
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{assessment.skill}</h3>
                  <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 16, lineHeight: 1.5 }}>
                    {assessment.description}
                  </p>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 16, fontSize: 12, color: 'var(--ink-3)' }}>
                    <span>{assessment.questions?.length || 10} questions</span>
                    <span>{assessment.duration} mins</span>
                    <span>Pass: {assessment.passMark}%</span>
                  </div>

                  {isVerified ? (
                    <button className="btn btn-outline btn-full" disabled style={{ opacity: 0.6 }}>
                      Already verified
                    </button>
                  ) : (
                    <Link to={`/assessments/${assessment.skill}`}>
                      <button className="btn btn-primary btn-full">Take Assessment</button>
                    </Link>
                  )}
                </div>
              );
            })}

            {assessments.length === 0 && (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                <h3>No assessments available yet</h3>
                <p>Check back soon. New skill tests are added regularly.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentsListPage;
