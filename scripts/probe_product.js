const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    // A known product URL from the logs (or I'll navigate to one)
    // I'll go to a category and click the first product
    await page.goto('https://santerialacatedral.com.ar/products/category/151', { waitUntil: 'domcontentloaded' });

    try {
        await page.waitForSelector('.product-default', { timeout: 10000 });
        // Click first product
        const productLink = await page.$('.product-default a');
        if (productLink) {
            const href = await page.evaluate(el => el.href, productLink);
            console.log('Navigating to product:', href);
            await page.goto(href, { waitUntil: 'domcontentloaded' }); // faster than networkidle2
            await new Promise(r => setTimeout(r, 2000)); // wait for hydration

            const html = await page.content();
            fs.writeFileSync('debug_product.html', html);
            console.log('Saved debug_product.html');
        } else {
            console.log('No product link found');
        }
    } catch (e) {
        console.error('Error:', e.message);
        // Save HTML anyway
        fs.writeFileSync('debug_probe_fail.html', await page.content());
    }

    await browser.close();
})();
