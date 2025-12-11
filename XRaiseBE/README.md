# XRaiseBE - Backend API

Django REST Framework backend for the XRaise billing platform with JWT authentication and Stripe integration.

## Overview

XRaiseBE is a RESTful API service that handles user authentication, subscription management, and payment processing through Stripe. It provides secure JWT-based authentication and real-time webhook processing for subscription updates.

## Features

- 🔐 JWT Authentication with access and refresh tokens
- 👤 User registration and management
- 💳 Stripe Checkout integration
- 📊 Subscription plan management (None, Basic, Pro)
- 🔔 Stripe webhook handling for real-time updates
- 📝 OpenAPI/Swagger documentation
- 🗄️ PostgreSQL database with optimized indexes
- 🔒 CORS and CSRF protection

## Technology Stack

- **Framework**: Django 5.2.9
- **API**: Django REST Framework 3.16.1
- **Authentication**: djangorestframework-simplejwt 5.5.1
- **Database**: PostgreSQL (psycopg 3.3.2)
- **Payment**: Stripe 14.0.1
- **Documentation**: drf-spectacular 0.29.0
- **Server**: Gunicorn 23.0.0
- **CORS**: django-cors-headers 4.9.0

## Project Structure

```
XRaiseBE/
├── manage.py                    # Django CLI
├── requirements.txt             # Python dependencies
├── Dockerfile                   # Container definition
├── gunicorn_conf.py            # Gunicorn configuration
│
├── backend/                     # Django project configuration
│   ├── settings.py              # Main settings
│   ├── urls.py                  # Root URL configuration
│   ├── wsgi.py                  # WSGI entry point
│   └── asgi.py                  # ASGI entry point
│
├── apps/                        # Django applications
│   ├── users/                   # User authentication
│   │   ├── models.py            # User model with subscription fields
│   │   ├── serializers.py       # JWT and user serializers
│   │   ├── views.py             # Registration, login, user stats
│   │   ├── urls.py              # User endpoints
│   │   └── admin.py             # Admin configuration
│   │
│   └── billing/                 # Subscription & billing
│       ├── models.py            # CheckoutSession, SubscriptionEvent
│       ├── serializers.py       # Billing serializers with validation
│       ├── views.py             # Upgrade, downgrade, webhooks
│       ├── urls.py              # Billing endpoints
│       └── admin.py             # Admin configuration
│
├── scripts/                     # Utility scripts
    ├── entrypoint.sh           # Container startup script
    └── health.sh               # Health check script
    └── api.conf                # API service config
```

## API Endpoints

### User Management

#### Register User
```http
POST /api/users/register/
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secure_password"
}

Response: 201 Created
{
  "detail": "registered"
}
```

#### Login
```http
POST /api/users/login/
Content-Type: application/json

{
  "username": "john_doe",
  "password": "secure_password"
}

Response: 200 OK
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### Refresh Token
```http
POST /api/users/token/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}

Response: 200 OK
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### Get User Stats
```http
GET /api/users/me/
Authorization: Bearer <access_token>

Response: 200 OK
{
  "username": "john_doe",
  "email": "john@example.com",
  "subscription_status": "active",
  "current_plan": "pro",
  "total_amount_paid": 2000
}
```

### Billing Management

#### Get Billing Status
```http
GET /api/billing/status/
Authorization: Bearer <access_token>

Response: 200 OK
{
  "subscription_status": "active",
  "current_plan": "pro",
  "total_amount_paid": 20.00
}
```

#### Upgrade Subscription
```http
POST /api/billing/upgrade/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "plan": "pro"
}

Response: 200 OK
{
  "checkout_url": "https://checkout.stripe.com/..."
}
```

#### Downgrade Subscription
```http
POST /api/billing/downgrade/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "plan": "basic"
}

Response: 200 OK
{
  "checkout_url": "https://checkout.stripe.com/..."
}

// Or for downgrade to free:
{
  "plan": "none"
}

Response: 200 OK
{
  "detail": "Downgraded to no plan"
}
```

#### Stripe Webhook
```http
POST /api/billing/webhook/stripe/
Stripe-Signature: t=...,v1=...
Content-Type: application/json

{
  "type": "checkout.session.completed",
  "data": { ... }
}

Response: 200 OK
```

## Running Locally

### Option 1: With Docker

#### Build the Image
```bash
cd XRaiseBE
docker build -t xraise-backend .
```

#### Run the Container
```bash
# Start PostgreSQL first
docker run -d \
  --name xraise-db \
  --env-file .env \
  -p 5432:5432 \
  postgres:16

# Run backend
docker run -d \
  --name xraise-backend \
  --link xraise-db:db \
  --env-file .env \
  -e POSTGRES_HOST=db \
  -p 8000:8000 \
  xraise-backend
```

Note: Make sure you have a `.env` file configured. See `.env.example` for reference.

#### Run Migrations
```bash
docker exec xraise-backend python manage.py migrate
```

#### Create Superuser
```bash
docker exec -it xraise-backend python manage.py createsuperuser
```

### Option 2: Without Docker

#### Prerequisites
- Python 3.13+
- PostgreSQL 16+
- pip

#### Setup

1. **Create Virtual Environment**
```bash
cd XRaiseBE
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

2. **Install Dependencies**
```bash
pip install -r requirements.txt
```

3. **Configure Environment Variables**

Copy the example environment file and configure your values:
```bash
cp .env.example .env
```

Then edit `.env` with your actual values. See `.env.example` for all available configuration options.

4. **Setup Database**

Make sure PostgreSQL is running and create the database:
```bash
psql -U postgres
CREATE DATABASE xraise;
\q
```

5. **Run Migrations**
```bash
python manage.py migrate
```

6. **Create Superuser**
```bash
python manage.py createsuperuser
```

7. **Run Development Server**
```bash
python manage.py runserver 0.0.0.0:8000
```

The API will be available at http://localhost:8000

## Database Models

### Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────┐
│                         User                                │
│─────────────────────────────────────────────────────────────│
│ PK │ id                      INTEGER                        │
│    │ username                VARCHAR(150) UNIQUE            │
│    │ email                   VARCHAR(254)                   │
│    │ password                VARCHAR(128)                   │
│    │ subscription_status     VARCHAR(16)                    │
│    │                         ['active', 'inactive']         │
│    │ current_plan            VARCHAR(16)                    │
│    │                         ['none', 'basic', 'pro']       │
│    │ total_amount_paid       BIGINT (cents)                 │
│    │ stripe_customer_id      VARCHAR(128) NULL              │
│    │ date_joined             TIMESTAMP                      │
│    │ last_login              TIMESTAMP NULL                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 1:N
                              │
          ┌───────────────────┴───────────────────┐
          │                                       │
          ▼                                       ▼
┌──────────────────────────────┐   ┌──────────────────────────────┐
│     CheckoutSession          │   │    SubscriptionEvent         │
│──────────────────────────────│   │──────────────────────────────│
│ PK │ id              INTEGER │   │ PK │ id              INTEGER │
│ FK │ user_id         INTEGER │   │ FK │ user_id         INTEGER │
│ IDX│                         │   │ IDX│                         │
│    │ plan            VARCHAR │   │    │ event_type      VARCHAR │
│    │                 (16)    │   │    │                 (64)    │
│    │ session_id      VARCHAR │   │    │ plan            VARCHAR │
│    │                 (128)   │   │    │                 (16)    │
│    │                 UNIQUE  │   │    │ subscription_   VARCHAR │
│    │ status          VARCHAR │   │    │ status          (16)    │
│    │                 (16)    │   │    │ amount_cents    BIGINT  │
│    │ amount_total    BIGINT  │   │    │ stripe_         VARCHAR │
│    │                 (cents) │   │    │ reference       (128)   │
│    │ created_at      TIMESTAMP   │    │                 IDX     │
└──────────────────────────────┘   │    │ created_at      TIMESTAMP
                                   └──────────────────────────────┘

Indexes:
  • User: username (unique), email
  • CheckoutSession: user_id, session_id (unique)
  • SubscriptionEvent: user_id, stripe_reference

Relationships:
  • User → CheckoutSession (1:N)
  • User → SubscriptionEvent (1:N)
```

### Model Details

#### User Model
Extends Django's `AbstractUser` with subscription fields:
- `subscription_status`: Current subscription state (active/inactive)
- `current_plan`: Current plan tier (none/basic/pro)
- `total_amount_paid`: Lifetime payments in cents
- `stripe_customer_id`: Stripe customer reference

#### CheckoutSession Model
Tracks Stripe checkout sessions:
- `user`: Foreign key to User (indexed)
- `plan`: Target subscription plan
- `session_id`: Stripe session ID (unique)
- `status`: Session state (created/completed/failed)
- `amount_total`: Payment amount in cents

#### SubscriptionEvent Model
Audit log for subscription changes:
- `user`: Foreign key to User (indexed)
- `event_type`: Type of event (e.g., checkout.session.completed)
- `plan`: Plan at time of event
- `subscription_status`: Status at time of event
- `amount_cents`: Transaction amount
- `stripe_reference`: Stripe event reference (indexed)

## Configuration

### Environment Variables

All environment variables are documented in `.env.example`. Copy this file to `.env` and configure your values:

```bash
cp .env.example .env
```

Key variables include:
- **Django Configuration**: `DJANGO_SECRET_KEY`, `DJANGO_DEBUG`, `ALLOWED_HOSTS`
- **Database**: `POSTGRES_*` variables
- **Stripe**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, price IDs
- **CORS**: `FRONTEND_URL`, `CORS_ALLOWED_ORIGINS`

See `.env.example` for complete documentation of all variables.

### JWT Configuration

- **Access Token Lifetime**: 60 minutes
- **Refresh Token Lifetime**: 24 hours
- **Auth Header Type**: Bearer

## Testing

### Manual API Testing

Use curl or tools like Postman/Insomnia:

```bash
# Register
curl -X POST http://localhost:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"testpass123"}'

# Login
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"testpass123"}'

# Get user stats (use access token from login)
curl -X GET http://localhost:8000/api/users/me/ \
  -H "Authorization: Bearer <access_token>"

# Get billing status
curl -X GET http://localhost:8000/api/billing/status/ \
  -H "Authorization: Bearer <access_token>"
```

### Stripe Webhook Testing

Use Stripe CLI to forward webhooks:

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local backend
stripe listen --forward-to localhost:8000/api/billing/webhook/stripe/

# Trigger test events
stripe trigger checkout.session.completed
```

## Admin Panel

Access the Django admin panel at http://localhost:8000/admin/

Features:
- User management
- Subscription tracking
- Checkout session monitoring
- Event logs

## Troubleshooting

### Database Connection Error
In Postgres container shell:
```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Check connection settings in .env
echo $POSTGRES_HOST
```

### Migration Issues
In BackEnd app container shell:
```bash
# Reset migrations (⚠️ deletes data)
python manage.py migrate --fake billing zero
python manage.py migrate --fake users zero
python manage.py migrate
```

# Or recreate database using SQL
In postgres container shell:
```bash
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
  CREATE DATABASE ${POSTGRES_DB};
  CREATE USER ${POSTGRES_USER} WITH PASSWORD '${POSTGRES_PASSWORD}';
  ALTER ROLE ${POSTGRES_USER} SET client_encoding TO 'utf8';
  ALTER ROLE ${POSTGRES_USER} SET default_transaction_isolation TO 'read committed';
  ALTER ROLE ${POSTGRES_USER} SET timezone TO 'UTC';
  GRANT ALL PRIVILEGES ON DATABASE ${POSTGRES_DB} TO ${POSTGRES_USER};
  \c ${POSTGRES_DB} ${POSTGRES_USER}
  GRANT ALL ON SCHEMA public TO ${POSTGRES_USER};
EOSQL
```
Then, in BackEnd app container shell:
```bash
python manage.py migrate
```

### Stripe Webhook Signature Verification Failed
- Verify `STRIPE_WEBHOOK_SECRET` matches your Stripe webhook endpoint
- Use Stripe CLI for local testing
- Check webhook signature in Stripe dashboard

### CORS Errors
- Verify `CORS_ALLOWED_ORIGINS` includes your frontend URL
- Check `FRONTEND_URL` is set correctly
- Ensure frontend uses correct backend URL

## Production Deployment

### Security Checklist
- [ ] Set `DJANGO_DEBUG=false`
- [ ] Use strong `DJANGO_SECRET_KEY`
- [ ] Configure proper `ALLOWED_HOSTS`
- [ ] Use production Stripe keys
- [ ] Set up HTTPS
- [ ] Configure proper CORS origins
- [ ] Use managed database service
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Use environment variables (never commit secrets)


## Performance Optimization

- Database indexes on foreign keys and frequently-queried fields
- Efficient serializer fields validation
- Connection pooling for database
- Static file serving via CDN (production)

## API Documentation

- **Swagger UI**: http://localhost:8000/api/docs/
- **OpenAPI Schema**: http://localhost:8000/api/schema/


