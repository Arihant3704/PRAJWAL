# SpamShield - Spam Email Detection System

A professional web application for detecting spam keywords in email content using the optimized **Horspool String Matching Algorithm**.

## Tech Stack
- **Backend:** Node.js (Express) - *Adapted from Flask requirements for platform compatibility*
- **Frontend:** Vanilla HTML5, CSS3, JavaScript
- **Template Engine:** EJS (Embedded JavaScript)
- **Database:** SQLite (better-sqlite3)
- **Security:** Bcrypt (Password Hashing), Express-Session (Auth)

## Key Features
- **Horspool Algorithm:** Custom implementation with shift table logic for efficient pattern matching.
- **Cybersecurity UI:** Modern dark theme with glassmorphism and smooth animations.
- **User Dashboard:** Track scan history and spam statistics.
- **Visualization:** Real-time animation of the string matching process.
- **Performance:** Comparative charts showing complexity and speed.

## Project Structure
- `server.ts`: Main application logic and routing.
- `lib/horspool.ts`: Mathematical implementation of the algorithm.
- `lib/db.ts`: SQLite database schema and initialization.
- `templates/`: EJS views for dynamic content.
- `static/`: Frontend assets (CSS, JS).

## Credentials
### Admin
- **Email:** admin@spamshield.com
- **Password:** admin123

### Demo User
- **Email:** user@spamshield.com
- **Password:** user123

## How to Run
1. The application starts automatically in the AI Studio environment.
2. If running locally:
   ```bash
   npm install
   npm run dev
   ```

## Algorithm Implementation Details
Horspool’s algorithm is a simplification of the Boyer-Moore algorithm. It preprocesses the pattern to create a shift table based on the last character of the current window in the text. This allows skipping multiple characters on mismatch, significantly improving average performance to sub-linear time O(n/m).
