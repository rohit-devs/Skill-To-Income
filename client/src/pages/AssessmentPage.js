import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import api, { getApiErrorMessage } from '../utils/api';

const AssessmentPage = () => {
  const { skill } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const startTime = useRef(null);

  useEffect(() => {
    const loadAssessment = async () => {
      setLoading(true);
      setError('');

      try {
        const { data } = await api.get(`/assessments/${skill}`);

        if (data.alreadyPassed) {
          setResult({ passed: true, alreadyPassed: true });
          setSubmitted(true);
          return;
        }

        setAssessment(data);
        setTimeLeft(data.duration * 60);
        setAnswers(new Array(data.questions?.length || 0).fill(-1));
      } catch (err) {
        setError(getApiErrorMessage(err, 'Unable to load this assessment.'));
        navigate('/assessments');
      } finally {
        setLoading(false);
      }
    };

    loadAssessment();
  }, [navigate, skill]);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;

    setSubmitting(true);
    setError('');

    const timeTaken = Math.round((Date.now() - startTime.current) / 1000);

    try {
      const { data } = await api.post(`/assessments/${skill}/submit`, { answers, timeTaken });
      setResult(data);
      setSubmitted(true);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Submission failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }, [answers, skill, submitting]);

  useEffect(() => {
    if (!started || submitted) return undefined;
    if (timeLeft <= 0) {
      handleSubmit();
      return undefined;
    }

    const timer = setInterval(() => setTimeLeft((value) => value - 1), 1000);
    return () => clearInterval(timer);
  }, [handleSubmit, started, submitted, timeLeft]);

  const formatTime = (seconds) =>
    `${Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

  const progress = assessment ? ((assessment.duration * 60 - timeLeft) / (assessment.duration * 60)) * 100 : 0;
  const answered = answers.filter((answer) => answer !== -1).length;

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  if (submitted && result) {
    return (
      <div className="page-wrap">
        <div className="container" style={{ maxWidth: 560 }}>
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>{result.passed ? 'Passed' : 'Retry'}</div>
            {result.alreadyPassed ? (
              <>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Already verified</h2>
                <p style={{ color: 'var(--ink-3)', marginBottom: 24 }}>
                  You have already passed the {skill} assessment. Your verified badge is active.
                </p>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
                  {result.passed ? 'You passed' : 'Not quite there'}
                </h2>
                <div
                  style={{
                    fontSize: 40,
                    fontWeight: 800,
                    color: result.passed ? 'var(--emerald)' : 'var(--rose)',
                    marginBottom: 8,
                  }}
                >
                  {result.percentage}%
                </div>
                <p style={{ color: 'var(--ink-3)', marginBottom: 24 }}>
                  Score: {result.score}/{result.total} | Pass mark: {assessment?.passMark}%
                </p>
              </>
            )}
            {result.passed && (
              <div
                style={{
                  background: 'var(--emerald-lt)',
                  border: '1px solid #9FE8D0',
                  borderRadius: 10,
                  padding: '14px 20px',
                  marginBottom: 24,
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--emerald)', marginBottom: 4 }}>{skill} skill verified</div>
                <div style={{ fontSize: 13, color: '#007055' }}>
                  A verified badge has been added to your profile. You now have access to premium {skill} tasks.
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => navigate('/tasks')}>
                Browse Tasks
              </button>
              {!result.passed && (
                <button className="btn btn-outline" onClick={() => navigate('/assessments')}>
                  Try Again Later
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="page-wrap">
        <div className="container" style={{ maxWidth: 560 }}>
          <div className="card">
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>Assessment</div>
              <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>{skill} Skill Assessment</h1>
              <p style={{ color: 'var(--ink-3)', fontSize: 14 }}>Pass this test to get a verified badge on your profile</p>
            </div>

            {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

            <div style={{ background: 'var(--surface-2)', borderRadius: 10, padding: '16px 20px', marginBottom: 24 }}>
              {[
                ['Questions', `${assessment?.questions?.length || 0} multiple choice`],
                ['Duration', `${assessment?.duration} minutes`],
                ['Pass mark', `${assessment?.passMark}%`],
                ['Attempts', 'Unlimited (24hr cooldown)'],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '6px 0',
                    borderBottom: '1px solid var(--border)',
                    fontSize: 13,
                  }}
                >
                  <span style={{ color: 'var(--ink-3)' }}>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>

            <div className="alert alert-info">Once you start, the timer begins. Complete all questions before time runs out.</div>

            <button
              className="btn btn-primary btn-full btn-lg"
              onClick={() => {
                setStarted(true);
                startTime.current = Date.now();
              }}
            >
              Start Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrap">
      <div className="container" style={{ maxWidth: 680 }}>
        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

        <div className="card" style={{ marginBottom: 20, padding: '14px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontWeight: 700 }}>{skill} Assessment</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>
                {answered}/{assessment?.questions?.length || 0} answered
              </span>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: 18,
                  color: timeLeft < 60 ? 'var(--rose)' : 'var(--violet)',
                  fontFamily: 'monospace',
                }}
              >
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
          <div className="progress">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {assessment?.questions?.map((question, questionIndex) => (
          <div key={questionIndex} className="card" style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 15, lineHeight: 1.5 }}>
              <span style={{ color: 'var(--violet)', marginRight: 8 }}>Q{questionIndex + 1}.</span>
              {question.question}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {question.options.map((option, optionIndex) => (
                <label
                  key={optionIndex}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    border: `1.5px solid ${answers[questionIndex] === optionIndex ? 'var(--violet)' : 'var(--border)'}`,
                    borderRadius: 8,
                    cursor: 'pointer',
                    background: answers[questionIndex] === optionIndex ? 'var(--violet-lt)' : 'var(--surface)',
                    transition: 'all .12s',
                    fontSize: 14,
                  }}
                >
                  <input
                    type="radio"
                    name={`q${questionIndex}`}
                    checked={answers[questionIndex] === optionIndex}
                    onChange={() =>
                      setAnswers((previous) => {
                        const nextAnswers = [...previous];
                        nextAnswers[questionIndex] = optionIndex;
                        return nextAnswers;
                      })
                    }
                    style={{ accentColor: 'var(--violet)' }}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        ))}

        <button
          className="btn btn-primary btn-full btn-lg"
          disabled={submitting}
          onClick={() => {
            if (
              answered < (assessment?.questions?.length || 0) &&
              !window.confirm(`You have ${(assessment?.questions?.length || 0) - answered} unanswered questions. Submit anyway?`)
            ) {
              return;
            }

            handleSubmit();
          }}
        >
          {submitting ? 'Submitting...' : `Submit Assessment (${answered}/${assessment?.questions?.length || 0} answered)`}
        </button>
      </div>
    </div>
  );
};

export default AssessmentPage;
