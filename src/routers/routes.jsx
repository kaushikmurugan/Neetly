import TestDetails from "../pages/testDetails";
import Test from "../pages/test";
import TestResults from "../pages/testResults";
import TestReview from "../pages/testReview";
import TestCards from "../pages/testCards";
import OtpLogin from "../pages/otpLogin";
import HomeScreen from "../pages/homeScreen";
import Practice from "../pages/practice";
import SubjectUnits from "../pages/subjectUnits";
import UnitTestList from "../pages/unitTestList";
import TipsAndTricks from "../pages/tipsAndTricks";
import TestCategory from "../pages/testCategory";
import Feedback from "../pages/feedback";
import Bookmark from "../pages/bookmark";
import ProfilePage from "../pages/profile";

export const pages = [
  {
    path: "/",
    title: "OTP Login",
    element: <OtpLogin />,
    isProtected: false,
  },
  {
    path: "/home-screen",
    title: "Home Screen",
    element: <HomeScreen />,
    isProtected: true,
  },
  {
    path: "/practice",
    title: "Practice",
    element: <Practice />,
    isProtected: true,
  },
  {
    path: "/practice/units",
    title: "Units",
    element: <SubjectUnits />,
    isProtected: true,
  },
  {
    path: "/practice/units/test",
    title: "Units Test List",
    element: <UnitTestList />,
    isProtected: true,
  },
  {
    path: "/test-category",
    title: "Test Category",
    element: <TestCategory />,
    isProtected: true,
  },
  {
    path: "/test-cards",
    title: "Test CardPage",
    element: <TestCards />,
    isProtected: true,
  },
  {
    path: "/test-details",
    title: "Test Details",
    element: <TestDetails />,
    isProtected: true,
  },
  {
    path: "/test",
    title: "Test",
    element: <Test />,
    isProtected: true,
  },
  {
    path: "/test-results",
    title: "Test Results",
    element: <TestResults />,
    isProtected: true,
  },
  {
    path: "/test-review",
    title: "Test Review",
    element: <TestReview />,
    isProtected: true,
  },
  {
    path: "/tips-and-tricks",
    title: "Tips and Tricks",
    element: <TipsAndTricks />,
    isProtected: true,
  },
  {
    path: "/feedback",
    title: "Feedback",
    element: <Feedback />,
    isProtected: true,
  },
  {
    path: "/bookmark",
    title: "Bookmark",
    element: <Bookmark />,
    isProtected: true,
  },
  {
    path: "/profile",
    title: "Profile",
    element: <ProfilePage />,
    isProtected: true,
  },
];
