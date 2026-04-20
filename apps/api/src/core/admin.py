from django.contrib import admin

from .models import (
  Alert,
  Category,
  Expense,
  Notification,
  Prediction,
  Project,
  ProjectRole,
  Recommendation,
  Report,
  UserProfile,
)

class RecommendationInline(admin.TabularInline):
  model = Recommendation
  extra = 0
  readonly_fields = ('title', 'body', 'priority', 'created_at')

class ProjectAdmin(admin.ModelAdmin):
  inlines = [RecommendationInline]

admin.site.register(UserProfile)
admin.site.register(Project, ProjectAdmin)
admin.site.register(ProjectRole)
admin.site.register(Category)
admin.site.register(Expense)
admin.site.register(Alert)
admin.site.register(Prediction)
admin.site.register(Recommendation)
admin.site.register(Report)
admin.site.register(Notification)