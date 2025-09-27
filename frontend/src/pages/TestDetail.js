import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import AuthContext from '../contexts/AuthContext';
import typeHindi from 'type-hindi';
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

const submitTopStyle = {
  ...buttonStyle,
  position: 'absolute',
  top: '1rem',
  right: '1rem',
  marginTop: 0
};

const TestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const audioRef = useRef(null);

  // State declarations
  const [audioUrl, setAudioUrl] = useState('');
  const [typedText, setTypedText] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [timeLimit, setTimeLimit] = useState(0);
  const [dictationWpm, setDictationWpm] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [dictationWords, setDictationWords] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [testType, setTestType] = useState('');
  const [canTakeTest, setCanTakeTest] = useState(true);

  // Fetch test metadata and audio
  useEffect(() => {
    const fetchTest = async () => {
      try {
        const { data } = await api.get(`/tests/${id}`);
        // Check if user has access to this test
        if (data.testType === 'premium' && (!user || !user.isPremium)) {
          // Only premium users can take premium tests
          setCanTakeTest(false);
        } else {
          // All users can take free and go-live tests
          setCanTakeTest(true);
        }
        
        setAudioUrl(`data:${data.contentType};base64,${data.audio}`);
        setName(data.name);
        setCategory(data.category);
        setTimeLimit(data.timeLimit);
        setDictationWpm(data.dictationWpm || 0);
        setAudioDuration(data.audioDuration || 0);
        setTestType(data.testType);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [id, user, navigate]);

  // Auto-play audio when loaded
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.load();
      audioRef.current.play().catch(console.error);
    }
  }, [audioUrl]);

  // Timer for typing phase
  useEffect(() => {
    if (!timerActive || timeLimit <= 0) return;
    const timer = setInterval(() => {
      setElapsed(prev => {
        if (prev + 1 >= timeLimit) {
          clearInterval(timer);
          handleSubmit();
          return timeLimit;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timerActive, timeLimit]);

  const handleEnded = () => {
    setTimerActive(true);
  };

  const handleSkip = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setTimerActive(true);
    }
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      await api.post(`/tests/${id}/submit`, {
        typedText: typedText.trim(),
        timeTaken: elapsed
      });
      navigate(`/tests/${id}/results`);
    } catch (err) {
      console.error(err);
      alert('Submission failed');
    }
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <p>Loading test...</p>
      </div>
    );
  }

  return (
    <>
      {!timerActive ? (
        <div style={containerStyle}>
          <div style={cardStyle}>
            <h2>{name}</h2>
            {testType === 'premium' && !canTakeTest && (
              <div style={{ 
                backgroundColor: '#fff3cd', 
                border: '1px solid #ffeaa7', 
                borderRadius: '4px', 
                padding: '1rem', 
                marginBottom: '1rem',
                color: '#856404'
              }}>
                <strong>Premium Test:</strong> This is a premium test. Please upgrade to a premium subscription to take this test.
              </div>
            )}
            <audio
              ref={audioRef}
              src={audioUrl}
              style={audioStyle}
              autoPlay
              onEnded={handleEnded}
            />
            {canTakeTest ? (
              <button style={buttonStyle} onClick={handleSkip}>
                Skip and Start Typing
              </button>
            ) : (
              <button 
                style={{...buttonStyle, backgroundColor: '#6c757d', cursor: 'not-allowed'}} 
                disabled
              >
                Upgrade to Take Test
              </button>
            )}
            <p><strong>Category:</strong> {category}</p>
            <p><strong>Time Limit:</strong> {timeLimit}s</p>
            {testType === 'premium' && (
              <p><strong>Type:</strong> <span style={{ backgroundColor: '#8e44ad', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>PREMIUM</span></p>
            )}
            {testType === 'free' && (
              <p><strong>Type:</strong> <span style={{ backgroundColor: '#27ae60', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>FREE</span></p>
            )}
            {testType === 'go-live' && (
              <p><strong>Type:</strong> <span style={{ backgroundColor: '#3498db', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>GO-LIVE</span></p>
            )}
          </div>
        </div>
      ) : (
        <div style={overlayStyle}>
          <h2>{name}</h2>
          
          <strong>Timer:</strong> {Math.floor(elapsed / 60)}m {elapsed % 60}s / {Math.floor(timeLimit / 60)}m {timeLimit % 60}s
          <button type="button" style={buttonStyle} onClick={handleSubmit}>
              Submit (जमा करें)
            </button>
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
            
            <span style={{ marginLeft: '1rem' }}>
              Words: {typedText.trim().split(/\s+/).filter(w => w).length}
            </span>
          </form>
        </div>
      )}
    </>
  );
};

export default TestDetail;
