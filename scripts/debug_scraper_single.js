const puppeteer = require('puppeteer');

async function debugSingle() {
    console.log('🐞 Debugging Single Product Scrape...');
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Known product
    const url = 'https://santerialacatedral.com.ar/productos/vela-larga-x-100-unid-19cm-1cm-dia'; // Replace with a valid one if this 404s

    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        // Wait for potential content
        try {
            await page.waitForSelector('.galeria', { timeout: 5000 });
        } catch (e) { console.log('Wait timeout for .galeria'); }

        await page.screenshot({ path: 'debug_product.png' });

        const data = await page.evaluate(() => {
            const images = [];
            // Generic Image Hunt
            const allImgs = Array.from(document.querySelectorAll('img')).map(i => ({ src: i.src, class: i.className, parent: i.parentElement.className }));
            return {
                allImagesCount: allImgs.length,
                sampleImages: allImgs.slice(0, 5)
            };
        });

        console.log('--- RESULTS ---');
        console.log(JSON.stringify(data, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
}

debugSingle();
