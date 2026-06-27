export type Pack = {
  id: string
  slug: string
  name: string
  category: string
  region: string
  records: number
  price: number
  available: boolean
  tagline: string
  fields: string[]
  sampleRows: Record<string, string>[]
}

export const CATEGORIES = ['All','Restaurants','Dentists','Med Spas','Gyms','Contractors','Real Estate','Salons','Law Firms','Auto Shops','Chiropractors']

export const CAT_GRADIENT: Record<string, [string, string]> = {
  Restaurants:   ['#FF6B35', '#FF3366'],
  Dentists:      ['#4361EE', '#7209B7'],
  'Med Spas':    ['#C77DFF', '#E040FB'],
  Gyms:          ['#06D6A0', '#118AB2'],
  Contractors:   ['#FFB703', '#FB8500'],
  'Real Estate': ['#6B6BFF', '#480CA8'],
  Salons:        ['#F72585', '#B5179E'],
  'Law Firms':   ['#8D99AE', '#4A4E69'],
  'Auto Shops':  ['#EF233C', '#D90429'],
  Chiropractors: ['#00B4D8', '#0077B6'],
}

export const packs: Pack[] = [
  {
    id:'1', slug:'fl-restaurants-weak-websites',
    name:'FL Restaurants — Weak Websites',
    category:'Restaurants', region:'Florida', records:500, price:39, available:true,
    tagline:'500 restaurants losing customers to a bad website. Ready to pitch today.',
    fields:['Business Name','City','Phone','Website','Google Rating','Site Issue','Email'],
    sampleRows:[
      {name:"Mango's Grill",city:'Miami',phone:'(305) 555-0142',website:'mangosgrill.com',rating:'4.1',issue:'No mobile layout',email:'info@mangosgrill.com'},
      {name:'Gulf Coast BBQ',city:'Tampa',phone:'(813) 555-0287',website:'gulfcoastbbq.net',rating:'3.8',issue:'No menu page',email:'—'},
      {name:'The Pier House',city:'Fort Lauderdale',phone:'(954) 555-0391',website:'pierhousefl.com',rating:'4.3',issue:'Broken contact form',email:'pier@pierhousefl.com'},
      {name:'Casa Verde',city:'Orlando',phone:'(407) 555-0165',website:'casaverdemx.com',rating:'4.0',issue:'Page loads 9s+',email:'—'},
      {name:'Sunrise Diner',city:'Jacksonville',phone:'(904) 555-0278',website:'sunrisediner.com',rating:'3.9',issue:'No SSL cert',email:'hello@sunrisediner.com'},
    ],
  },
  {
    id:'2', slug:'tx-restaurants-weak-websites',
    name:'TX Restaurants — Weak Websites',
    category:'Restaurants', region:'Texas', records:500, price:39, available:true,
    tagline:'Houston, Dallas, Austin. 500 restaurants with websites that lose them bookings.',
    fields:['Business Name','City','Phone','Website','Google Rating','Site Issue','Email'],
    sampleRows:[
      {name:'Lone Star Kitchen',city:'Houston',phone:'(713) 555-0134',website:'lonestarkitchen.com',rating:'4.2',issue:'No online ordering',email:'—'},
      {name:'Austin Taco Co.',city:'Austin',phone:'(512) 555-0219',website:'austintacoco.net',rating:'4.5',issue:'Flash-era design',email:'info@austintacoco.net'},
      {name:'The Oil Drum',city:'Dallas',phone:'(214) 555-0388',website:'oildrumdal.com',rating:'3.7',issue:'No mobile layout',email:'—'},
      {name:'Tex-Mex Palace',city:'San Antonio',phone:'(210) 555-0441',website:'texmexpalace.com',rating:'4.0',issue:'Images not loading',email:'contact@texmexpalace.com'},
      {name:"Rosie's Smokehouse",city:'Fort Worth',phone:'(817) 555-0562',website:'rosiessmokehouse.com',rating:'4.6',issue:'No hours listed',email:'—'},
    ],
  },
  {
    id:'3', slug:'southeast-dentists-no-booking',
    name:'Southeast Dentists — No Online Booking',
    category:'Dentists', region:'Southeast', records:400, price:49, available:true,
    tagline:'400 dental practices still making patients call to book. Perfect booking platform pitch.',
    fields:['Practice Name','State','City','Phone','Website','Booking Gap','Contact'],
    sampleRows:[
      {name:'Bright Smile Dental',state:'GA',city:'Atlanta',phone:'(404) 555-0182',website:'brightsmileatl.com',gap:'No booking widget',contact:'dr.harris@brightsmile.com'},
      {name:'Carolina Dental Care',state:'NC',city:'Charlotte',phone:'(704) 555-0256',website:'carolinadentalcare.com',gap:'Form only, no calendar',contact:'—'},
      {name:'Palmetto Smiles',state:'SC',city:'Columbia',phone:'(803) 555-0317',website:'palmettosmilessc.com',gap:'No booking at all',contact:'info@palmettosmilessc.com'},
      {name:'Music City Dental',state:'TN',city:'Nashville',phone:'(615) 555-0429',website:'musiccitydental.com',gap:'Broken Zocdoc link',contact:'—'},
      {name:'Peach State Dentistry',state:'GA',city:'Savannah',phone:'(912) 555-0511',website:'peachstatedentistry.com',gap:'Phone only',contact:'office@peachstatedentistry.com'},
    ],
  },
  {
    id:'4', slug:'ca-med-spas-weak-landing',
    name:'CA Med Spas — Weak Landing Pages',
    category:'Med Spas', region:'California', records:350, price:49, available:true,
    tagline:'350 California med spas with great Instagram but landing pages that convert nothing.',
    fields:['Business Name','City','Instagram','Website','Issue','Phone'],
    sampleRows:[
      {name:'Glow Lab Spa',city:'Los Angeles',instagram:'@glowlabla',website:'glowlabspa.com',issue:'No pricing page',phone:'(310) 555-0193'},
      {name:'Revive Med Spa',city:'San Diego',instagram:'@revivesd',website:'revivemedspasd.com',issue:'No before/after gallery',phone:'(619) 555-0244'},
      {name:'The Radiance Studio',city:'San Francisco',instagram:'@radiancesf',website:'radiancestudiosf.com',issue:'Not mobile friendly',phone:'(415) 555-0388'},
      {name:'Pure Aesthetics',city:'Beverly Hills',instagram:'@purebh',website:'pureaestheticsbh.com',issue:'No CTA above fold',phone:'(310) 555-0471'},
      {name:'Luxe Glow',city:'Sacramento',instagram:'@luxeglowsac',website:'luxeglowsac.com',issue:'Booking link broken',phone:'(916) 555-0539'},
    ],
  },
  {
    id:'5', slug:'northeast-gyms-no-social',
    name:'Northeast Gyms — No Social Presence',
    category:'Gyms', region:'Northeast', records:300, price:39, available:true,
    tagline:'300 independent gyms in NY, NJ, CT, MA with zero Instagram or Facebook presence.',
    fields:['Business Name','State','City','Phone','Website','Social Gap','Email'],
    sampleRows:[
      {name:'Iron Works Gym',state:'NY',city:'Buffalo',phone:'(716) 555-0127',website:'ironworksbuffalo.com',gap:'No Instagram',email:'info@ironworksbuffalo.com'},
      {name:"Mike's Fitness",state:'NJ',city:'Newark',phone:'(973) 555-0283',website:'mikesfitnessnj.com',gap:'Facebook inactive 2yr',email:'—'},
      {name:'Connecticut Strength',state:'CT',city:'Hartford',phone:'(860) 555-0344',website:'ctstrength.com',gap:'No social at all',email:'contact@ctstrength.com'},
      {name:'Harbor Fit',state:'MA',city:'Boston',phone:'(617) 555-0491',website:'harborfit.com',gap:'No Instagram',email:'—'},
      {name:'Peak Performance',state:'NY',city:'Rochester',phone:'(585) 555-0563',website:'peakperformancero.com',gap:'No social at all',email:'team@peakperformancero.com'},
    ],
  },
  {
    id:'6', slug:'midwest-contractors-outdated-sites',
    name:'Midwest Contractors — Outdated Websites',
    category:'Contractors', region:'Midwest', records:500, price:39, available:true,
    tagline:'500 contractors across IL, OH, MI, MN still running websites from 2010.',
    fields:['Business Name','State','City','Phone','Website','Built Est.','Contact'],
    sampleRows:[
      {name:'Midwest Build Co.',state:'IL',city:'Chicago',phone:'(312) 555-0182',website:'midwestbuildco.com',built:'~2010',contact:'joe@midwestbuildco.com'},
      {name:'Lake Erie Roofing',state:'OH',city:'Cleveland',phone:'(216) 555-0247',website:'lakeeriroofing.com',built:'~2008',contact:'—'},
      {name:'Great Lakes Plumbing',state:'MI',city:'Detroit',phone:'(313) 555-0395',website:'greatlakesplumbing.com',built:'~2012',contact:'office@greatlakesplumbing.com'},
      {name:'Twin Cities Concrete',state:'MN',city:'Minneapolis',phone:'(612) 555-0418',website:'twincitysconcrete.com',built:'~2009',contact:'—'},
      {name:'Heartland HVAC',state:'IL',city:'Springfield',phone:'(217) 555-0571',website:'heartlandhvac.com',built:'~2011',contact:'contact@heartlandhvac.com'},
    ],
  },
  {
    id:'7', slug:'nyc-salons-no-booking',
    name:'NYC Salons — No Online Booking',
    category:'Salons', region:'New York', records:300, price:39, available:true,
    tagline:'300 NYC salons still making clients call. Every single one needs a booking system.',
    fields:['Business Name','Borough','Phone','Yelp Rating','Website','Booking Gap'],
    sampleRows:[
      {name:'Studio 47 Salon',borough:'Brooklyn',phone:'(718) 555-0138',rating:'4.4',website:'studio47salon.com',gap:'No booking system'},
      {name:'Chelsea Cuts',borough:'Manhattan',phone:'(212) 555-0261',rating:'4.1',website:'chelseacutsnyc.com',gap:'Phone only'},
      {name:'Bronx Beauty Bar',borough:'Bronx',phone:'(718) 555-0374',rating:'4.3',website:'—',gap:'No website at all'},
      {name:'Queens Glow Studio',borough:'Queens',phone:'(718) 555-0445',rating:'4.0',website:'queensglowstudio.com',gap:'Broken booking link'},
      {name:'Uptown Shears',borough:'Harlem',phone:'(212) 555-0582',rating:'4.2',website:'uptownshears.com',gap:'No booking system'},
    ],
  },
  {
    id:'8', slug:'sw-law-firms-no-local-seo',
    name:'SW Law Firms — No Local SEO',
    category:'Law Firms', region:'Southwest', records:250, price:59, available:true,
    tagline:'250 small law firms in AZ, NV, NM, CO completely invisible in local search.',
    fields:['Firm Name','State','City','Phone','Website','SEO Gap','Contact'],
    sampleRows:[
      {name:'Desert Law Group',state:'AZ',city:'Phoenix',phone:'(602) 555-0143',website:'desertlawgroup.com',gap:'No Google Business',contact:'intake@desertlawgroup.com'},
      {name:'Silver State Legal',state:'NV',city:'Las Vegas',phone:'(702) 555-0276',website:'silverstatelegal.com',gap:'Unclaimed GBP',contact:'—'},
      {name:'Mesa Verde Law',state:'NM',city:'Albuquerque',phone:'(505) 555-0381',website:'mesaverdelaw.com',gap:'No local citations',contact:'contact@mesaverdelaw.com'},
      {name:'Rocky Mountain Attorneys',state:'CO',city:'Denver',phone:'(303) 555-0449',website:'rmattorneys.com',gap:'No GBP listing',contact:'—'},
      {name:'Cactus & Associates',state:'AZ',city:'Tucson',phone:'(520) 555-0527',website:'cactuslaw.com',gap:'Reviews not responding',contact:'office@cactuslaw.com'},
    ],
  },
  {
    id:'9', slug:'auto-shops-under-10-reviews',
    name:'Auto Shops — Under 10 Google Reviews',
    category:'Auto Shops', region:'National', records:600, price:39, available:true,
    tagline:'600 auto shops open 2+ years with fewer than 10 Google reviews. Easy reputation pitch.',
    fields:['Business Name','State','City','Phone','Reviews','Rating','Website'],
    sampleRows:[
      {name:"Tony's Auto Repair",state:'OH',city:'Columbus',phone:'(614) 555-0153',reviews:'6',rating:'4.0',website:'tonysautorepair.com'},
      {name:'Quick Fix Garage',state:'WA',city:'Seattle',phone:'(206) 555-0289',reviews:'4',rating:'4.5',website:'—'},
      {name:'Main Street Motors',state:'PA',city:'Pittsburgh',phone:'(412) 555-0374',reviews:'8',rating:'3.9',website:'mainstreetmotors.com'},
      {name:'Desert Auto Works',state:'AZ',city:'Scottsdale',phone:'(480) 555-0451',reviews:'3',rating:'4.2',website:'desertautoworks.com'},
      {name:'Bayou Auto Care',state:'LA',city:'New Orleans',phone:'(504) 555-0537',reviews:'7',rating:'4.1',website:'bayouautocare.com'},
    ],
  },
  {
    id:'10', slug:'tx-chiropractors-weak-websites',
    name:'TX Chiropractors — Weak Websites',
    category:'Chiropractors', region:'Texas', records:300, price:49, available:true,
    tagline:'300 Texas chiro practices with slow, mobile-broken, or booking-less websites.',
    fields:['Practice Name','City','Phone','Website','Site Issue','Contact'],
    sampleRows:[
      {name:'Lone Star Chiro',city:'Houston',phone:'(713) 555-0161',website:'lonestarchiro.com',issue:'No mobile layout',contact:'info@lonestarchiro.com'},
      {name:'Austin Spine Center',city:'Austin',phone:'(512) 555-0248',website:'austinspinecenter.com',issue:'No booking',contact:'—'},
      {name:'DFW Back Relief',city:'Dallas',phone:'(214) 555-0332',website:'dfwbackrelief.com',issue:'Slow load 8s+',contact:'office@dfwbackrelief.com'},
      {name:'Alamo Chiropractic',city:'San Antonio',phone:'(210) 555-0417',website:'alamochiro.com',issue:'Outdated design',contact:'—'},
      {name:'Gulf Chiro Care',city:'Corpus Christi',phone:'(361) 555-0589',website:'gulfchirocare.com',issue:'No SSL cert',contact:'contact@gulfchirocare.com'},
    ],
  },
  {
    id:'11', slug:'ca-realtors-no-personal-site',
    name:'CA Realtors — No Personal Website',
    category:'Real Estate', region:'California', records:350, price:59, available:true,
    tagline:'350 licensed CA agents on Zillow only — zero personal domain. Classic upsell.',
    fields:['Agent Name','City','Brokerage','License','Phone','Zillow','Email'],
    sampleRows:[
      {name:'Sandra M.',city:'Los Angeles',brokerage:'Keller Williams',license:'CA02134567',phone:'(310) 555-0189',zillow:'Yes',email:'smontoya@kw.com'},
      {name:'David L.',city:'San Francisco',brokerage:'Coldwell Banker',license:'CA02138901',phone:'(415) 555-0267',zillow:'Yes',email:'davidl@cbnorcal.com'},
      {name:'Maria T.',city:'San Diego',brokerage:'RE/MAX',license:'CA02142234',phone:'(619) 555-0341',zillow:'Yes',email:'mariatorres@remax.com'},
      {name:'James K.',city:'Sacramento',brokerage:'Century 21',license:'CA02145567',phone:'(916) 555-0428',zillow:'Yes',email:'—'},
      {name:'Priya N.',city:'Irvine',brokerage:'Berkshire Hathaway',license:'CA02148890',phone:'(949) 555-0513',zillow:'Yes',email:'priya.n@bhhsca.com'},
    ],
  },
  {
    id:'12', slug:'fl-plumbers-no-website',
    name:'FL Plumbers — No Website',
    category:'Contractors', region:'Florida', records:400, price:29, available:true,
    tagline:'400 licensed FL plumbers on Google Maps with active listings but zero website.',
    fields:['Business Name','City','Phone','Listing','Reviews','License'],
    sampleRows:[
      {name:'Fast Flow Plumbing',city:'Miami',phone:'(305) 555-0177',listing:'Active',reviews:'12',license:'CFC1234567'},
    ],
  },

  // ── Restaurants ──────────────────────────────────────────────────────────
  { id:'13', slug:'ca-restaurants-no-online-ordering', name:'CA Restaurants — No Online Ordering', category:'Restaurants', region:'California', records:480, price:39, available:true, tagline:'480 California restaurants with active Yelp pages but no online ordering or delivery integration.', fields:['Business Name','City','Phone','Yelp Rating','Website','Gap'], sampleRows:[] },
  { id:'14', slug:'ny-restaurants-under-reviewed', name:'NY Restaurants — Under-Reviewed', category:'Restaurants', region:'New York', records:420, price:39, available:true, tagline:'420 NYC-area restaurants open 3+ years with fewer than 25 Google reviews — reputation goldmine.', fields:['Business Name','Borough','Phone','Reviews','Rating','Email'], sampleRows:[] },
  { id:'15', slug:'midwest-restaurants-outdated-menus', name:'Midwest Restaurants — Outdated Menus', category:'Restaurants', region:'Midwest', records:390, price:29, available:true, tagline:'390 restaurants with printed-only menus and no digital version on their site.', fields:['Business Name','State','City','Phone','Website','Last Updated'], sampleRows:[] },
  { id:'16', slug:'southeast-restaurants-no-website', name:'Southeast Restaurants — No Website', category:'Restaurants', region:'Southeast', records:530, price:29, available:true, tagline:'530 restaurants across GA, FL, NC, SC with Google Maps but no domain.', fields:['Business Name','State','City','Phone','Reviews','Category'], sampleRows:[] },
  { id:'17', slug:'southwest-restaurants-catering', name:'SW Restaurants — Catering Upsell', category:'Restaurants', region:'Southwest', records:310, price:49, available:true, tagline:'310 restaurants with catering menus buried on page 3 — or no mention at all.', fields:['Business Name','City','Phone','Website','Catering Gap','Email'], sampleRows:[] },
  { id:'18', slug:'national-restaurants-broken-sites', name:'National Restaurants — Broken Sites', category:'Restaurants', region:'National', records:700, price:49, available:true, tagline:'700 restaurants nationwide with 404 errors, missing images, or dead contact forms.', fields:['Business Name','State','Phone','Website','Issue Type','Email'], sampleRows:[] },

  // ── Dentists ─────────────────────────────────────────────────────────────
  { id:'19', slug:'ca-dentists-no-reviews', name:'CA Dentists — Under 15 Reviews', category:'Dentists', region:'California', records:360, price:49, available:true, tagline:'360 California dental practices with under 15 Google reviews despite years of operation.', fields:['Practice Name','City','Phone','Reviews','Website','Email'], sampleRows:[] },
  { id:'20', slug:'tx-dentists-no-booking', name:'TX Dentists — No Online Booking', category:'Dentists', region:'Texas', records:440, price:49, available:true, tagline:'440 Texas dental offices still requiring patients to call — zero booking widget online.', fields:['Practice Name','City','Phone','Website','Booking Gap','Contact'], sampleRows:[] },
  { id:'21', slug:'midwest-dentists-slow-sites', name:'Midwest Dentists — Slow Sites', category:'Dentists', region:'Midwest', records:290, price:39, available:true, tagline:'290 dental practices with sites scoring under 40 on PageSpeed — patients bounce before booking.', fields:['Practice Name','State','City','Phone','PageSpeed','Website'], sampleRows:[] },
  { id:'22', slug:'northeast-dentists-no-seo', name:'Northeast Dentists — No Local SEO', category:'Dentists', region:'Northeast', records:320, price:59, available:true, tagline:'320 northeastern dental offices invisible in local search — no GBP, no citations.', fields:['Practice Name','State','City','Phone','Website','SEO Gap'], sampleRows:[] },
  { id:'23', slug:'national-dentists-no-website', name:'National Dentists — No Website', category:'Dentists', region:'National', records:500, price:39, available:true, tagline:'500 licensed dentists across the US with active Google profiles and zero website presence.', fields:['Practice Name','State','City','Phone','License','GBP Status'], sampleRows:[] },

  // ── Med Spas ─────────────────────────────────────────────────────────────
  { id:'24', slug:'tx-med-spas-no-instagram', name:'TX Med Spas — No Instagram', category:'Med Spas', region:'Texas', records:280, price:49, available:true, tagline:'280 Texas med spas with polished websites but no social presence whatsoever.', fields:['Business Name','City','Phone','Website','Social Gap','Email'], sampleRows:[] },
  { id:'25', slug:'fl-med-spas-weak-landing', name:'FL Med Spas — Weak Landing Pages', category:'Med Spas', region:'Florida', records:310, price:49, available:true, tagline:'310 Florida med spas with high ad spend but landing pages that convert under 1%.', fields:['Business Name','City','Phone','Website','Issue','Email'], sampleRows:[] },
  { id:'26', slug:'northeast-med-spas-no-reviews', name:'Northeast Med Spas — No Reviews', category:'Med Spas', region:'Northeast', records:240, price:49, available:true, tagline:'240 med spas in NY, NJ, CT with fewer than 20 Google reviews — credibility gap.', fields:['Business Name','State','City','Phone','Reviews','Website'], sampleRows:[] },
  { id:'27', slug:'national-med-spas-no-booking', name:'National Med Spas — No Booking', category:'Med Spas', region:'National', records:460, price:59, available:true, tagline:'460 med spas nationally with no online consultation booking — all phone or form only.', fields:['Business Name','State','City','Phone','Website','Gap'], sampleRows:[] },

  // ── Gyms ─────────────────────────────────────────────────────────────────
  { id:'28', slug:'southeast-gyms-no-website', name:'Southeast Gyms — No Website', category:'Gyms', region:'Southeast', records:350, price:29, available:true, tagline:'350 independent gyms across the Southeast with Google Maps but no domain.', fields:['Business Name','State','City','Phone','Reviews','GBP Status'], sampleRows:[] },
  { id:'29', slug:'tx-gyms-no-membership-portal', name:'TX Gyms — No Member Portal', category:'Gyms', region:'Texas', records:270, price:39, available:true, tagline:'270 Texas gyms without any online membership management — all done in person or by phone.', fields:['Business Name','City','Phone','Website','Gap','Email'], sampleRows:[] },
  { id:'30', slug:'ca-gyms-bad-social', name:'CA Gyms — Inactive Social', category:'Gyms', region:'California', records:310, price:39, available:true, tagline:'310 California gyms with Instagram accounts that have not posted in 6+ months.', fields:['Business Name','City','Instagram','Last Post','Followers','Website'], sampleRows:[] },
  { id:'31', slug:'national-gyms-no-class-schedule', name:'National Gyms — No Class Schedule', category:'Gyms', region:'National', records:520, price:39, available:true, tagline:'520 gyms nationwide with no online class schedule — customers cannot plan ahead.', fields:['Business Name','State','City','Phone','Website','Gap'], sampleRows:[] },

  // ── Contractors ───────────────────────────────────────────────────────────
  { id:'32', slug:'northeast-contractors-no-site', name:'Northeast Contractors — No Website', category:'Contractors', region:'Northeast', records:460, price:29, available:true, tagline:'460 licensed contractors in the Northeast with zero web presence — all referral only.', fields:['Business Name','State','City','Phone','License','Trade'], sampleRows:[] },
  { id:'33', slug:'ca-contractors-weak-sites', name:'CA Contractors — Weak Websites', category:'Contractors', region:'California', records:390, price:39, available:true, tagline:'390 California contractors with sites that have no project gallery, no reviews, no CTA.', fields:['Business Name','City','Phone','Website','Issue','License'], sampleRows:[] },
  { id:'34', slug:'southeast-contractors-no-reviews', name:'SE Contractors — No Reviews', category:'Contractors', region:'Southeast', records:440, price:39, available:true, tagline:'440 Southeast contractors with active businesses but fewer than 5 Google reviews.', fields:['Business Name','State','City','Phone','Reviews','Website'], sampleRows:[] },
  { id:'35', slug:'national-electricians-no-site', name:'National Electricians — No Website', category:'Contractors', region:'National', records:580, price:29, available:true, tagline:'580 licensed electricians nationwide — verified active, no website found.', fields:['Business Name','State','City','Phone','License','Reviews'], sampleRows:[] },

  // ── Real Estate ───────────────────────────────────────────────────────────
  { id:'36', slug:'tx-realtors-no-site', name:'TX Realtors — No Personal Website', category:'Real Estate', region:'Texas', records:420, price:59, available:true, tagline:'420 licensed Texas agents on Zillow and Realtor.com with no personal domain.', fields:['Agent Name','City','Brokerage','License','Phone','Email'], sampleRows:[] },
  { id:'37', slug:'fl-realtors-weak-sites', name:'FL Realtors — Weak Personal Sites', category:'Real Estate', region:'Florida', records:380, price:59, available:true, tagline:'380 Florida agents with personal sites but no IDX feed, blog, or lead capture.', fields:['Agent Name','City','Phone','Website','Issue','Email'], sampleRows:[] },
  { id:'38', slug:'northeast-realtors-no-video', name:'Northeast Realtors — No Video Tours', category:'Real Estate', region:'Northeast', records:290, price:49, available:true, tagline:'290 northeastern agents listing properties with no video walk-through — easy media upsell.', fields:['Agent Name','State','City','Phone','Brokerage','Email'], sampleRows:[] },
  { id:'39', slug:'national-property-managers-no-site', name:'National Property Managers — No Site', category:'Real Estate', region:'National', records:500, price:49, available:true, tagline:'500 property management companies with no website — running entirely on word of mouth.', fields:['Company Name','State','City','Phone','Units Managed','Email'], sampleRows:[] },

  // ── Salons ────────────────────────────────────────────────────────────────
  { id:'40', slug:'ca-salons-no-booking', name:'CA Salons — No Online Booking', category:'Salons', region:'California', records:370, price:39, available:true, tagline:'370 California salons with strong Yelp ratings but no Booksy, Square, or booking system.', fields:['Business Name','City','Phone','Yelp Rating','Website','Gap'], sampleRows:[] },
  { id:'41', slug:'tx-salons-weak-instagram', name:'TX Salons — Weak Instagram', category:'Salons', region:'Texas', records:290, price:39, available:true, tagline:'290 Texas salons with Instagram accounts under 200 followers and no consistent posting.', fields:['Business Name','City','Instagram','Followers','Last Post','Phone'], sampleRows:[] },
  { id:'42', slug:'southeast-salons-no-website', name:'SE Salons — No Website', category:'Salons', region:'Southeast', records:340, price:29, available:true, tagline:'340 salons across the Southeast with active Google listings but no domain.', fields:['Business Name','State','City','Phone','Reviews','GBP Status'], sampleRows:[] },
  { id:'43', slug:'national-barbershops-no-booking', name:'National Barbershops — No Booking', category:'Salons', region:'National', records:610, price:39, available:true, tagline:'610 barbershops nationwide taking walk-ins only — no app, no booking link.', fields:['Business Name','State','City','Phone','Website','Reviews'], sampleRows:[] },

  // ── Law Firms ─────────────────────────────────────────────────────────────
  { id:'44', slug:'northeast-law-no-seo', name:'Northeast Law Firms — No Local SEO', category:'Law Firms', region:'Northeast', records:280, price:59, available:true, tagline:'280 small law firms in NY, NJ, MA invisible in local search — no GBP or citations.', fields:['Firm Name','State','City','Phone','Website','SEO Gap'], sampleRows:[] },
  { id:'45', slug:'southeast-law-weak-sites', name:'SE Law Firms — Weak Websites', category:'Law Firms', region:'Southeast', records:240, price:59, available:true, tagline:'240 Southeast law firms with sites lacking practice area pages, bios, or contact forms.', fields:['Firm Name','State','City','Phone','Website','Issue'], sampleRows:[] },
  { id:'46', slug:'ca-law-no-reviews', name:'CA Law Firms — Under 10 Reviews', category:'Law Firms', region:'California', records:310, price:59, available:true, tagline:'310 California law firms with under 10 Google reviews — credibility gap in a competitive market.', fields:['Firm Name','City','Phone','Reviews','Rating','Website'], sampleRows:[] },
  { id:'47', slug:'national-law-no-contact-form', name:'National Law Firms — No Contact Form', category:'Law Firms', region:'National', records:430, price:49, available:true, tagline:'430 law firms nationally with websites but no functional contact form or intake system.', fields:['Firm Name','State','City','Phone','Website','Gap'], sampleRows:[] },

  // ── Auto Shops ────────────────────────────────────────────────────────────
  { id:'48', slug:'ca-auto-under-reviewed', name:'CA Auto Shops — Under-Reviewed', category:'Auto Shops', region:'California', records:410, price:39, available:true, tagline:'410 California auto shops open 2+ years with fewer than 15 Google reviews.', fields:['Business Name','City','Phone','Reviews','Rating','Website'], sampleRows:[] },
  { id:'49', slug:'tx-auto-no-website', name:'TX Auto Shops — No Website', category:'Auto Shops', region:'Texas', records:490, price:29, available:true, tagline:'490 Texas auto shops with active Google Maps listings and zero website.', fields:['Business Name','City','Phone','Reviews','GBP Status','License'], sampleRows:[] },
  { id:'50', slug:'northeast-auto-weak-sites', name:'Northeast Auto Shops — Weak Sites', category:'Auto Shops', region:'Northeast', records:330, price:39, available:true, tagline:'330 northeastern auto shops with sites lacking service menus, pricing, or booking.', fields:['Business Name','State','City','Phone','Website','Issue'], sampleRows:[] },
  { id:'51', slug:'southeast-auto-no-reviews', name:'SE Auto Shops — No Reviews', category:'Auto Shops', region:'Southeast', records:370, price:39, available:true, tagline:'370 auto shops across the Southeast with fewer than 8 Google reviews — easy pitch.', fields:['Business Name','State','City','Phone','Reviews','Website'], sampleRows:[] },

  // ── Chiropractors ─────────────────────────────────────────────────────────
  { id:'52', slug:'ca-chiro-no-booking', name:'CA Chiropractors — No Booking', category:'Chiropractors', region:'California', records:290, price:49, available:true, tagline:'290 California chiro practices with no online booking — patients must call every time.', fields:['Practice Name','City','Phone','Website','Gap','Email'], sampleRows:[] },
  { id:'53', slug:'fl-chiro-weak-sites', name:'FL Chiropractors — Weak Websites', category:'Chiropractors', region:'Florida', records:270, price:39, available:true, tagline:'270 Florida chiro offices with slow, mobile-broken sites losing new patients daily.', fields:['Practice Name','City','Phone','Website','Issue','Email'], sampleRows:[] },
  { id:'54', slug:'midwest-chiro-no-reviews', name:'Midwest Chiropractors — No Reviews', category:'Chiropractors', region:'Midwest', records:310, price:39, available:true, tagline:'310 Midwest chiro practices with under 12 Google reviews despite years in business.', fields:['Practice Name','State','City','Phone','Reviews','Website'], sampleRows:[] },
  { id:'55', slug:'national-chiro-no-seo', name:'National Chiropractors — No Local SEO', category:'Chiropractors', region:'National', records:480, price:49, available:true, tagline:'480 chiro practices nationally with no GBP listing or local citations — invisible to patients nearby.', fields:['Practice Name','State','City','Phone','Website','SEO Gap'], sampleRows:[] },
]
