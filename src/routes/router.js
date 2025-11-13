import ResetPasswordPage from "../pages/ResetPasswordPage";
import SetNewPassword from "../pages/Auth/SetNewPassword";
import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "../pages/Home";
import Hero from "../pages/Hero";
import OtherPage from "../pages/OtherPage";
import Contact from "../pages/Contact/Contact";
import Disclaimer from "../pages/Disclaimer/Disclaimer_new";
import TermsConditions from "../pages/TermsConditions/TermsConditions";
import PrivacyPolicy from "../pages/PrivacyPolicy/PrivacyPolicy";
import CancellationPolicy from "../pages/CancellationPolicy/CancellationPolicy";
import WhyChooseRaces from "../pages/WhyChooseRaces/WhyChooseRaces";
import Login from "../pages/Auth/Login";
import Signup from "../pages/Auth/Signup";
import NotFound from "../pages/NotFound";
import ErrorBoundary from "../components/ErrorBoundary";
import Profile from "../pages/Profile/Profile";
import MyEvents from "../pages/MyEvents";
import BannerDebugPage from "../pages/BannerDebugPage";
import SearchEvents from "../pages/SearchEvents";
import OrganiserProfile from "../pages/OrganiserProfile/OrganiserProfile";
import Favourites from "../pages/Favourites/Favourites";
import EventDetails from "../pages/EventDetails/EventDetails";
import SecureCheckout from "../pages/SecureCheckout/SecureCheckout";
import ParticipantDetails from "../pages/ParticipantDetails/ParticipantDetails";
import CreateEvent from "../pages/CreateEvent/CreateEvent";

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
    path: "/in/:citySlug",
    element: (
      <ErrorBoundary>
        <Hero />
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
    path: "/disclaimer",
    element: (
      <ErrorBoundary>
        <Disclaimer />
      </ErrorBoundary>
    ),
    errorElement: <NotFound />,
  },
  {
    path: "/terms-conditions",
    element: (
      <ErrorBoundary>
        <TermsConditions />
      </ErrorBoundary>
    ),
    errorElement: <NotFound />,
  },
  {
    path: "/privacy-policy",
    element: (
      <ErrorBoundary>
        <PrivacyPolicy />
      </ErrorBoundary>
    ),
    errorElement: <NotFound />,
  },
  {
    path: "/cancellation-policy",
    element: (
      <ErrorBoundary>
        <CancellationPolicy />
      </ErrorBoundary>
    ),
    errorElement: <NotFound />,
  },
  {
    path: "/why-choose-races",
    element: (
      <ErrorBoundary>
        <WhyChooseRaces />
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
    path: "/profile",
    element: (
      <ErrorBoundary>
        <Profile />
      </ErrorBoundary>
    ),
    errorElement: <NotFound />,
  },
  {
    path: "/myevents",
    element: (
      <ErrorBoundary>
        <MyEvents />
      </ErrorBoundary>
    ),
    errorElement: <NotFound />,
  },
  {
    path: "/organiser-profile",
    element: (
      <ErrorBoundary>
        <OrganiserProfile />
      </ErrorBoundary>
    ),
    errorElement: <NotFound />,
  },
  {
    path: "/search-events",
    element: (
      <ErrorBoundary>
        <SearchEvents />
      </ErrorBoundary>
    ),
    errorElement: <NotFound />,
  },
  {
    path: "/event/:eventId",
    element: (
      <ErrorBoundary>
        <EventDetails />
      </ErrorBoundary>
    ),
    errorElement: <NotFound />,
  },
  {
    path: "/checkout/:eventId",
    element: (
      <ErrorBoundary>
        <SecureCheckout />
      </ErrorBoundary>
    ),
    errorElement: <NotFound />,
  },
  {
    path: "/participant-details/:eventId",
    element: (
      <ErrorBoundary>
        <ParticipantDetails />
      </ErrorBoundary>
    ),
    errorElement: <NotFound />,
  },
  {
    path: "/favourites",
    element: (
      <ErrorBoundary>
        <Favourites />
      </ErrorBoundary>
    ),
    errorElement: <NotFound />,
  },
  {
    path: "/banner-debug",
    element: <BannerDebugPage />,
  },
  {
    path: "/reset-password/home/true/:token",
    element: <SetNewPassword />,
  },
  {
    path: "/reset-password/:token",
    element: <ResetPasswordPage />,
  },
  {
    path: "/create-event",
    element: (
      <ErrorBoundary>
        <CreateEvent />
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
