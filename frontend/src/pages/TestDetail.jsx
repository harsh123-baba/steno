import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { Editor } from '@tinymce/tinymce-react';

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

const buttonStyle = {
  backgroundColor: '#2980b9',
  color: '#fff',
  border: 'none',
  padding: '0.75rem 1.5rem',
  borderRadius: '4px',
  cursor: 'pointer',
  marginTop: '1rem'
};

const TestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [typedText, setTypedText] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [timeLimit, setTimeLimit] = useState(0);

  // Fetch test on mount
  useEffect(() => {
    const fetchTest = async () => {
      try {
        const { data } = await api.get(`/tests/${id}`);
        setAudioUrl(`data:${data.contentType};base64,${data.audio}`);
        setName(data.name);
        setCategory(data.category);
        setTimeLimit(data.timeLimit);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTest();
  }, [id]);

  // Auto-play audio
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
  }, [audioUrl]);

  // Timer logic
  useEffect(() => {
    let timer;
    if (timerActive && elapsed < timeLimit) {
      timer = setInterval(() => setElapsed(prev => prev + 1), 1000);
    }
    if (elapsed >= timeLimit && timerActive) {
      handleSubmit();
    }
    return () => clearInterval(timer);
  }, [timerActive, elapsed, timeLimit]);

  const handleEnded = () => setTimerActive(true);

  const handleSkip = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setTimerActive(true);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      await api.post(`/tests/${id}/submit`, {
        typedText: typedText.trim(),
        timeTaken: elapsed
      });
      navigate('/results');
    } catch (err) {
      console.error(err);
      alert('Submission failed');
    }
  };

  return (
    <>
      {!timerActive && (
        <div style={containerStyle}>
          <div style={cardStyle}>
            <h2>{name}</h2>
                <audio ref={audioRef} src={audioUrl} style={audioStyle} onEnded={handleEnded} />
                <button style={buttonStyle} onClick={handleSkip}>Skip and Start Typing</button>
                <p><strong>Category:</strong> {category}</p>
            <p><strong>Time Limit:</strong> {timeLimit}s</p>
          </div>
        </div>
      )}
      {timerActive && (
        <div style={overlayStyle}>
          <h2>{name}</h2>
          <p><strong>Timer:</strong> {elapsed}s / {timeLimit}s</p>
          <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '800px' }}>
            <Editor
              tinymceScriptSrc='/tinymce/tinymce.min.js'
              licenseKey='gpl'
              value={typedText}
              onEditorChange={(content) => setTypedText(content)}
              init={{
                height: 500,
                menubar: false,
                plugins: 'lists link image code',
                toolbar: 'undo redo | fontfamily fontsize',
                font_family_formats: `
                  Kruti Dev 010=Kruti Dev 010;
                  DevLys 010=DevLys 010;
                `,
                content_style: `
                  @font-face { font-family: 'Kruti Dev 010'; src: url('/fonts/KrutiDev_010.ttf') format('truetype'); }
                  @font-face { font-family: 'DevLys 010'; src: url('/fonts/DevLys_010.ttf') format('truetype'); }
                  body { font-family: 'Kruti Dev 010', monospace; }
                `
              }}
            />
            <button type='submit' style={buttonStyle}>Submit (जमा करें)</button>
            <span style={{ marginLeft: '1rem' }}>Words: {typedText.trim().split(/\s+/).filter(w => w).length}</span>
          </form>
        </div>
      )}
    </>
  );
};

export default TestDetail;
