// Product data generator for 1000 realistic carpentry products

interface ProductAttributes {
  woodType?: string;
  finish?: string;
  dimensions?: string;
  grade?: string;
  type?: string;
  material?: string;
  brand?: string;
  bladeLength?: string;
  pieces?: string;
  size?: string;
  capacity?: string;
  power?: string;
  padSize?: string;
  packSize?: string;
  diameter?: string;
  length?: string;
  sizes?: string;
  pins?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  attributes: ProductAttributes;
  stock: number;
  images: string[];
}

// Wood types with characteristics
const woodTypes = [
  { name: 'Oak', prefix: 'OAK', priceMultiplier: 1.0, descriptions: ['durable', 'classic grain pattern', 'excellent for furniture'] },
  { name: 'Walnut', prefix: 'WAL', priceMultiplier: 1.7, descriptions: ['rich dark color', 'premium quality', 'ages beautifully'] },
  { name: 'Maple', prefix: 'MPL', priceMultiplier: 1.1, descriptions: ['hard and dense', 'light color', 'great for cutting boards'] },
  { name: 'Cherry', prefix: 'CHR', priceMultiplier: 1.5, descriptions: ['reddish-brown', 'smooth grain', 'darkens with age'] },
  { name: 'Ash', prefix: 'ASH', priceMultiplier: 0.85, descriptions: ['flexible', 'shock resistant', 'great for tool handles'] },
  { name: 'Pine', prefix: 'PIN', priceMultiplier: 0.4, descriptions: ['economical', 'easy to work', 'lightweight'] },
  { name: 'Mahogany', prefix: 'MAH', priceMultiplier: 2.1, descriptions: ['exotic', 'rot resistant', 'fine furniture grade'] },
  { name: 'Cedar', prefix: 'CED', priceMultiplier: 0.75, descriptions: ['aromatic', 'naturally rot resistant', 'insect repellent'] },
  { name: 'Birch', prefix: 'BIR', priceMultiplier: 0.9, descriptions: ['fine grain', 'takes stain well', 'affordable hardwood'] },
  { name: 'Poplar', prefix: 'POP', priceMultiplier: 0.5, descriptions: ['paint-grade', 'easy to machine', 'budget friendly'] },
  { name: 'Hickory', prefix: 'HIK', priceMultiplier: 1.3, descriptions: ['extremely hard', 'rustic appearance', 'high shock resistance'] },
  { name: 'Teak', prefix: 'TEK', priceMultiplier: 3.0, descriptions: ['weather resistant', 'oily texture', 'outdoor furniture grade'] },
  { name: 'Beech', prefix: 'BCH', priceMultiplier: 0.95, descriptions: ['smooth texture', 'bends well', 'ideal for steam bending'] },
  { name: 'Alder', prefix: 'ALD', priceMultiplier: 0.7, descriptions: ['soft hardwood', 'uniform texture', 'stains evenly'] },
  { name: 'Sapele', prefix: 'SAP', priceMultiplier: 1.8, descriptions: ['interlocked grain', 'mahogany alternative', 'ribbon stripe figure'] },
];

const woodGrades = ['Select', 'Premium', 'Standard', 'Construction', 'Utility', 'Clear', 'Knotty', 'FAS'];
const woodFinishes = ['Unfinished', 'Sanded', 'Rough Sawn', 'Planed', 'S4S', 'Live Edge'];
const woodDimensions = [
  '1" x 4" x 8\'', '1" x 6" x 8\'', '1" x 8" x 8\'', '1" x 10" x 8\'', '1" x 12" x 8\'',
  '2" x 4" x 8\'', '2" x 6" x 8\'', '2" x 8" x 8\'', '2" x 10" x 8\'', '2" x 12" x 8\'',
  '4/4 x 6" x 8\'', '5/4 x 6" x 8\'', '6/4 x 8" x 8\'', '8/4 x 10" x 8\'',
  '3" x 3" x 36"', '4" x 4" x 8\'', '6" x 6" x 8\'',
];

const woodProducts = ['Plank', 'Board', 'Lumber', 'Slab', 'Panel', 'Strip', 'Beam', 'Post', 'Veneer Sheet', 'Turning Blank', 'Dowel'];

// Tool categories
const toolBrands = ['Stanley', 'DeWalt', 'Bosch', 'Makita', 'Milwaukee', 'Festool', 'Lie-Nielsen', 'Veritas', 'Narex', 'Irwin', 'Starrett', 'Gyokucho', 'Bessey', 'Jorgensen', 'Rockler'];

const handTools = [
  { type: 'Hand Saw', items: ['Dovetail Saw', 'Tenon Saw', 'Coping Saw', 'Crosscut Saw', 'Rip Saw', 'Japanese Pull Saw', 'Flush Cut Saw', 'Veneer Saw'] },
  { type: 'Chisel', items: ['Bench Chisel', 'Mortise Chisel', 'Paring Chisel', 'Firmer Chisel', 'Skew Chisel', 'Corner Chisel'] },
  { type: 'Hand Plane', items: ['Block Plane', 'Smoothing Plane', 'Jack Plane', 'Jointer Plane', 'Shoulder Plane', 'Router Plane', 'Rabbet Plane', 'Spokeshave'] },
  { type: 'Measuring Tool', items: ['Combination Square', 'Try Square', 'Sliding Bevel', 'Marking Gauge', 'Mortise Gauge', 'Caliper', 'Tape Measure', 'Folding Rule'] },
  { type: 'Clamp', items: ['Bar Clamp', 'Pipe Clamp', 'C-Clamp', 'Spring Clamp', 'Hand Screw Clamp', 'Corner Clamp', 'Band Clamp', 'Toggle Clamp'] },
  { type: 'Mallet', items: ['Wooden Mallet', 'Rubber Mallet', 'Dead Blow Hammer', 'Carving Mallet', 'Brass Hammer'] },
  { type: 'Screwdriver', items: ['Cabinet Screwdriver', 'Ratcheting Screwdriver', 'Precision Screwdriver Set', 'Square Drive Screwdriver'] },
  { type: 'File/Rasp', items: ['Wood Rasp', 'Cabinet Rasp', 'Needle File Set', 'Mill File', 'Surform Shaver'] },
];

const powerTools = [
  { type: 'Power Tool', items: ['Random Orbital Sander', 'Belt Sander', 'Palm Sander', 'Jigsaw', 'Circular Saw', 'Router', 'Drill Driver', 'Impact Driver', 'Biscuit Joiner', 'Domino Joiner', 'Oscillating Multi-Tool', 'Trim Router'] },
];

// Hardware categories
const hardwareMaterials = ['Brass', 'Steel', 'Stainless Steel', 'Bronze', 'Zinc', 'Nickel', 'Iron', 'Aluminum'];
const hardwareFinishes = ['Polished', 'Brushed', 'Antique', 'Oil Rubbed', 'Satin', 'Matte Black', 'Chrome', 'Copper'];

const hardwareTypes = [
  { type: 'Hinge', items: ['Butt Hinge', 'Piano Hinge', 'European Hinge', 'Strap Hinge', 'T-Hinge', 'Butterfly Hinge', 'Concealed Hinge', 'Pivot Hinge', 'Barrel Hinge'] },
  { type: 'Knob', items: ['Cabinet Knob', 'Drawer Knob', 'Door Knob', 'Mushroom Knob', 'Round Knob', 'Square Knob', 'Vintage Knob', 'Crystal Knob'] },
  { type: 'Pull', items: ['Drawer Pull', 'Cabinet Pull', 'Cup Pull', 'Ring Pull', 'Bail Pull', 'Bar Pull', 'Finger Pull', 'Edge Pull'] },
  { type: 'Fastener', items: ['Wood Screws', 'Cabinet Screws', 'Pocket Hole Screws', 'Dowel Pins', 'Biscuits', 'Brad Nails', 'Finish Nails', 'Staples'] },
  { type: 'Bracket', items: ['Shelf Bracket', 'Corner Bracket', 'Angle Bracket', 'Mending Plate', 'T-Bracket', 'Decorative Bracket'] },
  { type: 'Slide', items: ['Drawer Slide', 'Ball Bearing Slide', 'Soft Close Slide', 'Under-mount Slide', 'Center Mount Slide'] },
  { type: 'Catch', items: ['Magnetic Catch', 'Ball Catch', 'Roller Catch', 'Touch Latch', 'Push-to-Open', 'Elbow Catch'] },
  { type: 'Lock', items: ['Cabinet Lock', 'Drawer Lock', 'Cam Lock', 'Showcase Lock', 'Sliding Door Lock'] },
];

// Seeded random for reproducibility
function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.floor(seededRandom(seed) * arr.length)];
}

// Generate placeholder image URLs
function getPlaceholderImage(category: string, text: string): string {
  const colors: Record<string, { bg: string; fg: string }> = {
    'Wood': { bg: '8B4513', fg: 'F5DEB3' },
    'Tools': { bg: '4A5568', fg: 'E2E8F0' },
    'Hardware': { bg: 'B7791F', fg: 'FEFCBF' },
  };
  const { bg, fg } = colors[category] || { bg: '6B7280', fg: 'F3F4F6' };
  const encodedText = encodeURIComponent(text.length > 20 ? text.substring(0, 20) : text);
  return `https://placehold.co/400x300/${bg}/${fg}?text=${encodedText}`;
}

function generateWoodProduct(index: number): Product {
  const seed = index * 7;
  const wood = pick(woodTypes, seed);
  const productType = pick(woodProducts, seed + 1);
  const grade = pick(woodGrades, seed + 2);
  const finish = pick(woodFinishes, seed + 3);
  const dimension = pick(woodDimensions, seed + 4);

  const basePrice = 25 + seededRandom(seed + 5) * 75;
  const price = Math.round(basePrice * wood.priceMultiplier * 100) / 100;
  const desc = pick(wood.descriptions, seed + 6);

  return {
    id: `w${index}`,
    sku: `WD-${wood.prefix}-${String(index).padStart(4, '0')}`,
    name: `${grade} ${wood.name} ${productType}`,
    description: `${wood.name} ${productType.toLowerCase()} - ${desc}. ${dimension} dimensions, ${finish.toLowerCase()} finish. Perfect for woodworking projects requiring ${wood.descriptions[(index + 1) % wood.descriptions.length]}.`,
    price,
    currency: 'USD',
    category: 'Wood',
    attributes: {
      woodType: wood.name,
      finish,
      dimensions: dimension,
      grade,
    },
    stock: Math.floor(seededRandom(seed + 7) * 200) + 5,
    images: [getPlaceholderImage('Wood', `${wood.name} ${productType}`)],
  };
}

function generateToolProduct(index: number): Product {
  const seed = index * 13;
  const isPowerTool = seededRandom(seed) > 0.7;
  const brand = pick(toolBrands, seed + 1);

  let toolCategory;
  let toolItem;

  if (isPowerTool) {
    toolCategory = powerTools[0];
    toolItem = pick(toolCategory.items, seed + 2);
  } else {
    toolCategory = pick(handTools, seed + 2);
    toolItem = pick(toolCategory.items, seed + 3);
  }

  const basePrice = isPowerTool ? 80 + seededRandom(seed + 4) * 300 : 20 + seededRandom(seed + 4) * 150;
  const price = Math.round(basePrice * 100) / 100;

  const materials = ['High Carbon Steel', 'Chrome Vanadium Steel', 'Hardened Steel', 'Stainless Steel', 'Cast Iron', 'Ductile Iron', 'Aluminum', 'Rosewood Handle', 'Brass Fittings'];
  const material = pick(materials, seed + 5);

  const descriptions: Record<string, string[]> = {
    'Hand Saw': ['precise cuts', 'comfortable grip', 'sharp teeth', 'smooth action'],
    'Chisel': ['razor sharp edge', 'balanced weight', 'hardened steel', 'comfortable handle'],
    'Hand Plane': ['fine adjustments', 'smooth sole', 'sharp blade', 'comfortable grip'],
    'Measuring Tool': ['precision markings', 'accurate measurements', 'durable construction', 'easy to read'],
    'Clamp': ['strong grip', 'even pressure', 'quick release', 'protective pads'],
    'Mallet': ['solid head', 'comfortable grip', 'balanced swing', 'durable construction'],
    'Screwdriver': ['magnetic tip', 'comfortable handle', 'precision fit', 'durable shaft'],
    'File/Rasp': ['aggressive cut', 'comfortable handle', 'durable teeth', 'smooth finish'],
    'Power Tool': ['powerful motor', 'variable speed', 'dust collection', 'ergonomic design'],
  };

  const desc = pick(descriptions[toolCategory.type] || descriptions['Power Tool'], seed + 6);

  return {
    id: `t${index}`,
    sku: `TL-${toolCategory.type.substring(0, 3).toUpperCase()}-${String(index).padStart(4, '0')}`,
    name: `${brand} ${toolItem}`,
    description: `Professional-grade ${toolItem.toLowerCase()} by ${brand}. Features ${desc} and ${pick(descriptions[toolCategory.type] || descriptions['Power Tool'], seed + 7)}. Built with ${material.toLowerCase()} for lasting durability.`,
    price,
    currency: 'USD',
    category: 'Tools',
    attributes: {
      type: toolCategory.type,
      material,
      brand,
      ...(isPowerTool ? { power: `${Math.floor(seededRandom(seed + 8) * 15) + 3}A` } : {}),
    },
    stock: Math.floor(seededRandom(seed + 9) * 50) + 3,
    images: [getPlaceholderImage('Tools', toolItem)],
  };
}

function generateHardwareProduct(index: number): Product {
  const seed = index * 17;
  const hardwareCategory = pick(hardwareTypes, seed);
  const item = pick(hardwareCategory.items, seed + 1);
  const material = pick(hardwareMaterials, seed + 2);
  const finish = pick(hardwareFinishes, seed + 3);

  const packSizes = ['1', '2', '4', '6', '10', '12', '20', '25', '50', '100', '500'];
  const packSize = pick(packSizes, seed + 4);

  const basePrice = 5 + seededRandom(seed + 5) * 60;
  const multiplier = parseInt(packSize) > 10 ? 1 + (parseInt(packSize) / 100) : 1;
  const price = Math.round(basePrice * multiplier * 100) / 100;

  const sizes = ['1"', '1.25"', '1.5"', '2"', '2.5"', '3"', '3.5"', '4"', '6"', '8"', '12"', '18"', '20"', '24"'];
  const size = pick(sizes, seed + 6);

  return {
    id: `h${index}`,
    sku: `HW-${hardwareCategory.type.substring(0, 3).toUpperCase()}-${String(index).padStart(4, '0')}`,
    name: `${finish} ${material} ${item}`,
    description: `Quality ${item.toLowerCase()} crafted from ${material.toLowerCase()} with ${finish.toLowerCase()} finish. Pack of ${packSize}. Size: ${size}. Perfect for cabinet making, furniture restoration, and fine woodworking projects.`,
    price,
    currency: 'USD',
    category: 'Hardware',
    attributes: {
      material,
      finish,
      size,
      packSize,
    },
    stock: Math.floor(seededRandom(seed + 7) * 150) + 10,
    images: [getPlaceholderImage('Hardware', item)],
  };
}

export function generateProducts(count: number = 1000): Product[] {
  const products: Product[] = [];

  // Distribute: ~40% Wood, ~35% Tools, ~25% Hardware
  const woodCount = Math.floor(count * 0.4);
  const toolCount = Math.floor(count * 0.35);
  const hardwareCount = count - woodCount - toolCount;

  for (let i = 0; i < woodCount; i++) {
    products.push(generateWoodProduct(i));
  }

  for (let i = 0; i < toolCount; i++) {
    products.push(generateToolProduct(i));
  }

  for (let i = 0; i < hardwareCount; i++) {
    products.push(generateHardwareProduct(i));
  }

  return products;
}

// Export the generated products
export const generatedProducts = generateProducts(1000);
