# Cars Dealership

Repository: `xrwvm-fullstack_developer_capstone`. Project: **Cars Dealership**, IBM Full Stack Cloud Development Capstone.

Django provides sessions, the admin interface, the vehicle catalog, and the API used by React. Express serves dealerships and stores reviews. A Flask service provides sentiment analysis. The bundled vehicle, dealer, and review data are IBM sample records.

## Run locally

From the repository root:

```sh
python -m pip install -r server/requirements.txt -r server/djangoapp/microservices/requirements.txt
npm ci --prefix server/database
npm ci --prefix server/frontend
npm run build --prefix server/frontend
```

In separate terminals, run the following commands from the repository root. Use the same internal token for Express and Django.

```sh
INTERNAL_TOKEN=local-demo LOCAL_REVIEW_FILE=/tmp/cars/reviews.json node server/database/app.js
python server/djangoapp/microservices/app.py
```

```sh
cd server
export DJANGO_DEBUG=1 INTERNAL_TOKEN=local-demo
python manage.py migrate
python manage.py seed_cars
python manage.py createsuperuser
python manage.py runserver
```

Visit `http://127.0.0.1:8000`. The app uses Django sessions and CSRF protection for all writes. Run `python manage.py test` in `server/` with the local configuration above.

## Deployment configuration

The Dockerfiles cover the Django/React web application, Express backend, and sentiment service. For Express set `MONGO_URI`, `INTERNAL_TOKEN`, and optionally `MONGO_DB`. For Django set `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS`, `DJANGO_TRUSTED_ORIGINS`, `BACKEND_URL`, `SENTIMENT_URL`, and the same `INTERNAL_TOKEN`. Django requires durable storage for its SQLite database via `DJANGO_DB_PATH` or a production database configuration. The local JSON store is intended for single-process development.

For Watson NLU set `WATSON_NLU_URL` to the service instance URL and `WATSON_NLU_API_KEY` in the sentiment service. Without either variable the service uses the VADER method from the IBM starter and labels the engine in its responses.

## Attribution

Starter and data from [IBM Developer Skills Network](https://github.com/ibm-developer-skills-network/xrwvm-fullstack_developer_capstone). The supplied [course reference](https://github.com/umairazmat/IBM-Full-Stack-Software-Developer) was consulted for context. The starter license remains in [LICENSE](LICENSE).
