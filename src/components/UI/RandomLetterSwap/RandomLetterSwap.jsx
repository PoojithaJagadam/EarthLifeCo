import React from 'react';
import './RandomLetterSwap.css';

/**
 * RandomLetterSwap Component
 * Staggered letter-swap / letter-roll animation for navigation links.
 * 
 * @param {Object} props
 * @param {string} props.text - The text to animate
 * @param {number} [props.staggerDuration=0.025] - Delay between adjacent letters in seconds
 * @param {number} [props.duration=0.45] - Transition duration in seconds
 * @param {string} [props.className=''] - Additional CSS classes
 */
export const RandomLetterSwap = ({
  text = '',
  staggerDuration = 0.025,
  duration = 0.45,
  className = ''
}) => {
  if (!text || typeof text !== 'string') {
    return <span>{text}</span>;
  }

  const characters = text.split('');

  return (
    <span 
      className={`letter-swap-wrapper ${className}`.trim()} 
      aria-label={text}
      style={{
        '--swap-duration': `${duration}s`
      }}
    >
      {characters.map((char, index) => {
        const isSpace = char === ' ';
        return (
          <span
            key={index}
            className="letter-swap-char"
            style={{
              '--swap-delay': `${index * staggerDuration}s`
            }}
            aria-hidden="true"
          >
            <span>{isSpace ? '\u00A0' : char}</span>
            <span>{isSpace ? '\u00A0' : char}</span>
          </span>
        );
      })}
    </span>
  );
};

export default RandomLetterSwap;
