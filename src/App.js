import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import HomePage from './components/HomePage';
import LoginPage from './components/Login';
import Register from './components/Register';
import WorkPage from './components/WorkPage';
import ProfileSettingsPage from './components/ProfileSettingsPage';
import MyProjectsPage from './components/MyProjectsPage';
import SubmitProblemPage from './components/SubmitProblemPage';
import SubmitIdeaPage from './components/SubmitIdeaPage';
import Subscriptions from './components/Subscriptions';
import IdeasPlatform from './components/IdeasPlatform';
import UpdateProfilePage from './components/UpdateProfilePage';
import EditProfilePage from './components/EditProfilePage/EditProfilePage';
import Header from './components/Header';
import Footer from './components/Footer';
import Logout from './components/Logout';
import AdminDashboard from './components/Admin/AdminDashboard';
import BlogPage from './components/BlogPage';
import AmbassadorPage from './components/AmbassadorPage';
import Applications from './components/applications/applications';
import JurySecretaryProfile from './components/JurySecretaryProfile/JurySecretaryProfile';
import JuryVotingPage from './components/JuryVotingPage/JuryVotingPage';
import PMProjectsPage from './components/PMProjectsPage/PMProjectsPage';
import { UserProvider } from './components/context/UserContext';

import NotificationClient from './NotificationClient'; // ✅ Імпорт NotificationClient

const userId = localStorage.getItem("userId"); // або отримай через UserContext, якщо треба

const App = () => (
  <BrowserRouter>
    <UserProvider>
      <Header />
      {userId && <NotificationClient userId={userId} />} {/* ✅ Відображення NotificationClient */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/worker" element={<WorkPage />} />
        <Route path="/profile-settings" element={<ProfileSettingsPage />} />
        <Route path="/update-profile" element={<UpdateProfilePage />} />
        <Route path="/edit-profile" element={<EditProfilePage />} />
        <Route path="/projects" element={<MyProjectsPage />} />
        <Route path="/submit-problem" element={<SubmitProblemPage />} />
        <Route path="/submit-idea" element={<SubmitIdeaPage />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/my-problems" element={<IdeasPlatform />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/ambassadors" element={<AmbassadorPage />} />
        <Route path="/applications/:ideaId" element={<Applications />} />
        <Route path="/jury-secretary" element={<JurySecretaryProfile />} />
        <Route path="/jury" element={<JuryVotingPage />} />
        <Route path="/pm-projects" element={<PMProjectsPage />} />
      </Routes>
      <Footer />
    </UserProvider>
  </BrowserRouter>
);

export default App;
