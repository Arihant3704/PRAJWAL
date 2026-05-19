import express from 'express';
import session from 'express-session';
import path from 'path';
import bcrypt from 'bcryptjs';
import db from './lib/db';
import { detectSpam } from './lib/horspool';

const app = express();
const PORT = 3000;

// Add session data types
declare module 'express-session' {
    interface SessionData {
        user: { id: number; email: string; name: string };
    }
}

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('static'));

app.use(session({
    secret: 'spamshield-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'templates'));

// Give free access by auto-authenticating
const isAuthenticated = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.session.user) {
        // Auto-login as the default admin for free access
        const defaultUser = db.prepare('SELECT * FROM users WHERE email = ?').get('prajwal@gmail.com') as any;
        if (defaultUser) {
            req.session.user = { id: defaultUser.id, email: defaultUser.email, name: defaultUser.name };
        } else {
            // Fallback if DB isn't initialized yet
            req.session.user = { id: 1, email: 'prajwal@gmail.com', name: 'Administrator' };
        }
    }
    next();
};

// Apply free access globally to protected routes
app.use(['/dashboard', '/detector', '/detect', '/algorithm', '/performance'], isAuthenticated);

// Routes
app.get('/', (req, res) => {
    res.redirect('/dashboard');
});

app.get('/login', (req, res) => {
    res.redirect('/dashboard');
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

    if (!user) {
        // Auto-create user if not exists (Allow All logic)
        const hashedPassword = bcrypt.hashSync(password, 10);
        const name = email.split('@')[0];
        const result = db.prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)').run(email, hashedPassword, name);
        user = { id: result.lastInsertRowid, email, name };
    }

    // Truly allow all: Log in regardless of password matching
    req.session.user = { id: Number(user.id), email: user.email, name: user.name };
    res.redirect('/dashboard');
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

app.get('/dashboard', isAuthenticated, (req, res) => {
    const userId = req.session.user.id;
    
    const stats = db.prepare(`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN is_spam = 1 THEN 1 ELSE 0 END) as spam_count,
            AVG(execution_time) as avg_speed
        FROM scan_history WHERE user_id = ?
    `).get(userId) as any;

    const recentHistory = db.prepare(`
        SELECT * FROM scan_history 
        WHERE user_id = ? 
        ORDER BY created_at DESC LIMIT 5
    `).all(userId);

    // Get distribution for Pie Chart
    const distribution = db.prepare(`
        SELECT 
            SUM(CASE WHEN is_spam = 1 THEN 1 ELSE 0 END) as spam,
            SUM(CASE WHEN is_spam = 0 THEN 1 ELSE 0 END) as safe
        FROM scan_history WHERE user_id = ?
    `).get(userId) as any;

    // Get time-series data for Line Chart (Last 7 days)
    const timeHistory = db.prepare(`
        SELECT date(created_at) as date, COUNT(*) as count
        FROM scan_history 
        WHERE user_id = ? AND created_at >= date('now', '-7 days')
        GROUP BY date(created_at)
        ORDER BY date ASC
    `).all(userId);

    res.render('dashboard', { 
        user: req.session.user, 
        stats: stats || { total: 0, spam_count: 0, avg_speed: 0 },
        recentHistory,
        charts: {
            distribution: distribution || { spam: 0, safe: 0 },
            timeline: timeHistory
        }
    });
});

app.get('/about', (req, res) => {
    res.render('about', { user: req.session.user });
});

app.get('/detector', isAuthenticated, (req, res) => {
    res.render('detector', { user: req.session.user, result: null, content: '', subject: '' });
});

app.post('/detect', isAuthenticated, (req, res) => {
    const { subject, content } = req.body;
    const detectionResult = detectSpam(content);
    
    // Save to history
    db.prepare(`
        INSERT INTO scan_history (user_id, subject, content, is_spam, spam_score, matched_keywords, execution_time)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
        req.session.user.id,
        subject,
        content,
        detectionResult.isSpam ? 1 : 0,
        detectionResult.spamScore,
        JSON.stringify(detectionResult.matches),
        parseFloat(detectionResult.executionTime)
    );

    res.render('detector', { 
        user: req.session.user, 
        content: content,
        subject: subject,
        result: {
            ...detectionResult,
            subject
        }
    });
});

app.get('/algorithm', (req, res) => {
    res.render('algorithm', { user: req.session.user });
});

app.get('/performance', isAuthenticated, (req, res) => {
    const userId = req.session.user.id;
    const lastScan = db.prepare(`
        SELECT content, subject FROM scan_history 
        WHERE user_id = ? 
        ORDER BY created_at DESC LIMIT 1
    `).get(userId) as any;

    let comparison = null;
    if (lastScan) {
        comparison = detectSpam(lastScan.content).comparison;
    }

    res.render('performance', { 
        user: req.session.user,
        comparison
    });
});

app.get('/contact', (req, res) => {
    res.render('contact', { user: req.session.user, success: false });
});

app.post('/contact', (req, res) => {
    const { name, email, message } = req.body;
    db.prepare('INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)').run(name, email, message);
    res.render('contact', { user: req.session.user, success: true });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
