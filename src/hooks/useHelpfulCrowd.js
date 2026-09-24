import { useEffect } from 'react';

const STORE_HASH = 'Q05Jgz7'; // From user dashboard images

const useHelpfulCrowd = (scriptName) => {
  useEffect(() => {
    if (!scriptName) return;

    const scriptUrl = `https://app.helpfulcrowd.com/f/${STORE_HASH}/widgets/${scriptName}`;
    
    // Check if script is already loaded
    if (document.querySelector(`script[src="${scriptUrl}"]`)) {
      return;
    }

    const script = document.createElement('script');
    script.src = scriptUrl;
    script.defer = true;
    script.onload = () => {
      const event = new Event('helpfulcrowd:refresh');
      document.dispatchEvent(event);
      window.dispatchEvent(event);
    };
    document.head.appendChild(script);
  }, [scriptName]);
};

export default useHelpfulCrowd;
