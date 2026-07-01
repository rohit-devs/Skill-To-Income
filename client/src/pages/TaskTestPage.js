import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import api, { getApiErrorMessage } from '../utils/api';

const QUIZ_DURATION_SECONDS = 10 * 60;

const buildInitialAnswers = (count) =>
  Array.from({ length: count }, () => ({ mcqChoice: null, timeTaken: 0 }));

const formatTime = (value) =>
  `${Math.floor(value / 60).toString().padStart(2, '0')}:${(value % 60).toString().padStart(2, '0')}`;

export default function TaskTestPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [task, setTask] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [current, setCurrent] = useState(0);
  const [started, setStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION_SECONDS);
  const startTime = useRef(null);
  const questionStartTime = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [testRes, taskRes] = await Promise.all([
          api.get(`/ai/test/${taskId}`),
          api.get(`/tasks/${taskId}`),
        ]);

        const quiz = testRes.data.test;
        const attempt = quiz?.attempt || null;

        setTest(quiz);
        setTask(taskRes.data);
        setAnswers(buildInitialAnswers(quiz?.questions?.length || 0));

        if (attempt?.submittedAt) {
          setDone(true);
          setResult({
            score: attempt.score,
            percentage: attempt.percentage,
            passed: attempt.passed,
          });
        }
      } catch {
        navigate(`/tasks/${taskId}`);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate, taskId]);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;

    setSubmitting(true);
    setError('');

    const total = Math.round((Date.now() - (startTime.current || Date.now())) / 1000);

    try {
      const { data } = await api.post(`/ai/test/${taskId}/submit`, {
        answers,
        timeTakenTotal: total,
      });

      setResult({
        score: data.score,
        percentage: data.percentage,
        passed: data.passed,
      });
      setDone(true);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Quiz submission failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }, [answers, submitting, taskId]);

  useEffect(() => {
    if (!started || done) return undefined;

    if (timeLeft <= 0) {
      handleSubmit();
      return undefined;
    }

    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [done, handleSubmit, started, timeLeft]);

  const setAnswer = (choice) => {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[current] = { ...updated[current], mcqChoice: choice };
      return updated;
    });
  };

  const goToNext = () => {
    const timeTaken = Math.round((Date.now() - (questionStartTime.current || Date.now())) / 1000);

    setAnswers((prev) => {
      const updated = [...prev];
      updated[current] = { ...updated[current], timeTaken };
      return updated;
    });

    if (current < test.questions.length - 1) {
      setCurrent((value) => value + 1);
      questionStartTime.current = Date.now();
    }
  };

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (!test) return <div className="empty-state"><h3>No quiz found for this task</h3></div>;

  if (done) {
    const passed = Boolean(result?.passed);

    return (
      <div className="page-wrap">
        <div className="container" style={{ maxWidth: 580 }}>
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>{passed ? 'PASS' : 'TRY'}</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
              {passed ? 'Quiz passed' : 'Quiz not passed yet'}
            </h2>
            <p style={{ color: 'var(--ink-3)', fontSize: 14, lineHeight: 1.7, marginBottom: 22 }}>
              {passed
                ? 'You unlocked this task. Go back to the task page and accept it.'
                : 'You need at least 70% to unlock this task. Review the topic and try again.'}
            </p>

            <div style={{ background: passed ? 'var(--emerald-lt)' : 'var(--orange-lt)', borderRadius: 12, padding: '18px 20px', marginBottom: 24 }}>
              <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ink-3)', marginBottom: 8 }}>
                Result
              </div>
              <div style={{ fontSize: 34, fontWeight: 900, marginBottom: 4 }}>
                {result?.percentage ?? 0}%
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                Score {result?.score ?? 0} out of 100. Pass mark: {test.passThreshold || 70}%.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => navigate(`/tasks/${taskId}`)}>
                {passed ? 'Go to Task' : 'Back to Task'}
              </button>
              {!passed && (
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setDone(false);
                    setResult(null);
                    setStarted(false);
                    setCurrent(0);
                    setTimeLeft(QUIZ_DURATION_SECONDS);
                    setAnswers(buildInitialAnswers(test.questions.length));
                  }}
                >
                  Retry Quiz
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
        <div className="container" style={{ maxWidth: 580 }}>
          <div className="card">
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg,var(--blue),var(--orange))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, margin: '0 auto 14px' }}>
                AI
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>{test.testTitle}</h2>
              <p style={{ color: 'var(--ink-3)', fontSize: 14, lineHeight: 1.7 }}>{test.testIntro}</p>
            </div>

            <div style={{ background: 'var(--surface-2)', borderRadius: 12, padding: '16px 18px', marginBottom: 24 }}>
              {[
                ['Task', task?.title],
                ['Skill', task?.category],
                ['Questions', `${test.questions.length} MCQs`],
                ['Time limit', '10 minutes'],
                ['Unlock rule', `Pass with ${test.passThreshold || 70}% or more`],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 14, padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                  <span style={{ color: 'var(--ink-3)' }}>{label}</span>
                  <strong style={{ textAlign: 'right' }}>{value}</strong>
                </div>
              ))}
            </div>

            <div className="alert alert-info" style={{ marginBottom: 20 }}>
              This quiz is required before task acceptance. Your score is calculated instantly after submission.
            </div>

            <button
              className="btn btn-primary btn-full btn-lg"
              onClick={() => {
                setStarted(true);
                startTime.current = Date.now();
                questionStartTime.current = Date.now();
              }}
            >
              Start Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = test.questions[current];
  const answer = answers[current] || {};
  const progress = ((current + 1) / test.questions.length) * 100;

  return (
    <div className="page-wrap">
      <div className="container" style={{ maxWidth: 680 }}>
        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

        <div className="card" style={{ marginBottom: 16, padding: '12px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div>
              <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>Question {current + 1} of {test.questions.length}</span>
              <span style={{ marginLeft: 10, fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'var(--blue-lt)', color: 'var(--blue-dk)', fontWeight: 600 }}>
                MCQ
              </span>
            </div>
            <span style={{ fontWeight: 800, fontSize: 17, color: timeLeft < 60 ? 'var(--rose)' : 'var(--blue)', fontFamily: 'monospace' }}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <div className="progress">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,var(--blue),var(--orange))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, color: '#fff', flexShrink: 0 }}>
              AI
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)' }}>Quiz question</div>
          </div>

          <p style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.6, marginBottom: 22 }}>{question.question}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {question.options?.map((option, optionIndex) => (
              <label
                key={optionIndex}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  border: `1.5px solid ${answer.mcqChoice === optionIndex ? 'var(--blue)' : 'var(--border-2)'}`,
                  borderRadius: 10,
                  cursor: 'pointer',
                  background: answer.mcqChoice === optionIndex ? 'var(--blue-lt)' : 'var(--surface)',
                  transition: 'all .12s',
                }}
              >
                <input
                  type="radio"
                  name={`q${current}`}
                  checked={answer.mcqChoice === optionIndex}
                  onChange={() => setAnswer(optionIndex)}
                  style={{ accentColor: 'var(--blue)', width: 16, height: 16 }}
                />
                <span style={{ fontSize: 14 }}>{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {current > 0 && (
            <button className="btn btn-outline" onClick={() => setCurrent((value) => value - 1)}>
              Back
            </button>
          )}
          <div style={{ flex: 1 }} />
          {current < test.questions.length - 1 ? (
            <button className="btn btn-primary" onClick={goToNext} disabled={answer.mcqChoice === null}>
              Next Question
            </button>
          ) : (
            <button
              className="btn btn-success"
              disabled={submitting || answer.mcqChoice === null}
              onClick={() => {
                if (window.confirm('Submit your quiz answers now?')) {
                  handleSubmit();
                }
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
