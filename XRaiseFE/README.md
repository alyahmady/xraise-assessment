# XRaiseFE - Frontend Application

Next.js frontend for the XRaise billing platform with NextAuth.js authentication and Stripe integration.

## Overview

XRaiseFE is a modern, responsive web application that provides user authentication, subscription management, and payment processing interfaces. Built with Next.js and TypeScript, it offers a seamless user experience for managing billing subscriptions.

## Features

- 🔐 NextAuth.js authentication with JWT
- 📱 Responsive, mobile-friendly UI
- 💳 Stripe Checkout integration
- 📊 Real-time subscription status
- 🔄 Automatic token refresh
- ⚡ Fast page loads with Next.js
- 🎨 Clean, modern interface
- 🔒 Secure session management

## Technology Stack

- **Framework**: Next.js 16.0.8
- **Library**: React 19.0.0
- **Authentication**: NextAuth.js 5.0.0 (beta)
- **HTTP Client**: Axios 1.7.9
- **Language**: TypeScript 5.6.3
- **Runtime**: Node.js 20

## Project Structure

```
XRaiseFE/
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript configuration
├── next.config.ts              # Next.js configuration
├── Dockerfile                   # Container definition
├── middleware.ts                # Next.js middleware
├── styles.css                   # Global styles
│
└── pages/                       # Next.js pages (routes)
    ├── _app.tsx                 # App wrapper with SessionProvider
    ├── index.tsx                # Login/Register page (/)
    ├── dashboard.tsx            # User dashboard (/dashboard)
    ├── premium.tsx              # Premium features (/premium)
    │
    └── api/                     # API routes
        └── auth/
            └── [...nextauth].ts # NextAuth.js configuration
```

## Pages

### `/` - Login/Register Page
- User registration form
- Login form
- Redirects to dashboard after authentication

### `/dashboard` - User Dashboard
- Current subscription status
- Plan information
- Lifetime spending
- Upgrade/downgrade actions
- Logout functionality

### `/premium` - Premium Features
- Premium content showcase
- Protected route (requires authentication)

## Running Locally

### Option 1: With Docker

#### Build the Image
```bash
cd XRaiseFE
docker build -t xraise-frontend .
```

#### Run the Container
```bash
docker run -d \
  --name xraise-frontend \
  --env-file .env \
  -p 3000:3000 \
  xraise-frontend
```

Note: Make sure you have a `.env` file configured. See `.env.example` for reference.

Access the application at http://localhost:3000

### Option 2: Without Docker

#### Prerequisites
- Node.js 20+
- npm or yarn

#### Setup

1. **Install Dependencies**
```bash
cd XRaiseFE
npm install
```

2. **Configure Environment Variables**

Copy the example environment file and configure your values:
```bash
cp .env.example .env.local
```

Then edit `.env.local` with your actual values. See `.env.example` for all available configuration options.

**Note**: Next.js uses `.env.local` for local development (this file is gitignored by default).

3. **Run Development Server**
```bash
npm run dev
```

The application will be available at http://localhost:3000

4. **Build for Production**
```bash
npm run build
npm start
```

## Environment Variables

All environment variables are documented in `.env.example`. Copy this file to `.env.local` and configure your values:

```bash
cp .env.example .env.local
```

Key variables include:
- **NextAuth**: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- **Backend API**: `NEXT_PUBLIC_BACKEND_URL` (exposed to browser)
- **Stripe**: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (exposed to browser)

### Important Notes

- Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- Variables without the prefix are only available server-side
- Never expose secret keys with `NEXT_PUBLIC_` prefix
- Use `.env.local` for local development (gitignored by default)

See `.env.example` for complete documentation of all variables.

## Authentication Flow

### Registration
```
1. User fills registration form (username, email, password)
2. Frontend sends POST to /api/users/register/
3. Backend creates user and returns 201
4. Frontend automatically logs in user
5. Redirect to /dashboard
```

### Login
```
1. User fills login form (username, password)
2. NextAuth calls credentials provider
3. Provider calls backend /api/users/login/
4. Backend returns JWT tokens (access + refresh)
5. NextAuth stores tokens in session
6. Redirect to /dashboard
```

### Token Refresh
```
1. NextAuth checks token expiry before each request
2. If token expires in < 1 minute, refresh automatically
3. Call backend /api/users/token/refresh/
4. Update session with new access token
5. Continue with request
```

### Protected Routes
```
1. User accesses protected page (e.g., /dashboard)
2. NextAuth checks session status
3. If unauthenticated, redirect to /
4. If authenticated, render page
```

## API Integration

### Making Authenticated Requests

```typescript
import axios from "axios";
import { useSession } from "next-auth/react";

const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL;

function MyComponent() {
  const { data: session } = useSession();

  const fetchData = async () => {
    const response = await axios.get(`${backendBase}/api/billing/status/`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`
      }
    });
    return response.data;
  };

  // ...
}
```

### Handling Errors

```typescript
try {
  const response = await axios.post(`${backendBase}/api/billing/upgrade/`, 
    { plan: "pro" },
    { headers: { Authorization: `Bearer ${session.accessToken}` } }
  );
} catch (error) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      // Token expired, NextAuth will refresh
    } else if (error.response?.status === 400) {
      // Validation error
      console.error(error.response.data);
    }
  }
}
```

## Subscription Management

### Upgrade Flow
```typescript
const startCheckout = async (plan: string) => {
  const response = await axios.post(
    `${backendBase}/api/billing/upgrade/`,
    { plan },
    { headers: { Authorization: `Bearer ${session.accessToken}` } }
  );
  
  // Redirect to Stripe Checkout
  window.location.href = response.data.checkout_url;
};
```

### After Payment
```
1. User completes payment on Stripe
2. Stripe redirects to /dashboard?session_id=xxx
3. Frontend detects session_id parameter
4. Fetches updated billing status
5. Displays updated plan information
```

### Downgrade Flow
```typescript
const downgrade = async (plan: string) => {
  const response = await axios.post(
    `${backendBase}/api/billing/downgrade/`,
    { plan },
    { headers: { Authorization: `Bearer ${session.accessToken}` } }
  );
  
  if (response.data.checkout_url) {
    // Redirect to Stripe for paid downgrade
    window.location.href = response.data.checkout_url;
  } else {
    // Immediate downgrade to free plan
    fetchStatus(); // Refresh status
  }
};
```

## Styling

The application uses a simple, clean CSS design in `styles.css`:

- Responsive layout
- Mobile-friendly forms
- Clean button styles
- Consistent spacing
- Accessible color contrast

To customize:
1. Edit `styles.css` for global styles
2. Add component-specific styles inline or in CSS modules
3. Consider adding a CSS framework (Tailwind, Material-UI, etc.)

## Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

### Hot Reload

The development server supports hot reload:
- Changes to pages automatically refresh
- Changes to API routes require manual refresh
- TypeScript errors show in browser and terminal

### TypeScript

The project uses strict TypeScript:
- Type checking on build
- IntelliSense in VS Code
- Compile-time error detection

## Testing

### Manual Testing

1. **Registration Flow**
```
1. Go to http://localhost:3000
2. Fill registration form
3. Submit
4. Verify redirect to dashboard
5. Check user info displays correctly
```

2. **Login Flow**
```
1. Go to http://localhost:3000
2. Fill login form
3. Submit
4. Verify redirect to dashboard
5. Check session persists on refresh
```

3. **Subscription Flow**
```
1. Login to dashboard
2. Click "Upgrade to Pro"
3. Verify Stripe Checkout opens
4. Use test card: 4242 4242 4242 4242
5. Complete payment
6. Verify redirect back to dashboard
7. Check plan updated to "pro"
```

### Stripe Test Cards

| Card Number | Description |
|-------------|-------------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Decline |
| 4000 0025 0000 3155 | 3D Secure |

Use any future expiry date and any 3-digit CVC.

## Troubleshooting

### "NEXT_PUBLIC_BACKEND_URL is not defined"
- Check `.env.local` file exists
- Verify variable has `NEXT_PUBLIC_` prefix
- Restart dev server after adding env vars

### "Cannot connect to backend"
- Verify backend is running on correct port
- Check `NEXT_PUBLIC_BACKEND_URL` matches backend URL
- In Docker: use service name (e.g., `http://backend:8000`)
- Locally: use `http://localhost:8000`

### "NextAuth session is null"
- Check `NEXTAUTH_SECRET` is set
- Verify `NEXTAUTH_URL` matches frontend URL
- Clear browser cookies and try again

### "Stripe Checkout not opening"
- Verify backend returns `checkout_url`
- Check browser console for errors
- Ensure Stripe keys are test keys (start with `pk_test_`)

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

## Production Deployment

### Build Optimization

Next.js automatically optimizes for production:
- Minified JavaScript and CSS
- Image optimization
- Code splitting
- Static page generation where possible

### Environment Variables

Copy `.env.example` to your production environment file and update with production values:
- Use strong random key for `NEXTAUTH_SECRET`
- Set `NEXTAUTH_URL` to your production domain (HTTPS)
- Update `NEXT_PUBLIC_BACKEND_URL` to your API domain (HTTPS)
- Use production Stripe key (`pk_live_`) for `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

See `.env.example` for complete configuration reference.

### Deployment Platforms

**Vercel** (Recommended for Next.js):
```bash
npm install -g vercel
vercel
```

**Docker**:
```bash
docker build -t xraise-frontend .
docker run -p 3000:3000 xraise-frontend
```

**Static Export** (if no API routes needed):
```bash
npm run build
# Deploy the 'out' directory
```

### Security Checklist

- [ ] Use strong `NEXTAUTH_SECRET`
- [ ] Set proper `NEXTAUTH_URL` with HTTPS
- [ ] Use production Stripe key (`pk_live_`)
- [ ] Enable HTTPS
- [ ] Set proper CORS on backend
- [ ] Use environment variables (never commit secrets)
- [ ] Enable CSP headers
- [ ] Configure rate limiting

## Performance

- **First Load**: < 100KB JavaScript
- **Page Transitions**: Instant with client-side routing
- **API Calls**: Optimized with axios
- **Token Refresh**: Automatic, transparent to user

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility

- Semantic HTML
- Form labels
- Keyboard navigation
- ARIA attributes where needed

## Future Enhancements

- [ ] Add loading states and skeletons
- [ ] Implement error boundaries
- [ ] Add toast notifications
- [ ] Improve form validation
- [ ] Add password strength indicator
- [ ] Implement email verification
- [ ] Add profile management page
- [ ] Add billing history page
- [ ] Implement dark mode
- [ ] Add i18n support


