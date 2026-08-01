import { RequireAuth } from "@/components/RequireAuth";
import { AppLayout } from "@/layouts/app-layout";
import { DashboardPage } from "@/modules/dashboard/dashboard-page";
import { AssetsScreen } from "@/screens/AssetsScreen";
import { AuditsScreen } from "@/screens/AuditsScreen";
import { CargoScreen } from "@/screens/CargoScreen";
import { CategoriesScreen } from "@/screens/CategoriesScreen";
import { DepartmentsScreen } from "@/screens/DepartmentsScreen";
import { EquipmentScreen } from "@/screens/EquipmentScreen";
import { LicensesScreen } from "@/screens/LicensesScreen";
import { LoginScreen } from "@/screens/LoginScreen";
import { MaintenanceScreen } from "@/screens/MaintenanceScreen";
import { MovementsScreen } from "@/screens/MovementsScreen";
import { NotFoundScreen } from "@/screens/NotFoundScreen";
import { PpeRequirementsScreen } from "@/screens/PpeRequirementsScreen";
import { PpeScreen } from "@/screens/PpeScreen";
import { RegisterScreen } from "@/screens/RegisterScreen";
import { UsersScreen } from "@/screens/UsersScreen";
import { Outlet, Route, Routes } from "react-router-dom";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginScreen />} />
      <Route path="/register" element={<RegisterScreen />} />

      <Route
        element={
          <RequireAuth>
            <AppLayout>
              <Outlet />
            </AppLayout>
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/assets" element={<AssetsScreen />} />
        <Route path="/equipment" element={<EquipmentScreen />} />
        <Route path="/movements" element={<MovementsScreen />} />
        <Route path="/licenses" element={<LicensesScreen />} />
        <Route path="/ppe" element={<PpeScreen />} />
        <Route path="/ppe-requirements" element={<PpeRequirementsScreen />} />
        <Route path="/maintenance" element={<MaintenanceScreen />} />
        <Route path="/audits" element={<AuditsScreen />} />
        <Route path="/departments" element={<DepartmentsScreen />} />
        <Route path="/categories" element={<CategoriesScreen />} />
        <Route
          path="/users"
          element={
            <RequireAuth roles={["admin"]}>
              <UsersScreen />
            </RequireAuth>
          }
        />
        <Route
          path="/cargo"
          element={
            <RequireAuth roles={["admin", "manager"]}>
              <CargoScreen />
            </RequireAuth>
          }
        />
      </Route>

      <Route path="*" element={<NotFoundScreen />} />
    </Routes>
  );
}
