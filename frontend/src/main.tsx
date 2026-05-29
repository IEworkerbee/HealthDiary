import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router";

import App from "./pages/App.tsx";
import Calendar from "./pages/Calendars.tsx";
import Settings from "./pages/Settings.tsx";
import Diary from "./pages/Diary.tsx";
import ErrorPage from "./pages/ErrorPage.tsx";

import "bootstrap/dist/css/bootstrap.css";
import "./styles/global.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
  },
  { path: "/calendar", element: <Calendar /> },
  { path: "/settings", element: <Settings /> },
  { path: "/diary", element: <Diary /> },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
