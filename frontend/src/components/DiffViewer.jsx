import React from 'react';
import PropTypes from 'prop-types';
import './DiffViewer.css';
import kru2uni from '@anthro-ai/krutidev-unicode';

const stripTags = (input) => {
  const tmp = document.createElement('div');
  tmp.innerHTML = input;
  return tmp.textContent || '';
};

function computeLCS(a, b) {
  const n = a.length, m = b.length;
  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      if (a[i] === b[j]) {
        dp[i][j] = dp[i + 1][j + 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  let i = 0;
  let j = 0;
  const result = [];

  while (i < n && j < m) {
    if (a[i] === b[j]) {
      result.push({ type: 'match', value: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      result.push({ type: 'orig', value: a[i] });
      i++;
    } else {
      result.push({ type: 'typed', value: b[j] });
      j++;
    }
  }

  while (i < n) {
    result.push({ type: 'orig', value: a[i] });
    i++;
  }
  while (j < m) {
    result.push({ type: 'typed', value: b[j] });
    j++;
  }

  return result;
}

function diffWords(originalText, typedText) {
  const origWords = originalText.trim().split(/\s+/).filter(w => w);
  const typedWords = typedText.trim().split(/\s+/).filter(w => w);
  return computeLCS(origWords, typedWords);
}

const DiffViewer = ({ original, typed }) => {
  const originalText = kru2uni(stripTags(original));
  const typedText = kru2uni(stripTags(typed));
  const segmentsRaw = diffWords(originalText, typedText);

  const segments = [];
  for (let i = 0; i < segmentsRaw.length; ) {
    if (
      segmentsRaw[i].type === 'typed' &&
      segmentsRaw[i + 1] &&
      segmentsRaw[i + 1].type === 'orig'
    ) {
      segments.push({
        type: 'error',
        wrong: segmentsRaw[i].value,
        correct: segmentsRaw[i + 1].value
      });
      i += 2;
    } else if (segmentsRaw[i].type === 'match') {
      segments.push({ type: 'match', value: segmentsRaw[i].value });
      i++;
    } else if (segmentsRaw[i].type === 'typed') {
      segments.push({ type: 'deletion', wrong: segmentsRaw[i].value });
      i++;
    } else if (segmentsRaw[i].type === 'orig') {
      segments.push({ type: 'insertion', correct: segmentsRaw[i].value });
      i++;
    } else {
      i++;
    }
  }

  return (
    <div className="diff-container">
      {segments.map((seg, idx) => {
        if (seg.type === 'match') {
          return <span key={idx}>{seg.value} </span>;
        } else if (seg.type === 'error') {
          return (
            <span key={idx} className="diff-error">
              <del>{seg.wrong}</del> [{seg.correct}]{' '}
            </span>
          );
        } else if (seg.type === 'deletion') {
          return (
            <span key={idx} className="diff-error">
              <del>{seg.wrong}</del>{' '}
            </span>
          );
        } else if (seg.type === 'insertion') {
          return (
            <span key={idx} className="diff-missing">
              [{seg.correct}]{' '}
            </span>
          );
        }
        return null;
      })}
    </div>
  );
};

DiffViewer.propTypes = {
  original: PropTypes.string.isRequired,
  typed: PropTypes.string.isRequired
};

export default DiffViewer;
