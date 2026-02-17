const prices = [
    { raw: "$ 1.188,39", expected: 1188.39 },
    { raw: "1.188,39", expected: 1188.39 },
    { raw: "$ 1.500", expected: 1500.00 },
    { raw: "150,00", expected: 150.00 },
    { raw: "CÓDIGO: 963U", expected: 0 },
    { raw: "$ 178.259", expected: 178259.00 }, // User's broken output?
];

prices.forEach(p => {
    let result = 0;
    // My previous logic
    if (p.raw) {
        let cleanText = p.raw.replace(/\./g, "").replace(",", ".").replace(/[^0-9.]/g, "");
        result = parseFloat(cleanText) || 0;
    }
    console.log(`Raw: "${p.raw}" -> Parsed: ${result} (Expected: ${p.expected}) ${result === p.expected ? '✅' : '❌'}`);

    // Test alternative logic if failed
    if (result !== p.expected) {
        // Regex to capture last comma as decimal?
        // Or check for multiple dots?
    }
});
