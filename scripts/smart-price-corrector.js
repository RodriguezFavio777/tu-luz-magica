const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// --- CONFIG ---
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Target Categories (to build the "Source of Truth" map)
const TARGET_URLS = [
    'https://santerialacatedral.com.ar/products/category/velas',
    'https://santerialacatedral.com.ar/products/category/sahumerios',
    'https://santerialacatedral.com.ar/products/category/esencias',
    'https://santerialacatedral.com.ar/products/category/tarot-libros',
    'https://santerialacatedral.com.ar/products/category/151' // Santeria
];

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= scrollHeight - window.innerHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

(async () => {
    console.log('🕵️‍♂️ Starting SMART PRICE CORRECTOR (Name Matcher)...');

    // 1. Fetch Existing Products from DB
    const { data: dbProducts, error } = await supabase.from('products').select('id, name, price');
    if (error) { console.error('DB Error:', error); return; }
    console.log(`📦 Loaded ${dbProducts.length} products from DB.`);

    // 2. Build SOURCE OF TRUTH Map (Real Name -> Real Price)
    const priceMap = new Map();
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1920,1080']
    });

    // Scan method similar to sync-products.js
    const pageCollector = await browser.newPage();
    await pageCollector.setViewport({ width: 1920, height: 1080 });

    let allLinks = [];
    for (const url of TARGET_URLS) {
        console.log(`🌍 Collecting Links: ${url}`);
        try {
            await pageCollector.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });
            await autoScroll(pageCollector);
            const links = await pageCollector.evaluate(() => {
                return Array.from(document.querySelectorAll('a'))
                    .map(a => a.href)
                    .filter(href => (href.includes('/product/') || href.includes('/products/')) && !href.includes('#'))
                    .filter((v, i, a) => a.indexOf(v) === i);
            });
            console.log(`   Found ${links.length} links.`);
            allLinks = [...allLinks, ...links];
        } catch (e) {
            console.error(`   Error scanning ${url}:`, e.message);
        }
    }
    allLinks = [...new Set(allLinks)];
    console.log(`🎯 Total Unique Products to Extract: ${allLinks.length}`);

    // Visit Each Page to get Title + Price (Robust)
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Batch processing
    const BATCH_SIZE = 10;
    for (let i = 0; i < allLinks.length; i += BATCH_SIZE) {
        const batch = allLinks.slice(i, i + BATCH_SIZE);
        console.log(`\n🔄 Reading Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(allLinks.length / BATCH_SIZE)}`);

        for (const link of batch) {
            try {
                await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 30000 }); // faster resource

                const data = await page.evaluate(() => {
                    const title = document.querySelector('h1, .product-title, .product-name, .product_title')?.innerText.trim();
                    const priceText = document.querySelector('.product-price, .price, #price_display, .product-single-price')?.innerText?.trim() || "0";
                    return { title, priceText };
                });

                if (data && data.title && data.priceText) {
                    // Logic Price Parser
                    let price = 0;
                    let clean = data.priceText.replace(/[^0-9.,]/g, "").trim();
                    if (clean.includes(',')) {
                        clean = clean.replace(/\./g, "").replace(",", ".");
                        price = parseFloat(clean);
                    } else {
                        const dotCount = (clean.match(/\./g) || []).length;
                        if (dotCount === 1 && /^[0-9]+\.[0-9]{2}$/.test(clean)) {
                            price = parseFloat(clean);
                        } else {
                            clean = clean.replace(/\./g, "");
                            price = parseFloat(clean);
                        }
                    }
                    if (price > 0) priceMap.set(data.title.toLowerCase(), price);
                }
            } catch (e) { process.stdout.write('x'); } /* ignore error */
            process.stdout.write('.');
        }
    }

    await browser.close();
    console.log(`✅ built Price Map with ${priceMap.size} unique items.`);

    // 3. Update DB Prices
    console.log('🔄 Starting Database Updates (Adding 50% Margin)...');

    let updatedCount = 0;

    for (const prod of dbProducts) {
        const key = prod.name.toLowerCase();

        // Exact Match Attempt
        let realPrice = priceMap.get(key);

        // If not found, try fuzzy text include? (Risk of wrong matching)
        // Let's stick to strict-ish matching first. 
        // Maybe try removing "x units" or simplified?
        if (!realPrice) {
            // Maybe map has "Vela X" and DB has "Vela X (Pack)"?
            // Reverse: Check if any Map Key is contained in DB Name?
        }

        if (realPrice) {
            const newPrice = Math.ceil(realPrice * 1.5); // 50% Margin

            // Only update if difference is significant (> 5%)
            // Or if current price is absurd (> 10x real)
            if (Math.abs(prod.price - newPrice) > 100 || prod.price > newPrice * 5) {
                console.log(`   ✏️ UPDATE: "${prod.name}" | Old: $${prod.price} -> New: $${newPrice} (Base: $${realPrice})`);

                const { error: updateError } = await supabase
                    .from('products')
                    .update({ price: newPrice, is_active: true })
                    .eq('id', prod.id);

                if (!updateError) updatedCount++;
                else console.error('   Update Failed:', updateError.message);
            }
        } else {
            console.log(`   ⚠️ NO MATCH: "${prod.name}" - Keeping $${prod.price}`);
            // If price is absurdly high (e.g. > 100000 for a candle), fix it heuristically?
            // > 50000 -> divide by 100?
            if (prod.price > 50000) {
                const heuristicPrice = Math.round(prod.price / 100);
                console.log(`      -> HEURISTIC FIX (>50k): Setting to $${heuristicPrice}`);
                await supabase.from('products').update({ price: heuristicPrice }).eq('id', prod.id);
                updatedCount++;
            }
        }
    }

    console.log(`🎉 DONE. Updated ${updatedCount} products.`);

})();
