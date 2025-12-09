import { createBrowserRouter } from "react-router-dom";
import MainLayout from "@layouts/MainLayout";
import LoginPage from "@pages/Auth/Login";
import DashboardPage from "@pages/Dashboard";
import EmployeesPage from "@pages/Employees";
import ProtectedRoute from "./ProtectedRoute";
import NotFoundPage from "@pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "employees",
        element: <EmployeesPage />,
      },
      {
        path: "departments",
        element: <DepartmentsPage />,
      },
      // Add more routes here as you build them
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />
  },
]);
