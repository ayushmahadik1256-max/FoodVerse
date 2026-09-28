# FoodVerse

FoodVerse is a React/Vite food delivery demo with Firebase Authentication and an Express/MongoDB account and order API.

## Configure Firebase and MongoDB

1. Create a Firebase project and add a Web app. Enable **Email/Password** and **Phone** providers in Firebase Authentication. Add your local and deployed hostnames to Firebase's authorized domains.
2. Create a MongoDB database and a Firebase Admin service account. Keep the service account JSON out of the repository.
3. Copy `.env.example` to `.env.local` and fill in the Firebase web app values, `MONGODB_URI`, and `GOOGLE_APPLICATION_CREDENTIALS`. Add the first administrator's Firebase email to `ADMIN_EMAILS`.
4. Run `npm install` once.
5. Start the API in one terminal with `npm run api`, then the website in another with `npm run dev`.

Firebase web config values use the `VITE_FIREBASE_*` prefix. Firebase Admin credentials and the MongoDB URI are server-only. Never put either secret in a `VITE_*` variable or commit `.env.local`.

## Accounts and roles

Sign-up creates a customer account. Phone sign-in uses Firebase's real SMS code flow with reCAPTCHA. Password reset emails are sent by Firebase. Account profiles and orders are stored in MongoDB and tied to the verified Firebase UID. Customers, restaurant owners, delivery partners, and administrators see the dashboard assigned to their account; users cannot promote themselves by changing browser state. Add administrator emails to `ADMIN_EMAILS` before first sign-in. Administrators can assign customer, restaurant-owner, and delivery-partner roles from the Platform Users tab.

Users can change their name and phone from the account menu. Saved addresses and favorites are synchronized to their MongoDB profile as they change.

## API configuration

The Vite development server proxies `/api` to `http://localhost:4000`. For a separate production API origin, set `VITE_API_BASE_URL` when building the frontend and serve the Express API with the same MongoDB and Firebase Admin environment variables.

The current MongoDB API persists profiles and orders. Restaurant/menu/coupon/review demo content and several dashboard workflows still use the app's existing local mock data and browser storage.
