// src/App.tsx

import { Authenticated, Unauthenticated } from "convex/react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { DetailPage } from "./sheet/detail-page";
import { Header } from "./Header";
import { SignInForm } from "./SignInForm";
import { Dashboard } from "./Dashboard";
import { ProfilePage } from "./ProfilePage";
import { RBACPage } from "./rbac-page";

export default function App() {
  return (
    <BrowserRouter>
      <Authenticated>
        <Header />
        <Routes>
          {/* Main dashboard route */}
          <Route path="/" element={<Dashboard />} />
          {/* Dynamic route for a specific sheet */}
          <Route path="/sheet/:sheetId" element={<DetailPage />} />
          {/* New route for the profile page */}
          <Route path="/profile" element={<ProfilePage />} />
          {/* New route for the rbac page */}
          <Route path="/rbac" element={<RBACPage />} />
        </Routes>
      </Authenticated>
      <Unauthenticated>
        {/* --- CHANGED: Added routes for unauthenticated users --- */}
        <Routes>
          <Route path="/signin" element={<SignInForm />} />
          <Route path="/signup" element={<SignInForm />} />
          {/* Redirect any other unauthenticated path to the sign-in page */}
          <Route path="*" element={<Navigate to="/signin" />} />
        </Routes>
      </Unauthenticated>
    </BrowserRouter>
  );
}
