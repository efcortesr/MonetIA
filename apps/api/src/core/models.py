from decimal import Decimal

from django.conf import settings
from django.db import models
from django.db.models import Sum


class UserProfile(models.Model):
  user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")
  role = models.CharField(max_length=50, default="member")

  class Meta:
    db_table = "user_profiles"


class Recommendation(models.Model):
  project = models.ForeignKey('Project', on_delete=models.CASCADE, related_name="recommendations_list")
  title = models.CharField(max_length=255)
  body = models.TextField()
  priority = models.CharField(max_length=50)
  created_at = models.DateTimeField(auto_now_add=True)

  class Meta:
    db_table = "recommendations"

  def __str__(self):
    return f"[{self.priority}] {self.title} - {self.project.name}"


class Category(models.Model):
  name = models.CharField(max_length=120, unique=True)
  color = models.CharField(max_length=20, blank=True)
  icon = models.CharField(max_length=120, blank=True)

  class Meta:
    db_table = "categories"

  def __str__(self):
    return self.name


class Project(models.Model):
  owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="projects")
  name = models.CharField(max_length=200)
  description = models.TextField(blank=True)
  budget = models.DecimalField(max_digits=14, decimal_places=2)
  start_date = models.DateField()
  end_date = models.DateField()
  status = models.CharField(max_length=50)

  class Meta:
    db_table = "projects"

  def __str__(self):
    return self.name

  @property
  def total_expenses(self):
    return self.expenses.aggregate(total=Sum("amount"))["total"] or Decimal("0.00")

  @property
  def total_roles_cost(self):
    return self.roles.aggregate(total=Sum("salary"))["total"] or Decimal("0.00")

  @property
  def total_spent(self):
    return self.total_expenses + self.total_roles_cost

  @property
  def remaining_budget(self):
    return self.budget - self.total_spent


class ProjectRole(models.Model):
  project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="roles")
  name = models.CharField(max_length=120)
  salary = models.DecimalField(max_digits=14, decimal_places=2)

  class Meta:
    db_table = "project_roles"
    unique_together = ("project", "name")


class Expense(models.Model):
  project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="expenses")
  category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="expenses")
  user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="expenses")
  amount = models.DecimalField(max_digits=14, decimal_places=2)
  description = models.TextField(blank=True)
  date = models.DateField()
  receipt_url = models.URLField(blank=True)
  status = models.CharField(max_length=50)

  class Meta:
    db_table = "expenses"


class Alert(models.Model):
  project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="alerts")
  type = models.CharField(max_length=60)
  message = models.TextField()
  severity = models.CharField(max_length=50)
  is_read = models.BooleanField(default=False)
  created_at = models.DateTimeField(auto_now_add=True)

  class Meta:
    db_table = "alerts"


class Prediction(models.Model):
  project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="predictions")
  predicted_total = models.DecimalField(max_digits=14, decimal_places=2)
  probability_overrun = models.DecimalField(max_digits=5, decimal_places=2)
  recommendations = models.TextField()
  generated_at = models.DateTimeField(auto_now_add=True)

  class Meta:
    db_table = "predictions"


class Report(models.Model):
  project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="reports")
  title = models.CharField(max_length=200)
  type = models.CharField(max_length=60)
  format = models.CharField(max_length=20)
  file_url = models.URLField()
  created_at = models.DateTimeField(auto_now_add=True)

  class Meta:
    db_table = "reports"


class Notification(models.Model):
  user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
  message = models.TextField()
  type = models.CharField(max_length=60)
  is_read = models.BooleanField(default=False)
  created_at = models.DateTimeField(auto_now_add=True)

  class Meta:
    db_table = "notifications"