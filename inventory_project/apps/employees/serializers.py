from rest_framework import serializers
from .models import Department, Employee, SalaryPayment


class DepartmentSerializer(serializers.ModelSerializer):
    employee_count = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")

    def get_employee_count(self, obj):
        return obj.employee_set.filter(status="active").count()


class EmployeeSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source="department.name", read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = "__all__"
        read_only_fields = ("id", "emp_number", "created_at", "updated_at")

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"


class SalaryPaymentSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()

    class Meta:
        model = SalaryPayment
        fields = "__all__"
        read_only_fields = ("id", "net_pay", "created_at", "updated_at")

    def get_employee_name(self, obj):
        return f"{obj.employee.first_name} {obj.employee.last_name}"
