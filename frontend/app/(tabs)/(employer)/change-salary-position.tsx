import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import ChangeSalaryPositionForm from "@/src/components/employer/changeSalaryPositionForm";
import AppErrorState from "@/src/components/common/AppErrorState";
import AppLoadingState from "@/src/components/common/AppLoadingState";
import EmployerScreenContainer from "@/src/components/layout/EmployerScreenContainer";
import { useAuthContext } from "@/src/context/AuthContext";
import type { EmployeeDetailDto } from "@/src/dtos/employer/employee.dtos";
import { getEmployeeDetail } from "@/src/services/api/employeeService";

export default function ChangeSalaryPositionScreen() {
  const { contractId } = useLocalSearchParams<{ contractId: string }>();
  const [employee, setEmployee] = useState<EmployeeDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const { state } = useAuthContext();
  const employerId = state.user?.user_id ?? "";
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!contractId) return;
    fetchDetail();
  }, [contractId]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEmployeeDetail(employerId, contractId);
      setEmployee(data);
    } catch {
      setError("No se pudo cargar la informacion del empleado.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <EmployerScreenContainer>
        <AppLoadingState message="Cargando informacion del empleado..." />
      </EmployerScreenContainer>
    );
  }

  if (error || !employee) {
    return (
      <EmployerScreenContainer>
        <AppErrorState message={error ?? "Empleado no encontrado."} onRetry={fetchDetail} />
      </EmployerScreenContainer>
    );
  }

  return <ChangeSalaryPositionForm employee={employee} />;
}
