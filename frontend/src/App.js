import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "./pages/Home";
import ThemeQAPage from "./pages/ThemeQAPage";
import { ThemeProvider } from "./theme/ThemeProvider";
import { AuthProvider } from "./features/auth/AuthProvider";
import { useAuth } from "./features/auth/useAuth";
import AuthPage from "./features/auth/AuthPage";
import AriaLiveRegion from "./components/AriaLiveRegion";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function AuthGate({ children }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--rw-bg, #0d0f12)", color: "white" }}>Loading...</div>;
  }
  
  if (!user) {
    return <AuthPage />;
  }
  
  return children;
}

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
        <AuthProvider>
          <AuthGate>
            <AriaLiveRegion />
            {isQaMode ? (
              <ThemeQAPage />
            ) : (
              <Home selectedPDF={selectedPDF} setSelectedPDF={setSelectedPDF} />
            )}
          </AuthGate>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;