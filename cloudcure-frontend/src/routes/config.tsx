
import { ROUTES, ROLES } from '@/constants';
import { ProtectedRoute } from './ProtectedRoute';
import { HomeRedirect } from './HomeRedirect';
import { PublicRoute } from './PublicRoute';
import { AuthLayout } from '@/layouts/AuthLayout';
import { MainLayout } from '@/layouts/MainLayout';
import { EmptyLayout } from '@/layouts/EmptyLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';

// Lazy load pages
import LoginPage from '@/pages/login';
import RegisterPage from '@/pages/auth/Register';
import NotFoundPage from '@/pages/not-found';
import UnauthorizedPage from '@/pages/unauthorized';

// Admin Pages
import AdminDashboardPage from '@/pages/admin/dashboard';
import UsersManagementPage from '@/pages/admin/users';
import DoctorsManagementPage from '@/pages/admin/doctors';
import PatientsManagementPage from '@/pages/admin/patients';
import MedicalRecordsManagementPage from '@/pages/admin/medical-records';
import PrescriptionsManagementPage from '@/pages/admin/prescriptions';

// Patient Pages
import PatientAppointments from '@/pages/patient/appointments';
import PatientDoctors from '@/pages/patient/doctors';
import PatientDashboardPage from '@/pages/patient/dashboard/index';
import PatientBookAppointment from '@/pages/patient/book-appointment/index';
import PatientChatPage from '@/pages/patient/chat/index';
import PatientPrescriptionsPage from '@/pages/patient/prescriptions/index';
import PatientMedicalRecordsPage from '@/pages/patient/medical-records/index';

// Doctor Pages
import DoctorDashboardPage from '@/pages/doctor/dashboard/index';
import DoctorAppointmentsPage from '@/pages/doctor/appointments/index';
import DoctorPatientsPage from '@/pages/doctor/patients/index';
import DoctorChatPage from '@/pages/doctor/chat/index';
// import DoctorPaymentsPage from '@/pages/doctor/payments/index';
import DoctorProfilePage from '@/pages/doctor/profile/index';

import ProfilePage from '@/pages/profile/index';
import VideoCallPage from '@/pages/video-call/VideoCallPage';

// Public Info Pages (footer routes)
import FeaturesPage from '@/pages/info/features';
import PricingPage from '@/pages/info/pricing';
import SecurityPage from '@/pages/info/security';
import IntegrationsPage from '@/pages/info/integrations';
import ApiDocsPage from '@/pages/info/api-docs';
import AboutPage from '@/pages/info/about';
import BlogPage from '@/pages/info/blog';
import CareersPage from '@/pages/info/careers';
import PressPage from '@/pages/info/press';
import ContactPage from '@/pages/info/contact';
import PrivacyPage from '@/pages/info/privacy';
import TermsPage from '@/pages/info/terms';
import HipaaPage from '@/pages/info/hipaa';
import CookiePolicyPage from '@/pages/info/cookies';
import GdprPage from '@/pages/info/gdpr';

import type { RouteConfig } from '@/types';

/**
 * Centralized Route Configuration
 * Each route specifies its path, component, auth requirement, permission, and layout
 */

export const routes: RouteConfig[] = [
  // Public routes
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
    auth: false,
    layout: 'auth',
  },
  {
    path: ROUTES.REGISTER,
    element: <RegisterPage />,
    auth: false,
    layout: 'auth',
  },
  {
    path: ROUTES.UNAUTHORIZED,
    element: <UnauthorizedPage />,
    auth: false,
    layout: 'empty',
  },
  {
    path: ROUTES.NOT_FOUND,
    element: <NotFoundPage />,
    auth: false,
    layout: 'empty',
  },


  // Admin Routes
  {
    path: '/admin/dashboard',
    element: <AdminDashboardPage />,
    auth: true,
    permission: ROLES.ADMIN,
    layout: 'admin',
  },
  {
    path: '/admin/users',
    element: <UsersManagementPage />,
    auth: true,
    permission: ROLES.ADMIN,
    layout: 'admin',
  },
  {
    path: '/admin/doctors',
    element: <DoctorsManagementPage />,
    auth: true,
    permission: ROLES.ADMIN,
    layout: 'admin',
  },
  {
    path: '/admin/patients',
    element: <PatientsManagementPage />,
    auth: true,
    permission: ROLES.ADMIN,
    layout: 'admin',
  },
  {
    path: '/admin/medical-records',
    element: <MedicalRecordsManagementPage />,
    auth: true,
    permission: ROLES.ADMIN,
    layout: 'admin',
  },
  {
    path: '/admin/prescriptions',
    element: <PrescriptionsManagementPage />,
    auth: true,
    permission: ROLES.ADMIN,
    layout: 'admin',
  },

  // Patient Routes
  {
    path: '/patient/dashboard',
    element: <PatientDashboardPage />,
    auth: true,
    permission: ROLES.PATIENT,
    layout: 'dashboard',
  },
  {
    path: '/patient/appointments',
    element: <PatientAppointments />,
    auth: true,
    permission: ROLES.PATIENT,
    layout: 'dashboard',
  },
  {
    path: '/patient/doctors',
    element: <PatientDoctors />,
    auth: true,
    permission: ROLES.PATIENT,
    layout: 'dashboard',
  },
  {
    path: '/patient/book-appointment/:id',
    element: <PatientBookAppointment />,
    auth: true,
    permission: ROLES.PATIENT,
    layout: 'dashboard',
  },
  {
    path: '/patient/chat/:appointmentId/:doctorUserId',
    element: <PatientChatPage />,
    auth: true,
    permission: ROLES.PATIENT,
    layout: 'dashboard',
  },
  {
    path: '/medical-records',
    element: <PatientMedicalRecordsPage />,
    auth: true,
    permission: ROLES.PATIENT,
    layout: 'dashboard',
  },
  {
    path: '/prescriptions',
    element: <PatientPrescriptionsPage />,
    auth: true,
    permission: ROLES.PATIENT,
    layout: 'dashboard',
  },

  // Doctor Routes
  {
    path: '/doctor/dashboard',
    element: <DoctorDashboardPage />,
    auth: true,
    permission: ROLES.DOCTOR,
    layout: 'dashboard',
  },
  {
    path: '/doctor/appointments',
    element: <DoctorAppointmentsPage />,
    auth: true,
    permission: ROLES.DOCTOR,
    layout: 'dashboard',
  },
  {
    path: '/doctor/patients',
    element: <DoctorPatientsPage />,
    auth: true,
    permission: ROLES.DOCTOR,
    layout: 'dashboard',
  },
  {
    path: '/doctor/chat',
    element: <DoctorChatPage />,
    auth: true,
    permission: ROLES.DOCTOR,
    layout: 'dashboard',
  },
  {
    path: '/doctor/profile',
    element: <DoctorProfilePage />,
    auth: true,
    permission: ROLES.DOCTOR,
    layout: 'dashboard',
  },
  // {
  //   path: '/doctor/payments',
  //   element: <DoctorPaymentsPage />,
  //   auth: true,
  //   permission: ROLES.DOCTOR,
  //   layout: 'dashboard',
  // },

  // Home redirect
  {
    path: ROUTES.HOME,
    element: <HomeRedirect />,
    auth: false, // HomeRedirect handles its own auth check
    layout: 'empty',
  },
  {
    path: '/profile',
    element: <ProfilePage />,
    auth: true,
    layout: 'dashboard',
  },
  {
    path: '/video-call/:appointmentId/:otherUserId',
    element: <VideoCallPage />,
    auth: true,
    layout: 'empty',
  },

  // Public Info Routes (footer pages)
  { path: '/features', element: <FeaturesPage />, auth: false, layout: 'empty' },
  { path: '/pricing', element: <PricingPage />, auth: false, layout: 'empty' },
  { path: '/security', element: <SecurityPage />, auth: false, layout: 'empty' },
  { path: '/integrations', element: <IntegrationsPage />, auth: false, layout: 'empty' },
  { path: '/api-docs', element: <ApiDocsPage />, auth: false, layout: 'empty' },
  { path: '/about', element: <AboutPage />, auth: false, layout: 'empty' },
  { path: '/blog', element: <BlogPage />, auth: false, layout: 'empty' },
  { path: '/careers', element: <CareersPage />, auth: false, layout: 'empty' },
  { path: '/press', element: <PressPage />, auth: false, layout: 'empty' },
  { path: '/contact', element: <ContactPage />, auth: false, layout: 'empty' },
  { path: '/privacy', element: <PrivacyPage />, auth: false, layout: 'empty' },
  { path: '/terms', element: <TermsPage />, auth: false, layout: 'empty' },
  { path: '/hipaa', element: <HipaaPage />, auth: false, layout: 'empty' },
  { path: '/cookies', element: <CookiePolicyPage />, auth: false, layout: 'empty' },
  { path: '/gdpr', element: <GdprPage />, auth: false, layout: 'empty' },
];

/**
 * Get layout component based on layout type
 */
export function getLayout(layoutType: string): React.ComponentType<{ children: React.ReactNode }> {
  switch (layoutType) {
    case 'auth':
      return AuthLayout;
    case 'main':
      return MainLayout;
    case 'admin':
      return AdminLayout;
    case 'dashboard':
      return DashboardLayout;
    case 'empty':
      return EmptyLayout;
    default:
      return EmptyLayout;
  }
}

/**
 * Wrap route element with layout and protection if needed
 */
export function wrapRoute(route: RouteConfig): React.ReactElement {
  const Layout = getLayout(route.layout);

  let element: React.ReactElement;

  if (route.auth) {
    // Protected route - requires authentication
    element = (
      <ProtectedRoute requiredRole={route.permission as never}>{route.element}</ProtectedRoute>
    );
  } else if (route.path === ROUTES.LOGIN || route.path === ROUTES.REGISTER) {
    // Public auth routes - redirect if already authenticated
    element = <PublicRoute>{route.element}</PublicRoute>;
  } else {
    // Other public routes (404, unauthorized, etc.)
    element = route.element;
  }

  return <Layout>{element}</Layout>;
}
