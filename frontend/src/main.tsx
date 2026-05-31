import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router";

import App from "./pages/App.tsx";
import Calendar from "./pages/Calendars.tsx";
import Settings from "./pages/Settings.tsx";
import Diary from "./pages/Diary.tsx";
import DiaryEntry from "./pages/DiaryEntry.tsx";
import DiaryLogger from "./pages/DiaryLogger.tsx";
import DiaryEntryEditor from "./pages/DiaryEntryEditor.tsx";
import ErrorPage from "./pages/ErrorPage.tsx";

import TempJournalEntryInserter from "./pages/TempJournalEntryInserter.tsx";

import "bootstrap/dist/css/bootstrap.css";
import "./styles/global.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
  },
  { path: "/calendar/:year?/:month?", element: <Calendar /> },
  { path: "/settings", element: <Settings /> },
  { path: "/diary", element: <Diary /> },
  { path: "/logentry", element: <DiaryLogger /> },
  { path: "/entry/:entryID", element: <DiaryEntry /> },
  { path: "/test", element: <TempJournalEntryInserter /> },
  { path: "/editentry/:entryID", element: <DiaryEntryEditor /> },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
