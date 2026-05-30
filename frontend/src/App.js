import { useState } from "react";
import Home from "./pages/Home";

function App() {
  const [selectedPDF, setSelectedPDF] = useState(null);
  return <Home selectedPDF={selectedPDF} setSelectedPDF={setSelectedPDF} />;
}

export default App;