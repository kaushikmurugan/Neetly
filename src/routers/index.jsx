import { Route, Routes } from "react-router-dom";
import { pages } from "../routers/routes";
import ProtectedRoute from "../utils/protectedRoutes";

export function Routers() {
  let pageRoutes = pages.map(({ path, title, element, isProtected }) => {
    return (
      <Route
        key={title}
        path={`${path}`}
        element={
          isProtected ? <ProtectedRoute>{element}</ProtectedRoute> : element
        }
      />
    );
  });
  return <Routes>{pageRoutes}</Routes>;
}
