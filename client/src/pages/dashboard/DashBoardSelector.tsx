
import { ManufacturerDashboard } from "../dashboard/ManufacturerDashboard";
import { DashboardPage } from "./DashboardPage";
import { useAuth } from "../../lib/store";

const DashBoardSelector = () => {
  const { user } = useAuth();
  return user?.role == "manufacturer" ? (
    <ManufacturerDashboard />
  ) : (
    <DashboardPage />
  );
};

export default DashBoardSelector;
