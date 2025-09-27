import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RoleSelect from "./components/auth/RoleSelect.jsx";
import Login from "./components/auth/Login.jsx";
import Register from "./components/auth/Register.jsx";
import StudentDashboard from "./components/student/StudentDashboard.jsx";
import TutorDashboard from "./components/tutor/TutorDashboard.jsx";
import ProfileSetup from "./components/tutor/ProfileSetup.jsx";
import Chat from "./components/chat/Chat.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/role" replace />} />
      <Route path="/role" element={<RoleSelect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/student" element={<StudentDashboard />} />
      <Route path="/tutor" element={<TutorDashboard />} />
      <Route path="/tutor-setup" element={<ProfileSetup />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="*" element={<Navigate to="/role" replace />} />
    </Routes>
  );
}
