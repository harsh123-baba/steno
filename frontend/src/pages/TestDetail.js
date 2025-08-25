import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

const containerStyle = {
  padding: '1rem',
  display: 'flex',
  justifyContent: 'center'
};

const cardStyle = {
  backgroundColor: '#fff',
  padding: '2rem',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  maxWidth: '600px',
  width: '100%'
};

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'white',
  padding: '2rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
};

const audioStyle = {
  width: '100%',
  margin: '1rem 0'
};

const textareaStyle = {
  width: '100%',
  fontFamily: 'Noto Sans Devanagari, sans-serif',
  padding: '0.5rem',
  borderRadius: '4px',
  border: '1px solid #ccc',
  marginBottom: '1rem',
  height: '200px'
};

const buttonStyle = {
  backgroundColor: '#2980b9',
  color: '#fff',
  border: 'none',
  padding: '0.75rem 1.5rem',
  borderRadius: '4px',
  cursor: 'pointer',
  opacity: 1
};

const disabledButtonStyle = {
  ...buttonStyle,
  opacity: 0.6,
  cursor: 'not-allowed'
};

const TestDetail = () => {
  const { id } = useParams();
  const audioRef = useRef(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [typedText, setTypedText] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [timeLimitState, setTimeLimitState] = useState(0);

  // Fetch test data and load audio
  useEffect(() => {
    const fetchTest = async () => {
      try {
        const { data } = await api.get(`/tests/${id}`);
        const audioSrc = `data:${data.contentType};base64,${data.audio}`;
        setAudioUrl(audioSrc);
        setName(data.name);
        setCategory(data.category);
        setTimeLimitState(data.timeLimit);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTest();
  }, [id]);

  // Play audio once loaded
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play().catch((e) => console.error(e));
    }
  }, [audioUrl]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (timerActive && elapsed < timeLimitState) {
      interval = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, elapsed, timeLimitState]);

  // Auto-submit when time is up
  useEffect(() => {
    if (timerActive && elapsed >= timeLimitState && !submitted) {
      handleSubmit();
    }
  }, [elapsed, timerActive, submitted, timeLimitState]);

  const handleEnded = () => {
    setTimerActive(true);
  };

  const handleTextChange = (e) => {
    setTypedText(e.target.value);
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (submitted) return;
    try {
      const { data } = await api.post(`/tests/${id}/submit`, {
        typedText,
        timeTaken: elapsed
      });
      setResult(data);
      setTimerActive(false);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {!timerActive && !submitted && (
        <div style={containerStyle}>
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>{name}</h2>
            <audio
              ref={audioRef}
              controls
              src={audioUrl}
              style={audioStyle}
              onEnded={handleEnded}
            />
            <p><strong>Category:</strong> {category.toUpperCase()}</p>
            <p><strong>Time Limit:</strong> {timeLimitState}s</p>
            <p><strong>Timer:</strong> {elapsed}s</p>
          </div>
        </div>
      )}
      {timerActive && !submitted && (
        <div style={overlayStyle}>
          <h2>{name}</h2>
          <p><strong>Timer:</strong> {elapsed}s / {timeLimitState}s</p>
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <textarea
              rows="10"
              value={typedText}
              onChange={handleTextChange}
              required
              style={textareaStyle}
            />
            <button type="submit" style={buttonStyle}>
              Submit
            </button>
          </form>
        </div>
      )}
      {submitted && result && (
        <div style={containerStyle}>
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Result for {name}</h2>
            <p><strong>Errors:</strong> {result.errors}</p>
            <p><strong>Accuracy:</strong> {result.accuracy}%</p>
            <p><strong>WPM:</strong> {result.wpm}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default TestDetail;
