import {
  Wrench, Gauge, Battery, Disc, Droplet, Car, ShieldCheck, Clock, BellRing, LineChart,
  Wind, CircleDot, Cog, Sparkles, Zap, Thermometer, PaintBucket, Settings2,
} from 'lucide-react';

/**
 * Full workshop service catalog with realistic PKR pricing — mirrors what a
 * real multi-bay car service center in Pakistan typically offers. Prices are
 * indicative starting rates; the receptionist/admin can adjust per-workshop
 * in Admin > Services once the workshop is live.
 */
export const services = [
  { icon: Wrench, title: 'General / Periodic Service', price: 'From Rs. 6,500', duration: '2–3 hrs', desc: 'Full multi-point checkup — oil, filters, fluids, brakes, and a 40-point inspection.' },
  { icon: Droplet, title: 'Oil & Filter Change', price: 'From Rs. 3,500', duration: '30–45 min', desc: 'Engine oil and filter replacement with your choice of mineral, semi, or full-synthetic oil.' },
  { icon: Disc, title: 'Brake Pad Replacement', price: 'From Rs. 4,000', duration: '1 hr', desc: 'Front or rear brake pad replacement with rotor inspection and resurfacing if needed.' },
  { icon: Gauge, title: 'Engine Diagnostics (OBD Scan)', price: 'From Rs. 2,000', duration: '30–60 min', desc: 'Computerized fault-code scan and diagnosis for check-engine and performance issues.' },
  { icon: Battery, title: 'Battery Replacement & Testing', price: 'From Rs. 1,000', duration: '20 min', desc: 'Battery load-testing, terminal cleaning, and replacement with OEM-grade batteries.' },
  { icon: Wind, title: 'AC Service & Gas Refill', price: 'From Rs. 3,000', duration: '1–1.5 hrs', desc: 'AC gas refill, compressor check, cabin filter, and cooling performance restoration.' },
  { icon: CircleDot, title: 'Wheel Alignment', price: 'From Rs. 2,500', duration: '45 min', desc: 'Computerized 4-wheel alignment to correct uneven tire wear and steering pull.' },
  { icon: Cog, title: 'Wheel Balancing', price: 'From Rs. 1,500', duration: '30 min', desc: 'Precision wheel balancing for a smoother ride and reduced tire/suspension wear.' },
  { icon: Car, title: 'Tire Replacement & Rotation', price: 'From Rs. 1,000 /tire', duration: '20 min /tire', desc: 'New tire fitting, seasonal rotation, and puncture repair.' },
  { icon: Settings2, title: 'Suspension Repair', price: 'From Rs. 5,000', duration: '2–4 hrs', desc: 'Shock absorber, strut, and bushing replacement for a smoother, safer ride.' },
  { icon: Zap, title: 'Electrical & Wiring Repair', price: 'From Rs. 2,500', duration: '1–2 hrs', desc: 'Diagnosis and repair of lighting, wiring, alternator, and starter motor issues.' },
  { icon: Thermometer, title: 'Radiator & Cooling System', price: 'From Rs. 3,500', duration: '1–2 hrs', desc: 'Radiator flush, coolant top-up, hose inspection, and overheating diagnosis.' },
  { icon: Settings2, title: 'Clutch Replacement', price: 'From Rs. 12,000', duration: '3–5 hrs', desc: 'Complete clutch kit replacement including pressure plate and release bearing.' },
  { icon: PaintBucket, title: 'Denting & Painting', price: 'From Rs. 4,000 /panel', duration: '1–3 days', desc: 'Panel beating, filler work, and factory-matched paint refinishing.' },
  { icon: Sparkles, title: 'Car Wash & Detailing', price: 'From Rs. 1,500', duration: '45 min – 3 hrs', desc: 'Exterior wash, interior vacuum, polish, and full detailing packages.' },
];

export const steps = [
  { title: 'Book Online', desc: 'Pick your vehicle, the service you need, and a convenient time slot in seconds.' },
  { title: 'Drop Off', desc: 'Bring your car in at your booked slot — no waiting in line at the counter.' },
  { title: 'Track Live', desc: 'Follow every stage from inspection to quality check, right from your phone.' },
  { title: 'Pick Up', desc: 'Get notified the moment your vehicle is ready, with a clear itemized invoice.' },
];

export const features = [
  { icon: LineChart, title: 'Live Service Tracking', desc: 'Every vehicle moves through a visible pipeline — Booked, Inspection, In Progress, Quality Check, Ready — so nobody has to call and ask "is it done yet?"' },
  { icon: BellRing, title: 'Instant Notifications', desc: 'Customers are notified the moment their appointment is confirmed, their inspection is done, or their car is ready for pickup.' },
  { icon: ShieldCheck, title: 'Transparent, Itemized Invoices', desc: 'Every invoice breaks down parts, labor, and tax automatically — calculated server-side so totals are always accurate.' },
  { icon: Clock, title: 'No Double-Booking, Ever', desc: 'The scheduling engine prevents two customers from ever being booked into the same mechanic slot at the same time.' },
];

export const whyChooseUs = [
  { icon: ShieldCheck, title: 'Built for Real Workshops', desc: 'Designed around how a service center actually works — reception, inspection, mechanics, inventory, and billing, all in one place.' },
  { icon: Car, title: 'Multi-Workshop Ready', desc: 'Whether you run one bay or several branches, each location\'s customers, staff, and inventory stay cleanly separated.' },
  { icon: LineChart, title: 'Data You Can Act On', desc: 'See today\'s appointments, active jobs, revenue, and low-stock parts at a glance — no spreadsheets required.' },
];
