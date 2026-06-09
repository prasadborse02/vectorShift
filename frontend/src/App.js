import { useState, useEffect } from 'react';
import { PipelineToolbar } from './toolbar';
import { PipelineUI } from './ui';
import './styles.css';

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });
  const [canvasBg, setCanvasBg] = useState('#1a1b2e');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="app-container">
      <div className="app-main">
        <PipelineToolbar />
        <PipelineUI
          theme={theme}
          toggleTheme={toggleTheme}
          canvasBg={canvasBg}
          setCanvasBg={setCanvasBg}
        />
      </div>
    </div>
  );
}

export default App;
