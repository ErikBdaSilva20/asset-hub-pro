import { Outlet, Route, Routes } from "react-router-dom";
import { RequireAuth } from "@/components/RequireAuth";
import { AppLayout } from "@/layouts/app-layout";
import { LoginScreen } from "@/screens/LoginScreen";
import { RegisterScreen } from "@/screens/RegisterScreen";
import { NotFoundScreen } from "@/screens/NotFoundScreen";
import { SettingsScreen } from "@/screens/SettingsScreen";
import { DashboardPage } from "@/modules/dashboard/dashboard-page";
import { AssetsScreen } from "@/screens/AssetsScreen";
import { EquipmentScreen } from "@/screens/EquipmentScreen";
import { EmployeesScreen } from "@/screens/EmployeesScreen";
import { MovementsScreen } from "@/screens/MovementsScreen";
import { LicensesScreen } from "@/screens/LicensesScreen";
import { PpeScreen } from "@/screens/PpeScreen";
import { MaintenanceScreen } from "@/screens/MaintenanceScreen";
import { AuditsScreen } from "@/screens/AuditsScreen";
import { SuppliersScreen } from "@/screens/SuppliersScreen";
import { DepartmentsScreen } from "@/screens/DepartmentsScreen";
import { CategoriesScreen } from "@/screens/CategoriesScreen";

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
        <Route path="/employees" element={<EmployeesScreen />} />
        <Route path="/movements" element={<MovementsScreen />} />
        <Route path="/licenses" element={<LicensesScreen />} />
        <Route path="/ppe" element={<PpeScreen />} />
        <Route path="/maintenance" element={<MaintenanceScreen />} />
        <Route path="/audits" element={<AuditsScreen />} />
        <Route path="/suppliers" element={<SuppliersScreen />} />
        <Route path="/departments" element={<DepartmentsScreen />} />
        <Route path="/categories" element={<CategoriesScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
      </Route>

      <Route path="*" element={<NotFoundScreen />} />
    </Routes>
  );
}
