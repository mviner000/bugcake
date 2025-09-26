import { Authenticated, Unauthenticated } from "convex/react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import { DetailPage } from "./components/sheet/detail-page";
import { Header } from "./components/navbar/Header";
import { Dashboard } from "./components/dashboard";
import { ProfilePage } from "./components/profile/ProfilePage";
import { SignInForm } from "./components/auth/SignInForm";
import { NotFound } from "./components/NotFound";
import { RBACPage } from "./components/rbac/rbac-page";

function UnauthenticatedRoutes() {
  const location = useLocation();
  const state = { from: location };

  return (
    <Routes>
      <Route path="/signin" element={<SignInForm />} />
      <Route path="/signup" element={<SignInForm />} />
      {/* If the user is unauthenticated, redirect them to sign-in, preserving the original path */}
      <Route path="*" element={<Navigate to="/signin" state={state} replace />} />
    </Routes>
  );
}

// This component handles all routes for authenticated users.
function AuthenticatedRoutes() {
  return (
    <>
      <Header />
      <Routes>
        {/* 🆕 If an authenticated user tries to go to sign-in or sign-up, redirect to the dashboard. */}
        <Route path="/signin" element={<Navigate to="/" replace />} />
        <Route path="/signup" element={<Navigate to="/" replace />} />

        {/* The main application routes for authenticated users */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/sheet/:sheetId" element={<DetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/rbac" element={<RBACPage />} />

        {/* A 404 page for any route that doesn't exist */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Authenticated>
        <AuthenticatedRoutes />
      </Authenticated>
      <Unauthenticated>
        <UnauthenticatedRoutes />
      </Unauthenticated>
    </BrowserRouter>
  );
}
