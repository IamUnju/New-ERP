from rest_framework.routers import DefaultRouter
from .views import DepartmentViewSet, EmployeeViewSet, SalaryPaymentViewSet

router = DefaultRouter()
router.register("departments",      DepartmentViewSet,    basename="department")
router.register("employees",        EmployeeViewSet,      basename="employee")
router.register("salary-payments",  SalaryPaymentViewSet, basename="salary-payment")

urlpatterns = router.urls
