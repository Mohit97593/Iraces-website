import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "../pages/Home";
import Hero from "../pages/Hero";
import OtherPage from "../pages/OtherPage";
import Contact from "../pages/Contact/Contact";
import Login from "../pages/Auth/Login";
import Signup from "../pages/Auth/Signup";
import NotFound from "../pages/NotFound";
import ErrorBoundary from "../components/ErrorBoundary";

const AppRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <ErrorBoundary>
        <Home />
      </ErrorBoundary>
    ),
    errorElement: <NotFound />,
  },
  {
    path: "/hero",
    element: (
      <ErrorBoundary>
        <Hero />
      </ErrorBoundary>
    ),
    errorElement: <NotFound />,
  },
  {
    path: "/other",
    element: (
      <ErrorBoundary>
        <OtherPage />
      </ErrorBoundary>
    ),
    errorElement: <NotFound />,
  },
  {
    path: "/contact",
    element: (
      <ErrorBoundary>
        <Contact />
      </ErrorBoundary>
    ),
    errorElement: <NotFound />,
  },
  {
    path: "/login",
    element: (
      <ErrorBoundary>
        <Login />
      </ErrorBoundary>
    ),
    errorElement: <NotFound />,
  },
  {
    path: "/signup",
    element: (
      <ErrorBoundary>
        <Signup />
      </ErrorBoundary>
    ),
    errorElement: <NotFound />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export { AppRouter, RouterProvider };
