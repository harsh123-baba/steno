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

const UploadModal = ({ onClose }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('ssc');
  const [timeLimit, setTimeLimit] = useState('');
  const [audio, setAudio] = useState(null);
  const [expectedText, setExpectedText] = useState('');
  const [message, setMessage] = useState('');

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

  const handleExpectedTextChange = (e) => {
    setExpectedText(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !category || !timeLimit || !audio || !expectedText) {
      setMessage('Please provide all required fields.');
      return;
    }
    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('timeLimit', timeLimit);
    formData.append('audio', audio);
    formData.append('expectedText', expectedText);
    try {
      await api.post('/admin/tests', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage('Upload successful.');
      setName('');
      setCategory('ssc');
      setTimeLimit('');
      setAudio(null);
      setExpectedText('');
      setTimeout(onClose, 1000);
    } catch (err) {
      setMessage('Upload failed.');
      console.error(err);
    }
  };

  return (
    <div style={modalStyle}>
      <div style={dialogStyle}>
        <h3>Upload New Test</h3>
        {message && <p>{message}</p>}
        <form onSubmit={handleSubmit}>
          <div>
            <label>Test Name:</label><br />
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              required
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ marginTop: '0.5rem' }}>
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
          <div style={{ marginTop: '0.5rem' }}>
            <label>Time to Complete (seconds):</label><br />
            <input
              type="number"
              value={timeLimit}
              onChange={handleTimeLimitChange}
              required
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <label>Audio File:</label><br />
            <input type="file" accept="audio/*" onChange={handleAudioChange} required />
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <label>Expected Text:</label><br />
            <Editor
              tinymceScriptSrc='/tinymce/tinymce.min.js'
              licenseKey='gpl'
              value={expectedText}
              onEditorChange={handleExpectedTextChange}
              init={{
                height: 500,
                menubar: false,
                plugins: "lists link image code",
                toolbar: "undo redo | fontfamily fontsize",
                font_family_formats: `
                  Kruti Dev 010=Kruti Dev 010;
                  DevLys 010=DevLys 010;
                `,
                content_style: `
                  body { font-family: DevLys 010=DevLys 010;; }
                  @font-face { font-family: 'Kruti Dev 010'; src: url('/fonts/KrutiDev_010.ttf') format('truetype'); }
                  @font-face { font-family: 'DevLys 010'; src: url('/fonts/DevLys_010.ttf') format('truetype'); }
                `
              }}
            />
          </div>
          <div style={{ marginTop: '1rem', textAlign: 'right' }}>
            <button type="button" onClick={onClose} style={{ marginRight: '0.5rem' }}>
              Cancel
            </button>
            <button type="submit">Upload</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
