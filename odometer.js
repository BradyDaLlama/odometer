(function () {
    const gap = 0.1;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://bradydallama.github.io/odometer/odometer.css';
    document.head.appendChild(link);

    function createDigitElement() {
        const digit = document.createElement('div');
        digit.className = 'odometer-digit';

        const inner = document.createElement('div');
        inner.className = 'odometer-digit-inner';

        const blank = document.createElement('span');
        blank.className = 'blank';
        blank.textContent = '';
        inner.appendChild(blank);

        for (let i = 0; i <= 19; i++) {
            const span = document.createElement('span');
            span.textContent = i % 10;
            inner.appendChild(span);
        }

        digit.appendChild(inner);
        return digit;
    }

    function animateDigit(inner, fromDigit, toDigit, reduceMotion) {
        reduceMotion = reduceMotion === 'true';
        const fromY = -((fromDigit + 1) * (1 + gap));
        const toY = -((toDigit + 1) * (1 + gap));
        inner.dataset.digit = toDigit;

        inner.style.setProperty('--from', `${fromY}em`);
        inner.style.setProperty('--to', `${toY}em`);
        inner.style.animationName = 'none';
        inner.offsetHeight;
        inner.style.animationName = reduceMotion ? 'normalScroll' : 'squishyScroll';

        setTimeout(() => {
            const resetY = -((toDigit + 1) * (1 + gap));
            inner.style.transform = `translateY(${resetY}em)`;
        }, parseInt(inner.style.getPropertyValue('--odometer-duration').replace(/\D/g, '')));
    }

    function resizeOdometerDigits(el, displayVal) {
        const unitDiv = el.querySelector('.unit');

        const currentNodes = Array.from(el.childNodes).filter((n) => n !== unitDiv);
        const newNodes = [];

        for (let i = 0; i < displayVal.length; i++) {
            const char = displayVal[i];

            if (/\d/.test(char)) {
                const digitEl = createDigitElement();
                const inner = digitEl.querySelector('.odometer-digit-inner');
                animateDigit(inner, -1, parseInt(char), el.dataset.reduceMotion);
                digitEl.dataset.digitIndex = newNodes.length;
                newNodes.push(digitEl);
            } else if (char === '.' || char === ',') {
                const sep = document.createElement('span');
                sep.className = 'separator';
                sep.textContent = char;
                newNodes.push(sep);
            }
        }

        // Compare and update nodes in place to avoid flashing
        for (let i = 0; i < Math.max(currentNodes.length, newNodes.length); i++) {
            const current = currentNodes[i];
            const next = newNodes[i];

            if (!next) {
                current?.remove();
            } else if (!current) {
                el.insertBefore(next, unitDiv || null);
            } else if (current.className !== next.className || current.textContent !== next.textContent) {
                el.insertBefore(next, current);
                current.remove();
            }
        }

        // Update digit reference list
        el.odometerDigits = Array.from(el.querySelectorAll('.odometer-digit'));

        return displayVal.length;
    }

    function stepOdometer(el) {
        const target = el._odometerTargetValue.replace(/[^\d]/g, '').split('').map(Number);
        let current = el._odometerCurrentValue.replace(/[^\d]/g, '').split('').map(Number);

        let digitIndex = 0;
        for (let i = 0; i < el.childNodes.length; i++) {
            const node = el.childNodes[i];
            if (node.classList?.contains('odometer-digit')) {
                const from = current[digitIndex];
                const to = target[digitIndex];
                if (from !== to) {
                    const inner = node.querySelector('.odometer-digit-inner');
                    animateDigit(inner, from, to, el.dataset.reduceMotion);
                    current[digitIndex] = to;
                }
                digitIndex++;
            }
        }

        el._odometerCurrentValue = el._odometerTargetValue;
    }

    function updateOdometer(el, fullVal) {
        const unitMatch = fullVal.match(/[^\d.,]+$/); // Non-digit/comma/period suffix
        const unitText = unitMatch ? unitMatch[0] : '';
        const displayVal = fullVal.replace(unitText, '');

        const fullCharsSize = fullVal.replace(/[.,]/, '').length;
        const separatorSize = fullVal.replace(/[^.,]/g, '').length;

        const unitDiv = el.querySelector('.unit');
        if (unitDiv) unitDiv.textContent = unitText;

        resizeOdometerDigits(el, displayVal);

        el._odometerTargetValue = displayVal;
        el.style.setProperty('--odometer-width', `${fullCharsSize + 0.2 * separatorSize}ch`);
        stepOdometer(el);
    }

    function initOdometer(el) {
        const rawValue = el.innerText.trim();
        const unitMatch = rawValue.match(/[^\d.,]+$/);
        const unitText = unitMatch ? unitMatch[0] : '';
        const displayVal = rawValue.replace(unitText, '');
        const duration = parseInt(el.dataset.duration || '400');

        el.textContent = '';
        el.odometerDigits = [];
        el._odometerCurrentValue = displayVal;
        el._odometerTargetValue = displayVal;
        el.style.setProperty('--odometer-duration', `${duration}ms`);

        resizeOdometerDigits(el, displayVal);

        let unit = el.querySelector('.unit');
        if (!unit) {
            unit = document.createElement('div');
            unit.className = 'unit';
            el.appendChild(unit);
        }
        unit.textContent = unitText;

        el.setOdometer = function (newValue) {
            if (newValue !== el._odometerTargetValue + unit.textContent) {
                updateOdometer(el, newValue.toString());
            }
        };
    }

    function initAllOdometers() {
        const elements = document.querySelectorAll('.odometer');
        elements.forEach((el) => {
            if (!el._odometerInitialized) {
                el._odometerInitialized = true;
                initOdometer(el);
            }
        });

        document.documentElement.style.setProperty('--odometer-gap', `${gap}em`);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAllOdometers);
    } else {
        initAllOdometers();
    }
})();
