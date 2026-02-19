from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Department, Employee, SalaryPayment
from .serializers import DepartmentSerializer, EmployeeSerializer, SalaryPaymentSerializer
from apps.core.audit import AuditLogMixin


class DepartmentViewSet(AuditLogMixin, viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ["name"]


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
