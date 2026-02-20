from django.db import models
from django.utils import timezone
from apps.core.models import TimeStampedModel


class Department(TimeStampedModel):
    name        = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    is_active   = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Employee(TimeStampedModel):
    class Status(models.TextChoices):
        ACTIVE     = "active",     "Active"
        INACTIVE   = "inactive",   "Inactive"
        TERMINATED = "terminated", "Terminated"

    emp_number  = models.CharField(max_length=20, unique=True, blank=True)
    first_name  = models.CharField(max_length=100)
    last_name   = models.CharField(max_length=100)
    email       = models.EmailField(unique=True, blank=True, null=True)
    phone       = models.CharField(max_length=30, blank=True)
    department  = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    position    = models.CharField(max_length=100, blank=True)
    hire_date   = models.DateField(default=timezone.now)
    basic_salary = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status      = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    address     = models.TextField(blank=True)
    # Link to system user if employee can log in
    user        = models.OneToOneField(
        "users.User", on_delete=models.SET_NULL,
        null=True, blank=True, related_name="employee_profile"
    )

    class Meta:
        ordering = ["last_name", "first_name"]

    def __str__(self):
        return f"{self.emp_number} – {self.first_name} {self.last_name}"

    def save(self, *args, **kwargs):
        if not self.emp_number:
            last = Employee.objects.order_by("-id").first()
            n = (last.id if last else 0) + 1
            self.emp_number = f"EMP{n:05d}"
        super().save(*args, **kwargs)


class SalaryPayment(TimeStampedModel):
    employee      = models.ForeignKey(Employee, on_delete=models.PROTECT, related_name="salary_payments")
    period_month  = models.PositiveSmallIntegerField()   # 1-12
    period_year   = models.PositiveSmallIntegerField()
    basic_salary  = models.DecimalField(max_digits=12, decimal_places=2)
    allowances    = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    deductions    = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    net_pay       = models.DecimalField(max_digits=12, decimal_places=2)
    paid_on       = models.DateField(null=True, blank=True)
    note          = models.TextField(blank=True)

    class Meta:
        unique_together = ("employee", "period_month", "period_year")
        ordering = ["-period_year", "-period_month"]

    def save(self, *args, **kwargs):
        self.net_pay = self.basic_salary + self.allowances - self.deductions
        super().save(*args, **kwargs)
