-- Seed Sample Products
-- This creates example products (both services and physical items)

-- ============================================
-- SERVICES
-- ============================================

-- Lectura de Tarot
INSERT INTO products (name, description, type, price, duration_minutes, category_id, is_active) VALUES
  (
    'Lectura de Tarot Completa',
    'Consulta profunda de 60 minutos con análisis detallado de tu situación actual, pasado y futuro. Incluye interpretación de 10 cartas y guía personalizada.',
    'service',
    5000.00,
    60,
    '7eddd02a-3987-4913-833a-288c53d2e23c',
    true
  ),
  (
    'Lectura de Tarot Express',
    'Consulta rápida de 30 minutos enfocada en una pregunta específica. Ideal para decisiones urgentes.',
    'service',
    3000.00,
    30,
    '7eddd02a-3987-4913-833a-288c53d2e23c',
    true
  );

-- Lectura de Runas
INSERT INTO products (name, description, type, price, duration_minutes, category_id, is_active) VALUES
  (
    'Lectura de Runas Nórdicas',
    'Interpretación ancestral con runas vikingas. Sesión de 45 minutos para encontrar claridad y dirección en tu camino.',
    'service',
    4500.00,
    45,
    'fb3f2d86-1daf-4e74-a3c7-ad0a8439885d',
    true
  );

-- Ritual Energético
INSERT INTO products (name, description, type, price, duration_minutes, category_id, is_active) VALUES
  (
    'Ritual de Luna Llena',
    'Ritual personalizado para manifestación y liberación. Incluye preparación energética y cierre con protección.',
    'service',
    8000.00,
    90,
    '170b6573-6189-4823-b0df-51f9e151b392',
    true
  ),
  (
    'Ritual de Protección Personal',
    'Ritual enfocado en crear un escudo energético protector. Ideal para momentos de vulnerabilidad.',
    'service',
    6500.00,
    60,
    '170b6573-6189-4823-b0df-51f9e151b392',
    true
  );

-- Limpieza Energética
INSERT INTO products (name, description, type, price, duration_minutes, category_id, is_active) VALUES
  (
    'Limpieza de Espacios',
    'Limpieza profunda de tu hogar u oficina. Eliminación de energías estancadas y armonización del ambiente.',
    'service',
    7000.00,
    120,
    '96b93f2b-2f0a-49fb-9139-7fd60acacb81',
    true
  ),
  (
    'Limpieza Áurica Personal',
    'Sesión de limpieza de tu campo energético personal. Restaura tu vitalidad y equilibrio interior.',
    'service',
    5500.00,
    60,
    '96b93f2b-2f0a-49fb-9139-7fd60acacb81',
    true
  );

-- Coaching Espiritual
INSERT INTO products (name, description, type, price, duration_minutes, category_id, is_active) VALUES
  (
    'Sesión de Coaching Espiritual',
    'Acompañamiento personalizado en tu proceso de crecimiento. Herramientas prácticas para tu evolución consciente.',
    'service',
    6000.00,
    75,
    '8dab39ba-f21f-4ffe-8c31-6684323bedfe',
    true
  );

-- ============================================
-- PHYSICAL PRODUCTS
-- ============================================

-- Crystals
INSERT INTO products (name, description, type, price, stock, shipping_weight, is_active) VALUES
  (
    'Cuarzo Rosa Natural',
    'Cristal de cuarzo rosa de alta calidad. Piedra del amor incondicional y la sanación emocional. Tamaño: 5-7cm.',
    'physical',
    3500.00,
    15,
    0.15,
    true
  ),
  (
    'Amatista Uruguaya',
    'Amatista natural de Uruguay. Potencia la intuición y la conexión espiritual. Tamaño: 8-10cm.',
    'physical',
    5500.00,
    10,
    0.25,
    true
  ),
  (
    'Obsidiana Negra',
    'Piedra de protección y anclaje. Ideal para absorber energías negativas. Tamaño: 4-6cm.',
    'physical',
    2800.00,
    20,
    0.12,
    true
  ),
  (
    'Citrino Natural',
    'Cristal de abundancia y prosperidad. Atrae la energía del éxito. Tamaño: 5-7cm.',
    'physical',
    4200.00,
    12,
    0.18,
    true
  );

-- Incense & Smudging
INSERT INTO products (name, description, type, price, stock, shipping_weight, is_active) VALUES
  (
    'Sahumerio de Palo Santo',
    'Pack de 5 varillas de Palo Santo peruano. Limpieza energética y aromaterapia sagrada.',
    'physical',
    2500.00,
    30,
    0.08,
    true
  ),
  (
    'Sahumerio de Salvia Blanca',
    'Manojo de salvia blanca californiana. Purificación profunda de espacios y auras.',
    'physical',
    3200.00,
    25,
    0.10,
    true
  ),
  (
    'Incienso de Sándalo Premium',
    'Caja de 20 varillas de incienso de sándalo. Meditación y elevación espiritual.',
    'physical',
    1800.00,
    40,
    0.05,
    true
  );

-- Tarot Decks
INSERT INTO products (name, description, type, price, stock, shipping_weight, is_active) VALUES
  (
    'Tarot Rider-Waite Clásico',
    'El mazo de tarot más icónico. 78 cartas con guía de interpretación en español.',
    'physical',
    4500.00,
    8,
    0.30,
    true
  ),
  (
    'Tarot de Marsella Tradicional',
    'Mazo tradicional francés. Ideal para lecturas profundas y meditación.',
    'physical',
    5200.00,
    6,
    0.32,
    true
  );

-- Candles
INSERT INTO products (name, description, type, price, stock, shipping_weight, is_active) VALUES
  (
    'Vela Ritual de Protección',
    'Vela artesanal de cera de soja con hierbas protectoras. Duración: 8 horas.',
    'physical',
    2200.00,
    18,
    0.20,
    true
  ),
  (
    'Vela de Abundancia Dorada',
    'Vela ritualizada para atraer prosperidad. Aroma de canela y naranja.',
    'physical',
    2500.00,
    15,
    0.22,
    true
  );
