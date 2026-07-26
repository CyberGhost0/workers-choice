// All service titles, trade names, and business names used for search autocomplete
// The values match what the API search can find (service titles, descriptions, artisan categories, business names)
export const SERVICE_SUGGESTIONS = [
  // Trades / categories (match exact DB category names for accurate search)
  'Plumbing', 'Electrician', 'Electrical', 'Cleaning', 'Gardening', 'Landscaping',
  'Carpentry', 'Painting', 'Barber', 'Barbing', 'Haircut',
  'Fruit Hawking', 'Fruit Seller',

  // Plumbing services
  'Pipe Repair & Installation', 'Drain Cleaning', 'Water Heater Installation',
  'Geyser Installation', 'Leak Repair', 'Bathroom Renovation',

  // Cleaning services
  'House Cleaning', 'Office Cleaning', 'Deep Cleaning', 'Carpet Cleaning',
  'Home Cleaning', 'Commercial Cleaning', 'Spotless Cleaning',

  // Electrical services
  'Electrical Repairs', 'Electrical Wiring', 'Inverter Installation',
  'Solar Installation', 'Generator Maintenance', 'Generator Repair',
  'Circuit Breaker', 'Rewiring', 'PowerFix Electrical',

  // Gardening services
  'Lawn Mowing', 'Lawn Maintenance', 'Garden Design', 'Landscaping',
  'Tree Trimming', 'Tree Removal', 'Garden Setup', 'Green Garden Landscaping',

  // Carpentry services
  'Furniture Repair', 'Furniture Restoration', 'Custom Woodwork',
  'Cabinet Installation', 'Kitchen Cabinet', 'Custom Furniture',
  'Shelf Installation', 'Wardrobe Installation', 'WoodCraft Nigeria',

  // Painting services
  'Interior Painting', 'Exterior Painting', 'Wallpaper Installation',
  'Wallpaper Removal', 'House Painting', 'Wall Painting', 'PaintPro Nigeria',

  // Barber services
  'Barbing & Haircut', 'Kids Haircut', 'Hair Grooming', 'Shave', 'Musa Barbing Salon',

  // Fruit hawking services
  'Coconut & Zobo Pack', 'Coconut Water', 'Zobo Drink', 'Fresh Fruit',
  'Eke Wheelbarrow Fruits',

  // Common search terms (mapped via the search function)
  'Plumber', 'Cleaner', 'Gardener', 'Carpenter', 'Painter', 'Fruit',
];

// Map common alternative terms to their searchable equivalents
const TERM_MAP: Record<string, string> = {
  plumber: 'Plumbing',
  cleaner: 'Cleaning',
  gardener: 'Gardening',
  carpenter: 'Carpentry',
  painter: 'Painting',
  electrician: 'Electrical',
  barber: 'Barbing',
  barbering: 'Barbing',
  fruithawker: 'Fruit Hawking',
  fruitseller: 'Fruit Hawking',
  haircut: 'Barbing & Haircut',
  landscaping: 'Landscaping',
  woodwork: 'Carpentry',
  cabinet: 'Cabinet Installation',
  furniture: 'Furniture Repair',
  inverter: 'Inverter Installation',
  solar: 'Solar Installation',
  generator: 'Generator Maintenance',
  wallpaper: 'Wallpaper Installation',
  lawn: 'Lawn Mowing',
  tree: 'Tree Trimming',
  drain: 'Drain Cleaning',
  geyser: 'Water Heater Installation',
  coconut: 'Coconut & Zobo Pack',
  zobo: 'Coconut & Zobo Pack',
};

export function filterSuggestions(query: string): string[] {
  if (!query || query.length < 1) return [];
  const q = query.toLowerCase().trim();

  // First check the term map for an exact match
  if (q in TERM_MAP) {
    const mapped = TERM_MAP[q];
    const rest = SERVICE_SUGGESTIONS.filter((s) => s.toLowerCase().includes(q) && s !== mapped);
    return [mapped, ...rest].slice(0, 8);
  }

  return SERVICE_SUGGESTIONS.filter((s) => s.toLowerCase().includes(q)).slice(0, 8);
}

export function normalizeSearchQuery(query: string): string {
  const q = query.toLowerCase().trim();
  if (q in TERM_MAP) return TERM_MAP[q];
  return query;
}
