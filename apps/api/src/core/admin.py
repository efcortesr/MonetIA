from django.contrib import admin

from .models import Alert, Category, Expense, Notification, Prediction, Project, Report, UserProfile


admin.site.register(UserProfile)
admin.site.register(Project)
admin.site.register(Category)
admin.site.register(Expense)
admin.site.register(Alert)
admin.site.register(Prediction)
admin.site.register(Report)
admin.site.register(Notification)