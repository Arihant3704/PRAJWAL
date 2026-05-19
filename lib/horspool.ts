export interface MatchResult {
    position: number;
    keyword: string;
}

export function buildShiftTable(pattern: string): Map<string, number> {
    const m = pattern.length;
    const table = new Map<string, number>();
    
    // Default shift is pattern length
    // We'll handle characters not in table during search
    
    for (let i = 0; i < m - 1; i++) {
        table.set(pattern[i], m - 1 - i);
    }
    
    return table;
}

export function horspoolSearch(text: string, pattern: string): number[] {
    const n = text.length;
    const m = pattern.length;
    const matches: number[] = [];
    
    if (m === 0 || m > n) return matches;
    
    const shiftTable = buildShiftTable(pattern);
    let i = m - 1;
    
    while (i < n) {
        let k = 0;
        while (k < m && pattern[m - 1 - k] === text[i - k]) {
            k++;
        }
        
        if (k === m) {
            matches.push(i - m + 1);
        }
        
        const charAtI = text[i];
        const shift = shiftTable.get(charAtI) ?? m;
        i += shift;
    }
    
    return matches;
}

export function kmpSearch(text: string, pattern: string): number[] {
    const n = text.length;
    const m = pattern.length;
    const matches: number[] = [];
    if (m === 0) return matches;

    // Preprocessing: compute longest prefix-suffix (LPS) array
    const lps = new Array(m).fill(0);
    let len = 0;
    let i = 1;
    while (i < m) {
        if (pattern[i] === pattern[len]) {
            len++;
            lps[i] = len;
            i++;
        } else {
            if (len !== 0) {
                len = lps[len - 1];
            } else {
                lps[i] = 0;
                i++;
            }
        }
    }

    // Searching
    let j = 0; // index for pattern
    let k = 0; // index for text
    while (k < n) {
        if (pattern[j] === text[k]) {
            j++;
            k++;
        }
        if (j === m) {
            matches.push(k - j);
            j = lps[j - 1];
        } else if (k < n && pattern[j] !== text[k]) {
            if (j !== 0) {
                j = lps[j - 1];
            } else {
                k++;
            }
        }
    }
    return matches;
}

export function naiveSearch(text: string, pattern: string): number[] {
    const n = text.length;
    const m = pattern.length;
    const matches: number[] = [];
    for (let i = 0; i <= n - m; i++) {
        let j;
        for (j = 0; j < m; j++) {
            if (text[i + j] !== pattern[j]) break;
        }
        if (j === m) matches.push(i);
    }
    return matches;
}

export const SPAM_KEYWORDS = [
    "win money",
    "free offer",
    "click here",
    "urgent",
    "lottery",
    "claim prize",
    "limited offer",
    "congratulations"
];

export function detectSpam(content: string) {
    const text = content.toLowerCase();
    const results: MatchResult[] = [];
    
    // Horspool Metrics
    const hStart = process.hrtime();
    for (const keyword of SPAM_KEYWORDS) {
        const matches = horspoolSearch(text, keyword.toLowerCase());
        for (const pos of matches) {
            results.push({ position: pos, keyword });
        }
    }
    const hEnd = process.hrtime(hStart);
    const executionTimeMs = (hEnd[0] * 1000 + hEnd[1] / 1000000).toFixed(4);

    // KMP Metrics (for comparison)
    const kStart = process.hrtime();
    for (const keyword of SPAM_KEYWORDS) {
        kmpSearch(text, keyword.toLowerCase());
    }
    const kEnd = process.hrtime(kStart);
    const kmpTime = (kEnd[0] * 1000 + kEnd[1] / 1000000).toFixed(4);

    // Naive Metrics (for comparison)
    const nStart = process.hrtime();
    for (const keyword of SPAM_KEYWORDS) {
        naiveSearch(text, keyword.toLowerCase());
    }
    const nEnd = process.hrtime(nStart);
    const naiveTime = (nEnd[0] * 1000 + nEnd[1] / 1000000).toFixed(4);
    
    // Spam score logic
    const uniqueKeywords = Array.from(new Set(results.map(r => r.keyword)));
    const spamScore = Math.min(100, (results.length * 15) + (uniqueKeywords.length * 10));
    
    // AI Explanation
    let explanation = "";
    if (spamScore > 60) {
        explanation = `This email is marked as dangerous spam because it contains multiple high-risk keywords like ${uniqueKeywords.slice(0, 3).map(k => `'${k}'`).join(", ")}. These are commonly found in phishing attacks.`;
    } else if (spamScore > 30) {
        explanation = `This email is suspicious. We found matches for ${uniqueKeywords.map(k => `'${k}'`).join(", ")}. These phrases are often associated with unsolicited marketing or dubious offers.`;
    } else {
        explanation = "This email appears safe. No significant spam patterns were detected using the Horspool Engine.";
    }

    return {
        isSpam: spamScore >= 31,
        spamScore,
        matches: results,
        executionTime: executionTimeMs,
        keywordCount: results.length,
        uniqueKeywordCount: uniqueKeywords.length,
        uniqueKeywords,
        comparison: {
            horspool: executionTimeMs,
            kmp: kmpTime,
            naive: naiveTime
        },
        explanation
    };
}
