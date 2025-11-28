# Setting up Ngrok for Stable Google Auth

Since your local IP address keeps changing, using `ngrok` provides a stable public URL for your local development server. This ensures Google Authentication works consistently.

## Prerequisites

1.  **Ngrok Account**: If you haven't already, sign up at [ngrok.com](https://ngrok.com/).
2.  **Auth Token**: Get your authtoken from the ngrok dashboard and run:
    ```bash
    npx ngrok config add-authtoken <YOUR_TOKEN>
    ```

## How to Run

1.  **Start your app** (if not already running):
    ```bash
    npm run dev
    ```

2.  **Start the tunnel** (in a new terminal):
    ```bash
    npm run tunnel
    ```
    This will generate a URL like `https://<random-id>.ngrok-free.app`.

## Critical Step: Update Supabase

Every time you restart ngrok (unless you have a paid static domain), you get a new URL. You **MUST** update Supabase for login to work:

1.  Go to your **Supabase Dashboard** -> **Authentication** -> **URL Configuration**.
2.  Add the new ngrok URL to **Redirect URLs**.
    *   Example: `https://<random-id>.ngrok-free.app/auth/google-callback`
3.  (Optional) You can also set it as the **Site URL**, but adding it to Redirect URLs is usually sufficient.

## Usage

Open the ngrok URL in your browser instead of `localhost` or the IP address.
`https://<random-id>.ngrok-free.app`

Login should now work seamlessly!
