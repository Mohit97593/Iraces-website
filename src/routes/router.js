import ResetPasswordPage from "../pages/ResetPasswordPage";
import InvitationHandler from "../pages/Auth/InvitationHandler";
import SetNewPassword from "../pages/Auth/SetNewPassword";
import React from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import MaintenanceWrapper from "../components/MaintenanceWrapper";
import MaintenancePage from "../pages/MaintenancePage";
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
import ForgotPassword from "../pages/Auth/ForgotPassword";
import NotFound from "../pages/NotFound";
import ErrorBoundary from "../components/ErrorBoundary";
import Profile from "../pages/Profile/Profile";
import MyEvents from "../pages/MyEvents";
import BannerDebugPage from "../pages/BannerDebugPage";
import SearchEvents from "../pages/SearchEvents";
import OrganiserProfile from "../pages/OrganiserProfile/OrganiserProfile";
import OrganiserPublicProfile from "../pages/OrganiserProfile/OrganiserPublicProfile";
import Favourites from "../pages/Favourites/Favourites";
import EventDetails from "../pages/EventDetails/EventDetails";
import SecureCheckout from "../pages/SecureCheckout/SecureCheckout";
import ParticipantDetails from "../pages/ParticipantDetails/ParticipantDetails";
import CreateEvent from "../pages/CreateEvent/CreateEvent";
import EventTermsConditions from "../pages/EventTermsConditions/EventTermsConditions";
import RegistrationTracker from "../pages/RegistrationTracker";
import EventAnalytics from "../pages/EventAnalytics/EventAnalytics";
import Registrations from "../pages/Registrations/Registrations";
import Participants from "../pages/Participants/Participants";
import PaymentLog from "../pages/PaymentLog/PaymentLog";
import RemittanceDetails from "../pages/RemittanceDetails/RemittanceDetails";
import PaymentSuccess from "../pages/PaymentSuccess";
import PaymentFailure from "../pages/PaymentFailure";
import TicketDetails from "../pages/TicketDetails";
import ResumePayment from "../pages/ResumePayment/ResumePayment";

const AppRouter = createBrowserRouter([
  {
    element: (
      <MaintenanceWrapper>
        <Outlet />
      </MaintenanceWrapper>
    ),
    children: [
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
        path: "/maintenance-mode",
        element: <MaintenancePage />,
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
        path: "/invitation/:orgId/:email",
        element: (
          <ErrorBoundary>
            <InvitationHandler />
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
        path: "/forgot-password",
        element: (
          <ErrorBoundary>
            <ForgotPassword />
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
        path: "/organiser/:organiserId/:organiserName?",
        element: (
          <ErrorBoundary>
            <OrganiserPublicProfile />
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
        path: "/event",
        element: (
          <ErrorBoundary>
            <EventDetails />
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
        path: "/event-terms/:eventId",
        element: (
          <ErrorBoundary>
            <EventTermsConditions />
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
        path: "/registration-tracker",
        element: (
          <ErrorBoundary>
            <RegistrationTracker />
          </ErrorBoundary>
        ),
        errorElement: <NotFound />,
      },
      {
        path: "/ticket-details/:eventId",
        element: (
          <ErrorBoundary>
            <TicketDetails />
          </ErrorBoundary>
        ),
        errorElement: <NotFound />,
      },
      {
        path: "/payment/success",
        element: (
          <ErrorBoundary>
            <PaymentSuccess />
          </ErrorBoundary>
        ),
        errorElement: <NotFound />,
      },
      {
        path: "/payment/failure",
        element: (
          <ErrorBoundary>
            <PaymentFailure />
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
        path: "/event-analytics/:eventId",
        element: (
          <ErrorBoundary>
            <EventAnalytics />
          </ErrorBoundary>
        ),
        errorElement: <NotFound />,
      },
      {
        path: "/registrations/:eventId",
        element: (
          <ErrorBoundary>
            <Registrations />
          </ErrorBoundary>
        ),
        errorElement: <NotFound />,
      },
      {
        path: "/participants/:eventId",
        element: (
          <ErrorBoundary>
            <Participants />
          </ErrorBoundary>
        ),
        errorElement: <NotFound />,
      },
      {
        path: "/payment-log/:eventId",
        element: (
          <ErrorBoundary>
            <PaymentLog />
          </ErrorBoundary>
        ),
        errorElement: <NotFound />,
      },
      {
        path: "/remittance-details/:eventId",
        element: (
          <ErrorBoundary>
            <RemittanceDetails />
          </ErrorBoundary>
        ),
        errorElement: <NotFound />,
      },
      {
        path: "/resumePayment",
        element: (
          <ErrorBoundary>
            <ResumePayment />
          </ErrorBoundary>
        ),
        errorElement: <NotFound />,
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
    ],
  },
]);

export { AppRouter, RouterProvider };
