import { useAuth } from "../context/AuthContext";
import { ManufacturerDashboard } from "./ManufacturerDashboard";
import { DashboardPage } from "./DashboardPage";

const DashBoardSelector = () => {
  const { user } = useAuth();
  return user?.role == "manufacturer" ? (
    <ManufacturerDashboard />
  ) : (
    <DashboardPage />
  );
};

export default DashBoardSelector;
