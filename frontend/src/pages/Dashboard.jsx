import { useAuth } from "../context/AuthContext";
import VecinoDashboard from "./VecinoDashboard";
import FuncionarioDashboard from "./FuncionarioDashboard";

export default function Dashboard() {
  const { user } = useAuth();

  if (user?.role === "Vecino") {
    return <VecinoDashboard />;
  }

  return <FuncionarioDashboard />;
}
