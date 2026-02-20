from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Department, Employee, SalaryPayment
from .serializers import DepartmentSerializer, EmployeeSerializer, SalaryPaymentSerializer
from apps.core.audit import AuditLogMixin


class DepartmentViewSet(AuditLogMixin, viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ["name"]
    filterset_fields = ["is_active"]
    
    @action(detail=False, methods=["get"], url_path="active")
    def active_only(self, request):
        """Return only active departments"""
        departments = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(departments, many=True)
        return Response(serializer.data)


class EmployeeViewSet(AuditLogMixin, viewsets.ModelViewSet):
    queryset = Employee.objects.select_related("department").all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "department"]
    search_fields = ["first_name", "last_name", "email", "emp_number"]
    ordering_fields = ["last_name", "hire_date", "basic_salary"]


class SalaryPaymentViewSet(viewsets.ModelViewSet):
    queryset = SalaryPayment.objects.select_related("employee").all()
    serializer_class = SalaryPaymentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["employee", "period_year", "period_month"]
    ordering_fields = ["period_year", "period_month", "net_pay"]
