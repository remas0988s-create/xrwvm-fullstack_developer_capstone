import json

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction

from djangoapp.models import CarMake, CarModel


class Command(BaseCommand):
    help = "Import the IBM starter vehicle catalog without deleting existing entries."

    @transaction.atomic
    def handle(self, *args, **options):
        catalog = settings.BASE_DIR / "database/data/car_records.json"
        for entry in json.loads(catalog.read_text(encoding="utf-8"))["cars"]:
            make, _ = CarMake.objects.get_or_create(name=entry["make"])
            CarModel.objects.update_or_create(
                make=make, name=entry["model"], year=entry["year"],
                defaults={"body_type": entry["bodyType"]},
            )
        self.stdout.write(f"Catalog contains {CarMake.objects.count()} makes and {CarModel.objects.count()} models.")
