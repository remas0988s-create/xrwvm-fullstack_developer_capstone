from django.db import models


class CarMake(models.Model):
    name = models.CharField(max_length=80, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class CarModel(models.Model):
    make = models.ForeignKey(CarMake, on_delete=models.CASCADE, related_name="models")
    name = models.CharField(max_length=80)
    body_type = models.CharField(max_length=40)
    year = models.PositiveSmallIntegerField()

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=("make", "name", "year"), name="unique_catalog_car")
        ]

    def __str__(self):
        return f"{self.make} {self.name} ({self.year})"
