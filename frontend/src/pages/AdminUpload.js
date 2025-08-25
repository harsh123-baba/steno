import React, { useState } from 'react';
import api from '../api';

const AdminUpload = () => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('ssc');
  const [timeLimit, setTimeLimit] = useState('');
  const [audio, setAudio] = useState(null);
  const [expectedText, setExpectedText] = useState('');
  const [message, setMessage] = useState('');

  const handleNameChange = (e) => setName(e.target.value);
  const handleCategoryChange = (e) => setCategory(e.target.value);
  const handleTimeLimitChange = (e) => setTimeLimit(e.target.value);
  const handleFileChange = (e) => setAudio(e.target.files[0]);
  const handleExpectedTextChange = (e) => setExpectedText(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !category || !timeLimit || !audio || !expectedText) {
      setMessage('All fields are required.');
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
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('Test uploaded successfully.');
      setName('');
      setCategory('ssc');
      setTimeLimit('');
      setAudio(null);
      setExpectedText('');
    } catch (err) {
      setMessage('Upload failed.');
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Upload New Test</h2>
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
          <input type="file" accept="audio/*" onChange={handleFileChange} required />
        </div>
        <div style={{ marginTop: '0.5rem' }}>
          <label>Expected Text:</label><br />
          <textarea
            rows="4"
            cols="50"
            value={expectedText}
            onChange={handleExpectedTextChange}
            required
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginTop: '1rem' }}>
          <button type="submit">Upload</button>
        </div>
      </form>
    </div>
  );
};

export default AdminUpload;
