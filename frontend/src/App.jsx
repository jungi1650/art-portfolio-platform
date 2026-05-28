import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import StudentDashboard from "./pages/StudentDashboard";
import ParentDashboard from "./pages/ParentDashboard";
import PortfolioDetailPage from "./pages/PortfolioDetailPage";
import CommunityListPage from "./pages/CommunityListPage";
import CommunityWritePage from "./pages/CommunityWritePage";
import CommunityDetailPage from "./pages/CommunityDetailPage";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import ArtworksPage from "./pages/ArtworksPage";

function App() {
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/community"
          element={<CommunityListPage boardType="community" />}
        />

        <Route
          path="/mentoring"
          element={<CommunityListPage boardType="mentoring" />}
        />

        <Route path="/community/:id" element={<CommunityDetailPage />} />
        <Route path="/mentoring/:id" element={<CommunityDetailPage />} />

        <Route
          path="/community/write"
          element={
            <ProtectedRoute>
              <CommunityWritePage boardType="community" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mentoring/write"
          element={
            <ProtectedRoute>
              <CommunityWritePage boardType="mentoring" />
            </ProtectedRoute>
          }
        />

        <Route path="/portfolio/:id" element={<PortfolioDetailPage />} />
        <Route path="/artworks" element={<ArtworksPage />} />

        <Route
          path="/student"
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/parent"
          element={
            <ProtectedRoute>
              <ParentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;