const puppeteer = require('puppeteer');

async function expertDebug() {
    console.log('🕵️ Expert Scraper Debugging...');
    const browser = await puppeteer.launch({
        headless: false,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--window-size=1920,1080'
        ]
    });
    const page = await browser.newPage();

    // Set standard User-Agent to avoid basic bot detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    const url = 'https://santerialacatedral.com.ar/productos/vela-larga-x-100-unid-19cm-1cm-dia';

    try {
        console.log(`Navigating to ${url}...`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        console.log('Page loaded. Waiting for network settlement...');
        // Wait an extra 5 seconds just to be safe for lazy hydration
        await new Promise(r => setTimeout(r, 5000));

        // Take screenshot
        await page.screenshot({ path: 'debug_expert_view.png', fullPage: true });
        console.log('Screenshot saved to debug_expert_view.png');

        // Analyze content
        const data = await page.evaluate(() => {
            const bodyLength = document.body.innerHTML.length;
            const hiddenMsg = document.querySelector('body')?.innerText.includes('pardon our interruption') || false; // Cloudflare check

            // Try different selectors found in previous successful browser session
            // The browser subagent successfully found '.galeria .swiper-slide img'
            const slideImages = Array.from(document.querySelectorAll('.galeria .swiper-slide img')).map(img => img.src);
            const allImages = Array.from(document.querySelectorAll('img')).map(i => ({ src: i.src, class: i.className }));

            const variantSelect = document.querySelector('select');

            return {
                bodyLength,
                isCloudflare: hiddenMsg,
                slideImages,
                allImagesCount: allImages.length,
                variantSelect: !!variantSelect ? 'Found' : 'Missing',
                sampleImages: allImages.slice(0, 5)
            };
        });

        console.log('--- RESULTS ---');
        console.log(JSON.stringify(data, null, 2));

    } catch (e) {
        console.error('Scraping Error:', e);
    } finally {
        await browser.close();
    }
}

expertDebug();
