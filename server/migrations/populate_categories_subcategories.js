const { executeQuery } = require('../config/db');

/**
 * Migration to populate the product categories and subcategories
 * 
 * This migration:
 * 1. Inserts the comprehensive hardware store category structure
 */
async function populateCategoriesSubcategories() {
  try {
    console.log('Populating categories and subcategories...');

    // Define the category structure
    const categories = [
      { id: 'building-materials', name: '🧱 Building & Construction Materials' },
      { id: 'fasteners', name: '🔩 Fasteners & Fixings' },
      { id: 'tools', name: '🛠️ Tools & Equipment' },
      { id: 'plumbing', name: '🔧 Plumbing & Sanitary' },
      { id: 'electrical', name: '💡 Electrical & Lighting' },
      { id: 'paints', name: '🎨 Paints & Surface Finishing' },
      { id: 'doors-windows', name: '🚪 Doors, Windows & Accessories' },
      { id: 'furniture-fittings', name: '🪑 Furniture & Cabinet Fittings' },
      { id: 'garden', name: '🌳 Garden & Outdoor' },
      { id: 'hvac', name: '🔥 Heating, Cooling & Ventilation' },
      { id: 'safety', name: '🛡️ Safety, Security & Fire Protection' },
      { id: 'cleaning', name: '🧽 Cleaning & Maintenance' },
      { id: 'automotive', name: '🚗 Automotive Tools & Supplies' },
      { id: 'adhesives', name: '🧯 Adhesives, Sealants & Chemicals' },
      { id: 'glass', name: '🪞 Glass, Acrylic & Mirrors' },
      { id: 'interior-fixtures', name: '🪟 Blinds, Curtains & Interior Fixtures' },
      { id: 'storage', name: '📦 Packaging, Storage & Organization' },
      { id: 'industrial', name: '🧰 Industrial Supplies' },
      { id: 'miscellaneous', name: '⚙️ Miscellaneous' }
    ];

    // Check if product_categories table exists
    const tableCheck = await executeQuery(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'product_categories'
    `);

    // Create the table if it doesn't exist
    if (tableCheck[0].count === 0) {
      console.log('Creating product_categories table...');
      await executeQuery(`
        CREATE TABLE product_categories (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          store_id INT DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }

    // Check if product_subcategories table exists
    const subcatTableCheck = await executeQuery(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'product_subcategories'
    `);

    // Create the subcategories table if it doesn't exist
    if (subcatTableCheck[0].count === 0) {
      console.log('Creating product_subcategories table...');
      await executeQuery(`
        CREATE TABLE product_subcategories (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          category_id VARCHAR(50) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE CASCADE
        )
      `);
    }

    // Insert categories
    for (const category of categories) {
      // Check if category exists
      const categoryExists = await executeQuery(
        'SELECT COUNT(*) as count FROM product_categories WHERE id = ?',
        [category.id]
      );
      
      if (categoryExists[0].count === 0) {
        await executeQuery(
          'INSERT INTO product_categories (id, name) VALUES (?, ?)',
          [category.id, category.name]
        );
        console.log(`Added category: ${category.name}`);
      } else {
        console.log(`Category already exists: ${category.name}`);
      }
    }

    // Define subcategory structure by category ID
    const subcategories = {
      'building-materials': [
        {id: 'cement-concrete', name: 'Cement, Concrete & Aggregates'},
        {id: 'bricks-blocks', name: 'Bricks & Blocks'},
        {id: 'lumber-timber', name: 'Lumber & Timber Products'},
        {id: 'drywall', name: 'Drywall & Plasterboard'},
        {id: 'insulation', name: 'Insulation Materials'},
        {id: 'roofing', name: 'Roofing Materials'},
        {id: 'waterproofing', name: 'Waterproofing & Dampproofing'},
        {id: 'steel-metal', name: 'Steel & Metal Framing'},
        {id: 'flooring-underlayment', name: 'Flooring Underlayment'},
        {id: 'construction-membranes', name: 'Construction Membranes & Barriers'},
        {id: 'cladding-facades', name: 'Cladding & Facades'},
        {id: 'structural-beams', name: 'Structural Beams & Supports'}
      ],
      'fasteners': [
        {id: 'screws', name: 'Screws (Wood, Metal, Drywall)'},
        {id: 'nails-brads', name: 'Nails & Brads'},
        {id: 'bolts-nuts', name: 'Bolts & Nuts'},
        {id: 'washers-spacers', name: 'Washers & Spacers'},
        {id: 'anchors-plugs', name: 'Anchors & Wall Plugs'},
        {id: 'rivets', name: 'Rivets & Rivet Tools'},
        {id: 'cable-ties', name: 'Cable Ties & Clamps'},
        {id: 'picture-hanging', name: 'Picture Hanging Hardware'},
        {id: 'specialty-fasteners', name: 'Specialty Fasteners'},
        {id: 'threaded-rods', name: 'Threaded Rods & Studs'},
        {id: 'brackets-angles', name: 'Construction Brackets & Angles'},
        {id: 'staples-pins', name: 'Staples & Pins'}
      ],
      'tools': [
        {id: 'hand-tools', name: 'Hand Tools'},
        {id: 'power-tools', name: 'Power Tools'},
        {id: 'measuring-tools', name: 'Measuring & Layout Tools'},
        {id: 'cutting-tools', name: 'Cutting Tools'},
        {id: 'tool-storage', name: 'Tool Storage & Workbenches'},
        {id: 'ladders-scaffolding', name: 'Ladders & Scaffolding'},
        {id: 'lifting-equipment', name: 'Lifting & Moving Equipment'},
        {id: 'pneumatic-tools', name: 'Compressors & Pneumatic Tools'},
        {id: 'welding-equipment', name: 'Welding Equipment'},
        {id: 'construction-machinery', name: 'Construction Machinery'},
        {id: 'tool-accessories', name: 'Tool Accessories & Parts'},
        {id: 'specialized-trade', name: 'Specialized Trade Tools'}
      ]
    };

    // Continue adding subcategories for other categories
    subcategories['plumbing'] = [
      {id: 'pipes-fittings', name: 'Pipes & Fittings'},
      {id: 'valves-controls', name: 'Valves & Controls'},
      {id: 'drainage-systems', name: 'Drainage Systems'},
      {id: 'faucets-taps', name: 'Faucets & Taps'},
      {id: 'sinks-basins', name: 'Sinks & Basins'},
      {id: 'toilets-urinals', name: 'Toilets & Urinals'},
      {id: 'showers-bathtubs', name: 'Showers & Bathtubs'},
      {id: 'water-heaters', name: 'Water Heaters'},
      {id: 'pumps-pressure', name: 'Pumps & Pressure Systems'},
      {id: 'water-filtration', name: 'Water Filtration & Treatment'},
      {id: 'plumbing-accessories', name: 'Plumbing Accessories'},
      {id: 'pipe-insulation', name: 'Pipe Insulation'}
    ];

    subcategories['electrical'] = [
      {id: 'wiring-cables', name: 'Wiring & Cables'},
      {id: 'switches-outlets', name: 'Switches & Outlets'},
      {id: 'circuit-breakers', name: 'Circuit Breakers & Fuse Boxes'},
      {id: 'conduits-raceways', name: 'Conduits & Raceways'},
      {id: 'interior-lighting', name: 'Interior Lighting Fixtures'},
      {id: 'exterior-lighting', name: 'Exterior Lighting Fixtures'},
      {id: 'bulbs-tubes', name: 'Light Bulbs & Tubes'},
      {id: 'smart-lighting', name: 'Smart Lighting Systems'},
      {id: 'junction-boxes', name: 'Junction Boxes & Enclosures'},
      {id: 'electrical-tape', name: 'Electrical Tape & Accessories'},
      {id: 'doorbells-chimes', name: 'Doorbells & Chimes'},
      {id: 'generators', name: 'Generators & Power Supplies'}
    ];

    subcategories['paints'] = [
      {id: 'interior-paints', name: 'Interior Paints'},
      {id: 'exterior-paints', name: 'Exterior Paints'},
      {id: 'primers-undercoats', name: 'Primers & Undercoats'},
      {id: 'stains-varnishes', name: 'Stains & Varnishes'},
      {id: 'brushes-rollers', name: 'Paint Brushes & Rollers'},
      {id: 'paint-sprayers', name: 'Paint Sprayers & Accessories'},
      {id: 'surface-preparation', name: 'Surface Preparation Tools'},
      {id: 'wallpaper-adhesives', name: 'Wallpaper & Adhesives'},
      {id: 'texturing-materials', name: 'Texturing Materials'},
      {id: 'decorative-finishes', name: 'Decorative Finishes'},
      {id: 'paint-removers', name: 'Paint Removers & Strippers'},
      {id: 'protective-coatings', name: 'Protective Coatings'}
    ];

    subcategories['doors-windows'] = [
      {id: 'interior-doors', name: 'Interior Doors'},
      {id: 'exterior-doors', name: 'Exterior Doors'},
      {id: 'door-frames', name: 'Door Frames & Jambs'},
      {id: 'door-hardware', name: 'Door Hardware & Handles'},
      {id: 'windows', name: 'Windows (Various Types)'},
      {id: 'window-frames', name: 'Window Frames'},
      {id: 'window-hardware', name: 'Window Hardware'},
      {id: 'glass-glazing', name: 'Glass & Glazing Supplies'},
      {id: 'patio-doors', name: 'Patio & Sliding Doors'},
      {id: 'garage-doors', name: 'Garage Doors & Openers'},
      {id: 'door-closers', name: 'Door Closers & Controls'},
      {id: 'weather-stripping', name: 'Weather Stripping & Seals'}
    ];

    subcategories['furniture-fittings'] = [
      {id: 'cabinet-hinges', name: 'Cabinet Hinges'},
      {id: 'drawer-slides', name: 'Drawer Slides & Runners'},
      {id: 'handles-knobs', name: 'Handles & Knobs'},
      {id: 'locks-catches', name: 'Locks & Catches'},
      {id: 'shelf-supports', name: 'Shelf Supports & Brackets'},
      {id: 'furniture-legs', name: 'Furniture Legs & Feet'},
      {id: 'chair-table-hardware', name: 'Chair & Table Hardware'},
      {id: 'decorative-hardware', name: 'Decorative Hardware'},
      {id: 'furniture-protection', name: 'Furniture Protection'},
      {id: 'assembly-hardware', name: 'Assembly Hardware'},
      {id: 'specialty-cabinet', name: 'Specialty Cabinet Hardware'},
      {id: 'cabinet-organization', name: 'Cabinet Organization Systems'}
    ];

    subcategories['garden'] = [
      {id: 'garden-tools', name: 'Garden Tools'},
      {id: 'landscaping-materials', name: 'Landscaping Materials'},
      {id: 'outdoor-furniture', name: 'Outdoor Furniture'},
      {id: 'garden-irrigation', name: 'Garden Irrigation'},
      {id: 'plant-containers', name: 'Plant Pots & Containers'},
      {id: 'outdoor-decking', name: 'Outdoor Decking'},
      {id: 'fencing-gates', name: 'Fencing & Gates'},
      {id: 'pest-control', name: 'Pest Control'},
      {id: 'soil-amendments', name: 'Soil & Amendments'},
      {id: 'outdoor-lighting', name: 'Outdoor Lighting'},
      {id: 'garden-structures', name: 'Garden Structures & Arches'},
      {id: 'lawn-maintenance', name: 'Lawn Maintenance Equipment'}
    ];

    subcategories['hvac'] = [
      {id: 'heating-systems', name: 'Heating Systems & Radiators'},
      {id: 'air-conditioning', name: 'Air Conditioning Units'},
      {id: 'ventilation-fans', name: 'Ventilation Fans & Ducts'},
      {id: 'hvac-controls', name: 'HVAC Controls & Thermostats'},
      {id: 'air-filters', name: 'Air Filters & Purifiers'},
      {id: 'ductwork-fittings', name: 'Ductwork & Fittings'},
      {id: 'heat-pumps', name: 'Heat Pumps'},
      {id: 'dehumidifiers', name: 'Dehumidifiers & Humidifiers'},
      {id: 'chimneys-flues', name: 'Chimneys & Flues'},
      {id: 'boilers', name: 'Boilers & Water Heaters'},
      {id: 'underfloor-heating', name: 'Underfloor Heating'},
      {id: 'insulation-materials', name: 'Insulation Materials'}
    ];

    subcategories['safety'] = [
      {id: 'door-window-security', name: 'Door & Window Security'},
      {id: 'locks-padlocks', name: 'Locks & Padlocks'},
      {id: 'safes-storage', name: 'Safes & Secure Storage'},
      {id: 'security-cameras', name: 'Security Cameras & Systems'},
      {id: 'fire-extinguishers', name: 'Fire Extinguishers & Blankets'},
      {id: 'smoke-detectors', name: 'Smoke & Carbon Monoxide Detectors'},
      {id: 'first-aid', name: 'First Aid Supplies'},
      {id: 'ppe', name: 'Personal Protective Equipment'},
      {id: 'safety-signs', name: 'Safety Signs & Labels'},
      {id: 'access-control', name: 'Access Control Systems'},
      {id: 'alarm-systems', name: 'Alarm Systems'},
      {id: 'fall-protection', name: 'Fall Protection Equipment'}
    ];

    subcategories['cleaning'] = [
      {id: 'cleaning-chemicals', name: 'Cleaning Chemicals'},
      {id: 'cleaning-tools', name: 'Cleaning Tools & Equipment'},
      {id: 'waste-disposal', name: 'Waste Disposal'},
      {id: 'janitorial-supplies', name: 'Janitorial Supplies'},
      {id: 'maintenance-products', name: 'Maintenance Products'},
      {id: 'pest-control', name: 'Pest Control'},
      {id: 'specialty-cleaners', name: 'Specialty Cleaners'},
      {id: 'air-fresheners', name: 'Air Fresheners'},
      {id: 'drain-maintenance', name: 'Drain Maintenance'},
      {id: 'floor-care', name: 'Floor Care Products'},
      {id: 'disinfectants', name: 'Disinfectants & Sanitizers'},
      {id: 'cleaning-storage', name: 'Storage Solutions for Cleaning Supplies'}
    ];

    subcategories['automotive'] = [
      {id: 'auto-hand-tools', name: 'Hand Tools (Automotive)'},
      {id: 'diagnostic-equipment', name: 'Diagnostic Equipment'},
      {id: 'car-care', name: 'Car Care & Detailing'},
      {id: 'oils-fluids', name: 'Oils & Fluids'},
      {id: 'auto-fasteners', name: 'Automotive Fasteners'},
      {id: 'battery-electrical', name: 'Battery & Electrical'},
      {id: 'tire-accessories', name: 'Tire & Wheel Accessories'},
      {id: 'interior-accessories', name: 'Interior Accessories'},
      {id: 'exterior-accessories', name: 'Exterior Accessories'},
      {id: 'garage-organization', name: 'Garage Organization'},
      {id: 'trailer-parts', name: 'Trailer Parts & Accessories'},
      {id: 'workshop-equipment', name: 'Workshop Equipment'}
    ];

    subcategories['adhesives'] = [
      {id: 'construction-adhesives', name: 'Construction Adhesives'},
      {id: 'wood-glues', name: 'Wood Glues'},
      {id: 'epoxies-resins', name: 'Epoxies & Resins'},
      {id: 'caulks-sealants', name: 'Caulks & Sealants'},
      {id: 'silicones', name: 'Silicones'},
      {id: 'mastics', name: 'Mastics & Construction Chemicals'},
      {id: 'concrete-additives', name: 'Concrete Additives'},
      {id: 'lubricants-greases', name: 'Lubricants & Greases'},
      {id: 'cleaners-solvents', name: 'Cleaners & Solvents'},
      {id: 'bonding-agents', name: 'Specialty Bonding Agents'},
      {id: 'tapes', name: 'Tapes (Duct, Masking, etc.)'},
      {id: 'waterproofing', name: 'Waterproofing Compounds'}
    ];

    subcategories['glass'] = [
      {id: 'sheet-glass', name: 'Sheet Glass'},
      {id: 'tempered-glass', name: 'Tempered & Safety Glass'},
      {id: 'acrylic-sheets', name: 'Acrylic Sheets'},
      {id: 'polycarbonate', name: 'Polycarbonate Panels'},
      {id: 'mirrors', name: 'Mirrors & Mirror Accessories'},
      {id: 'glass-cutting', name: 'Glass Cutting Tools'},
      {id: 'glass-installation', name: 'Glass Installation Supplies'},
      {id: 'decorative-glass', name: 'Decorative Glass'},
      {id: 'glass-blocks', name: 'Glass Blocks'},
      {id: 'glass-shelving', name: 'Glass Shelving'},
      {id: 'glass-protection', name: 'Glass Protection Products'},
      {id: 'glass-repair', name: 'Glass Repair Kits'}
    ];

    subcategories['interior-fixtures'] = [
      {id: 'window-blinds', name: 'Window Blinds'},
      {id: 'curtains-drapes', name: 'Curtains & Drapes'},
      {id: 'curtain-rods', name: 'Curtain Rods & Hardware'},
      {id: 'shades-shutters', name: 'Shades & Shutters'},
      {id: 'window-films', name: 'Window Films & Tints'},
      {id: 'interior-trim', name: 'Interior Trim & Molding'},
      {id: 'wall-panels', name: 'Interior Wall Panels'},
      {id: 'ceiling-tiles', name: 'Ceiling Tiles & Grid Systems'},
      {id: 'decorative-elements', name: 'Decorative Interior Elements'},
      {id: 'room-dividers', name: 'Room Dividers & Screens'},
      {id: 'track-systems', name: 'Track Systems'},
      {id: 'installation-tools', name: 'Installation Tools & Accessories'}
    ];

    subcategories['storage'] = [
      {id: 'storage-containers', name: 'Storage Containers & Bins'},
      {id: 'shelving-units', name: 'Shelving Units'},
      {id: 'tool-storage', name: 'Tool Storage & Organization'},
      {id: 'garage-organization', name: 'Garage Organization Systems'},
      {id: 'moving-supplies', name: 'Moving Supplies'},
      {id: 'packaging-materials', name: 'Packaging Materials'},
      {id: 'closet-organization', name: 'Closet Organization'},
      {id: 'workshop-storage', name: 'Workshop Storage'},
      {id: 'storage-cabinets', name: 'Storage Cabinets'},
      {id: 'utility-carts', name: 'Utility Carts & Dollies'},
      {id: 'storage-hooks', name: 'Storage Hooks & Hangers'},
      {id: 'labels-marking', name: 'Labels & Marking Systems'}
    ];

    subcategories['industrial'] = [
      {id: 'pneumatic-components', name: 'Pneumatic Components'},
      {id: 'hydraulic-supplies', name: 'Hydraulic Supplies'},
      {id: 'material-handling', name: 'Material Handling Equipment'},
      {id: 'industrial-hardware', name: 'Industrial Hardware'},
      {id: 'industrial-adhesives', name: 'Industrial Adhesives & Sealants'},
      {id: 'industrial-lubricants', name: 'Industrial Lubricants'},
      {id: 'workwear-safety', name: 'Workwear & Safety Gear'},
      {id: 'industrial-measuring', name: 'Industrial Measuring Tools'},
      {id: 'machining-accessories', name: 'Machining Accessories'},
      {id: 'industrial-chemicals', name: 'Industrial Chemicals'},
      {id: 'welding-supplies', name: 'Welding Supplies'},
      {id: 'workshop-machinery', name: 'Workshop Machinery'}
    ];

    subcategories['miscellaneous'] = [
      {id: 'specialty-hardware', name: 'Specialty Hardware'},
      {id: 'seasonal-products', name: 'Seasonal Products'},
      {id: 'project-kits', name: 'Project Kits'},
      {id: 'custom-cut', name: 'Custom Cut Services'},
      {id: 'rental-equipment', name: 'Rental Equipment'},
      {id: 'installation-services', name: 'Installation Services'},
      {id: 'technical-manuals', name: 'Technical Manuals & Guides'},
      {id: 'discontinued-items', name: 'Discontinued Items'},
      {id: 'clearance', name: 'Clearance & Overstock'},
      {id: 'new-arrivals', name: 'New Arrivals'},
      {id: 'refurbished', name: 'Customer Returns (Refurbished)'},
      {id: 'gift-cards', name: 'Gift Cards & Certificates'}
    ];

    // Insert subcategories
    for (const categoryId in subcategories) {
      for (const subcategory of subcategories[categoryId]) {
        // Check if subcategory exists
        const subcategoryExists = await executeQuery(
          'SELECT COUNT(*) as count FROM product_subcategories WHERE id = ?',
          [subcategory.id]
        );
        
        if (subcategoryExists[0].count === 0) {
          await executeQuery(
            'INSERT INTO product_subcategories (id, name, category_id) VALUES (?, ?, ?)',
            [subcategory.id, subcategory.name, categoryId]
          );
          console.log(`Added subcategory: ${subcategory.name} to ${categoryId}`);
        } else {
          console.log(`Subcategory already exists: ${subcategory.name}`);
        }
      }
    }

    console.log('✅ Categories and subcategories have been populated!');
  } catch (error) {
    console.error('Error in migration:', error);
    throw error;
  }
}

// Export the migration function
module.exports = {
  populateCategoriesSubcategories
}; 