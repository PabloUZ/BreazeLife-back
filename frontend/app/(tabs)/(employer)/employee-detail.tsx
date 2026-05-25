import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import EmployeeDetail from "@/src/components/employer/employeeDetail";
import AppErrorState from "@/src/components/common/AppErrorState";
import AppLoadingState from "@/src/components/common/AppLoadingState";
import EmployerScreenContainer from "@/src/components/layout/EmployerScreenContainer";
import { useAuthContext } from "@/src/context/AuthContext";
import type { EmployeeDetailDto } from "@/src/dtos/employer/employee.dtos";
import { getEmployeeDetail } from "@/src/services/api/employeeService";

export default function EmployeeDetailScreen() {
  const router = useRouter();
  const { state } = useAuthContext();
  const employerId = state.user?.user_id ?? "";
  const { contractId } = useLocalSearchParams<{ contractId: string }>();
  const [employee, setEmployee] = useState<EmployeeDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEmployeeDetail(employerId, contractId);
      setEmployee(data);
    } catch (err: any) {
      if (err.message === "EMPLOYEE_NOT_FOUND") {
        setError("Empleado no encontrado.");
      } else if (err.message === "UNAUTHORIZED") {
        setError("No tienes permiso para ver este empleado.");
      } else {
        setError("No se pudo cargar el detalle. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  }, [contractId, employerId]);

  useFocusEffect(
    useCallback(() => {
      if (!contractId) return;
      fetchDetail();
    }, [contractId, fetchDetail])
  );

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

  return (
    <EmployerScreenContainer>
      <EmployeeDetail
        employee={employee}
        onBack={() => router.back()}
        onEdit={() =>
          router.push({
            pathname: "/(tabs)/(employer)/edit-employee" as any,
            params: { contractId: employee.contractId },
          })
        }
        onViewHistory={() =>
          router.push({
            pathname: "/(tabs)/(employer)/salary-history" as any,
            params: { contractId: employee.contractId },
          })
        }
      />
    </EmployerScreenContainer>
  );
}
