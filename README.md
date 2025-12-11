# XRaise Billing Platform

A full-stack billing and subscription management platform built with Django REST Framework and Next.js, featuring Stripe payment integration.

## Overview

XRaise is a modern SaaS billing platform that enables users to register, authenticate, and manage subscription plans with integrated Stripe payments. The platform consists of two main applications:

- **XRaiseBE**: Django REST API backend with JWT authentication and Stripe integration
- **XRaiseFE**: Next.js frontend with NextAuth.js for session management

## Features

- 🔐 **User Authentication**: JWT-based authentication with access and refresh tokens
- 💳 **Stripe Integration**: Secure payment processing with Stripe Checkout
- 📊 **Subscription Management**: Flexible plan upgrades and downgrades
- 🎯 **Real-time Updates**: Stripe webhooks for instant subscription status updates
- 🔒 **Secure**: CSRF protection, CORS configuration, and JWT token validation
- 📱 **Responsive UI**: Modern, mobile-friendly interface

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Docker Compose Network                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │   Frontend       │  │    Backend       │  │   Database   │  │
│  │   (Next.js)      │  │   (Django)       │  │  (Postgres)  │  │
│  │   Port: 3000     │  │   Port: 8000     │  │  Port: 5432  │  │
│  │                  │  │                  │  │              │  │
│  │  • Auth UI       │  │ • REST API       │  │ • User Data  │  │
│  │  • Dashboard     │  │ • JWT Auth       │  │ • Billing    │  │
│  │  • Payments      │  │ • Stripe         │  │ • Events     │  │
│  └────────┬─────────┘  └────────┬─────────┘  └──────┬───────┘  │
│           │                     │   ▲                │          │
│           │                     │   │                │          │
│           └─────────────────────┼───┼────────────────┘          │
│                                 │   │                           │
│                    (HTTP/REST API)  │ (Webhook)                 │
│                                     │                           │
└─────────────────────────────────────┼───────────────────────────┘
           │                          │
           │                          │
           ▼                          │
    ┌────────────────┐                │
    │  User Browser  │                │
    │  localhost:    │                │
    │  3000          │                │
    └────────────────┘                │
                                      │
                             ┌────────┴────────┐
                             │ Stripe Service  │
                             │    (Cloud)      │
                             └─────────────────┘
```

## Technology Stack

### Backend (XRaiseBE)
- **Framework**: Django 5.2.9
- **API**: Django REST Framework 3.16
- **Authentication**: JWT (djangorestframework-simplejwt)
- **Database**: PostgreSQL 16
- **Payment**: Stripe API 14.0
- **Documentation**: drf-spectacular (OpenAPI/Swagger)
- **Server**: Gunicorn + Supervisor

### Frontend (XRaiseFE)
- **Framework**: Next.js 16.0.8
- **Library**: React 19.0.0
- **Authentication**: NextAuth.js 5.0.0
- **HTTP Client**: Axios 1.7.9
- **Language**: TypeScript 5.6

### Infrastructure
- **Container**: Docker + Docker Compose
- **Database**: PostgreSQL 16
- **Reverse Proxy**: (Optional) Nginx

## Quick Start with Docker Compose

### Prerequisites

- Docker Desktop or Docker Engine (20.10+)
- Docker Compose (2.0+)
- Stripe account (for payment processing)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd xraise-assessment
```

### 2. Configure Environment Variables

Copy the example environment file and configure your values:

```bash
cp .env.example .env
```

Then edit `.env` with your actual values. See `.env.example` for all available configuration options and descriptions.

### 3. Build and Start Services

```bash
# Build all services
docker-compose build

# Start all services in detached mode
docker-compose up -d

# View logs
docker-compose logs -f
```

### 4. Run Database Migrations

```bash
# Run migrations
docker-compose exec backend python manage.py migrate

# Create a superuser (optional)
docker-compose exec backend python manage.py createsuperuser
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api/docs/
- **Admin Panel**: http://localhost:8000/admin/

## API Endpoints

### Authentication
```
POST   /api/users/register/           Register new user
POST   /api/users/login/              Get JWT tokens
POST   /api/users/token/refresh/      Refresh access token
GET    /api/users/me/                 Get current user info
```

### Billing
```
GET    /api/billing/status/           Get billing status
POST   /api/billing/upgrade/          Upgrade subscription
POST   /api/billing/downgrade/        Downgrade subscription
POST   /api/billing/webhook/stripe/   Stripe webhook handler
```

### Documentation
```
GET    /api/schema/                   OpenAPI schema
GET    /api/docs/                     Swagger UI
```

## User Flow

### 1. Registration & Login
```
User → Register → Login → Receive JWT Tokens → Access Dashboard
```

### 2. Subscription Upgrade
```
Dashboard → Select Plan → Stripe Checkout → Payment → Webhook → Plan Updated
```

### 3. Plan Management
```
Dashboard → View Current Plan → Upgrade/Downgrade → Confirmation
```

## Subscription Plans

| Plan | Price | Features |
|------|-------|----------|
| **None** | Free | Basic access |
| **Basic** | $10/month | Standard features |
| **Pro** | $20/month | All features |

### Upgrade Paths
- None → Basic
- None → Pro
- Basic → Pro

### Downgrade Paths
- Pro → Basic
- Pro → None
- Basic → None

## Development

### Running Individual Services

See individual README files for detailed instructions:
- [Backend README](./XRaiseBE/README.md)
- [Frontend README](./XRaiseFE/README.md)

### Testing with Stripe

Use Stripe test cards for development:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155

Use any future expiry date and any 3-digit CVC.

### Setting Up Stripe Webhooks

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Forward webhooks to local backend:
   ```bash
   stripe listen --forward-to localhost:8000/api/billing/webhook/stripe/
   ```
3. Copy the webhook signing secret to your `.env` file

## Docker Compose Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f [service_name]

# Rebuild services
docker-compose build [service_name]

# Restart a service
docker-compose restart [service_name]

# Execute command in container
docker-compose exec [service_name] [command]

# View running containers
docker-compose ps

# Remove volumes (⚠️ deletes data)
docker-compose down -v
```

## Database Management

```bash
# Access PostgreSQL shell
docker-compose exec db psql -U postgres -d xraise

# Backup database
docker-compose exec db pg_dump -U postgres xraise > backup.sql

# Restore database
docker-compose exec -T db psql -U postgres xraise < backup.sql

# View database logs
docker-compose logs db
```

## Troubleshooting

### Port Already in Use
```bash
# Check what's using the port
lsof -i :8000  # or :3000, :5432

# Kill the process
kill -9 <PID>
```

### Database Connection Issues
```bash
# Restart database service
docker-compose restart db

# Check database logs
docker-compose logs db
```

### Frontend Can't Connect to Backend
- Verify `NEXT_PUBLIC_BACKEND_URL` is set correctly
- In Docker: use `http://backend:8000`
- Locally: use `http://localhost:8000`

### Stripe Webhook Failures
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Check webhook signature verification
- Use Stripe CLI for local testing

## Production Deployment

### Security Checklist

- [ ] Set `DJANGO_DEBUG=false`
- [ ] Use strong `DJANGO_SECRET_KEY` and `NEXTAUTH_SECRET`
- [ ] Use production Stripe keys (not test keys)
- [ ] Configure proper `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS`
- [ ] Enable HTTPS (update URLs accordingly)
- [ ] Set up proper database backups
- [ ] Configure monitoring and logging
- [ ] Use environment-specific `.env` files
- [ ] Set up Stripe webhook endpoint properly
- [ ] Use managed database service (e.g., AWS RDS)

### Environment Variables for Production

Copy `.env.example` to `.env` and update with production values. Key changes for production:
- Set `DJANGO_DEBUG=false`
- Use strong random keys for `DJANGO_SECRET_KEY` and `NEXTAUTH_SECRET`
- Update `ALLOWED_HOSTS` with your domain
- Use HTTPS URLs for `FRONTEND_URL`, `NEXT_PUBLIC_BACKEND_URL`, and `CORS_ALLOWED_ORIGINS`
- Use production Stripe keys (starting with `sk_live_` and `pk_live_`)

See `.env.example` for complete configuration reference.

## Project Structure

```
xraise-assessment/
├── compose.yaml                 # Docker Compose configuration
├── README.md                    # This file
├── .env.example                 # Environment variables template
├── .env                         # Environment variables (not in git)
│
├── XRaiseBE/                    # Backend application
│   └── README.md                # See XRaiseBE/README.md for details
│
└── XRaiseFE/                    # Frontend application
    └── README.md                # See XRaiseFE/README.md for details
```


