require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Product = require('./models/Product');
const User = require('./models/User');

const SHIPPING_RETURNS_MODAL = `We ship worldwide via international express DHL.<br><br>Delivery costs are calculated at checkout depending on location.<br><br>You can return your order within 28 days and be refunded within 14 days of receipt if the product is in its original condition and packaging.<br><br>Please note - bespoke or custom garments may not be eligible for return.<br><br><a href='/return-policy' style='color: #d4a74f; text-decoration: underline;'>Read our shipping & returns policy</a>`;

const SHIPPING_RETURNS_BODY = `We ship worldwide via international express DHL. Delivery costs are calculated at checkout depending on location. You can return your order within 28 days and be refunded within 14 days of receipt if the product is in its original condition and packaging.`;

const products = [
  {
    slug: 'trolly-bag',
    title: 'Rigid Transit 20',
    description: 'Compact transit unit.\nStructured shell.\nDesigned to carry and attach.',
    price: 38500,
    category: 'Travel Case',
    coverImage: '/asset/images/products/cover-products/trolly-bag.jpg',
    images: [
      '/asset/images/products/trolly-bag-small/trolly-bag-1.jpeg',
      '/asset/images/products/trolly-bag-small/trolly-bag-2.jpeg',
      '/asset/images/products/trolly-bag-small/trolly-bag-3.jpg',
      '/asset/images/products/trolly-bag-small/trolly-bag-4.jpg',
    ],
    specs: [
      { key: 'DIMENSIONS', value: 'Rigid Transit 20: 20 x 8.8 x 14.2 in (H × W × D)', modalContent: 'Rigid Transit 20  20 x 8.8 x 14.2 in (H × W × D).<br>Rigid Transit 27  27 × 17 × 13 in (H × W × D)' },
      { key: 'MAKER', value: 'URNIETA', modalContent: 'URNIETA' },
      { key: 'CONSTRUCTION', value: 'Polycarbonate outer shell. Aluminum-magnesium structural frame. Reinforced textile attachment panels.', modalContent: 'Polycarbonate outer shell.<br>Aluminum-magnesium structural frame.<br>Reinforced textile attachment panels.' },
      { key: 'FORM', value: '20″ rigid body. Balanced vertical structure. Expandable internal layout.', modalContent: '20″ rigid body.<br>Balanced vertical structure.<br>Expandable internal layout.' },
      { key: 'FUNCTION', value: 'TSA-approved locking system. 360° spinner wheels. Telescopic aluminum handle. Expandable internal packing system. URNIETA modular attachment panel.', modalContent: 'TSA-approved locking system.<br>360° spinner wheels.<br>Telescopic aluminum handle.<br>Expandable internal packing system.<br>URNIETA modular attachment panel.' },
      { key: 'USE', value: 'Carry-on travel. Urban transit. Extended movement.', modalContent: 'Carry-on travel. Urban transit. Extended movement.' },
      { key: 'COMPATIBLE ATTACHMENTS', value: 'Structure Sling. Core Pack. Utility Flask. Weather Module. Field Frame.', modalContent: 'Structure Sling. Core Pack. Utility Flask. Weather Module. Field Frame.' },
      { key: 'SHIPPING & RETURNS', value: SHIPPING_RETURNS_BODY, modalContent: SHIPPING_RETURNS_MODAL },
    ],
    keyElements: [
      { tag: 'Feature 01', title: 'URNIETA Modular Attachment System', description: 'Integrated attachment panel on the exterior enables the Structure Sling, Utility Flask, Field Frame, and Weather Module to mount directly onto the case.', images: ['/asset/images/key-elements/trolly-bag/card1/k1.jpg', '/asset/images/key-elements/trolly-bag/card1/k2.jpg'] },
      { tag: 'Feature 02', title: 'TSA-Approved Locking System', description: 'Built-in TSA lock allows security screening without damage. Accepts standard TSA master keys used globally.', images: ['/asset/images/key-elements/trolly-bag/card2/k1.jpg'] },
      { tag: 'Feature 03', title: '360° Spinner Wheels', description: 'Four multi-directional wheels distribute weight and allow full-rotation movement across all surface types.', images: ['/asset/images/key-elements/trolly-bag/card3/k1.jpg', '/asset/images/key-elements/trolly-bag/card3/k2.jpg'] },
      { tag: 'Feature 04', title: 'Expandable Internal Layout', description: 'Internal packing system with compression straps and expandable divider configuration for structured load management.', images: ['/asset/images/key-elements/trolly-bag/card4/k1.jpg'] },
    ],
  },
  {
    slug: 'trolly-bag-pro',
    title: 'Rigid Transit 27',
    description: 'Expanded transit unit.\nFull-trip structure.\nBuilt for longer movement.',
    price: 45000,
    category: 'Travel Case',
    coverImage: '/asset/images/products/cover-products/trolly-bag-pro.jpg',
    images: [
      '/asset/images/products/trolly-bag-big/trolly-bag-1.jpeg',
      '/asset/images/products/trolly-bag-big/trolly-bag-2.jpeg',
      '/asset/images/products/trolly-bag-big/trolly-bag-3.jpg',
      '/asset/images/products/trolly-bag-big/trolly-bag-4.jpg',
    ],
    specs: [
      { key: 'DIMENSIONS', value: 'Rigid Transit 27: 27 × 17 × 13 in (H × W × D)', modalContent: 'Rigid Transit 27  27 × 17 × 13 in (H × W × D).' },
      { key: 'MAKER', value: 'URNIETA', modalContent: 'URNIETA' },
      { key: 'CONSTRUCTION', value: 'Polycarbonate outer shell. Aluminum-magnesium structural frame. Reinforced textile attachment panels.', modalContent: 'Polycarbonate outer shell.<br>Aluminum-magnesium structural frame.<br>Reinforced textile attachment panels.' },
      { key: 'FORM', value: '27″ rigid body. Balanced vertical structure. Expandable internal layout.', modalContent: '27″ rigid body.<br>Balanced vertical structure.<br>Expandable internal layout.' },
      { key: 'FUNCTION', value: 'TSA-approved locking system. 360° spinner wheels. Telescopic aluminum handle. URNIETA modular attachment panel.', modalContent: 'TSA-approved locking system.<br>360° spinner wheels.<br>Telescopic aluminum handle.<br>URNIETA modular attachment panel.' },
      { key: 'USE', value: 'Extended travel. Checked baggage. Long-form transit.', modalContent: 'Extended travel. Checked baggage. Long-form transit.' },
      { key: 'SHIPPING & RETURNS', value: SHIPPING_RETURNS_BODY, modalContent: SHIPPING_RETURNS_MODAL },
    ],
    keyElements: [
      { tag: 'Feature 01', title: 'URNIETA Modular Attachment System', description: 'Full-size exterior attachment panel for mounting Nofoal system accessories during transit.', images: ['/asset/images/key-elements/trolly-bag-pro/card1/k1.jpg'] },
      { tag: 'Feature 02', title: 'Expanded Internal Volume', description: '27-inch body with full-trip capacity. Expandable compression layout for extended journeys.', images: ['/asset/images/key-elements/trolly-bag-pro/card2/k1.jpg'] },
      { tag: 'Feature 03', title: '360° Spinner Mobility', description: 'Four-wheel spinner system for effortless directional movement across terminal and transit surfaces.', images: ['/asset/images/key-elements/trolly-bag-pro/card3/k1.jpg'] },
    ],
  },
  {
    slug: 'water-bottle-s',
    title: 'Utility Flask 560',
    description: 'Compact hydration unit.\nDesigned for attach and carry.',
    price: 10500,
    category: 'Hydration',
    coverImage: '/asset/images/products/cover-products/bottle-s.jpeg',
    images: [
      '/asset/images/products/water-bottle-small/water-bottle-1.jpg',
      '/asset/images/products/water-bottle-small/water-bottle-2.jpg',
      '/asset/images/products/water-bottle-small/water-bottle-3.jpg',
    ],
    specs: [
      { key: 'MAKER', value: 'URNIETA', modalContent: 'URNIETA' },
      { key: 'CONSTRUCTION', value: 'Grade 316 stainless steel. Double-wall vacuum insulation. Hypalon attachment collar.', modalContent: 'Grade 316 stainless steel.<br>Double-wall vacuum insulation.<br>Hypalon attachment collar.' },
      { key: 'FORM', value: '560ml / 18.9 oz capacity. 70mm diameter body. 245mm height.', modalContent: '560ml / 18.9 oz capacity.<br>70mm diameter body.<br>245mm height.' },
      { key: 'FUNCTION', value: 'Twist-lock lid. URNIETA attachment collar for system mounting. Maintains temperature 12hr hot / 24hr cold.', modalContent: 'Twist-lock lid.<br>URNIETA attachment collar for system mounting.<br>Maintains temperature 12hr hot / 24hr cold.' },
      { key: 'USE', value: 'Daily carry. System attachment. Outdoor use.', modalContent: 'Daily carry. System attachment. Outdoor use.' },
      { key: 'SHIPPING & RETURNS', value: SHIPPING_RETURNS_BODY, modalContent: SHIPPING_RETURNS_MODAL },
    ],
    keyElements: [
      { tag: 'Feature 01', title: 'URNIETA Attachment Collar', description: 'Hypalon collar system allows the flask to mount directly to the Structure Sling, Core Pack, or Rigid Transit exterior panels.', images: ['/asset/images/key-elements/water-bottle-small/card1/k1.jpg', '/asset/images/key-elements/water-bottle-small/card1/k2.jpg'] },
      { tag: 'Feature 02', title: 'Double-Wall Vacuum Insulation', description: 'Grade 316 stainless steel with vacuum insulation maintains temperature for extended periods in all environments.', images: ['/asset/images/key-elements/water-bottle-small/card2/k1.jpg'] },
      { tag: 'Feature 03', title: 'Compact 560ml Form', description: 'Sized for daily carry and system integration without adding unnecessary bulk to your configuration.', images: ['/asset/images/key-elements/water-bottle-small/card3/k1.jpg'] },
    ],
  },
  {
    slug: 'water-bottle-b',
    title: 'Utility Flask 1500',
    description: 'Extended capacity hydration.\nBuilt for full-day field use.',
    price: 20000,
    category: 'Hydration',
    coverImage: '/asset/images/products/cover-products/bottle-b.jpeg',
    images: [
      '/asset/images/products/water-bottle-big/water-bottle-1.jpg',
      '/asset/images/products/water-bottle-big/water-bottle-2.jpg',
      '/asset/images/products/water-bottle-big/water-bottle-3.jpg',
    ],
    specs: [
      { key: 'MAKER', value: 'URNIETA', modalContent: 'URNIETA' },
      { key: 'CONSTRUCTION', value: 'Grade 316 stainless steel. Double-wall vacuum insulation. Reinforced carry handle.', modalContent: 'Grade 316 stainless steel.<br>Double-wall vacuum insulation.<br>Reinforced carry handle.' },
      { key: 'FORM', value: '1500ml / 50.7 oz capacity. Extended body format. Dual-access lid system.', modalContent: '1500ml / 50.7 oz capacity.<br>Extended body format.<br>Dual-access lid system.' },
      { key: 'FUNCTION', value: 'Dual-access lid. Reinforced stainless carry handle. URNIETA attachment compatible. 18hr hot / 36hr cold performance.', modalContent: 'Dual-access lid.<br>Reinforced stainless carry handle.<br>URNIETA attachment compatible.<br>18hr hot / 36hr cold performance.' },
      { key: 'USE', value: 'Field operations. Full-day outdoor use. Extended travel.', modalContent: 'Field operations. Full-day outdoor use. Extended travel.' },
      { key: 'SHIPPING & RETURNS', value: SHIPPING_RETURNS_BODY, modalContent: SHIPPING_RETURNS_MODAL },
    ],
    keyElements: [
      { tag: 'Feature 01', title: '1500ml Extended Capacity', description: 'Full-day hydration in a single unit. Designed for field use, extended outdoor movement, and high-output activity.', images: ['/asset/images/key-elements/water-bottle-big/card1/k1.jpg'] },
      { tag: 'Feature 02', title: 'Dual-Access Lid System', description: 'Wide-mouth and flow-access lid configuration allows direct pour and controlled sip from the same unit.', images: ['/asset/images/key-elements/water-bottle-big/card2/k1.jpg'] },
      { tag: 'Feature 03', title: 'Reinforced Carry Handle', description: 'Integrated stainless handle rated for single-hand transport with full load.', images: ['/asset/images/key-elements/water-bottle-big/card3/k1.jpg'] },
    ],
  },
  {
    slug: 'umbrella',
    title: 'Weather Module',
    description: 'Compact weather protection.\nBuilt to attach and deploy.',
    price: 6000,
    category: 'Weather',
    coverImage: '/asset/images/products/cover-products/umbrella.jpeg',
    images: [
      '/asset/images/products/umbrella/umbrella-1.jpg',
      '/asset/images/products/umbrella/umbrella-2.jpg',
      '/asset/images/products/umbrella/umbrella-3.jpg',
    ],
    specs: [
      { key: 'MAKER', value: 'URNIETA', modalContent: 'URNIETA' },
      { key: 'CONSTRUCTION', value: 'Carbon fiber frame. Ripstop nylon canopy. Hypalon attachment clip.', modalContent: 'Carbon fiber frame.<br>Ripstop nylon canopy.<br>Hypalon attachment clip.' },
      { key: 'FORM', value: 'Compact collapsed form. 98cm canopy diameter when open. Auto-open mechanism.', modalContent: 'Compact collapsed form.<br>98cm canopy diameter when open.<br>Auto-open mechanism.' },
      { key: 'FUNCTION', value: 'Auto-open / auto-close. URNIETA clip for system attachment. Wind-resistant up to 60km/h. UV protection UPF 50+.', modalContent: 'Auto-open / auto-close.<br>URNIETA clip for system attachment.<br>Wind-resistant up to 60km/h.<br>UV protection UPF 50+.' },
      { key: 'USE', value: 'Urban movement. Travel. System integration.', modalContent: 'Urban movement. Travel. System integration.' },
      { key: 'SHIPPING & RETURNS', value: SHIPPING_RETURNS_BODY, modalContent: SHIPPING_RETURNS_MODAL },
    ],
    keyElements: [
      { tag: 'Feature 01', title: 'URNIETA System Clip', description: 'Hypalon clip mounts the Weather Module to any URNIETA attachment point — sling, pack, or case exterior.', images: ['/asset/images/key-elements/umbrella/card1/k1.jpg'] },
      { tag: 'Feature 02', title: 'Carbon Fiber Frame', description: 'Lightweight carbon structure resists wind deformation without adding weight to your carry configuration.', images: ['/asset/images/key-elements/umbrella/card2/k1.jpg'] },
      { tag: 'Feature 03', title: 'Auto-Open / Auto-Close', description: 'Single-button operation for immediate deployment and collapse without interrupting movement.', images: ['/asset/images/key-elements/umbrella/card3/k1.jpg'] },
    ],
  },
  {
    slug: 'sunglass',
    title: 'Field Frame',
    description: 'Optical protection for active use.\nBuilt to integrate with the system.',
    price: 19500,
    category: 'Eyewear',
    coverImage: '/asset/images/products/cover-products/sunglass.jpeg',
    images: [
      '/asset/images/products/sunglasses/sunglasses-1.jpg',
      '/asset/images/products/sunglasses/sunglasses-2.jpg',
      '/asset/images/products/sunglasses/sunglasses-3.jpg',
    ],
    specs: [
      { key: 'MAKER', value: 'URNIETA', modalContent: 'URNIETA' },
      { key: 'CONSTRUCTION', value: 'TR-90 flexible frame. Polarized polycarbonate lens. Hypalon temple attachment points.', modalContent: 'TR-90 flexible frame.<br>Polarized polycarbonate lens.<br>Hypalon temple attachment points.' },
      { key: 'FORM', value: 'Wraparound profile. Interchangeable lens system. Lightweight 28g frame.', modalContent: 'Wraparound profile.<br>Interchangeable lens system.<br>Lightweight 28g frame.' },
      { key: 'FUNCTION', value: 'Polarized UV400 protection. URNIETA mount compatible. Impact-resistant lens. Sweat-resistant coating.', modalContent: 'Polarized UV400 protection.<br>URNIETA mount compatible.<br>Impact-resistant lens.<br>Sweat-resistant coating.' },
      { key: 'USE', value: 'Field use. Urban movement. Active carry.', modalContent: 'Field use. Urban movement. Active carry.' },
      { key: 'SHIPPING & RETURNS', value: SHIPPING_RETURNS_BODY, modalContent: SHIPPING_RETURNS_MODAL },
    ],
    keyElements: [
      { tag: 'Feature 01', title: 'URNIETA Mount Compatibility', description: 'Temple attachment points allow the Field Frame to clip directly onto the Structure Sling or Core Pack for hands-free carry.', images: ['/asset/images/key-elements/sunglasses/card1/k1.jpg', '/asset/images/key-elements/sunglasses/card1/k2.jpg'] },
      { tag: 'Feature 02', title: 'Polarized UV400 Lens', description: 'Polycarbonate polarized lens blocks 100% UV and eliminates surface glare for clear visual performance in all light conditions.', images: ['/asset/images/key-elements/sunglasses/card2/k1.jpg'] },
      { tag: 'Feature 03', title: 'TR-90 Flexible Frame', description: '28g wraparound TR-90 frame with sweat resistance and impact rating for active, outdoor, and transit use.', images: ['/asset/images/key-elements/sunglasses/card3/k1.jpg'] },
    ],
  },
  {
    slug: 'side-bag',
    title: 'Structure Sling',
    description: 'Compact structure.\nDesigned to move without excess.',
    price: 10000,
    category: 'Bag',
    coverImage: '/asset/images/products/cover-products/side-bag.jpg',
    images: [
      '/asset/images/products/side-bag/side-bag-1.jpg',
      '/asset/images/products/side-bag/side-bag-2.jpg',
      '/asset/images/products/side-bag/side-bag-3.jpg',
      '/asset/images/products/side-bag/side-bag-4.jpg',
    ],
    specs: [
      { key: 'MAKER', value: 'URNIETA', modalContent: 'URNIETA' },
      { key: 'CONSTRUCTION', value: '900D reinforced textile. X-PAC structural panels. Hypalon and coated nylon components.', modalContent: '900D reinforced textile.<br>X-PAC structural panels.<br>Hypalon and coated nylon components.' },
      { key: 'FORM', value: '320mm × 170mm × 60mm frame. Compact horizontal profile. Dual carry configuration.', modalContent: '320mm × 170mm × 60mm frame.<br>Compact horizontal profile.<br>Dual carry configuration.' },
      { key: 'FUNCTION', value: 'Adjustable crossbody strap. Top carry handle. Expandable compartment system. Water-resistant zipper construction. Reinforced exterior hardware.', modalContent: 'Adjustable crossbody strap.<br>Top carry handle.<br>Expandable compartment system.<br>Water-resistant zipper construction.<br>Reinforced exterior hardware.' },
      { key: 'USE', value: 'Urban movement. Off-road travel. Daily carry.', modalContent: 'Urban movement. Off-road travel. Daily carry.' },
      { key: 'SHIPPING & RETURNS', value: SHIPPING_RETURNS_BODY, modalContent: SHIPPING_RETURNS_MODAL },
    ],
    keyElements: [
      { tag: 'Feature 01', title: 'URNIETA System Compatibility', description: 'Allows sunglasses, utility flask 560, field module to be securely attached to the sling for quick access during movement.', images: ['/asset/images/key-elements/side-bag/card1/k1.jpg', '/asset/images/key-elements/side-bag/card1/k2.jpg', '/asset/images/key-elements/side-bag/card1/k3.jpeg'] },
      { tag: 'Feature 02', title: 'Dual Carry Configuration', description: 'Equipped with an adjustable crossbody strap and top carry handle, allowing flexible carry depending on movement and use.', images: ['/asset/images/key-elements/side-bag/card2/k1.jpg', '/asset/images/key-elements/side-bag/card2/k2.jpg'] },
      { tag: 'Feature 03', title: 'Expandable Storage System', description: 'Integrated expandable compartment system adapts to different carry needs without compromising the compact structure.', images: ['/asset/images/key-elements/side-bag/card3/k1.jpg', '/asset/images/key-elements/side-bag/card3/k2.jpeg'] },
      { tag: 'Feature 04', title: 'Water-Resistant Construction', description: 'Features water-resistant zippers and reinforced exterior hardware to protect contents during everyday movement and changing environments.', images: ['/asset/images/key-elements/side-bag/card4/k1.jpeg'] },
    ],
  },
  {
    slug: 'bag-pack',
    title: 'Core Pack',
    description: 'Primary carry system. Structured for load.\nDesigned to expand through attachment.',
    price: 25000,
    category: 'Backpack',
    coverImage: '/asset/images/products/cover-products/bag-pack.jpg',
    images: [
      '/asset/images/products/bag-pack/bag-pack-1.jpg',
      '/asset/images/products/bag-pack/bag-pack-2.jpg',
      '/asset/images/products/bag-pack/bag-pack-3.jpg',
      '/asset/images/products/bag-pack/bag-pack-4.jpg',
    ],
    specs: [
      { key: 'MAKER', value: 'URNIETA', modalContent: 'URNIETA' },
      { key: 'CONSTRUCTION', value: '900D reinforced textile. X-PAC structural panels. Hypalon and coated nylon components. Reinforced load-bearing hardware.', modalContent: '900D reinforced textile.<br>X-PAC structural panels.<br>Hypalon and coated nylon components.<br>Reinforced load-bearing hardware.' },
      { key: 'FORM', value: '320 × 430 × 150 mm. Structured vertical profile. Approx. 35L capacity. Five internal compartments.', modalContent: '320 × 430 × 150 mm.<br>Structured vertical profile.<br>Approx. 35L capacity.<br>Five internal compartments.' },
      { key: 'FUNCTION', value: 'Reinforced shoulder-strap backpack carry. Top grab handle. Water-resistant zipper construction. Designed to carry loads up to 50 lbs. Detachable sections for adaptable storage.', modalContent: 'Reinforced shoulder-strap backpack carry.<br>Top grab handle.<br>Water-resistant zipper construction.<br>Designed to carry loads up to 50 lbs.<br>Detachable sections for adaptable storage.' },
      { key: 'USE', value: 'Extended carry. Daily use. Field operations. Travel.', modalContent: 'Extended carry. Daily use. Field operations. Travel.' },
      { key: 'COMPATIBLE ATTACHMENTS', value: 'Structure Sling. Utility Flask 560. Weather Module. Field Frame. Field Module.', modalContent: 'Structure Sling. Utility Flask 560. Weather Module. Field Frame. Field Module.' },
      { key: 'SHIPPING & RETURNS', value: SHIPPING_RETURNS_BODY, modalContent: SHIPPING_RETURNS_MODAL },
    ],
    keyElements: [
      { tag: 'Feature 01', title: 'URNIETA Attachment System', description: 'Exterior panel system compatible with all URNIETA accessories — mount the Utility Flask, Field Frame, or Weather Module for full system carry.', images: ['/asset/images/key-elements/bag-pack/card1/k1.jpg', '/asset/images/key-elements/bag-pack/card1/k2.jpg'] },
      { tag: 'Feature 02', title: '35L Structured Capacity', description: 'Five-compartment internal layout with compression system. Rated for loads up to 50 lbs on reinforced shoulder straps.', images: ['/asset/images/key-elements/bag-pack/card2/k1.jpg'] },
      { tag: 'Feature 03', title: 'Detachable Section System', description: 'Modular detachment points allow reconfiguration of carry volume depending on mission requirements.', images: ['/asset/images/key-elements/bag-pack/card3/k1.jpg', '/asset/images/key-elements/bag-pack/card3/k2.jpg'] },
      { tag: 'Feature 04', title: 'Water-Resistant Construction', description: 'X-PAC panels and water-resistant zippers protect contents across urban, field, and transit environments.', images: ['/asset/images/key-elements/bag-pack/card4/k1.jpg'] },
    ],
  },
  {
    slug: 'go-pro',
    title: 'Field Case',
    description: 'Modular field documentation unit.\nBuilt for attachment and deployment.',
    price: 9500,
    category: 'Camera',
    coverImage: '/asset/images/products/cover-products/go-pro.jpg',
    images: [
      '/asset/images/products/go-pro/go-pro-1.jpg',
      '/asset/images/products/go-pro/go-pro-2.jpg',
      '/asset/images/products/go-pro/go-pro-3.jpg',
    ],
    specs: [
      { key: 'MAKER', value: 'URNIETA', modalContent: 'URNIETA' },
      { key: 'CONSTRUCTION', value: 'Polycarbonate housing. Impact-resistant inner foam. URNIETA magnetic attachment base.', modalContent: 'Polycarbonate housing.<br>Impact-resistant inner foam.<br>URNIETA magnetic attachment base.' },
      { key: 'FORM', value: 'Compatible with GoPro HERO 9/10/11/12. Compact deployment profile. Universal mount thread.', modalContent: 'Compatible with GoPro HERO 9/10/11/12.<br>Compact deployment profile.<br>Universal mount thread.' },
      { key: 'FUNCTION', value: 'Magnetic URNIETA mount. Universal 1/4"-20 thread. Impact-rated protective housing. Water-resistant seal.', modalContent: 'Magnetic URNIETA mount.<br>Universal 1/4"-20 thread.<br>Impact-rated protective housing.<br>Water-resistant seal.' },
      { key: 'USE', value: 'Field documentation. Action recording. System integration.', modalContent: 'Field documentation. Action recording. System integration.' },
      { key: 'SHIPPING & RETURNS', value: SHIPPING_RETURNS_BODY, modalContent: SHIPPING_RETURNS_MODAL },
    ],
    keyElements: [
      { tag: 'Feature 01', title: 'URNIETA Magnetic Mount', description: 'Magnetic base system mounts the Field Case to any URNIETA attachment point on the Structure Sling, Core Pack, or Rigid Transit.', images: ['/asset/images/key-elements/go-pro/card1/k1.jpg'] },
      { tag: 'Feature 02', title: 'GoPro HERO Compatible', description: 'Precision-fit housing designed for HERO 9, 10, 11, and 12 with direct access to all controls and ports.', images: ['/asset/images/key-elements/go-pro/card2/k1.jpg', '/asset/images/key-elements/go-pro/card2/k2.jpg'] },
      { tag: 'Feature 03', title: 'Impact-Rated Protection', description: 'Polycarbonate shell with impact-absorbing inner foam maintains camera function after drops and field impacts.', images: ['/asset/images/key-elements/go-pro/card3/k1.jpg'] },
    ],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nofoal');
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared products');

    // Insert all products
    const inserted = await Product.insertMany(products);
    console.log(`Seeded ${inserted.length} products`);

    // Create admin user if not exists
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL || 'admin@nofoal.com' });
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: process.env.ADMIN_EMAIL || 'admin@nofoal.com',
        password_hash: process.env.ADMIN_PASSWORD || 'Admin@nofoal123',
        role: 'admin',
        isVerified: true,
      });
      console.log('Admin user created');
    } else {
      console.log('Admin user already exists');
    }

    console.log('Seed complete');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
