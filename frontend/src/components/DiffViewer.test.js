import React from 'react';
import { render, screen } from '@testing-library/react';
import DiffViewer from './DiffViewer';

describe('DiffViewer', () => {
  test('renders matching characters without highlights', () => {
    render(<DiffViewer original="abc" typed="abc" />);
    expect(screen.getByText('a')).toBeInTheDocument();
    expect(screen.getByText('b')).toBeInTheDocument();
    expect(screen.getByText('c')).toBeInTheDocument();
  });

  test('highlights mismatches in red and shows correct text in brackets', () => {
    render(<DiffViewer original="ab" typed="ax" />);
    // 'a' matches
    expect(screen.getByText('a')).toBeInTheDocument();
    // 'x' is wrong and should have diff-wrong class
    const wrong = screen.getByText('x');
    expect(wrong).toBeInTheDocument();
    expect(wrong).toHaveClass('diff-wrong');
    // correct 'b' should be shown in brackets with diff-correct class
    const correctBracket = screen.getByText('[b]');
    expect(correctBracket).toBeInTheDocument();
    expect(correctBracket).toHaveClass('diff-correct');
  });
});
