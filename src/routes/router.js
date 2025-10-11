import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "../pages/Home";
import Hero from "../pages/Hero";
import OtherPage from "../pages/OtherPage";
import PrivateRoute from "./PrivateRoute";

const AppRouter = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/hero",
    element: <Hero />,
  },
  {
    path: "/other",
    element: <OtherPage />,
  },
], {
  basename: "/Iraces-website"
});

export { AppRouter, RouterProvider };
