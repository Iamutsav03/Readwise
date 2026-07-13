import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "./pages/Home";
import ThemeQAPage from "./pages/ThemeQAPage";
import { ThemeProvider } from "./theme/ThemeProvider";
import { AuthProvider } from "./features/auth/AuthProvider";
import { GuestSessionProvider } from "./features/auth/GuestSessionContext";
import AriaLiveRegion from "./components/AriaLiveRegion";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});


function App() {
  const [selectedPDF, setSelectedPDF] = useState(null);
  const [isQaMode, setIsQaMode] = useState(window.location.hash === '#qa');

  useEffect(() => {
    const handleHash = () => setIsQaMode(window.location.hash === '#qa');
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <GuestSessionProvider>
          <AuthProvider>
            <AriaLiveRegion />
            {isQaMode ? (
              <ThemeQAPage />
            ) : (
              <Home selectedPDF={selectedPDF} setSelectedPDF={setSelectedPDF} />
            )}
          </AuthProvider>
        </GuestSessionProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;