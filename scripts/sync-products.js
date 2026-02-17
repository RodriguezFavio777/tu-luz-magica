const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// URLS OBJETIVO
const TARGET_URLS = [
    'https://santerialacatedral.com.ar/products/category/151',
    'https://santerialacatedral.com.ar/products/category/velas',
    'https://santerialacatedral.com.ar/products/category/sahumerios',
    'https://santerialacatedral.com.ar/products/category/esencias',
    'https://santerialacatedral.com.ar/products/category/tarot-libros'
];

// FILTRO ANTI-RELIGIÓN
const BLACKLIST = [
    'imagen', 'busto', 'estatua', 'figura', 'escultura',
    'san ', 'santa ', 'santo ', 'gauchito', 'buda', 'virgen',
    'divino', 'jesús', 'jesus', 'corazón de jesús', 'umbanda', 'religion'
];

// MAPEO DE CATEGORÍAS (Keyword -> Slug en DB)
const CATEGORY_MAP = {
    'vela': 'velas', 'velón': 'velas', 'velon': 'velas', 'cirio': 'velas', 'bujia': 'velas', '7 dias': 'velas', 'noche': 'velas',
    'sahumerio': 'sahumerios', 'incienso': 'sahumerios', 'carbon': 'sahumerios', 'bomba': 'sahumerios', 'perlas': 'sahumerios', 'defumacion': 'sahumerios',
    'humificador': 'aromaterapia', 'humidificador': 'aromaterapia', 'difusor': 'aromaterapia', 'esencia': 'aromaterapia', 'aceite': 'aromaterapia', 'liquido': 'aromaterapia', 'hornillo': 'aromaterapia', 'aroma': 'aromaterapia',
    'piedra': 'cristales', 'gema': 'cristales', 'cuarzo': 'cristales', 'turmalina': 'cristales', 'amatista': 'cristales',
    'tarot': 'oraculos', 'mazo': 'oraculos', 'cartas': 'oraculos', 'runas': 'oraculos', 'libro': 'oraculos'
};

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

async function scrapeProducts() {
    console.log('🔮 Iniciando Scraper V4.0 (Batch Mode + Anti-Block)...');

    // 1. SEED CATEGORIES (Ensure they exist with correct scope)
    const PHYSICAL_CATS = [
        { name: 'Velas y Iluminación', slug: 'velas' },
        { name: 'Sahumerios y Defumación', slug: 'sahumerios' },
        { name: 'Aromaterapia', slug: 'aromaterapia' },
        { name: 'Cristales y Gemas', slug: 'cristales' },
        { name: 'Oráculos y Tarot', slug: 'oraculos' },
        { name: 'Santería y Religión', slug: 'santeria' }
    ];

    for (const cat of PHYSICAL_CATS) {
        const { error } = await supabase.from('service_categories').upsert({
            name: cat.name,
            slug: cat.slug,
            scope: 'physical',
            is_active: true
        }, { onConflict: 'slug' });
        if (error) console.error('Error seeding category:', cat.slug, error);
    }
    console.log('✅ Categories Seeded/Verified.');

    // 2. Fetch IDs
    const { data: categories, error: catError } = await supabase
        .from('service_categories')
        .select('id, slug')
        .eq('scope', 'physical');

    if (catError) { console.error('CRITICAL: Cannot fetch categories', catError); return; }

    console.log(`Connection Scope: ${!!process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE (Admin)' : 'ANON (Public)'}`);

    const catMap = {};
    if (categories) categories.forEach(c => catMap[c.slug] = c.id);

    // Collect ALL links first
    let allLinks = [];

    const browserCollector = await puppeteer.launch({
        headless: false,
        args: ['--start-maximized', '--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
    });
    const pageCollector = await browserCollector.newPage();
    await pageCollector.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await pageCollector.setViewport({ width: 1920, height: 1080 });

    try {
        for (const url of TARGET_URLS) {
            console.log(`\n📂 Collecting Links from: ${url}`);
            try {
                await pageCollector.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });
                await autoScroll(pageCollector);
                // Wait for grid
                try { await pageCollector.waitForSelector('a[href*="/product"]', { timeout: 10000 }); } catch (e) { }

                const links = await pageCollector.evaluate(() => {
                    // Collect all potentially relevant links
                    return Array.from(document.querySelectorAll('a'))
                        .map(a => a.href)
                        .filter(href => (href.includes('/product/') || href.includes('/products/')) && !href.includes('#'))
                        .filter((v, i, a) => a.indexOf(v) === i);
                });
                console.log(`   Found ${links.length} potential links.`);
                allLinks = [...allLinks, ...links];
            } catch (e) {
                console.error(`Error collecting from ${url}:`, e.message);
            }
        }
    } finally {
        await browserCollector.close();
    }

    // Phase 2: Separate Categories vs Products & Expand Categories
    let productLinks = new Set();
    let categoriesToVisit = new Set(allLinks.filter(l => l.includes('/category/') || !l.includes('/product/'))); // Categories or plural products
    // Initial products (strict singular /product/)
    allLinks.filter(l => l.includes('/product/') && !l.includes('/category/')).forEach(l => productLinks.add(l));

    console.log(`\nPhase 2: Scanning ${categoriesToVisit.size} Sub-Categories for products...`);

    // Launch a new inspector browser for pass 2
    const browserInspector = await puppeteer.launch({ headless: false, args: ['--no-sandbox'] });
    const pageInspector = await browserInspector.newPage();

    for (const catUrl of categoriesToVisit) {
        try {
            await pageInspector.goto(catUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

            // Infinite Scroll Loop (Max 5 attempts of no change)
            let lastHeight = await pageInspector.evaluate('document.body.scrollHeight');
            let unchanged = 0;
            while (unchanged < 2) {
                await pageInspector.evaluate('window.scrollTo(0, document.body.scrollHeight)');
                await new Promise(r => setTimeout(r, 1500));
                let newHeight = await pageInspector.evaluate('document.body.scrollHeight');
                if (newHeight === lastHeight) unchanged++;
                else { unchanged = 0; lastHeight = newHeight; }
            }

            const foundProducts = await pageInspector.evaluate(() => {
                return Array.from(document.querySelectorAll('a'))
                    .filter(a => a.href.includes('/product/') && !a.href.includes('/category/') && !a.href.includes('/products/'))
                    .map(a => a.href);
            });

            if (foundProducts.length > 0) {
                // console.log(`   + [${foundProducts.length} items]`);
                foundProducts.forEach(p => productLinks.add(p));
            }
        } catch (e) { }
    }
    await browserInspector.close();

    allLinks = Array.from(productLinks);

    // Unique links
    allLinks = [...new Set(allLinks)];
    console.log(`\n-----------------------------------`);
    console.log(`🎯 Total Unique Products to Scrape: ${allLinks.length}`);
    console.log(`-----------------------------------`);

    // Process in Batches of 5 to reset session
    const BATCH_SIZE = 5;
    for (let i = 0; i < allLinks.length; i += BATCH_SIZE) {
        const batch = allLinks.slice(i, i + BATCH_SIZE);
        console.log(`\n🔄 Processing Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(allLinks.length / BATCH_SIZE)} (${batch.length} items)`);

        const browser = await puppeteer.launch({
            headless: false,
            args: ['--start-maximized', '--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
        });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1920, height: 1080 });

        for (const link of batch) {
            try {
                await page.goto(link, { waitUntil: 'networkidle2', timeout: 60000 });
                await new Promise(r => setTimeout(r, Math.random() * 2000 + 3000)); // Random 3-5s delay

                const data = await page.evaluate(() => {
                    const title = document.querySelector('h1, .product-title, .product-name, .product_title')?.innerText.trim();
                    if (!title) return null;

                    let priceText = document.querySelector('.product-price, .price, #price_display, .product-single-price')?.innerText?.trim() || "0";

                    // ULTRA-ROBUST PRICE PARSING
                    let price = 0;
                    if (priceText) {
                        let clean = priceText.replace(/[^0-9.,]/g, "").trim();
                        // 1. If comma exists -> AR Format (1.188,39 or 1,20)
                        if (clean.includes(',')) {
                            // Remove all dots, replace comma with dot
                            clean = clean.replace(/\./g, "").replace(",", ".");
                            price = parseFloat(clean);
                        } else {
                            // 2. NO comma
                            // Could be "1.188" (AR thousand) OR "1188.39" (US decimal)

                            // Heuristic: If it ENDS with .XX (2 digits) AND doesn't look like thousand (1.188)
                            // "1.188" matches .XX but is thousand? No, 1188.00 matches.
                            // "1188.39" matches.
                            // If it has ONE dot and 2 decimals -> US.
                            const dotCount = (clean.match(/\./g) || []).length;
                            if (dotCount === 1 && /^[0-9]+\.[0-9]{2}$/.test(clean)) {
                                // "1188.39" -> US Format
                                price = parseFloat(clean);
                            } else {
                                // "1.188" or "15.000" -> AR Thousand Format
                                // Remove dots
                                clean = clean.replace(/\./g, "");
                                price = parseFloat(clean);
                            }
                        }
                    }
                    const description = document.querySelector('.product-description, .description, #description, .product-single-description')?.innerText.trim() || "";

                    // IMÁGENES
                    const images = [];
                    document.querySelectorAll('.product-single-container img').forEach(img => images.push(img.src));
                    document.querySelectorAll('.swiper-slide img').forEach(img => {
                        const src = img.src || img.dataset.src;
                        if (src) images.push(src);
                    });
                    if (images.length === 0) {
                        document.querySelectorAll('img').forEach(img => {
                            if (img.src && img.width > 300 && !img.src.includes('logo')) images.push(img.src);
                        });
                    }
                    const uniqueImages = [...new Set(images)].filter(src => src.includes('http') && !src.includes('placeholder') && !src.includes('logo'));

                    // VARIANTES
                    const variants = [];
                    const variantTextDivs = Array.from(document.querySelectorAll('.attributeTable.row .attribut-only, .config-size-list div'));
                    const badKeywords = ['todas las categorías', 'velas de noche', 'velas largas', 'velas santoral', 'http', 'www', 'inicio', 'servicios', 'tienda'];
                    const variantLabels = [...new Set(variantTextDivs.map(d => d.innerText.trim()).filter(t => t && !badKeywords.some(k => t.toLowerCase().includes(k))))];
                    if (variantLabels.length > 0) {
                        variants.push({ type: 'Opción / Color', options: [...new Set(variantLabels)] });
                    } else {
                        document.querySelectorAll('select').forEach(sel => {
                            const label = sel.previousElementSibling?.innerText || "Opción";
                            const opts = Array.from(sel.querySelectorAll('option')).map(o => o.innerText.trim()).filter(t => t !== "Seleccionar..." && t !== "");
                            if (opts.length > 0) variants.push({ type: label, options: opts });
                        });
                    }
                    return { title, price, description, images: uniqueImages, variants };
                });

                if (!data) {
                    console.log(`❌ Failed: ${link}`);
                    continue;
                }

                // Logic for Category/Filter (Copied from previous version)
                if (BLACKLIST.some(bad => data.title.toLowerCase().includes(bad))) {
                    continue;
                }

                // Exclude if only 1 image and it's small/generic (Banner/Logo check)
                if (data.images.length === 1) {
                    const img = data.images[0].toLowerCase();
                    if (img.includes('banner') || img.includes('icon') || img.includes('logo')) {
                        console.log(`   . Skipped (Bad Image): ${data.title}`);
                        continue;
                    }
                }

                // Expanded Category Mapping
                const SUB_CATEGORY_MAP_INJECTED = {
                    'velas': 'velas', 'velon': 'velas', 'cirio': 'velas', 'bujia': 'velas', '7 dias': 'velas', 'noche': 'velas', 'aromanza': 'velas', 'finitas': 'velas', 'san jorge': 'velas', 'san expedito': 'velas',
                    'sahumerio': 'sahumerios', 'incienso': 'sahumerios', 'carbon': 'sahumerios', 'bomba': 'sahumerios', 'perlas': 'sahumerios',
                    'defumacion': 'sahumerios', 'sagrada madre': 'sahumerios', 'palo santo': 'sahumerios', 'conos': 'sahumerios', 'pastillas': 'sahumerios', 'hierbas': 'sahumerios', 'resina': 'sahumerios',
                    'esencia': 'aromaterapia', 'aceite': 'aromaterapia', 'difusor': 'aromaterapia', 'hornillo': 'aromaterapia', 'aroma': 'aromaterapia',
                    'humidificador': 'aromaterapia', 'spray': 'aromaterapia', 'aerosol': 'aromaterapia', 'perfume': 'aromaterapia', 'agua': 'aromaterapia',
                    'piedra': 'cristales', 'gema': 'cristales', 'cuarzo': 'cristales', 'turmalina': 'cristales', 'amatista': 'cristales', 'pirita': 'cristales',
                    'tarot': 'oraculos', 'mazo': 'oraculos', 'cartas': 'oraculos', 'runas': 'oraculos', 'libro': 'oraculos', 'pendulo': 'oraculos',
                    'imagen': 'santeria', 'busto': 'santeria', 'estatua': 'santeria', 'figura': 'santeria', 'san ': 'santeria', 'santa ': 'santeria', 'novena': 'santeria', 'estampa': 'santeria'
                };

                let targetSlug = null;
                const lowerTitle = data.title.toLowerCase();
                for (const [key, slug] of Object.entries(SUB_CATEGORY_MAP_INJECTED)) {
                    if (lowerTitle.includes(key)) { targetSlug = slug; break; }
                }

                // Fallback to URL hint
                if (!targetSlug) {
                    if (link.includes('velas')) targetSlug = 'velas';
                    else if (link.includes('sahumerios')) targetSlug = 'sahumerios';
                    else if (link.includes('esencias')) targetSlug = 'aromaterapia';
                    else if (link.includes('tarot')) targetSlug = 'oraculos';
                }

                if (!targetSlug || !catMap[targetSlug]) {
                    // console.log(`   . Skipped (Map): ${data.title}`); 
                    continue;
                }

                const finalPrice = Math.ceil(data.price * 1.5);
                console.log(`   > Inserting: ${data.title.substring(0, 25)}... | Imgs: ${data.images.length}`);

                const { error } = await supabase.from('products').upsert({
                    name: data.title,
                    description: data.description,
                    price: finalPrice,
                    cost_price: data.price,
                    category_id: catMap[targetSlug],
                    type: 'physical',
                    stock: 50,
                    image_url: data.images[0],
                    images: data.images,
                    variants: data.variants,
                    is_active: true
                }, { onConflict: 'name' });

                if (error) console.error('   ❌ DB Error:', error.message);
                else process.stdout.write('✅ ');

            } catch (e) { console.error(`   Error processing link: ${link}`, e.message); }
        }
        await browser.close();
        // Wait between batches
        console.log('   Cooling down (5s)...');
        await new Promise(r => setTimeout(r, 5000));
    }
}
scrapeProducts();
