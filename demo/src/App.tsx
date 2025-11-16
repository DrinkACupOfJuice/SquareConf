import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Chat from "../src/pages/Chat/Chat";
import Home from "../src/pages/Home/Home";
import Manager from "../src/pages/Manager/Manager";
import KnowledgeBaseManager from "../src/pages/KnowledgeBaseManager/KnowledgeBaseManager";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/manager" element={<Manager />} />
        <Route path="/knowledge-base" element={<KnowledgeBaseManager />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Router>
  );
};

export default App;