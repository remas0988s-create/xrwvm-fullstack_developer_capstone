import json
from datetime import date
from urllib.parse import quote

import requests
from django import forms
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import UserCreationForm
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_POST

from .models import CarMake, CarModel
from .restapis import analyze_review_sentiments, get_request, post_review


class RegistrationForm(UserCreationForm):
    first_name = forms.CharField(max_length=150)
    last_name = forms.CharField(max_length=150)
    email = forms.EmailField()

    class Meta(UserCreationForm.Meta):
        fields = ("username", "first_name", "last_name", "email")


def reply(status=200, **data):
    return JsonResponse({"status": status, **data}, status=status)


def payload(request):
    try:
        data = json.loads(request.body)
    except (ValueError, UnicodeError):
        return {}
    return data if isinstance(data, dict) else {}


@ensure_csrf_cookie
@require_GET
def session(request):
    return reply(userName=request.user.get_username() if request.user.is_authenticated else None)


@require_POST
def login_user(request):
    data = payload(request)
    username, password = data.get("userName"), data.get("password")
    if not isinstance(username, str) or not isinstance(password, str):
        return reply(400, error="Username and password are required.")
    user = authenticate(request, username=username, password=password)
    if user is None:
        return reply(401, error="Invalid username or password.")
    login(request, user)
    return reply(userName=user.get_username(), authenticated=True)


@require_POST
def logout_user(request):
    logout(request)
    return reply(message="Logged out successfully.")


@require_POST
def register(request):
    data = payload(request)
    form = RegistrationForm({
        "username": data.get("userName"), "password1": data.get("password"),
        "password2": data.get("passwordConfirmation"),
        "first_name": data.get("firstName"), "last_name": data.get("lastName"),
        "email": data.get("email"),
    })
    if not form.is_valid():
        return reply(400, error=" ".join(message for errors in form.errors.values() for message in errors))
    user = form.save()
    login(request, user)
    return reply(201, userName=user.get_username())


def proxy(endpoint, field, require_result=False):
    try:
        data = get_request(endpoint)
    except (requests.RequestException, ValueError):
        return reply(502, error="Dealership service is unavailable.")
    if require_result and not data:
        return reply(404, error="Dealership not found.")
    return reply(**{field: data})


@require_GET
def get_dealerships(request, state=None):
    endpoint = "fetchDealers" if not state or state.lower() == "all" else f"fetchDealers/{quote(state, safe='')}"
    return proxy(endpoint, "dealers")


@require_GET
def get_dealer_details(request, dealer_id):
    return proxy(f"fetchDealer/{dealer_id}", "dealer", require_result=True)


@require_GET
def get_dealer_reviews(request, dealer_id):
    return proxy(f"fetchReviews/dealer/{dealer_id}", "reviews")


@require_GET
def get_cars(request):
    cars = CarModel.objects.select_related("make").order_by("make__name", "name", "year")
    return reply(CarMakes=list(CarMake.objects.order_by("name").values_list("name", flat=True)),
                 CarModels=[{"id": c.pk, "CarMake": c.make.name, "CarModel": c.name,
                             "CarYear": c.year, "CarType": c.body_type} for c in cars])


@require_GET
def analyze_review(request, text):
    try:
        return reply(**analyze_review_sentiments(text))
    except (requests.RequestException, ValueError):
        return reply(502, error="Sentiment service is unavailable.")


@require_POST
def add_review(request):
    if not request.user.is_authenticated:
        return reply(401, error="Please sign in first.")
    data = payload(request)
    review = data.get("review")
    if not isinstance(review, str) or not 1 <= len(review.strip()) <= 500:
        return reply(400, error="Enter a review between 1 and 500 characters.")
    try:
        purchased = date.fromisoformat(data["purchase_date"])
        dealer_id = int(data["dealership"])
        car = CarModel.objects.select_related("make").get(pk=int(data["car_id"]))
    except (KeyError, TypeError, ValueError, CarModel.DoesNotExist):
        return reply(400, error="Select a valid vehicle, dealer and purchase date.")
    if purchased > date.today():
        return reply(400, error="Purchase date cannot be in the future.")
    try:
        if not get_request(f"fetchDealer/{dealer_id}"):
            return reply(404, error="Dealership not found.")
        sentiment = analyze_review_sentiments(review.strip())["sentiment"]
        saved = post_review({
            "name": request.user.get_username(), "dealership": dealer_id, "review": review.strip(),
            "purchase": True, "purchase_date": purchased.isoformat(), "car_make": car.make.name,
            "car_model": car.name, "car_year": car.year, "sentiment": sentiment,
        })
    except (requests.RequestException, ValueError, KeyError):
        return reply(502, error="Unable to save the review. Please try again.")
    return reply(201, review=saved)
