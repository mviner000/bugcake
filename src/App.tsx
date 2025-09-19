// src/App.tsx

import { Authenticated, Unauthenticated } from "convex/react";

import { DetailPage } from "./sheet/detail-page";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Header } from "./Header";
import { SignInForm } from "./SignInForm";
import { Dashboard } from "./Dashboard";
import { ProfilePage } from "./ProfilePage";
import { RBACPage } from "./rbac-page";

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Authenticated>
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
        <SignInForm />
      </Unauthenticated>
    </BrowserRouter>
  );
}
