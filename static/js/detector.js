// Advanced Detector Logic
document.addEventListener('DOMContentLoaded', () => {
    initDragAndDrop();
    initRealtimeDetection();
    initPdfExport();
    
    // Initial score update if coming from server result
    if (window.SCAN_RESULT) {
        updateScoreMeter(window.SCAN_RESULT.spamScore);
    }
});

// 1. Drag & Drop Integration
function initDragAndDrop() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const contentArea = document.getElementById('content-textarea');
    const subjectArea = document.getElementById('subject-input');

    if (!dropZone) return;

    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('active');
    });

    ['dragleave', 'drop'].forEach(evt => {
        dropZone.addEventListener(evt, () => dropZone.classList.remove('active'));
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length) handleFile(files[0]);
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleFile(e.target.files[0]);
    });

    function handleFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            contentArea.value = content;
            subjectArea.value = file.name.replace(/\.[^/.]+$/, "");
            // Trigger real-time scan
            triggerRealtimeScan(content);
        };
        reader.readAsText(file);
    }
}

// 2. Real-time Detection
const SPAM_KEYWORDS = [
    "win money", "free offer", "click here", "urgent", "lottery", 
    "claim prize", "limited offer", "congratulations", "cash prize", 
    "bank transfer", "act now", "verify account"
];

function initRealtimeDetection() {
    const textarea = document.getElementById('content-textarea');
    if (!textarea) return;

    let timeout;
    textarea.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            triggerRealtimeScan(textarea.value);
        }, 300);
    });
}

function triggerRealtimeScan(text) {
    if (!text) {
        updateScoreMeter(0);
        return;
    }

    const lowerText = text.toLowerCase();
    let matches = 0;
    const uniqueMatches = new Set();

    SPAM_KEYWORDS.forEach(word => {
        if (lowerText.includes(word)) {
            matches++;
            uniqueMatches.add(word);
        }
    });

    // Client-side quick score
    const score = Math.min(100, (matches * 15) + (uniqueMatches.size * 10));
    updateScoreMeter(score);
}

function updateScoreMeter(score) {
    const meter = document.getElementById('score-meter');
    const text = document.getElementById('score-text');
    if (!meter || !text) return;

    let color = '#22c55e'; // Safe
    if (score > 60) color = '#ef4444'; // Dangerous
    else if (score > 30) color = '#eab308'; // Suspicious

    meter.style.setProperty('--meter-color', color);
    meter.style.setProperty('--score-deg', (score * 3.6) + 'deg');
    text.innerText = score + '%';
    text.style.color = color;
}

// 3. PDF Export
function initPdfExport() {
    const btn = document.getElementById('download-pdf');
    if (!btn || !window.SCAN_RESULT) return;

    btn.addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const r = window.SCAN_RESULT;

        // Header
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text('SPAMSHIELD ANALYSIS REPORT', 20, 25);
        
        doc.setFontSize(10);
        doc.text(`DATE: ${new Date().toLocaleString()}`, 140, 25);

        // Content
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(14);
        doc.text('SECURITY STATUS', 20, 55);
        
        doc.setFontSize(30);
        doc.setTextColor(r.spamScore > 60 ? 239 : 34, r.spamScore > 60 ? 68 : 197, r.spamScore > 60 ? 68 : 94);
        doc.text(`${r.spamScore}%`, 20, 75);
        
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(r.isSpam ? 'THREAT DETECTED' : 'CLEAN / VERIFIED', 20, 85);

        // Meta
        doc.line(20, 95, 190, 95);
        doc.setFontSize(10);
        doc.text(`Subject: ${window.SCAN_SUBJECT}`, 20, 105);
        doc.text(`Engine: Horspool String Matching v2.0`, 20, 112);
        doc.text(`Latency: ${r.executionTime}ms`, 20, 119);

        // Keywords
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42);
        doc.text('MATCHED PATTERNS', 20, 135);
        
        let y = 145;
        r.matches.slice(0, 10).forEach(m => {
            doc.setFontSize(10);
            doc.text(`- ${m.keyword} (Offset: ${m.position})`, 25, y);
            y += 7;
        });

        // AI Explanation
        doc.setFillColor(248, 250, 252);
        doc.rect(20, y + 10, 170, 30, 'F');
        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);
        const splitText = doc.splitTextToSize(`AI INSIGHT: ${r.explanation}`, 160);
        doc.text(splitText, 25, y + 20);

        doc.save(`SpamShield_Report_${window.SCAN_SUBJECT.replace(/\s+/g, '_')}.pdf`);
    });
}
