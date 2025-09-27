import React, { useState } from 'react';
import api from '../api';
import { Editor } from '@tinymce/tinymce-react';

const modalStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const dialogStyle = {
  background: '#fff',
  padding: '1rem',
  borderRadius: '4px',
  maxWidth: '500px',
  width: '100%'
};

const progressBarStyle = {
  width: '100%',
  height: '20px',
  backgroundColor: '#f0f0f0',
  borderRadius: '10px',
  overflow: 'hidden',
  marginTop: '10px'
};

const progressFillStyle = {
  height: '100%',
  backgroundColor: '#4CAF50',
  transition: 'width 0.3s ease'
};

const UploadModal = ({ onClose, test }) => {
  const isEditMode = !!test;
  
  const [name, setName] = useState(test?.name || '');
  const [category, setCategory] = useState(test?.category || 'ssc');
  const [timeLimit, setTimeLimit] = useState(test?.timeLimit || '');
  const [audio, setAudio] = useState(null);
  const [expectedText, setExpectedText] = useState(test?.expectedText || '');
  const [message, setMessage] = useState('');
  const [dictationWpm, setDictationWpm] = useState(test?.dictationWpm || '');
  const [testType, setTestType] = useState(test?.testType || 'hidden');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const handleTimeLimitChange = (e) => {
    setTimeLimit(e.target.value);
  };

  const handleAudioChange = (e) => {
    setAudio(e.target.files[0]);
  };

  const handleExpectedTextChange = (content) => {
    setExpectedText(content);
  };
  
  const handleDictationWpmChange = (e) => {
    setDictationWpm(e.target.value);
  };
  
  const handleTestTypeChange = (e) => {
    setTestType(e.target.value);
  };
  
  const wordCount = expectedText.trim().split(/\s+/).filter(w => w).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // For editing, audio is optional
    if (!isEditMode && (!name || !category || !timeLimit || !dictationWpm || !audio || !expectedText)) {
      setMessage('Please provide all required fields.');
      return;
    }
    
    // For editing, only require non-empty fields
    if (isEditMode && (!name || !category || !timeLimit || !dictationWpm || !expectedText)) {
      setMessage('Please provide all required fields.');
      return;
    }
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('timeLimit', timeLimit);
    formData.append('dictationWpm', dictationWpm);
    formData.append('expectedText', expectedText);
    formData.append('testType', testType);
    
    // Only append audio if a new file was selected
    if (audio) {
      formData.append('audio', audio);
    }
    
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      if (isEditMode) {
        // Use PUT for editing
        await api.put(`/admin/tests/${test.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        });
        setMessage('Test updated successfully.');
      } else {
        // Use POST for creating
        await api.post('/admin/tests', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        });
        setMessage('Upload successful.');
        // Reset form fields only for create mode
        setName('');
        setCategory('ssc');
        setTimeLimit('');
        setDictationWpm('');
        setAudio(null);
        setExpectedText('');
      }
      setIsUploading(false);
      setTimeout(onClose, 1000);
    } catch (err) {
      setIsUploading(false);
      setMessage(isEditMode ? 'Update failed.' : 'Upload failed.');
      console.error(err);
    }
  };

  return (
    <div style={modalStyle}>
      <div style={dialogStyle}>
        <h3>{isEditMode ? 'Edit Test' : 'Upload New Test'}</h3>
        {message && <p>{message}</p>}
        
        {isUploading && (
          <div>
            <p>Uploading... {uploadProgress}%</p>
            <div style={progressBarStyle}>
              <div style={{...progressFillStyle, width: `${uploadProgress}%`}}></div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div>
            <label>Test Name:</label><br />
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              required
              style={{ width: '100%' }}
              disabled={isUploading}
            />
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <label>Category:</label><br />
            <select
              value={category}
              onChange={handleCategoryChange}
              required
              style={{ width: '100%' }}
              disabled={isUploading}
            >
              <option value="ssc">SSC</option>
              <option value="court">Court</option>
              <option value="others">Others</option>
            </select>
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <label>Time to Complete (seconds):</label><br />
            <input
              type="number"
              value={timeLimit}
              onChange={handleTimeLimitChange}
              required
              style={{ width: '100%' }}
              disabled={isUploading}
            />
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <label>Dictation WPM:</label><br />
            <input
              type="number"
              value={dictationWpm}
              onChange={handleDictationWpmChange}
              required
              style={{ width: '100%' }}
              disabled={isUploading}
            />
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <label>Test Type:</label><br />
            <select
              value={testType}
              onChange={handleTestTypeChange}
              required
              style={{ width: '100%' }}
              disabled={isUploading}
            >
              <option value="free">Free</option>
              <option value="premium">Premium</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <label>Audio File:</label><br />
            <input 
              type="file" 
              accept="audio/*" 
              onChange={handleAudioChange} 
              required={!isEditMode} 
              disabled={isUploading}
            />
            {isEditMode && <small>Leave blank to keep existing audio file</small>}
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <label>Expected Text:</label><br />
            <Editor
              tinymceScriptSrc="/tinymce/tinymce.min.js"
              licenseKey="gpl"
              value={expectedText}
              onEditorChange={handleExpectedTextChange}
              init={{
                height: 200,
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
              disabled={isUploading}
            />
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <p>Word Count: <strong>{wordCount}</strong></p>
          </div>
          <div style={{ marginTop: '1rem', textAlign: 'right' }}>
            <button 
              type="button" 
              onClick={onClose} 
              style={{ marginRight: '0.5rem' }}
              disabled={isUploading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : (isEditMode ? 'Update' : 'Upload')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
