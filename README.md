# Stock Trading Journal

A web application for recording and analysing trading performance. It is built with **Next.js 15**, **Supabase** and **Tailwind CSS**.  Authentication and data persistence are handled by Supabase while UI state is managed with [Zustand](https://github.com/pmndrs/zustand).

## Features

- User registration and login using Supabase auth.
- Create strategy buckets to group trades and manage cash allocations.
- Add, edit and close trades with journaling notes, tags and confidence levels.
- Track bucket transactions (deposits/withdrawals) and profit/loss statistics.
- Example profit chart using Recharts.

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   Create a `.env.local` file and provide your Supabase credentials:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=<your-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
   ```

3. **Run the development server**

   ```bash
   npm run dev
   ```

   The app will be available at [http://localhost:3000](http://localhost:3000).

4. **Build for production**

   ```bash
   npm run build
   npm start
   ```

## Project Structure

```
src/
  app/          # Next.js routes and pages
  components/   # Reusable UI components
  lib/          # Supabase clients and utilities
  store/        # Zustand state stores
```

Key scripts are defined in `package.json`:

```json
"scripts": {
  "dev": "next dev --turbopack",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}
```

## Important Modules

### Supabase Clients

`supabaseClient.js` exposes the browser client while `supabaseAdmin.js` is used on the server. They read the Supabase credentials from environment variables:

```javascript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

```javascript
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
```

### Authentication Middleware

`authMiddleware.js` verifies the logged in user by reading the token cookie and querying Supabase:

```javascript
export async function verifyUserFromCookie(request) {
  const token = request.cookies.get("token")?.value;
  if (!token) throw new Error("Unauthorized: No token provided");
  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) throw new Error("Unauthorized: Invalid token");
  return user;
}
```

### Zustand Bucket Store

`useBucketStore.js` keeps bucket data in sync with the API and exposes helper functions:

```javascript
export const useBucketStore = create((set, get) => ({
  buckets: [],
  fetchBuckets: async () => {
    const res = await axios.get("/api/buckets", { withCredentials: true });
    set({ buckets: res.data });
  },
  createBucket: async (name, bucketSize) => {
    const tempId = crypto.randomUUID();
    set({ buckets: [...get().buckets, { id: tempId, name, bucket_size: bucketSize, trade_count: 0 }] });
    const res = await axios.post("/api/buckets", { name, bucket_size: bucketSize }, { withCredentials: true });
    set({ buckets: get().buckets.map((b) => (b.id === tempId ? res.data : b)) });
  },
  deleteBucket: async (id) => {
    const prev = get().buckets;
    set({ buckets: prev.filter((b) => b.id !== id) });
    await axios.delete(`/api/buckets/${id}`, { withCredentials: true });
  },
}));
```

### API Routes

Next.js route handlers under `src/app/api` provide the backend logic. For example, the login route issues a token cookie:

```javascript
export async function POST(request) {
  const { email, password } = await request.json();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return NextResponse.json({ error: error.message }, { status: 401 });
  const response = NextResponse.json({ session: data.session, user: data.user }, { status: 200 });
  response.cookies.set("token", data.session.access_token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: data.session.expires_in, path: "/" });
  return response;
}
```

Bucket endpoints combine authentication with Supabase queries to fetch bucket details, trades and transactions.

### Tracking Trade Executions

Each buy or sell action records a row in `bucket_transactions`. Sells accumulate
on the trade via two fields:

- `exit_sum` – the total value received from selling shares
- `sold_qty` – how many shares have been sold so far

When the last share is sold the exit price is calculated as
`exit_sum / sold_qty` and the return amount is the difference between this sum
and the cost of all shares.

### Forms and UI Components

- `AddTradeForm.jsx` and `SellTradeForm.jsx` provide dialogs for creating or closing trades.
- Components in `src/components/ui` are small wrappers around Radix primitives.

## Contributing

Feel free to open issues or pull requests with improvements. This project is a work in progress and any contributions are welcome.

## License

MIT
