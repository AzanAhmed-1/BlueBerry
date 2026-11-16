# BlueBerry Letters

A romantic stationery-style shared letter webpage. The envelope opens into **Create a letter** and **View the letter**. Letters are stored in PostgreSQL and updates are broadcast live with Socket.IO, so two devices on different networks can see saved changes.

## Important privacy note

The room URL contains a random, hard-to-guess ID and acts like a private invitation. Anyone who has the full link can view and edit the letter. Do not post it publicly. This starter app does not include user accounts, end-to-end encryption, or a per-person permission system.

## Run locally

You need Node.js 20+ and a PostgreSQL database.

1. Create a PostgreSQL database.
2. Copy `.env.example` to `.env` and put your database connection string in `DATABASE_URL`.
3. In this folder run:

```bash
npm install
npm start
```

4. Open `http://localhost:3000`. Click the envelope and copy the address from your browser to share the room link.

For local testing on two devices, both must be able to reach the computer running the server. For use from different networks, deploy it publicly using the steps below.

## Deploy with Render + Neon

### 1. Create the database
1. Create a PostgreSQL project on Neon.
2. Copy its connection string. Keep it private.

### 2. Put the code on GitHub
1. Create a new GitHub repository.
2. Upload all files in this folder (including the `public` folder).
3. Do not upload `.env` or any real database password.

### 3. Deploy the web service
1. In Render, choose **New → Web Service** and connect your GitHub repository.
2. Use these settings:
   - Runtime: Node
   - Build command: `npm install`
   - Start command: `npm start`
3. Add an environment variable named `DATABASE_URL` with the Neon connection string.
4. Deploy. Render provides a public HTTPS address.

### 4. Share the letter room
1. Open the deployed website.
2. Click the envelope. A room is created automatically.
3. Copy the full URL from the browser address bar. It will contain `?room=...`.
4. Send that exact URL privately to the other person. Both people can create, view, and update the same letter.

## How real-time works

The server saves each letter in PostgreSQL. When a person saves, Socket.IO sends an update to everyone currently connected to that room. The other device's open letter view updates without refreshing. If someone opens the page later, the latest saved version loads from the database.

## Customizing the names

Edit the two address lines in `public/index.html`:

- `Mrs. BlueBerry`
- `Mr. BlackBerry`

## Troubleshooting

- If the app says it cannot load a letter, check the `DATABASE_URL` in Render.
- If live updates do not arrive, refresh both pages and confirm both URLs contain the same `room` value.
- Do not share the room URL publicly; possession of the link grants access.
