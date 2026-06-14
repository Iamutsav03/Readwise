import { useState, useEffect } from "react";
import Home from "./pages/Home";
import ThemeQAPage from "./pages/ThemeQAPage";
import { ThemeProvider } from "./theme/ThemeProvider";

function App() {
  const [selectedPDF, setSelectedPDF] = useState(null);
  const [isQaMode, setIsQaMode] = useState(window.location.hash === '#qa');

  useEffect(() => {
    const handleHash = () => setIsQaMode(window.location.hash === '#qa');
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  return (
    <ThemeProvider>
      {isQaMode ? (
        <ThemeQAPage />
      ) : (
        <Home selectedPDF={selectedPDF} setSelectedPDF={setSelectedPDF} />
      )}
    </ThemeProvider>
  );
}

export default App;