const textInput = document.getElementById('vizText');
const patternInput = document.getElementById('vizPattern');
const startBtn = document.getElementById('startViz');
const pauseBtn = document.getElementById('pauseViz');
const resetBtn = document.getElementById('resetViz');
const speedInput = document.getElementById('vizSpeed');
const speedVal = document.getElementById('speedVal');
const textRow = document.getElementById('textRow');
const patternRow = document.getElementById('patternRow');
const shiftTableDiv = document.getElementById('shiftTableViz');
const logDiv = document.getElementById('vizLog');

let isAnimating = false;
let isPaused = false;
let animationId = 0;
let currentStepSpeed = 800;

function initViz() {
    const text = textInput.value;
    const pattern = patternInput.value;
    
    textRow.innerHTML = '';
    patternRow.innerHTML = '';
    
    for (const char of text) {
        const div = document.createElement('div');
        div.className = 'char-box glass';
        div.textContent = char === ' ' ? '\u00A0' : char;
        div.style.padding = '10px';
        div.style.minWidth = '44px';
        div.style.textAlign = 'center';
        div.style.border = '1px solid rgba(255,255,255,0.1)';
        textRow.appendChild(div);
    }
    
    for (const char of pattern) {
        const div = document.createElement('div');
        div.className = 'pattern-char glass';
        div.textContent = char === ' ' ? '\u00A0' : char;
        div.style.padding = '10px';
        div.style.minWidth = '44px';
        div.style.textAlign = 'center';
        div.style.background = 'rgba(6, 182, 212, 0.2)';
        div.style.border = '1px solid var(--accent-cyan)';
        patternRow.appendChild(div);
    }
    
    // Update shift table
    const m = pattern.length;
    const table = {};
    for (let i = 0; i < m - 1; i++) {
        table[pattern[i]] = m - 1 - i;
    }
    
    shiftTableDiv.innerHTML = '<span style="color:var(--accent-purple)">Others → ' + m + '</span><br>';
    for (const [char, shift] of Object.entries(table)) {
        shiftTableDiv.innerHTML += `<b>${char === ' ' ? 'Space' : char}</b> → ${shift}<br>`;
    }
    
    logDiv.innerHTML = '<span style="color:var(--accent-cyan)">System ready. Command sequence loaded.</span>';
    patternRow.style.marginLeft = '0px';
}

async function startAnimation() {
    if (isAnimating && !isPaused) return;
    
    if (isPaused) {
        isPaused = false;
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        return;
    }

    isAnimating = true;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    
    initViz();
    
    const text = textInput.value;
    const pattern = patternInput.value;
    const n = text.length;
    const m = pattern.length;
    const charWidth = 50; // Width + margin
    
    const table = {};
    for (let i = 0; i < m - 1; i++) {
        table[pattern[i]] = m - 1 - i;
    }
    
    let i = m - 1;
    while (i < n && isAnimating) {
        patternRow.style.marginLeft = `${(i - m + 1) * charWidth}px`;
        await waitForResume();
        await sleep(currentStepSpeed);
        
        let match = true;
        const textChars = textRow.children;
        
        for (let j = m - 1; j >= 0; j--) {
            if (!isAnimating) return;
            await waitForResume();
            
            const textIdx = i - (m - 1 - j);
            textChars[textIdx].style.border = '1px solid var(--accent-purple)';
            textChars[textIdx].style.background = 'rgba(147, 51, 234, 0.2)';
            
            await sleep(currentStepSpeed / 2);
            
            if (pattern[j] !== text[textIdx]) {
                textChars[textIdx].style.background = 'rgba(239, 68, 68, 0.2)';
                textChars[textIdx].style.border = '1px solid #ef4444';
                match = false;
                logDiv.innerHTML = `Mismatch detected at index ${textIdx}.<br>` + logDiv.innerHTML;
                break;
            } else {
                textChars[textIdx].style.background = 'rgba(34, 197, 94, 0.2)';
                textChars[textIdx].style.border = '1px solid #22c55e';
            }
        }
        
        if (match) {
            logDiv.innerHTML = `<b style="color:var(--accent-cyan)">Match confirmed at offset ${i - m + 1}!</b><br>` + logDiv.innerHTML;
            await sleep(currentStepSpeed);
        }
        
        // Reset colors for next shift
        await sleep(currentStepSpeed / 2);
        for (let j = 0; j < n; j++) {
            textChars[j].style.background = '';
            textChars[j].style.border = '1px solid rgba(255,255,255,0.1)';
        }
        
        const charAtI = text[i];
        const shift = table[charAtI] ?? m;
        i += shift;
        
        if (i < n && isAnimating) {
            logDiv.innerHTML = `Shifting right by ${shift} positions...<br>` + logDiv.innerHTML;
        }
    }
    
    if (isAnimating) {
        logDiv.innerHTML = `<b style="color:var(--accent-cyan)">Scan complete. Protocol terminated.</b><br>` + logDiv.innerHTML;
    }
    
    isAnimating = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForResume() {
    while (isPaused && isAnimating) {
        await sleep(100);
    }
}

startBtn.addEventListener('click', startAnimation);

pauseBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    pauseBtn.innerHTML = isPaused ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>';
});

resetBtn.addEventListener('click', () => {
    isAnimating = false;
    isPaused = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    initViz();
});

speedInput.addEventListener('input', (e) => {
    currentStepSpeed = parseInt(e.target.value);
    speedVal.innerText = currentStepSpeed + 'ms';
});

initViz();
