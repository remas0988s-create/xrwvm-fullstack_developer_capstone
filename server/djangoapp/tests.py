from django.test import Client, TestCase
from django.core.management import call_command


class DealershipTests(TestCase):
    def test_registration_login_and_logout(self):
        client = Client(enforce_csrf_checks=True)
        client.get("/djangoapp/session")
        token = lambda: client.cookies["csrftoken"].value
        credentials = {"userName": "test_driver", "password": "Sample-car-900!"}
        self.assertEqual(client.post("/djangoapp/register", credentials, "application/json").status_code, 403)
        result = client.post(
            "/djangoapp/register", {**credentials, "passwordConfirmation": credentials["password"]},
            "application/json", HTTP_X_CSRFTOKEN=token(),
        )
        self.assertEqual(result.status_code, 201)
        self.assertEqual(client.get("/djangoapp/session").json()["userName"], "test_driver")
        self.assertEqual(client.post("/djangoapp/logout", {}, "application/json", HTTP_X_CSRFTOKEN=token()).status_code, 200)
        self.assertIsNone(client.get("/djangoapp/session").json()["userName"])
        self.assertEqual(client.post("/djangoapp/login", credentials, "application/json", HTTP_X_CSRFTOKEN=token()).status_code, 200)

    def test_anonymous_review_is_rejected(self):
        self.assertEqual(self.client.post("/djangoapp/add_review", {}, "application/json").status_code, 401)

    def test_catalog_seed_is_idempotent(self):
        call_command("seed_cars")
        first = self.client.get("/djangoapp/get_cars").json()
        call_command("seed_cars")
        self.assertTrue(first["CarMakes"])
        self.assertTrue(first["CarModels"])
        self.assertEqual(self.client.get("/djangoapp/get_cars").json(), first)

    def test_static_pages(self):
        self.assertContains(self.client.get("/about"), "About Us")
        self.assertContains(self.client.get("/contact"), "Contact Us")
