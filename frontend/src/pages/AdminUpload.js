import React, { useState } from 'react';
import api from '../api';
import { Editor } from '@tinymce/tinymce-react';
import DiffViewer from '../components/DiffViewer';

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

const AdminUpload = () => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('ssc');
  const [timeLimit, setTimeLimit] = useState('');
  const [dictationWpm, setDictationWpm] = useState('');
  const [audio, setAudio] = useState(null);
  const [expectedText, setExpectedText] = useState('');
  const [message, setMessage] = useState('');
  const [typedText, setTypedText] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const handleTypedTextChange = (e) => setTypedText(e.target.value);

  const handleNameChange = (e) => setName(e.target.value);
  const handleCategoryChange = (e) => setCategory(e.target.value);
  const handleTimeLimitChange = (e) => setTimeLimit(e.target.value);
  const handleDictationWpmChange = (e) => setDictationWpm(e.target.value);
  const handleFileChange = (e) => setAudio(e.target.files[0]);
  const handleExpectedTextChange = (content) => setExpectedText(content);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !category || !timeLimit || !dictationWpm || !audio || !expectedText) {
      setMessage('All fields are required.');
      return;
    }
    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('timeLimit', timeLimit);
    formData.append('dictationWpm', dictationWpm);
    formData.append('audio', audio);
    formData.append('expectedText', expectedText);
    try {
      setIsUploading(true);
      setUploadProgress(0);
      await api.post('/admin/tests', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });
      setMessage('Test uploaded successfully.');
      setName('');
      setCategory('ssc');
      setTimeLimit('');
      setDictationWpm('');
      setAudio(null);
      setExpectedText('');
      setIsUploading(false);
    } catch (err) {
      setMessage('Upload failed.');
      console.error(err);
      setIsUploading(false);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Upload New Test</h2>
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
        <div style={{ marginBottom: '0.5rem' }}>
          <label>Test Name:</label><br />
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
            required
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>Category:</label><br />
          <select
            value={category}
            onChange={handleCategoryChange}
            required
            style={{ width: '100%' }}
          >
            <option value="ssc">SSC</option>
            <option value="court">Court</option>
            <option value="others">Others</option>
          </select>
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>Time Limit (seconds):</label><br />
          <input
            type="number"
            value={timeLimit}
            onChange={handleTimeLimitChange}
            required
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>Dictation WPM:</label><br />
          <input
            type="number"
            value={dictationWpm}
            onChange={handleDictationWpmChange}
            required
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>Audio File:</label><br />
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            required
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
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
          />
        </div>
        <button type="submit" style={{ padding: '0.5rem 1rem', background: '#2980b9', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Upload (जमा करें)
        </button>
      </form>
    </div>
  );
};

export default AdminUpload;
