export function getMoonPhase(date: Date = new Date()): { phase: string; icon: string; description: string } {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    const day = date.getDate();

    let c = 0;
    let e = 0;
    let jd = 0;
    let b = 0;

    if (month < 3) {
        year--;
        month += 12;
    }

    ++month;

    c = 365.25 * year;
    e = 30.6 * month;
    jd = c + e + day - 694039.09; // jd is total days elapsed
    jd /= 29.5305882; // divide by the moon cycle
    b = parseInt(jd.toString()); // int(jd) -> b, take integer part of jd
    jd -= b; // subtract integer part to leave fractional part of original jd
    b = Math.round(jd * 8); // scale fraction from 0-8 and round

    if (b >= 8) {
        b = 0; // 0 and 8 are the same so turn 8 into 0
    }

    // 0 => New Moon
    // 1 => Waxing Crescent
    // 2 => First Quarter
    // 3 => Waxing Gibbous
    // 4 => Full Moon
    // 5 => Waning Gibbous
    // 6 => Last Quarter
    // 7 => Waning Crescent

    switch (b) {
        case 0:
            return { phase: 'Luna Nueva', icon: '🌑', description: 'Tiempo de siembra e intenciones.' };
        case 1:
            return { phase: 'Luna Creciente', icon: '🌒', description: 'Momento de impulso y acción.' };
        case 2:
            return { phase: 'Cuarto Creciente', icon: '🌓', description: 'Supera obstáculos, confía.' };
        case 3:
            return { phase: 'Luna Gibosa', icon: '🌔', description: 'Perfecciona y ajusta detalles.' };
        case 4:
            return { phase: 'Luna Llena', icon: '🌕', description: 'Plenitud, cosecha y gratitud.' };
        case 5:
            return { phase: 'Luna Gibosa Menguante', icon: '🌖', description: 'Libera lo que no sirve.' };
        case 6:
            return { phase: 'Cuarto Menguante', icon: '🌗', description: 'Introspección y balance.' };
        case 7:
            return { phase: 'Luna Menguante', icon: '🌘', description: 'Descanso y sanación.' };
        default:
            return { phase: 'Luna Nueva', icon: '🌑', description: 'Tiempo de siembra e intenciones.' };
    }
}
