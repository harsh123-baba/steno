import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import { ReactTransliterate } from "react-transliterate";
import "react-transliterate/dist/index.css";

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

const getEditorStyle = (fontFamily) => ({
  width: '100%',
  fontFamily: fontFamily === 'Kruti Dev 010' ? 'Kruti Dev 010, monospace' : fontFamily,
  fontSize: '18px',
  lineHeight: fontFamily === 'Kruti Dev 010' ? '1.8' : '1.6',
  letterSpacing: fontFamily === 'Kruti Dev 010' ? '0.5px' : 'normal',
  padding: '1rem',
  borderRadius: '4px',
  border: '2px solid #3498db',
  marginBottom: '1rem',
  height: '200px',
  resize: 'vertical',
  backgroundColor: '#fff',
  outline: 'none'
});

const toolbarStyle = {
  display: 'flex',
  gap: '0.5rem',
  marginBottom: '0.5rem',
  padding: '0.5rem',
  backgroundColor: '#f8f9fa',
  borderRadius: '4px',
  border: '1px solid #dee2e6'
};

const toolButtonStyle = {
  padding: '0.25rem 0.5rem',
  border: '1px solid #ccc',
  borderRadius: '3px',
  backgroundColor: '#fff',
  cursor: 'pointer',
  fontSize: '14px'
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
  const [selectedFont, setSelectedFont] = useState('Kruti Dev 010');
  const [useTransliteration, setUseTransliteration] = useState(true);
  const editorRef = useRef(null);

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

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  const handleFontChange = (fontName) => {
    setSelectedFont(fontName);
    if (editorRef.current) {
      editorRef.current.style.fontFamily = fontName;
    }
  };

  // Kruti Dev 010 keyboard mapping
  const krutiMapping = {
    'a': 'क', 'b': 'व', 'c': 'अ', 'd': '्', 'e': 'आ', 'f': 'इ', 'g': 'उ', 'h': 'फ',
    'i': 'ग', 'j': 'र', 'k': 'क', 'l': 'त', 'm': 'स', 'n': 'ल', 'o': 'य', 'p': 'ज',
    'q': 'औ', 'r': 'ी', 's': 'े', 't': 'ू', 'u': 'ह', 'v': 'न', 'w': 'ै', 'x': 'ं',
    'y': 'ब', 'z': 'ए', 'A': 'ओ', 'B': 'ऊ', 'C': 'ण', 'D': 'अं', 'E': 'ध', 'F': 'ऋ',
    'G': 'ख', 'H': 'घ', 'I': 'छ', 'J': 'झ', 'K': 'ख', 'L': 'थ', 'M': 'श', 'N': 'ळ',
    'O': 'द', 'P': 'च', 'Q': 'ऑ', 'R': 'ऐ', 'S': 'ो', 'T': 'ऊ', 'U': 'ङ', 'V': 'ऩ',
    'W': 'ॉ', 'X': 'ँ', 'Y': 'भ', 'Z': 'एँ', '1': '१', '2': '२', '3': '३', '4': '४',
    '5': '५', '6': '६', '7': '७', '8': '८', '9': '९', '0': '०', '/': 'य', '?': 'य्',
    '<': 'ष', '>': '।', '[': 'ड', ']': 'ढ', '{': 'ड़', '}': 'ढ़', '|': 'ॐ', ';': 'प',
    ':': 'प्', "'": 'ट', '"': 'ठ', ',': ',', '.': '.', '!': '!', '@': 'ॅ', '#': '्र',
    '$': 'र्', '%': 'ज्ञ', '^': 'त्र', '&': 'श्र', '*': 'द्व', '(': '(', ')': ')'
  };

  const handleKrutiInput = (e) => {
    if (selectedFont === 'Kruti Dev 010' && useTransliteration) {
      const char = e.key;
      if (krutiMapping[char]) {
        e.preventDefault();
        const newText = typedText + krutiMapping[char];
        setTypedText(newText);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      const allowedKeys = ['a', 'c', 'v', 'x', 'z', 'y'];
      if (!allowedKeys.includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    }
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (submitted) return;
    
    console.log('Submitting:', { typedText: typedText.trim(), timeTaken: elapsed, testId: id });
    
    try {
      const response = await api.post(`/tests/${id}/submit`, {
        typedText: typedText.trim(),
        timeTaken: elapsed
      });
      console.log('Submit response:', response.data);
      setResult(response.data);
      setTimerActive(false);
      setSubmitted(true);
    } catch (err) {
      console.error('Submit error:', err.response?.data || err.message);
      const errorMsg = err.response?.data?.message || 'Submission failed';
      alert(`सबमिशन में त्रुटि: ${errorMsg}`);
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
          </div>
        </div>
      )}

      {timerActive && !submitted && (
        <div style={overlayStyle}>
          <h2>{name}</h2>
          <p style={{ fontSize: '18px', marginBottom: '1rem' }}><strong>Timer:</strong> {elapsed}s / {timeLimitState}s</p>
          <p style={{ marginBottom: '1rem', color: '#7f8c8d' }}>हिंदी में टाइप करें (Type in Hindi):</p>
          <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '800px' }}>
            <div style={toolbarStyle}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '14px' }}>
                <input 
                  type="checkbox" 
                  checked={useTransliteration}
                  onChange={(e) => setUseTransliteration(e.target.checked)}
                />
                {selectedFont === 'Kruti Dev 010' ? 'Kruti Typing' : 'Hindi Typing'}
              </label>
              <button type="button" style={toolButtonStyle} onClick={() => formatText('bold')}>
                <strong>B</strong>
              </button>
              <button type="button" style={toolButtonStyle} onClick={() => formatText('italic')}>
                <em>I</em>
              </button>
              <button type="button" style={toolButtonStyle} onClick={() => formatText('underline')}>
                <u>U</u>
              </button>
              <button type="button" style={toolButtonStyle} onClick={() => formatText('fontSize', '16px')}>
                16px
              </button>
              <button type="button" style={toolButtonStyle} onClick={() => formatText('fontSize', '18px')}>
                18px
              </button>
              <button type="button" style={toolButtonStyle} onClick={() => formatText('fontSize', '20px')}>
                20px
              </button>
            </div>
            <textarea
              ref={editorRef}
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              onKeyDown={handleKrutiInput}  // Added Kruti keyboard input handling
              style={getEditorStyle(selectedFont)}
              className={selectedFont === 'Kruti Dev 010' ? 'kruti-font' : ''}
              autoFocus
              placeholder={selectedFont === 'Kruti Dev 010' ? "Enable Hindi keyboard in your system settings to type" : "Type here..."}
              lang="hi"
              inputMode="text"
              spellCheck={false}
            />
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button type="submit" style={buttonStyle}>
                Submit (जमा करें)
              </button>
              <span style={{ fontSize: '14px', color: '#666' }}>
                Words: {typedText.trim().split(/\s+/).filter(w => w.length > 0).length}
              </span>
            </div>
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
