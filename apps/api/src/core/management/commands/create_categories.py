from django.core.management.base import BaseCommand
from core.models import Category


class Command(BaseCommand):
    help = 'Create predefined project expense categories'

    def handle(self, *args, **options):
        categories = [
            {
                'name': 'Infraestructura',
                'color': '#3B82F6',
                'icon': 'server'
            },
            {
                'name': 'Software y Licencias',
                'color': '#10B981',
                'icon': 'package'
            },
            {
                'name': 'Personal y Salarios',
                'color': '#F59E0B',
                'icon': 'users'
            },
            {
                'name': 'Hardware',
                'color': '#EF4444',
                'icon': 'monitor'
            },
            {
                'name': 'Servicios en la Nube',
                'color': '#8B5CF6',
                'icon': 'cloud'
            },
            {
                'name': 'Comunicaciones',
                'color': '#06B6D4',
                'icon': 'phone'
            },
            {
                'name': 'Capacitación',
                'color': '#84CC16',
                'icon': 'graduation-cap'
            },
            {
                'name': 'Marketing',
                'color': '#F97316',
                'icon': 'megaphone'
            },
            {
                'name': 'Consultoría',
                'color': '#6366F1',
                'icon': 'briefcase'
            },
            {
                'name': 'Viajes y Representación',
                'color': '#EC4899',
                'icon': 'plane'
            },
            {
                'name': 'Seguros',
                'color': '#14B8A6',
                'icon': 'shield'
            },
            {
                'name': 'Impuestos y Tasas',
                'color': '#64748B',
                'icon': 'file-text'
            }
        ]

        created_count = 0
        for cat_data in categories:
            category, created = Category.objects.get_or_create(
                name=cat_data['name'],
                defaults={
                    'color': cat_data['color'],
                    'icon': cat_data['icon']
                }
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created category: {category.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Category already exists: {category.name}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'\nTotal categories created: {created_count}')
        )
        self.stdout.write(
            self.style.SUCCESS(f'Total categories in database: {Category.objects.count()}')
        )
