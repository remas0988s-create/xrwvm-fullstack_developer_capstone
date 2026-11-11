from django.contrib import admin
from django.urls import include, path
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.generic import TemplateView

spa = ensure_csrf_cookie(TemplateView.as_view(template_name="index.html"))
urlpatterns = [
    path("admin/", admin.site.urls),
    path("djangoapp/", include("djangoapp.urls")),
    path("about", TemplateView.as_view(template_name="About.html")),
    path("contact", TemplateView.as_view(template_name="Contact.html")),
    path("", spa),
    path("get_dealers", spa),
    path("get_dealers/<str:state>", spa),
    path("login", spa),
    path("register", spa),
    path("dealer/<int:dealer_id>", spa),
    path("postreview/<int:dealer_id>", spa),
]
