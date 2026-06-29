const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Import Models
const User = require('../models/User');
const Medicine = require('../models/Medicine');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Prescription = require('../models/Prescription');
const Reminder = require('../models/Reminder');
const Review = require('../models/Review');

// Import Middlewares & Controllers
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { authSendLimiter, authVerifyLimiter } = require('../middleware/rateLimiter');
const authController = require('../controllers/authController');

// ==========================================
// AUTH ROUTES
// ==========================================
router.post('/auth/send-otp', authSendLimiter, authController.sendOtp);
router.post('/auth/verify-otp', authVerifyLimiter, authController.verifyOtp);
router.post('/auth/google', authController.googleLogin);
router.get('/auth/me', protect, authController.getMe);

// ==========================================
// IN-MEMORY MOCK DATA WAREHOUSE FOR FALLBACK
// ==========================================
let mockMedicines = [
  {
    _id: "med_1",
    name: "Crocin Pain Relief",
    brand: "Haleon",
    salt: "Paracetamol 650mg + Caffeine 50mg",
    category: "Tablets",
    description: "Fast-acting relief from headache, toothache, and musculoskeletal pain.",
    uses: "Relieving fever, headache, body aches, joint pain, and migraine.",
    sideEffects: "Nausea, skin rashes, gastric irritation in rare cases.",
    dosage: "1 tablet every 6 hours as needed. Maximum 4 tablets in 24 hours.",
    storage: "Store in dry place below 30°C. Protect from direct light.",
    price: 27,
    mrp: 30,
    discount: 10,
    rxRequired: false,
    stock: 120,
    image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc1MDAnIGhlaWdodD0nMzAwJz48cmVjdCB3aWR0aD0nMTAwJScgaGVpZ2h0PScxMDAlJyBmaWxsPScjZWVmMmZmJy8+PHRleHQgeD0nNTAlJyB5PSc1MCUnIGRvbWluYW50LWJhc2VsaW5lPSdtaWRkbGUnIHRleHQtYW5jaG9yPSdtaWRkbGUnIGZpbGw9JyMwMDVhY2MnIGZvbnQtZmFtaWx5PSdQb3BwaW5zLCBBcmlhbCwgc2Fucy1zZXJpZicgZm9udC1zaXplPScyOCc+TWVkQ2FyZTwvdGV4dD48L3N2Zz4=",
    rating: 4.6
  },
  {
    _id: "med_2",
    name: "Mox-500 Capsule",
    brand: "Sun Pharma",
    salt: "Amoxicillin 500mg",
    category: "Tablets",
    description: "Broad-spectrum penicillin antibiotic used to treat bacterial infections.",
    uses: "Ear, nose, throat, skin, and urinary tract bacterial infections.",
    sideEffects: "Diarrhea, rash, nausea, vomiting, allergic reactions.",
    dosage: "1 capsule three times daily or as prescribed by a medical doctor.",
    storage: "Store below 25°C in a dry place. Keep out of reach of children.",
    price: 102,
    mrp: 120,
    discount: 15,
    rxRequired: true,
    stock: 8,
    image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc1MDAnIGhlaWdodD0nMzAwJz48cmVjdCB3aWR0aD0nMTAwJScgaGVpZ2h0PScxMDAlJyBmaWxsPScjZWVmMmZmJy8+PHRleHQgeD0nNTAlJyB5PSc1MCUnIGRvbWluYW50LWJhc2VsaW5lPSdtaWRkbGUnIHRleHQtYW5jaG9yPSdtaWRkbGUnIGZpbGw9JyMwMDVhY2MnIGZvbnQtZmFtaWx5PSdQb3BwaW5zLCBBcmlhbCwgc2Fucy1zZXJpZicgZm9udC1zaXplPScyOCc+TWVkQ2FyZTwvdGV4dD48L3N2Zz4=",
    rating: 4.4
  },
  {
    _id: "med_3",
    name: "Lipivas 10",
    brand: "Cipla",
    salt: "Atorvastatin 10mg",
    category: "Tablets",
    description: "Lipid-lowering statin medication used to prevent cardiovascular disease.",
    uses: "Lowers high cholesterol, LDL, triglycerides, and reduces risk of heart attack.",
    sideEffects: "Muscle pain, weakness, headache, increased blood sugar.",
    dosage: "1 tablet daily at night or as directed by a cardiologist.",
    storage: "Store at room temperature away from moisture and heat.",
    price: 83.6,
    mrp: 95,
    discount: 12,
    rxRequired: true,
    stock: 75,
    image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop&q=60",
    rating: 4.8
  },
  {
    _id: "med_4",
    name: "Ibugesic 400",
    brand: "Cipla",
    salt: "Ibuprofen 400mg",
    category: "Tablets",
    description: "Non-steroidal anti-inflammatory drug (NSAID) that reduces pain, fever, and inflammation.",
    uses: "Mild to moderate pain, rheumatoid arthritis, dental pain, fever.",
    sideEffects: "Heartburn, nausea, flatulence, headache, dizziness.",
    dosage: "1 tablet 2-3 times daily after meals, or as directed.",
    storage: "Store in a cool dry place.",
    price: 23.75,
    mrp: 25,
    discount: 5,
    rxRequired: false,
    stock: 200,
    image: "https://images.unsplash.com/photo-1550572017-edd951b55104?w=500&auto=format&fit=crop&q=60",
    rating: 4.2
  },
  {
    _id: "med_5",
    name: "Benadryl Cough Syrup",
    brand: "Kenvue",
    salt: "Diphenhydramine 12.5mg + Ammonium Chloride 125mg",
    category: "Syrups",
    description: "Effective cough relief formulation designed to clear chest congestion and soothe dry cough.",
    uses: "Relieving cough, sore throat, sneezing, runny nose, watery eyes.",
    sideEffects: "Drowsiness, dry mouth, blurred vision, dizziness.",
    dosage: "5-10 ml up to 4 times a day for adults. Do not exceed 40ml in 24 hours.",
    storage: "Keep in a cool place. Shake well before use.",
    price: 126,
    mrp: 140,
    discount: 10,
    rxRequired: false,
    stock: 85,
    image: "https://images.unsplash.com/photo-1550572017-edd951b55104?w=500&auto=format&fit=crop&q=60",
    rating: 4.3
  },
  {
    _id: "med_6",
    name: "Gelusil Liquid MPS",
    brand: "Abbott",
    salt: "Aluminium Hydroxide 250mg + Magnesium Hydroxide 250mg + Simethicone 50mg",
    category: "Syrups",
    description: "Fast-acting antacid gel that neutralizes stomach acid and relieves gas pain.",
    uses: "Acidity, heartburn, gas, indigestion, stomach upset.",
    sideEffects: "Constipation, diarrhea, stomach cramps in high doses.",
    dosage: "2-3 teaspoons (10-15 ml) after meals and at bedtime, or as needed.",
    storage: "Keep cap tightly closed. Store below 25°C.",
    price: 147.2,
    mrp: 160,
    discount: 8,
    rxRequired: false,
    stock: 92,
    image: "https://images.unsplash.com/photo-1550572017-edd951b55104?w=500&auto=format&fit=crop&q=60",
    rating: 4.5
  },
  {
    _id: "med_7",
    name: "Dexorange Syrup",
    brand: "Franco-Indian",
    salt: "Ferric Ammonium Citrate 160mg + Cyanocobalamin 7.5mcg + Folic Acid 0.5mg",
    category: "Syrups",
    description: "Hematinic syrup containing Iron, Vitamin B12, and Folic Acid for blood regeneration.",
    uses: "Treatment of iron-deficiency anemia, pregnancy anemia, and general weakness.",
    sideEffects: "Dark stools, temporary teeth staining, mild constipation.",
    dosage: "1 tablespoon (15 ml) twice daily after meals for adults.",
    storage: "Store in a cool dark place. Shake well before use.",
    price: 154,
    mrp: 175,
    discount: 12,
    rxRequired: false,
    stock: 6,
    image: "https://images.unsplash.com/photo-1550572017-edd951b55104?w=500&auto=format&fit=crop&q=60",
    rating: 4.7
  },
  {
    _id: "med_8",
    name: "Neurobion Forte",
    brand: "Procter & Gamble",
    salt: "Thiamine (B1) 10mg + Riboflavin (B2) 10mg + Pyridoxine (B6) 3mg + Cyanocobalamin (B12) 15mcg",
    category: "Vitamins",
    description: "Essential Vitamin B-Complex tablet designed for strengthening nerves and energy metabolism.",
    uses: "Neuropathy, muscle pain, chronic fatigue, vitamin deficiency.",
    sideEffects: "Excess urination, yellow coloration of urine (harmless Riboflavin effect).",
    dosage: "1 tablet daily or as advised by a physician.",
    storage: "Keep in a cool dry place below 25°C.",
    price: 42.75,
    mrp: 45,
    discount: 5,
    rxRequired: false,
    stock: 350,
    image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500&auto=format&fit=crop&q=60",
    rating: 4.9
  },
  {
    _id: "med_9",
    name: "Limcee Chewable",
    brand: "Abbott",
    salt: "Vitamin C (Ascorbic Acid) 500mg",
    category: "Vitamins",
    description: "Orange-flavored chewable vitamin C supplement that boosts natural immunity and skin health.",
    uses: "Immune support, scurvy, skin regeneration, wound healing, collagen production.",
    sideEffects: "Diarrhea or stomach cramps if consumed in excessive amounts.",
    dosage: "1 tablet daily. Chew fully before swallowing.",
    storage: "Store away from heat and moisture. Keep container sealed.",
    price: 32.2,
    mrp: 35,
    discount: 8,
    rxRequired: false,
    stock: 400,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60",
    rating: 4.6
  },
  {
    _id: "med_10",
    name: "Zincovit Tablet",
    brand: "Apex Labs",
    salt: "Multivitamin + Multimineral + Grape Seed Extract",
    category: "Vitamins",
    description: "Nutritional supplement with high zinc content combined with standard vitamins.",
    uses: "Immune builder, recovery support after infections, fatigue, skin health.",
    sideEffects: "Metallic taste, stomach upset if taken empty stomach.",
    dosage: "1 tablet daily after food.",
    storage: "Store below 30°C in dry place.",
    price: 99,
    mrp: 110,
    discount: 10,
    rxRequired: false,
    stock: 180,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60",
    rating: 4.8
  },
  {
    _id: "med_11",
    name: "Cetaphil Gentle Cleanser",
    brand: "Galderma",
    salt: "Cetyl Alcohol + Stearyl Alcohol",
    category: "Skincare",
    description: "Dermatologically tested gentle face cleanser suitable for sensitive, dry skin.",
    uses: "Skin cleansing, makeup removal, barrier protection, dry skin care.",
    sideEffects: "Extremely rare allergic reactions.",
    dosage: "Apply to skin, rub gently. Rinse off with water, or wipe off with tissue.",
    storage: "Store at room temperature. For external use only.",
    price: 315,
    mrp: 350,
    discount: 10,
    rxRequired: false,
    stock: 45,
    image: "https://images.unsplash.com/photo-1608248597481-496100c80836?w=500&auto=format&fit=crop&q=60",
    rating: 4.7
  },
  {
    _id: "med_12",
    name: "Betadine Ointment",
    brand: "Win-Medicare",
    salt: "Povidone-Iodine 5% w/w",
    category: "Skincare",
    description: "Antiseptic water-soluble ointment used to prevent infections in minor cuts and burns.",
    uses: "Wound antiseptic, minor burn dressings, skin abrasions.",
    sideEffects: "Local skin irritation, redness, scaling.",
    dosage: "Clean the affected area and apply a small layer 1-3 times daily.",
    storage: "Store below 25°C. Do not freeze.",
    price: 109.25,
    mrp: 115,
    discount: 5,
    rxRequired: false,
    stock: 140,
    image: "https://images.unsplash.com/photo-1608248597481-496100c80836?w=500&auto=format&fit=crop&q=60",
    rating: 4.5
  },
  {
    _id: "med_13",
    name: "Vicco Turmeric Cream",
    brand: "Vicco Laboratories",
    salt: "Turmeric Extract 16% + Sandalwood Oil 1.2%",
    category: "Skincare",
    description: "Ayurvedic skin cream with antiseptic turmeric properties for natural healing and radiance.",
    uses: "Pimples, acne, scars, rashes, skin brightening.",
    sideEffects: "None reported. Suitable for all skin types.",
    dosage: "Apply small amount to face and neck twice daily after washing.",
    storage: "Store in a cool dry place.",
    price: 138,
    mrp: 150,
    discount: 8,
    rxRequired: false,
    stock: 80,
    image: "https://images.unsplash.com/photo-1608248597481-496100c80836?w=500&auto=format&fit=crop&q=60",
    rating: 4.3
  },
  {
    _id: "med_14",
    name: "Omron BP Monitor HEM 7120",
    brand: "Omron",
    salt: "Electronic Oscillometric System",
    category: "Devices",
    description: "Fully automatic upper-arm digital blood pressure monitor with Intellisense technology.",
    uses: "Monitoring systolic/diastolic blood pressure and pulse rate at home.",
    sideEffects: "None. Do not base medicine changes solely on self-readings.",
    dosage: "Sit quietly for 5 minutes. Wrap cuff around arm, press Start button.",
    storage: "Store in original protective case. Avoid water exposure.",
    price: 1874.25,
    mrp: 2499,
    discount: 25,
    rxRequired: false,
    stock: 35,
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&auto=format&fit=crop&q=60",
    rating: 4.8
  },
  {
    _id: "med_15",
    name: "Accu-Chek Active Glucometer",
    brand: "Roche Diagnostics",
    salt: "Glucose Dehydrogenase biosensor",
    category: "Devices",
    description: "Reliable home blood sugar testing kit with 10 test strips and lancing device.",
    uses: "Monitoring blood glucose concentration values.",
    sideEffects: "Minor finger pricking discomfort.",
    dosage: "Insert test strip. Prick finger with lancet, apply blood drop to strip.",
    storage: "Keep strips in original dry container. Store meter at room temperature.",
    price: 1279.2,
    mrp: 1599,
    discount: 20,
    rxRequired: false,
    stock: 4,
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&auto=format&fit=crop&q=60",
    rating: 4.6
  },
  {
    _id: "med_16",
    name: "Dr Trust Infrared Thermometer",
    brand: "Dr Trust",
    salt: "Non-contact Infrared Sensor",
    category: "Devices",
    description: "Contactless dual-mode infrared forehead and object temperature reader.",
    uses: "Measuring body heat and baby bottle / bathwater temperatures.",
    sideEffects: "None.",
    dosage: "Hold sensor 2-5cm from forehead, pull trigger, wait 1 second for beep.",
    storage: "Keep clean. Wipe sensor lens with isopropyl alcohol when dirty.",
    price: 1399.3,
    mrp: 1999,
    discount: 30,
    rxRequired: false,
    stock: 50,
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&auto=format&fit=crop&q=60",
    rating: 4.4
  },
  {
    _id: "med_17",
    name: "Himalaya Baby Powder",
    brand: "Himalaya Wellness",
    salt: "Zinc Oxide + Olive Oil + Khus Khus Extract",
    category: "Baby Care",
    description: "Herbal baby powder designed to absorb excess sweat and prevent skin chafing.",
    uses: "Absorbs sweat, prevents body odor, soothes skin, keeps baby dry.",
    sideEffects: "None. Avoid inhaling powder dust.",
    dosage: "Sprinkle onto hand and pat gently onto baby's skin after bathing.",
    storage: "Keep container tightly closed in a cool dry place.",
    price: 162,
    mrp: 180,
    discount: 10,
    rxRequired: false,
    stock: 95,
    image: "https://images.unsplash.com/photo-1515488042361-404e9250afef?w=500&auto=format&fit=crop&q=60",
    rating: 4.6
  },
  {
    _id: "med_18",
    name: "Johnson's Baby Shampoo",
    brand: "Johnson & Johnson",
    salt: "No-more-tears Mild Surfactant Blend",
    category: "Baby Care",
    description: "Gently cleanses baby's soft hair and scalp with a soap-free, ophthalmologist-approved formula.",
    uses: "Baby hair wash, gentle scalp cleansing without eye sting.",
    sideEffects: "None. Rinse with water if styling.",
    dosage: "Wet hair, apply shampoo, lather gently, and rinse with warm water.",
    storage: "Store in normal room conditions.",
    price: 184.8,
    mrp: 210,
    discount: 12,
    rxRequired: false,
    stock: 110,
    image: "https://images.unsplash.com/photo-1515488042361-404e9250afef?w=500&auto=format&fit=crop&q=60",
    rating: 4.5
  },
  {
    _id: "med_19",
    name: "Sterile Gauze Swab 3M",
    brand: "3M India",
    salt: "100% Bleached Cotton Gauze",
    category: "Surgical",
    description: "Individually packed sterilized medical cotton pads for wound dressing and cleansing.",
    uses: "Wound cleaning, absorbing fluids, padding and protecting open skin injuries.",
    sideEffects: "None. Ensure packaging is intact before using.",
    dosage: "Open peel pack aseptically. Apply swab to wound using forceps.",
    storage: "Store in original box. Sterile until package is opened.",
    price: 212.5,
    mrp: 250,
    discount: 15,
    rxRequired: false,
    stock: 14,
    image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500&auto=format&fit=crop&q=60",
    rating: 4.7
  },
  {
    _id: "med_20",
    name: "Micropore Surgical Tape",
    brand: "3M India",
    salt: "Hypoallergenic Paper Adhesive",
    category: "Surgical",
    description: "Breathable skin-friendly surgical paper tape ideal for securing dressings and bandages.",
    uses: "Securing wound pads, bandages, catheters, and medical tubings on skin.",
    sideEffects: "Extremely low risk of skin redness.",
    dosage: "Tear to length, apply gently over dressing, pat down adhesive.",
    storage: "Store at room temperature. Keep away from moisture.",
    price: 81,
    mrp: 90,
    discount: 10,
    rxRequired: false,
    stock: 150,
    image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500&auto=format&fit=crop&q=60",
    rating: 4.5
  },
  {
    _id: "med_21",
    name: "Dabur Chyawanprash",
    brand: "Dabur",
    salt: "Amla + Ashwagandha + Giloy + Pippali + Honey + 40+ Herbs",
    category: "Ayurvedic",
    description: "Authentic double-immunity Ayurvedic booster jam rich in antioxidants and vitamin C.",
    uses: "Strengthens respiratory system, improves digestion, fights illness.",
    sideEffects: "Increase in body heat if taken excessively, caution for diabetics.",
    dosage: "1-2 teaspoons daily with warm milk or directly.",
    storage: "Close cap tightly. Store in a dry place.",
    price: 357,
    mrp: 420,
    discount: 15,
    rxRequired: false,
    stock: 120,
    image: "https://images.unsplash.com/photo-1611079830811-b65d1a601991?w=500&auto=format&fit=crop&q=60",
    rating: 4.8
  },
  {
    _id: "med_22",
    name: "Himalaya Septilin Tablets",
    brand: "Himalaya Wellness",
    salt: "Guggulu + Maharasnadi Quath + Guduchi",
    category: "Ayurvedic",
    description: "Immunomodulatory and anti-inflammatory formulation that builds defense mechanism.",
    uses: "Treats respiratory tract infections, sore throat, sinus problems.",
    sideEffects: "None under standard dosages.",
    dosage: "2 tablets twice daily after meals, or as recommended.",
    storage: "Keep in a cool dry place away from heat.",
    price: 157.5,
    mrp: 175,
    discount: 10,
    rxRequired: false,
    stock: 9,
    image: "https://images.unsplash.com/photo-1611079830811-b65d1a601991?w=500&auto=format&fit=crop&q=60",
    rating: 4.5
  }
];

let mockCarts = {};
let mockOrders = [
  {
    _id: "ord_mock_11111",
    userId: "mock_admin_id_9999",
    items: [
      { medicineId: "med_1", qty: 2, name: "Crocin Pain Relief", price: 27, mrp: 30, rxRequired: false }
    ],
    totalAmount: 94,
    deliveryCharge: 40,
    gst: 6.48,
    couponCode: '',
    discount: 0,
    address: { street: '12 Main St, Admin Quarter', city: 'Bangalore', state: 'Karnataka', zip: '560001' },
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'Pending',
    status: 'Confirmed',
    prescriptionId: null,
    createdAt: new Date(Date.now() - 3600000 * 2) // 2 hours ago
  }
];
let mockPrescriptions = [];
let mockReminders = [
  {
    _id: "rem_mock_1",
    userId: "mock_admin_id_9999",
    medicineName: "Crocin Pain Relief",
    time: "08:00",
    frequency: "Daily",
    slot: "Morning",
    active: true
  }
];
let mockReviews = {};

// ==========================================
// 1. PROFILE API
// ==========================================
router.put('/auth/profile', protect, async (req, res) => {
  try {
    const { name, phone, bloodGroup, allergies, addresses, familyMembers } = req.body;
    
    if (global.isDbMock) {
      const userObj = global.mockUsersList.find(u => u.id === req.user.id || u._id === req.user.id);
      if (!userObj) {
        return res.status(404).json({ success: false, message: "Mock user not found" });
      }
      if (name) userObj.name = name;
      if (phone) userObj.phone = phone;
      if (bloodGroup) userObj.bloodGroup = bloodGroup;
      if (allergies) userObj.allergies = allergies;
      if (addresses) userObj.addresses = addresses;
      if (familyMembers) userObj.familyMembers = familyMembers;

      return res.status(200).json({ success: true, user: userObj });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (bloodGroup) user.bloodGroup = bloodGroup;
    if (allergies) user.allergies = allergies;
    if (addresses) user.addresses = addresses;
    if (familyMembers) user.familyMembers = familyMembers;

    await user.save();
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update profile", error: error.message });
  }
});

// ==========================================
// 2. MEDICINES / SHOP ROUTES
// ==========================================
router.get('/medicines', async (req, res) => {
  try {
    const { search, category, priceMax, rxRequired, sort, page = 1, limit = 8 } = req.query;

    if (global.isDbMock) {
      let filtered = [...mockMedicines];

      if (search) {
        const query = search.toLowerCase();
        filtered = filtered.filter(m => 
          m.name.toLowerCase().includes(query) || 
          m.brand.toLowerCase().includes(query) || 
          m.salt.toLowerCase().includes(query)
        );
      }

      if (category) {
        filtered = filtered.filter(m => m.category === category);
      }

      if (priceMax) {
        filtered = filtered.filter(m => m.price <= Number(priceMax));
      }

      if (rxRequired !== undefined && rxRequired !== '') {
        filtered = filtered.filter(m => m.rxRequired === (rxRequired === 'true'));
      }

      // Sort
      if (sort === 'priceAsc') filtered.sort((a, b) => a.price - b.price);
      else if (sort === 'priceDesc') filtered.sort((a, b) => b.price - a.price);
      else if (sort === 'discount') filtered.sort((a, b) => b.discount - a.discount);
      else if (sort === 'newest') filtered.sort((a, b) => b._id.localeCompare(a._id));
      else filtered.sort((a, b) => a.name.localeCompare(b.name));

      const skip = (Number(page) - 1) * Number(limit);
      const paginated = filtered.slice(skip, skip + Number(limit));

      return res.status(200).json({
        success: true,
        medicines: paginated,
        pagination: {
          total: filtered.length,
          page: Number(page),
          pages: Math.ceil(filtered.length / Number(limit))
        }
      });
    }

    // Real MongoDB flow
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { salt: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) query.category = category;
    if (priceMax) query.price = { $lte: Number(priceMax) };
    if (rxRequired !== undefined && rxRequired !== '') query.rxRequired = rxRequired === 'true';

    let sortObj = {};
    if (sort === 'priceAsc') sortObj.price = 1;
    else if (sort === 'priceDesc') sortObj.price = -1;
    else if (sort === 'discount') sortObj.discount = -1;
    else if (sort === 'newest') sortObj.createdAt = -1;
    else sortObj.name = 1;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Medicine.countDocuments(query);
    const medicines = await Medicine.find(query).sort(sortObj).skip(skip).limit(Number(limit));

    res.status(200).json({
      success: true,
      medicines,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching medicines" });
  }
});

router.get('/medicines/:id', async (req, res) => {
  try {
    const medId = req.params.id;

    if (global.isDbMock) {
      const medicine = mockMedicines.find(m => m._id === medId);
      if (!medicine) return res.status(404).json({ success: false, message: "Medicine not found" });

      const substitutes = mockMedicines.filter(m => 
        m._id !== medId && 
        m.salt.split(' ')[0].toLowerCase() === medicine.salt.split(' ')[0].toLowerCase() && 
        m.price < medicine.price
      );

      const related = mockMedicines.filter(m => m._id !== medId && m.category === medicine.category).slice(0, 4);
      const reviews = mockReviews[medId] || [];

      return res.status(200).json({ success: true, medicine, reviews, substitutes, related });
    }

    const medicine = await Medicine.findById(medId);
    if (!medicine) return res.status(404).json({ success: false, message: "Medicine not found" });

    const reviews = await Review.find({ medicineId: medId }).populate('userId', 'name avatar');
    const saltWords = medicine.salt.split(/\s+/).filter(word => word.length > 4);
    let saltQuery = [];
    if (saltWords.length > 0) {
      saltQuery = saltWords.map(word => ({ salt: { $regex: word.replace(/[^a-zA-Z0-9]/g, ''), $options: 'i' } }));
    } else {
      saltQuery = [{ salt: { $regex: medicine.salt, $options: 'i' } }];
    }

    const substitutes = await Medicine.find({
      _id: { $ne: medId },
      $or: saltQuery,
      price: { $lt: medicine.price }
    }).sort({ price: 1 }).limit(4);

    const related = await Medicine.find({ _id: { $ne: medId }, category: medicine.category }).limit(4);

    res.status(200).json({ success: true, medicine, reviews, substitutes, related });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching medicine details" });
  }
});

router.post('/medicines/:id/reviews', protect, async (req, res) => {
  const medId = req.params.id;
  const { rating, comment } = req.body;

  try {
    if (global.isDbMock) {
      const medicine = mockMedicines.find(m => m._id === medId);
      if (!medicine) return res.status(404).json({ success: false, message: "Medicine not found" });

      const newReview = {
        _id: 'rev_' + Date.now(),
        medicineId: medId,
        userId: {
          id: req.user.id,
          name: req.user.name || 'Test User',
          avatar: req.user.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=User'
        },
        rating: Number(rating),
        comment,
        createdAt: new Date()
      };

      if (!mockReviews[medId]) mockReviews[medId] = [];
      mockReviews[medId].push(newReview);

      return res.status(201).json({ success: true, review: newReview });
    }

    const medicine = await Medicine.findById(medId);
    if (!medicine) return res.status(404).json({ success: false, message: "Medicine not found" });

    const review = await Review.create({
      medicineId: medId,
      userId: req.user.id,
      rating: Number(rating),
      comment
    });

    const allReviews = await Review.find({ medicineId: medId });
    const avgRating = allReviews.reduce((sum, item) => sum + item.rating, 0) / allReviews.length;
    medicine.rating = Math.round(avgRating * 10) / 10;
    await medicine.save();

    const populatedReview = await Review.findById(review._id).populate('userId', 'name avatar');
    res.status(201).json({ success: true, review: populatedReview });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error posting review" });
  }
});

// ==========================================
// 3. CART ROUTES
// ==========================================
router.get('/cart', protect, async (req, res) => {
  try {
    if (global.isDbMock) {
      const uCart = mockCarts[req.user.id] || { items: [] };
      return res.status(200).json({ success: true, cart: uCart });
    }

    let cart = await Cart.findOne({ userId: req.user.id }).populate('items.medicineId');
    if (!cart) cart = await Cart.create({ userId: req.user.id, items: [] });
    res.status(200).json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching cart" });
  }
});

router.post('/cart', protect, async (req, res) => {
  const { medicineId, qty } = req.body;

  try {
    if (global.isDbMock) {
      if (!mockCarts[req.user.id]) mockCarts[req.user.id] = { items: [] };
      const uCart = mockCarts[req.user.id];
      const med = mockMedicines.find(m => m._id === medicineId);
      
      const itemIndex = uCart.items.findIndex(item => item.medicineId._id === medicineId);
      if (itemIndex > -1) {
        uCart.items[itemIndex].qty += qty ? Number(qty) : 1;
      } else {
        uCart.items.push({
          _id: 'cart_item_' + Date.now(),
          medicineId: med,
          qty: qty ? Number(qty) : 1
        });
      }
      return res.status(200).json({ success: true, cart: uCart });
    }

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) cart = await Cart.create({ userId: req.user.id, items: [] });

    const itemIndex = cart.items.findIndex(item => item.medicineId.toString() === medicineId);
    if (itemIndex > -1) {
      cart.items[itemIndex].qty += qty ? Number(qty) : 1;
    } else {
      cart.items.push({ medicineId, qty: qty ? Number(qty) : 1 });
    }

    await cart.save();
    const updatedCart = await Cart.findOne({ userId: req.user.id }).populate('items.medicineId');
    res.status(200).json({ success: true, cart: updatedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding item to cart" });
  }
});

router.put('/cart/:itemId', protect, async (req, res) => {
  const { qty } = req.body;
  const itemId = req.params.itemId;

  try {
    if (global.isDbMock) {
      const uCart = mockCarts[req.user.id];
      const item = uCart.items.find(i => i._id === itemId);
      if (item) item.qty = Number(qty);
      return res.status(200).json({ success: true, cart: uCart });
    }

    const cart = await Cart.findOne({ userId: req.user.id });
    const item = cart.items.id(itemId);
    if (item) item.qty = Number(qty);
    await cart.save();

    const updatedCart = await Cart.findOne({ userId: req.user.id }).populate('items.medicineId');
    res.status(200).json({ success: true, cart: updatedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating cart" });
  }
});

router.delete('/cart/:itemId', protect, async (req, res) => {
  const itemId = req.params.itemId;

  try {
    if (global.isDbMock) {
      const uCart = mockCarts[req.user.id];
      uCart.items = uCart.items.filter(i => i._id !== itemId);
      return res.status(200).json({ success: true, cart: uCart });
    }

    const cart = await Cart.findOne({ userId: req.user.id });
    cart.items.pull(itemId);
    await cart.save();

    const updatedCart = await Cart.findOne({ userId: req.user.id }).populate('items.medicineId');
    res.status(200).json({ success: true, cart: updatedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error removing item" });
  }
});

// ==========================================
// 4. ORDER ROUTES
// ==========================================
router.post('/orders', protect, async (req, res) => {
  const { items, totalAmount, deliveryCharge, gst, couponCode, discount, address, paymentMethod, prescriptionId } = req.body;

  try {
    if (global.isDbMock) {
      const newOrder = {
        _id: 'ord_mock_' + Date.now(),
        userId: req.user.id,
        items,
        totalAmount,
        deliveryCharge,
        gst,
        couponCode,
        discount,
        address,
        paymentMethod,
        paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid',
        status: 'Placed',
        prescriptionId,
        createdAt: new Date()
      };
      
      mockOrders.unshift(newOrder);
      // Clear cart
      mockCarts[req.user.id] = { items: [] };

      return res.status(201).json({ success: true, order: newOrder });
    }

    // Real DB flow
    for (const item of items) {
      const med = await Medicine.findById(item.medicineId);
      if (med) {
        med.stock = Math.max(0, med.stock - item.qty);
        await med.save();
      }
    }

    const order = await Order.create({
      userId: req.user.id,
      items,
      totalAmount,
      deliveryCharge,
      gst,
      couponCode,
      discount,
      address,
      paymentMethod,
      paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid',
      status: 'Placed',
      prescriptionId
    });

    await Cart.findOneAndDelete({ userId: req.user.id });
    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to place order", error: error.message });
  }
});

router.get('/orders', protect, async (req, res) => {
  try {
    if (global.isDbMock) {
      const uOrders = mockOrders.filter(o => o.userId === req.user.id);
      return res.status(200).json({ success: true, orders: uOrders });
    }

    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
});

router.get('/orders/:id', protect, async (req, res) => {
  try {
    if (global.isDbMock) {
      const order = mockOrders.find(o => o._id === req.params.id);
      if (!order) return res.status(404).json({ success: false, message: "Order not found" });
      return res.status(200).json({ success: true, order });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching order details" });
  }
});

// ==========================================
// 5. PRESCRIPTION ROUTES
// ==========================================
router.post('/prescriptions', protect, upload.single('prescription'), async (req, res) => {
  const { doctorName, notes } = req.body;

  try {
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : '/uploads/mock-prescription.pdf';

    if (global.isDbMock) {
      const newRx = {
        _id: 'rx_mock_' + Date.now(),
        userId: req.user.id,
        fileUrl,
        doctorName: doctorName || 'Self/Unknown',
        notes: notes || '',
        status: 'Pending',
        date: new Date(),
        createdAt: new Date()
      };
      mockPrescriptions.unshift(newRx);
      return res.status(201).json({ success: true, prescription: newRx });
    }

    if (!req.file) return res.status(400).json({ success: false, message: "File upload missing" });

    const prescription = await Prescription.create({
      userId: req.user.id,
      fileUrl,
      doctorName: doctorName || "Self/Unknown",
      notes: notes || "",
      status: 'Pending'
    });

    res.status(201).json({ success: true, prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to upload prescription" });
  }
});

router.get('/prescriptions', protect, async (req, res) => {
  try {
    if (global.isDbMock) {
      const uRx = mockPrescriptions.filter(r => r.userId === req.user.id);
      return res.status(200).json({ success: true, prescriptions: uRx });
    }

    const prescriptions = await Prescription.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, prescriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to retrieve prescriptions" });
  }
});

// ==========================================
// 6. MEDICINE REMINDER ROUTES
// ==========================================
router.get('/reminders', protect, async (req, res) => {
  try {
    if (global.isDbMock) {
      const uRem = mockReminders.filter(r => r.userId === req.user.id);
      return res.status(200).json({ success: true, reminders: uRem });
    }

    const reminders = await Reminder.find({ userId: req.user.id }).sort({ time: 1 });
    res.status(200).json({ success: true, reminders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching reminders" });
  }
});

router.post('/reminders', protect, async (req, res) => {
  const { id, medicineName, time, frequency, slot, active } = req.body;

  try {
    if (global.isDbMock) {
      let reminder;
      if (id) {
        reminder = mockReminders.find(r => r._id === id);
        if (reminder) {
          reminder.medicineName = medicineName;
          reminder.time = time;
          reminder.frequency = frequency || reminder.frequency;
          reminder.slot = slot;
          if (active !== undefined) reminder.active = active;
        }
      } else {
        reminder = {
          _id: 'rem_mock_' + Date.now(),
          userId: req.user.id,
          medicineName,
          time,
          frequency: frequency || 'Daily',
          slot,
          active: active !== undefined ? active : true
        };
        mockReminders.push(reminder);
      }
      return res.status(200).json({ success: true, reminder });
    }

    // Real DB flow
    let reminder;
    if (id) {
      reminder = await Reminder.findById(id);
      if (reminder) {
        reminder.medicineName = medicineName;
        reminder.time = time;
        reminder.frequency = frequency || reminder.frequency;
        reminder.slot = slot;
        if (active !== undefined) reminder.active = active;
        await reminder.save();
      }
    } else {
      reminder = await Reminder.create({
        userId: req.user.id,
        medicineName,
        time,
        frequency: frequency || 'Daily',
        slot,
        active: active !== undefined ? active : true
      });
    }
    res.status(200).json({ success: true, reminder });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error saving reminder" });
  }
});

router.delete('/reminders/:id', protect, async (req, res) => {
  try {
    if (global.isDbMock) {
      mockReminders = mockReminders.filter(r => r._id !== req.params.id);
      return res.status(200).json({ success: true, message: "Deleted" });
    }

    await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.status(200).json({ success: true, message: "Reminder deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting reminder" });
  }
});

// ==========================================
// 7. DRUG INTERACTION CHECKER
// ==========================================
const interactionsDb = [
  {
    salts: ['paracetamol', 'alcohol'],
    severity: 'Dangerous',
    color: 'red',
    description: 'Combining paracetamol with alcohol significantly increases the risk of severe liver damage/toxicity. Avoid alcohol consumption while on paracetamol treatment.'
  },
  {
    salts: ['aspirin', 'warfarin'],
    severity: 'Dangerous',
    color: 'red',
    description: 'Aspirin and Warfarin are both blood thinners. Taking them together drastically increases the risk of major internal gastrointestinal bleeding and bruising.'
  },
  {
    salts: ['ibuprofen', 'aspirin'],
    severity: 'Warning',
    color: 'yellow',
    description: 'Both are NSAIDs. Taking Ibuprofen and Aspirin together increases the likelihood of stomach pain, indigestion, ulcers, and bleeding.'
  },
  {
    salts: ['amoxicillin', 'methotrexate'],
    severity: 'Warning',
    color: 'yellow',
    description: 'Amoxicillin can slow down the excretion of Methotrexate, leading to elevated drug levels in blood and potentially dangerous methotrexate toxicity.'
  },
  {
    salts: ['atorvastatin', 'clarithromycin'],
    severity: 'Dangerous',
    color: 'red',
    description: 'Clarithromycin dramatically increases blood levels of Atorvastatin, which can lead to severe muscle damage (rhabdomyolysis) and kidney issues.'
  },
  {
    salts: ['metformin', 'contrast dye'],
    severity: 'Dangerous',
    color: 'red',
    description: 'Iodinated contrast dyes used in medical scans can compromise kidney function, leading to a dangerous buildup of metformin and lactic acidosis.'
  },
  {
    salts: ['iron', 'antacid'],
    severity: 'Warning',
    color: 'yellow',
    description: 'Antacids (Aluminium/Magnesium Hydroxides) block or reduce the absorption of iron supplements in the stomach. Take iron at least 2 hours before or 4 hours after antacids.'
  },
  {
    salts: ['sildenafil', 'nitroglycerin'],
    severity: 'Dangerous',
    color: 'red',
    description: 'Combining sildenafil with nitroglycerin causes a profound, life-threatening drop in blood pressure. Never use these together.'
  }
];

router.get('/drug-interactions', async (req, res) => {
  const { med1, med2 } = req.query;
  if (!med1 || !med2) return res.status(400).json({ success: false, message: "Two medicine names are required" });

  try {
    let medicine1, medicine2;

    if (global.isDbMock) {
      medicine1 = mockMedicines.find(m => m.name.toLowerCase() === med1.trim().toLowerCase());
      medicine2 = mockMedicines.find(m => m.name.toLowerCase() === med2.trim().toLowerCase());
    } else {
      medicine1 = await Medicine.findOne({ name: { $regex: `^${med1.trim()}$`, $options: 'i' } });
      medicine2 = await Medicine.findOne({ name: { $regex: `^${med2.trim()}$`, $options: 'i' } });
    }

    if (!medicine1 || !medicine2) {
      return res.status(404).json({ success: false, message: "One or both medicines not found in catalog." });
    }

    const salt1 = medicine1.salt.toLowerCase();
    const salt2 = medicine2.salt.toLowerCase();

    let matched = null;
    for (const rule of interactionsDb) {
      if (rule.salts.some(s => salt1.includes(s)) && rule.salts.some(s => salt2.includes(s))) {
        matched = rule;
        break;
      }
    }

    if (matched) {
      return res.status(200).json({
        success: true,
        status: matched.severity,
        color: matched.color,
        description: matched.description,
        med1: { name: medicine1.name, salt: medicine1.salt },
        med2: { name: medicine2.name, salt: medicine2.salt }
      });
    } else {
      return res.status(200).json({
        success: true,
        status: 'Safe',
        color: 'green',
        description: 'No known severe interactions found in our database between these chemical compounds.',
        med1: { name: medicine1.name, salt: medicine1.salt },
        med2: { name: medicine2.name, salt: medicine2.salt }
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Interaction checker error" });
  }
});

// ==========================================
// 8. SYMPTOM CHECKER ROUTE
// ==========================================
router.post('/symptom-checker', async (req, res) => {
  const { symptoms } = req.body;
  if (!symptoms || symptoms.length === 0) return res.status(400).json({ success: false, message: "Symptoms list required" });

  try {
    const searchTerms = [];
    if (symptoms.includes('Fever') || symptoms.includes('Headache') || symptoms.includes('Body Pain')) {
      searchTerms.push('Crocin Pain Relief', 'Ibugesic 400');
    }
    if (symptoms.includes('Cough') || symptoms.includes('Sore Throat') || symptoms.includes('Runny Nose')) {
      searchTerms.push('Benadryl Cough Syrup', 'Himalaya Septilin Tablets');
    }
    if (symptoms.includes('Acidity') || symptoms.includes('Gas') || symptoms.includes('Heartburn')) {
      searchTerms.push('Gelusil Liquid MPS');
    }
    if (symptoms.includes('Weakness') || symptoms.includes('Fatigue')) {
      searchTerms.push('Dexorange Syrup', 'Neurobion Forte', 'Zincovit Tablet');
    }
    if (symptoms.includes('Cuts') || symptoms.includes('Minor Burns') || symptoms.includes('Skin Rash')) {
      searchTerms.push('Betadine Ointment', 'Vicco Turmeric Cream');
    }
    if (symptoms.includes('Dry Skin') || symptoms.includes('Sensitive Skin')) {
      searchTerms.push('Cetaphil Gentle Cleanser');
    }

    let suggestedMedicines = [];
    if (global.isDbMock) {
      suggestedMedicines = mockMedicines.filter(m => searchTerms.includes(m.name));
    } else {
      suggestedMedicines = await Medicine.find({ name: { $in: searchTerms } });
    }

    res.status(200).json({
      success: true,
      suggestedMedicines,
      disclaimer: "Disclaimer: Suggestions are only over-the-counter (OTC) medicines intended for general symptoms self-care. Always consult a certified medical practitioner or doctor for formal diagnostics and prescription."
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error matching symptoms" });
  }
});

// ==========================================
// 9. ADMIN DASHBOARD ROUTE
// ==========================================
router.post('/admin/medicines', protect, admin, async (req, res) => {
  try {
    if (global.isDbMock) {
      const newMed = { _id: 'med_' + Date.now(), ...req.body };
      mockMedicines.push(newMed);
      return res.status(201).json({ success: true, medicine: newMed });
    }
    const medicine = await Medicine.create(req.body);
    res.status(201).json({ success: true, medicine });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to add medicine" });
  }
});

router.put('/admin/medicines/:id', protect, admin, async (req, res) => {
  try {
    if (global.isDbMock) {
      const medIndex = mockMedicines.findIndex(m => m._id === req.params.id);
      if (medIndex > -1) {
        mockMedicines[medIndex] = { ...mockMedicines[medIndex], ...req.body };
        return res.status(200).json({ success: true, medicine: mockMedicines[medIndex] });
      }
      return res.status(404).json({ success: false, message: "Not found" });
    }

    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, medicine });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update medicine" });
  }
});

router.delete('/admin/medicines/:id', protect, admin, async (req, res) => {
  try {
    if (global.isDbMock) {
      mockMedicines = mockMedicines.filter(m => m._id !== req.params.id);
      return res.status(200).json({ success: true, message: "Deleted" });
    }
    await Medicine.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete medicine" });
  }
});

router.patch('/admin/prescriptions/:id', protect, admin, async (req, res) => {
  const { status } = req.body;
  try {
    if (global.isDbMock) {
      const rx = mockPrescriptions.find(r => r._id === req.params.id);
      if (rx) rx.status = status;
      return res.status(200).json({ success: true, prescription: rx });
    }
    const prescription = await Prescription.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.status(200).json({ success: true, prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update prescription status" });
  }
});

router.get('/admin/orders', protect, admin, async (req, res) => {
  try {
    if (global.isDbMock) {
      const populated = mockOrders.map(o => {
        const u = global.mockUsersList.find(usr => usr.id === o.userId || usr._id === o.userId) || { name: 'Admin User', email: 'admin@medcare.com' };
        return { ...o, userId: u };
      });
      return res.status(200).json({ success: true, orders: populated });
    }
    const orders = await Order.find({}).populate('userId', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
});

router.get('/admin/prescriptions', protect, admin, async (req, res) => {
  try {
    if (global.isDbMock) {
      const prescriptions = mockPrescriptions.map(rx => {
        const u = global.mockUsersList.find(usr => usr.id === rx.userId || usr._id === rx.userId) || { name: 'Guest User', email: 'guest@medcare.com' };
        return { ...rx, userId: u };
      });
      return res.status(200).json({ success: true, prescriptions });
    }
    const prescriptions = await Prescription.find({}).populate('userId', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, prescriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch prescriptions" });
  }
});

router.get('/admin/users', protect, admin, async (req, res) => {
  try {
    if (global.isDbMock) {
      const users = global.mockUsersList.map(u => ({
        _id: u._id || u.id,
        name: u.name,
        email: u.email,
        role: u.role || 'user',
        createdAt: u.createdAt || new Date().toISOString()
      }));
      return res.status(200).json({ success: true, users });
    }
    const users = await User.find({}, 'name email role createdAt').sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
});

router.put('/admin/orders/:id', protect, admin, async (req, res) => {
  const { status } = req.body;
  try {
    if (global.isDbMock) {
      const o = mockOrders.find(order => order._id === req.params.id);
      if (o) o.status = status;
      return res.status(200).json({ success: true, order: o });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update order" });
  }
});

router.get('/admin/dashboard', protect, admin, async (req, res) => {
  try {
    if (global.isDbMock) {
      const totalOrdersCount = mockOrders.length;
      const totalUsersCount = global.mockUsersList.length;
      const totalRevenue = mockOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const lowStockCount = mockMedicines.filter(m => m.stock < 10).length;

      const salesChart = [];
      const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        salesChart.push({
          day: weekday[d.getDay()],
          sales: Math.round(i === 2 ? totalRevenue * 0.4 : i === 0 ? totalRevenue * 0.6 : 0),
          orders: i === 2 || i === 0 ? 1 : 0
        });
      }

      const pendingRx = mockPrescriptions.filter(r => r.status === 'Pending').map(rx => {
        const u = global.mockUsersList.find(usr => usr.id === rx.userId || usr._id === rx.userId) || { name: 'Guest User' };
        return { ...rx, userId: u };
      });

      const recentActivity = mockOrders.map(o => ({
        type: 'order',
        text: `New order #${o._id.substring(12)} placed for ₹${o.totalAmount}`,
        time: o.createdAt
      })).slice(0, 5);

      return res.status(200).json({
        success: true,
        stats: { totalOrders: totalOrdersCount, totalUsers: totalUsersCount, totalRevenue, lowStockCount },
        lowStockAlerts: mockMedicines.filter(m => m.stock < 10),
        pendingPrescriptions: pendingRx,
        salesChart,
        recentActivity
      });
    }

    // Real DB flow
    const totalOrdersCount = await Order.countDocuments({});
    const totalUsersCount = await User.countDocuments({ role: 'user' });
    const orders = await Order.find({});
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const lowStockMedicines = await Medicine.find({ stock: { $lt: 10 } });
    const pendingPrescriptions = await Prescription.find({ status: 'Pending' }).populate('userId', 'name email');

    const salesData = [];
    const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

      const dayOrders = orders.filter(o => o.createdAt >= startOfDay && o.createdAt <= endOfDay);
      const daySales = dayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      salesData.push({
        day: weekday[d.getDay()],
        sales: Math.round(daySales),
        orders: dayOrders.length
      });
    }

    const recentActivity = [];
    const latestOrders = await Order.find({}).populate('userId', 'name').sort({ createdAt: -1 }).limit(3);
    latestOrders.forEach(o => {
      recentActivity.push({
        type: 'order',
        text: `New order #${o._id.toString().substring(18)} placed by ${o.userId?.name || 'Guest'} for ₹${o.totalAmount}`,
        time: o.createdAt
      });
    });

    res.status(200).json({
      success: true,
      stats: { totalOrders: totalOrdersCount, totalUsers: totalUsersCount, totalRevenue: Math.round(totalRevenue), lowStockCount: lowStockMedicines.length },
      lowStockAlerts: lowStockMedicines,
      pendingPrescriptions,
      salesChart: salesData,
      recentActivity: recentActivity.slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to collect dashboard telemetry" });
  }
});

module.exports = router;
