from rest_framework.routers import DefaultRouter
from .views import AccountViewSet, ExpenseViewSet, IncomeViewSet, LedgerEntryViewSet, FinanceSummaryViewSet

router = DefaultRouter()
router.register("accounts",      AccountViewSet,      basename="account")
router.register("expenses",      ExpenseViewSet,      basename="expense")
router.register("income",        IncomeViewSet,       basename="income")
router.register("ledger",        LedgerEntryViewSet,  basename="ledger")
router.register("finance",       FinanceSummaryViewSet, basename="finance")

urlpatterns = router.urls
