const expressionEl = document.getElementById('expression');
const resultEl = document.getElementById('result');
const modeToggle = document.getElementById('modeToggle');

let expression = '';
let degreeMode = true;

function formatNumber(value) {
    if (!isFinite(value)) return 'Erreur';
    const abs = Math.abs(value);
    if (abs >= 1e12 || (abs > 0 && abs < 1e-9)) {
        return value.toExponential(6).replace(/\.?0+e/, 'e');
    }
    return Number(value.toFixed(10)).toString();
}

function normalizeExpression(raw) {
    let value = raw
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'pi')
        .replace(/e/g, 'e')
        .replace(/\^/g, '**')
        .replace(/√/g, 'sqrt')
        .replace(/%/g, '/100');

    value = value.replace(/sin\(/g, 'sin(');
    value = value.replace(/cos\(/g, 'cos(');
    value = value.replace(/tan\(/g, 'tan(');
    value = value.replace(/ln\(/g, 'ln(');
    value = value.replace(/log\(/g, 'log(');

    return value;
}

function evaluateExpression(rawExpression) {
    const sanitized = normalizeExpression(rawExpression);

    try {
        const fn = new Function(
            'sin',
            'cos',
            'tan',
            'sqrt',
            'log',
            'ln',
            'pi',
            'e',
            'return ' + sanitized
        );

        const result = fn(
            (x) => Math.sin(degreeMode ? (x * Math.PI) / 180 : x),
            (x) => Math.cos(degreeMode ? (x * Math.PI) / 180 : x),
            (x) => Math.tan(degreeMode ? (x * Math.PI) / 180 : x),
            Math.sqrt,
            Math.log10,
            Math.log,
            Math.PI,
            Math.E
        );

        return result;
    } catch (error) {
        return 'Erreur';
    }
}

function updateDisplay() {
    expressionEl.textContent = expression || '0';
}

function appendValue(value) {
    expression += value;
    updateDisplay();
    resultEl.textContent = evaluateExpression(expression) === 'Erreur' ? 'Erreur' : formatNumber(Number(evaluateExpression(expression)));
}

function clearAll() {
    expression = '';
    updateDisplay();
    resultEl.textContent = '0';
}

function deleteLast() {
    expression = expression.slice(0, -1);
    updateDisplay();
    resultEl.textContent = expression ? formatNumber(Number(evaluateExpression(expression))) : '0';
}

function calculate() {
    if (!expression) return;
    const value = evaluateExpression(expression);
    if (value === 'Erreur') {
        resultEl.textContent = 'Erreur';
        return;
    }
    expression = formatNumber(Number(value));
    expressionEl.textContent = expression;
    resultEl.textContent = expression;
}

document.querySelectorAll('button[data-value]').forEach((button) => {
    button.addEventListener('click', () => {
        const value = button.dataset.value;
        if (value === 'sqrt(') {
            expression += 'sqrt(';
        } else {
            expression += value;
        }

        updateDisplay();
        const currentValue = evaluateExpression(expression);
        resultEl.textContent = currentValue === 'Erreur' ? 'Erreur' : formatNumber(Number(currentValue));
    });
});

document.querySelectorAll('button[data-action]').forEach((button) => {
    button.addEventListener('click', () => {
        const action = button.dataset.action;
        if (action === 'clear') clearAll();
        if (action === 'delete') deleteLast();
        if (action === 'equals') calculate();
    });
});

modeToggle.addEventListener('click', () => {
    degreeMode = !degreeMode;
    modeToggle.textContent = degreeMode ? 'DEG' : 'RAD';
});

document.addEventListener('keydown', (event) => {
    const key = event.key;
    const accepted = /[0-9\+\-\*\/\(\)\.%]/;

    if (accepted.test(key)) {
        expression += key;
        updateDisplay();
        const currentValue = evaluateExpression(expression);
        resultEl.textContent = currentValue === 'Erreur' ? 'Erreur' : formatNumber(Number(currentValue));
    }

    if (key === 'Enter' || key === '=') {
        calculate();
    }

    if (key === 'Backspace') {
        deleteLast();
    }

    if (key === 'Escape') {
        clearAll();
    }
});