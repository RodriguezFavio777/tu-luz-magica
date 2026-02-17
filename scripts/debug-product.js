const puppeteer = require('puppeteer');

(async () => {
    // URL from the screenshot
    const url = 'https://santerialacatedral.com.ar/product/sahumerio-organicos-aromanza-india-x-8-varillas-a-partir-de-12-u-1';

    console.log(`🔎 Inspecting: ${url}`);

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Set viewport to desktop to get desktop layout
    await page.setViewport({ width: 1280, height: 800 });

    await page.goto(url, { waitUntil: 'networkidle2' });

    // Selectors to check
    const selectors = [
        '.product-price',
        '.price',
        '#price_display',
        '.product-single-price',
        'h2.price',
        '.current-price'
    ];

    const priceData = await page.evaluate((selectors) => {
        const results = [];

        selectors.forEach(sel => {
            const el = document.querySelector(sel);
            if (el) {
                results.push({
                    selector: sel,
                    innerText: el.innerText,
                    textContent: el.textContent,
                    innerHTML: el.innerHTML,
                    // Check for hidden inputs often used in WooCommerce
                    hiddenVal: document.querySelector('input[name="price"]')?.value
                });
            }
        });
        return results;
    }, selectors);

    console.log('--- Price Selection Debug ---');
    console.log(JSON.stringify(priceData, null, 2));

    priceData.forEach(p => {
        if (!p.innerText) return;

        let raw = p.innerText.trim();
        console.log(`\nEval Selector: ${p.selector}`);
        console.log(`Raw InnerText: "${raw}"`);

        // Detailed char inspection
        for (let i = 0; i < raw.length; i++) {
            console.log(`Char[${i}]: '${raw[i]}' Code: ${raw.charCodeAt(i)}`);
        }

        // Apply logic
        let cleanText = raw.replace(/\./g, "").replace(",", ".").replace(/[^0-9.]/g, "");
        let parsed = parseFloat(cleanText);
        console.log(`Processed: "${cleanText}" -> Float: ${parsed}`);
    });

    await browser.close();
})();
