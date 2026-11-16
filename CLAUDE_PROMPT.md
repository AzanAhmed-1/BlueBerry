# Prompt for Claude

Build and polish a complete, deployable web app called **BlueBerry Letters**.

## Product concept
The first screen should feel like opening a personal handwritten letter. Show one elegant sealed envelope centered on a warm ivory/blush paper background. The envelope must have a prominent realistic-looking red wax seal. Above or near it, show these exact lines:

**For: Mrs. BlueBerry**
**From: Mr. BlackBerry**

The envelope is clickable. On click, reveal a tasteful choice panel with two clear actions:
1. **Create a letter**
2. **View the letter**

The create view should have a comfortable writing area and a Save button. The view mode should display the latest saved letter in a beautiful paper-like reading panel.

## Essential functionality
- This must be a real multi-device web app, not just a static mockup.
- Two people must be able to open the same private room link from different devices and different internet networks.
- When either person saves a letter, the other person's open page should receive the update in real time without refreshing.
- Persist letters in a real database so content survives server restarts and redeployments.
- Create a new room and a random, unguessable room ID when the first visitor opens the envelope.
- Put the room ID in the URL so the user can share the full link with the other person.
- Anyone with the room link can currently read and edit; make this limitation clear in the UI and documentation. Do not pretend this is end-to-end encrypted or account-secured.
- Handle loading, empty-letter, save success, network failure, and invalid-link states.
- Ensure mobile responsiveness and accessible buttons, labels, keyboard focus, and modal behavior.
- Never hardcode secrets or commit environment files.

## Visual direction
- Warm ivory, parchment, dusty blush, muted brown typography.
- Editorial serif headings, refined sans-serif UI text.
- A dimensional envelope with folded triangular flap and a deep red wax stamp.
- Subtle hover/open animation; keep it elegant, not cartoonish.
- Generous whitespace and excellent phone layout.
- Preserve the exact names and wording above.

## Technical direction
Use TypeScript if you choose a framework. Keep the deployment straightforward and explain every step for a beginner. A suitable architecture is a Node server with PostgreSQL persistence and Socket.IO/WebSockets for live updates, serving the frontend from the same origin. You may improve the starter code supplied with this prompt, but do not replace real persistence or real-time syncing with localStorage, mock data, polling-only behavior, or an in-memory array.

## Deliverables
1. Complete working source code.
2. A clear project file/folder structure.
3. `.env.example` with placeholders only.
4. README with local setup and beginner-friendly deployment steps using GitHub + a Node hosting service + PostgreSQL hosting.
5. Explain how to create the first room and share its URL.
6. Test the flow: create room, open same URL in two browser sessions, save on one, verify the other updates live.
7. List remaining limitations and security improvements.

Start by inspecting the supplied project files if available. Fix bugs rather than only describing changes. Do not stop at a design mockup.