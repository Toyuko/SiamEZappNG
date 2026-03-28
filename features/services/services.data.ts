export type ServiceItem = {
  slug: string;
  icon: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  benefits: string[];
  steps: string[];
  requirements?: string[];
  requiredDocuments?: string[];
  overviewHighlights?: { title: string; description: string }[];
  pricingPackages?: {
    name: string;
    price: string;
    isPopular?: boolean;
    ctaLabel: string;
    features: string[];
  }[];
  faqs?: { question: string; answer: string }[];
  processingTime?: string;
  rating?: string;
  consultationNote?: string;
  disclaimer?: string;
  category: 'Legal' | 'Translation' | 'Mobility' | 'Business' | 'Concierge';
  /** Optional catalog card — formatted as “From ฿{amount}” via i18n */
  cardPriceBaht?: string;
  cardBadge?: 'popular' | 'fast';
};

export const serviceCatalog: ServiceItem[] = [
  {
    slug: 'marriage-registration',
    icon: '💍',
    title: 'Marriage Registration',
    shortDescription: 'Complete support for Thai marriage registration and legal paperwork.',
    fullDescription:
      'Navigate Thai bureaucracy with confidence from document preparation to district office registration, so you can focus on what matters most.',
    benefits: ['Document checklist prepared upfront', 'Bilingual coordination support', 'Faster district office processing'],
    overviewHighlights: [
      {
        title: 'Document preparation',
        description:
          'Expert translation and certification of passports, affirmations, and supporting documents for Embassy, MFA, and Amphur submission.',
      },
      {
        title: 'Embassy and MFA liaison',
        description: 'We coordinate with your Embassy and the Thai Ministry of Foreign Affairs to secure attestations and MFA legalization.',
      },
      {
        title: 'Appointment and registration',
        description: 'We help schedule your Amphur appointment and accompany you for a smooth registration experience.',
      },
    ],
    requirements: [
      'Both partners must appear in person at the District Office (Amphur).',
      'Two witnesses are required (typically Thai nationals) with valid identification.',
      'Embassy-issued affirmation documents must be prepared and legalized before registration.',
      'Non-Thai documents must be translated into Thai before MFA submission.',
    ],
    requiredDocuments: [
      'Passport copies for both partners',
      'Embassy-issued Affirmation of Freedom to Marry',
      'Thai translations of foreign-language documents',
      'MFA legalization confirmation for required documents',
      'Divorce decree or death certificate (if previously married/widowed)',
    ],
    steps: [
      'Initial consultation and eligibility review',
      'Document preparation and translation',
      'Embassy and MFA legalization coordination',
      'District office appointment and registration support',
    ],
    pricingPackages: [
      {
        name: 'Basic assistance',
        price: 'THB 8,500 + fees',
        ctaLabel: 'Get started',
        features: [
          'Document checklist and preparation guide',
          'Translation referral and review',
          'Email support',
          'MFA submission support',
        ],
      },
      {
        name: 'Full service',
        price: 'THB 18,500 + fees',
        isPopular: true,
        ctaLabel: 'Start your application',
        features: [
          'Everything in Basic',
          'Full document preparation and translation coordination',
          'Embassy and MFA liaison',
          'Amphur appointment booking and accompaniment',
          'Dedicated case manager',
        ],
      },
      {
        name: 'Premium / VIP wedding',
        price: 'THB 45,000 + fees',
        ctaLabel: 'Inquire now',
        features: [
          'Everything in Full Service',
          'Priority processing and expedited appointments',
          'VIP Amphur experience',
          'Wedding day coordination (ceremony and legal)',
          'Certificate apostille support',
        ],
      },
    ],
    faqs: [
      {
        question: 'What is MFA legalization, and why do I need it for marriage registration?',
        answer:
          'MFA legalization verifies Embassy-issued and supporting documents at the Thai Ministry of Foreign Affairs so they can be accepted for official use in Thailand.',
      },
      {
        question: 'How long does MFA legalization and the full marriage process take?',
        answer:
          'MFA legalization usually takes 2-5 business days, while the full journey from preparation to Amphur registration often takes 2-4 weeks.',
      },
      {
        question: 'Can I handle the process myself, or should I use a service?',
        answer:
          'You can do it yourself, but the process is complex and time-consuming. Professional support helps reduce delays, document errors, and rejections.',
      },
      {
        question: 'Do both partners need to be present at the Amphur?',
        answer: 'Yes. Thai law requires both parties to appear in person with the required documents and witnesses.',
      },
    ],
    processingTime: 'MFA about 2-5 business days; full journey often 2-4 weeks (expedited options available).',
    rating: '4.9 / 5.0 based on 150+ reviews',
    consultationNote: 'Free initial 15-minute consultation available.',
    disclaimer:
      'SiamEZ offers professional assistance and consultancy services as an independent company and is not connected to or endorsed by the Thai government.',
    category: 'Legal',
    cardPriceBaht: '8,500',
    cardBadge: 'popular',
  },
  {
    slug: 'translation-services',
    icon: '📄',
    title: 'Translation Services',
    shortDescription: 'Certified translations for official documents, legal paperwork, and government submissions with accuracy and speed.',
    fullDescription:
      'Whether you need documents translated for visa applications, legal proceedings, business contracts, or personal matters, SiamEZ provides certified translation services recognized by Thai government agencies. Our team of professional translators ensures accuracy, proper formatting, and timely delivery for all your translation needs.',
    benefits: ['Certified translations accepted by Thai government agencies', 'Fast turnaround with express service for urgent cases'],
    overviewHighlights: [
      {
        title: 'Certified translations',
        description: 'All translations are certified and accepted by Thai government agencies.',
      },
      {
        title: 'Fast turnaround',
        description: 'Express service is available for urgent document translations.',
      },
    ],
    steps: ['Share your document and requirements', 'Translation and certification by our team', 'Receive your completed certified translation for submission'],
    requirements: ['Documents must be legible and complete', 'Provide source language and target language requirements', 'Tell us your expected submission deadline for standard or express processing'],
    requiredDocuments: ['Source document(s) to be translated', 'Any supporting pages required for official submission', 'Preferred spelling for names and key terms (if applicable)'],
    pricingPackages: [
      {
        name: 'Standard translation service',
        price: 'Quote-based',
        ctaLabel: 'Request custom quote',
        features: ['Certified translation for official use', 'Pricing based on language pair and document complexity', 'Standard turnaround: 2 - 5 business days'],
      },
    ],
    processingTime: '2 - 5 business days',
    rating: '4.9 / 5.0 based on 150+ reviews',
    consultationNote: 'Free initial 15-minute call with our experts.',
    category: 'Translation',
    cardBadge: 'fast',
  },
  {
    slug: 'driver-license',
    icon: '🚗',
    title: "Driver's License",
    shortDescription:
      'Fast-track appointments, group packages, and exam preparation handled by our bilingual team.',
    fullDescription:
      'Whether you are converting a foreign license, renewing, applying new for car or motorcycle, or need an International Driving Permit (IDP), SiamEZ coordinates schools, documents, and DLT appointments. We stay current with 2026 rules on health certificates, proof of address, and theory exam content so you avoid surprises at the office.',
    benefits: [
      'Coordinators on the ground in Bangkok',
      'English + Thai support via WhatsApp',
      'Updated for 2026 color-blind, reaction, and health checks',
      'Fixed package lines with optional add-ons only when needed',
    ],
    overviewHighlights: [
      {
        title: 'DLT-aligned process',
        description: 'We follow Department of Land Transport (DLT) requirements and office-specific cut-off times.',
      },
      {
        title: 'English + Thai support',
        description: 'Coordinators in Bangkok with WhatsApp updates so you always know the next step.',
      },
      {
        title: 'FastTrack & groups',
        description: 'Optional expedited booking plus coordinated slots for families and corporate groups.',
      },
      {
        title: '2026 health & vision checks',
        description: 'Guidance on medical certificates and color-blind / reaction tests used at Thai DLT offices.',
      },
      {
        title: 'Transparent packages',
        description: 'Clear base prices and add-ons with no hidden extra forms after you book.',
      },
      {
        title: 'Recognized school partners',
        description: 'We work with DLT-recognized driving schools used to foreign applicants.',
      },
      {
        title: 'Trusted by expats & digital nomads',
        description: 'We focus on Bangkok offices and keep communication in one thread from first question to licensed.',
      },
    ],
    steps: [
      'Choose your license service (conversion, renewal, new application, or IDP).',
      'Coordinator confirms checklist, package total, and available appointment windows.',
      'Complete required tests/classes and attend your DLT visit with guided support.',
    ],
    requirements: [
      'Allow at least three business days before your preferred date.',
      'Weekends are usually unavailable for DLT processing.',
      'If processing car and motorcycle together, expect a longer appointment block.',
      'Checklist can include health certificate, proof of address, and theory exam requirements under 2026 rules.',
    ],
    requiredDocuments: [
      'Passport and visa/entry documents',
      'Proof of address in Thailand',
      'Medical certificate (as required by DLT)',
      'Current foreign or Thai license (for conversion/renewal cases)',
      'Any supporting forms requested for your selected package/add-ons',
    ],
    pricingPackages: [
      {
        name: 'Conversion (foreign license)',
        price: 'Bike THB 4,500 | Car THB 6,000',
        ctaLabel: 'Book this package',
        features: ['DLT coordination and checklist support', 'Appointment planning', 'Guidance for required tests and documents'],
      },
      {
        name: 'Renewal',
        price: 'Bike THB 3,500 | Car THB 4,500',
        ctaLabel: 'Book this package',
        features: ['Renewal requirement review', 'Scheduling support', 'Document verification before office visit'],
      },
      {
        name: 'Apply new',
        price: 'Bike THB 3,500 | Car THB 5,000 | Both THB 7,500',
        isPopular: true,
        ctaLabel: 'Start your booking',
        features: ['New application checklist', 'School/mandatory session coordination', 'DLT visit support'],
      },
      {
        name: 'International Driving Permit (IDP)',
        price: 'THB 3,500',
        ctaLabel: 'Request this service',
        features: ['IDP eligibility and document guidance', 'Submission coordination', 'Status updates from your coordinator'],
      },
      {
        name: 'Optional add-ons',
        price: 'As selected',
        ctaLabel: 'Request custom quote',
        features: ['FastTrack booking: +THB 1,500', 'Translation letter: +THB 2,500', 'Address certificate assistance: +THB 2,500'],
      },
    ],
    processingTime: 'Varies by service (typically 1-3 visits).',
    rating: '4.9 / 5.0 based on 150+ reviews',
    consultationNote: 'Free initial 15-minute call. Payment supported via KBank transfer or PromptPay after coordinator confirmation.',
    disclaimer:
      'SiamEZ offers professional assistance as an independent company and is not connected to or endorsed by the Thai government or the DLT.',
    category: 'Mobility',
    cardPriceBaht: '3,500',
    cardBadge: 'popular',
  },
  {
    slug: 'visa-services',
    icon: '🛂',
    title: 'Visa Services',
    shortDescription: 'Comprehensive visa assistance including applications, extensions, and conversions for all visa types in Thailand.',
    fullDescription:
      "Thailand's visa system can be complex and ever-changing. SiamEZ provides expert guidance and assistance for all types of visas including tourist visas, business visas, retirement visas, education visas, and family visas. We help you understand requirements, prepare documents, and navigate the immigration process smoothly.",
    benefits: ['Up-to-date guidance on Thai immigration laws and regulations', 'Timely processing support to help keep applications on schedule'],
    overviewHighlights: [
      {
        title: 'Expert Knowledge',
        description: 'Up-to-date knowledge of Thai immigration laws and regulations.',
      },
      {
        title: 'Timely Processing',
        description: 'Ensure your visa applications are submitted on time.',
      },
    ],
    steps: ['Consultation and visa type assessment', 'Document preparation and application support', 'Submission, follow-up, and status guidance'],
    requirements: [
      'Visa requirements vary by visa category and applicant profile.',
      'Applicants should provide complete and accurate personal and travel details.',
      'Timelines and required documents depend on the selected visa type.',
    ],
    requiredDocuments: [
      'Passport and relevant immigration history documents',
      'Supporting financial or sponsor documents (as required)',
      'Additional category-specific forms for the selected visa type',
    ],
    pricingPackages: [
      {
        name: 'Visa services package',
        price: 'Quote-based',
        ctaLabel: 'Request custom quote',
        features: ['Support for applications, extensions, and conversions', 'Document review and preparation guidance', 'Process follow-up assistance'],
      },
    ],
    processingTime: '1 - 4 Weeks (varies by visa type)',
    rating: '4.9 / 5.0 based on 150+ reviews',
    consultationNote: 'Free initial 15-minute call with our visa experts.',
    category: 'Legal',
    cardBadge: 'fast',
  },
  {
    slug: 'police-clearance',
    icon: '🛡️',
    title: 'Police Clearance',
    shortDescription: 'Professional assistance obtaining police clearance certificates and background checks required for visas and work permits.',
    fullDescription:
      'Police clearance certificates are often required for visa applications, work permits, and various official purposes in Thailand. SiamEZ assists you in obtaining these certificates efficiently, handling the application process at the Royal Thai Police Headquarters and ensuring all requirements are met.',
    benefits: ['Official certification from Royal Thai Police Headquarters', 'Complete support from application to certificate collection'],
    overviewHighlights: [
      {
        title: 'Official Certification',
        description: 'Certificates are issued by Royal Thai Police Headquarters.',
      },
      {
        title: 'Complete Support',
        description: 'Full assistance from application to certificate collection.',
      },
    ],
    steps: ['Initial consultation and requirement check', 'Application preparation and submission support', 'Certificate collection and handover'],
    requirements: [
      'Police clearance requirements vary by destination country and purpose.',
      'Applicants must provide complete and accurate identity details.',
      'Processing timelines can vary based on official verification steps.',
    ],
    requiredDocuments: [
      'Passport copy and identification details',
      'Any supporting visa/work permit request documents',
      'Additional forms requested during police certificate processing',
    ],
    pricingPackages: [
      {
        name: 'Police clearance service',
        price: 'Quote-based',
        ctaLabel: 'Request custom quote',
        features: ['Application assistance', 'Royal Thai Police process coordination', 'Certificate collection support'],
      },
    ],
    processingTime: '2 - 4 Weeks',
    rating: '4.9 / 5.0 based on 150+ reviews',
    consultationNote: 'Free initial 15-minute call with our experts.',
    category: 'Legal',
  },
  {
    slug: 'vehicle-registration',
    icon: '🏍️',
    title: 'Vehicle Registration',
    shortDescription: 'Professional car and motorcycle registration in Bangkok with one-day processing for qualifying BKK-plated vehicles.',
    fullDescription:
      'SiamEZ provides professional vehicle registration assistance across Thailand. Whether you need to transfer ownership, renew your tax and insurance, change plates, or update your registration book, our team handles the paperwork and DLT process so you can focus on what matters.',
    benefits: [
      'Bangkok one-day processing for qualifying BKK-plated vehicles',
      'DLT paperwork, submissions, and coordination handled end-to-end',
      'Online document inspection before your visit',
    ],
    overviewHighlights: [
      {
        title: 'Bangkok one-day processing',
        description: 'For BKK plates, we can often complete registration in one working day when requirements are met.',
      },
      {
        title: 'DLT paperwork handled',
        description: 'We manage forms, submissions, and coordination with the Department of Land Transport on your behalf.',
      },
      {
        title: 'Online document inspection',
        description: 'Submit your documents for review before you visit so we can confirm everything is in order.',
      },
    ],
    steps: ['Share your vehicle type and registration requirement', 'Team reviews documents and confirms Bangkok/province timeline', 'DLT processing is completed and status is updated to you'],
    requirements: [
      'Car requirements: original condition, no modifications, no black smoke.',
      'Motorcycle requirements: original condition, no loud exhaust.',
      'Vehicles from other provinces may require additional processing time.',
      'DLT government fees are separate from service fees.',
    ],
    requiredDocuments: [
      'Vehicle registration book and owner identification documents',
      'Supporting transfer/renewal/change paperwork depending on request',
      'Additional evidence for special cases (for example engine change invoice)',
    ],
    pricingPackages: [
      {
        name: 'Car registration service fees (Bangkok process)',
        price: 'BKK plate THB 3,500',
        ctaLabel: 'Book this service',
        features: ['Other province plate: +THB 1,500', 'Swap plate: THB 1,500', 'Not including DLT fees'],
      },
      {
        name: 'Motorcycle registration service fees (Bangkok process)',
        price: 'BKK plate THB 2,000',
        ctaLabel: 'Book this service',
        features: [
          'Different province: +THB 1,000',
          'Renew tax/insurance under 5 years: THB 700',
          'Renew tax/insurance over 5 years: THB 1,200',
          'Not including DLT fees',
        ],
      },
      {
        name: 'Additional services',
        price: 'As required',
        ctaLabel: 'Request custom quote',
        features: [
          'Change color: THB 1,000',
          'Change engine: THB 1,000 (invoice required)',
          'Lost book (green/blue): THB 1,500',
          'Exhaust over 95 dB: THB 1,500 - 2,500',
          'Missing documents: staff inspection required',
        ],
      },
    ],
    processingTime: 'Bangkok (BKK plates): often 1 business day; other provinces: timeline on inquiry',
    rating: '4.9 / 5.0 based on 150+ reviews',
    consultationNote: 'Free initial 15-minute call with our experts.',
    disclaimer:
      'SiamEZ offers professional assistance and consultancy services as an independent company and is not connected to or endorsed by the Thai government.',
    category: 'Mobility',
    cardPriceBaht: '2,000',
  },
  {
    slug: 'construction-handyman',
    icon: '🛠️',
    title: 'Construction & Handyman',
    shortDescription:
      'Professional home repairs, renovations, and construction services for residential and commercial properties in Thailand.',
    fullDescription:
      'From minor repairs to major renovations, SiamEZ connects you with skilled, licensed contractors and handymen. We handle everything from finding the right professionals to project management, ensuring quality workmanship and timely completion. Our network includes electricians, plumbers, carpenters, painters, and general contractors.',
    benefits: ['Licensed and insured professionals', 'Quality workmanship with project follow-up'],
    overviewHighlights: [
      {
        title: 'Licensed Professionals',
        description: 'All contractors are licensed and insured for your peace of mind.',
      },
      {
        title: 'Quality Guaranteed',
        description: 'We ensure quality workmanship and follow-up on all projects.',
      },
    ],
    steps: ['Share your repair or renovation requirements', 'Get matched with qualified professionals and project scope', 'Start work with coordinated updates and quality follow-up'],
    requirements: [
      'Project scope, location, and timeline should be shared during consultation.',
      'Final timelines depend on project size and contractor availability.',
      'Any building or property permissions should be prepared when required.',
    ],
    requiredDocuments: [
      'Property/location details for the requested work',
      'Photos or measurements of the repair/renovation area (if available)',
      'Any relevant building management or owner approvals',
    ],
    pricingPackages: [
      {
        name: 'Construction & handyman service',
        price: 'Quote-based',
        ctaLabel: 'Request custom quote',
        features: ['Access to licensed contractors and handymen', 'Project coordination support', 'Quality follow-up after work completion'],
      },
    ],
    processingTime: 'Varies by Project',
    rating: '4.9 / 5.0 based on 150+ reviews',
    consultationNote: 'Free initial 15-minute call with our experts.',
    category: 'Business',
  },
  {
    slug: 'private-driver-service',
    icon: '🧑‍✈️',
    title: 'Private Driver Service',
    shortDescription: 'Professional private drivers for daily use, business trips, or special occasions with flexible packages.',
    fullDescription:
      'Need a reliable driver for daily commutes, business meetings, or special events? SiamEZ offers private driver services with flexible packages. Our professional drivers are experienced, punctual, and familiar with Bangkok and surrounding areas. Choose from hourly, daily, or monthly packages.',
    benefits: ['Licensed, experienced, and background-checked drivers', 'Flexible hourly, daily, or monthly packages'],
    overviewHighlights: [
      {
        title: 'Professional Drivers',
        description: 'All drivers are licensed, experienced, and background-checked.',
      },
      {
        title: 'Flexible Packages',
        description: 'Hourly, daily, or monthly packages to suit your needs.',
      },
    ],
    steps: ['Share your schedule and transport requirements', 'Select the package and service duration', 'Driver assignment and trip coordination'],
    requirements: [
      'Booking details should include pickup points, schedule, and service duration.',
      'Package selection depends on your travel frequency and use case.',
      'Availability may vary based on date, location, and demand.',
    ],
    pricingPackages: [
      {
        name: 'Private driver service',
        price: 'Quote-based',
        ctaLabel: 'Request custom quote',
        features: ['Daily use, business trip, and event support', 'Flexible package options', 'Professional and punctual drivers'],
      },
    ],
    processingTime: '1 - 3 Business Days',
    rating: '4.9 / 5.0 based on 150+ reviews',
    consultationNote: 'Free initial 15-minute call with our experts.',
    category: 'Concierge',
  },
  {
    slug: 'transportation-services',
    icon: '🚐',
    title: 'Transportation Services',
    shortDescription: 'Reliable airport transfers, city tours, and inter-city transportation with comfortable, well-maintained vehicles.',
    fullDescription:
      'SiamEZ provides professional transportation services throughout Thailand. From airport pickups to city tours and inter-city travel, we offer comfortable vehicles with experienced drivers. Our fleet includes sedans, SUVs, vans, and buses to accommodate any group size.',
    benefits: ['Safe, well-maintained vehicles with licensed experienced drivers', 'Punctual pickups and drop-offs'],
    overviewHighlights: [
      {
        title: 'Safe & Reliable',
        description: 'All vehicles are well-maintained and drivers are licensed and experienced.',
      },
      {
        title: 'Punctual Service',
        description: 'On-time pickups and drop-offs guaranteed.',
      },
    ],
    steps: ['Share route, date, and passenger details', 'Receive recommended vehicle and booking confirmation', 'Pickup and transportation service completion'],
    requirements: [
      'Provide pickup and drop-off locations with preferred timing.',
      'Select vehicle size based on passenger count and luggage.',
      'Advance booking is recommended for peak periods and larger groups.',
    ],
    pricingPackages: [
      {
        name: 'Transportation service',
        price: 'Quote-based',
        ctaLabel: 'Request custom quote',
        features: ['Airport transfers, city tours, and inter-city travel', 'Sedans, SUVs, vans, and buses available', 'Flexible booking support'],
      },
    ],
    processingTime: 'Same Day - Advance Booking',
    rating: '4.9 / 5.0 based on 150+ reviews',
    consultationNote: 'Free initial 15-minute call with our experts.',
    category: 'Concierge',
  },
  {
    slug: 'event-planning-venue-services',
    icon: '🎉',
    title: 'Bespoke Event Planning & Exclusive Venue Hire',
    shortDescription:
      "Elevate your celebrations at Bangkok's premier speakeasy with curated event experiences.",
    fullDescription:
      'From corporate gatherings to private celebrations and exclusive VIP experiences, SiamEZ and The Red Door Bkk combine professional coordination with an intimate venue in the heart of Bangkok. Tell us your vision and we handle the details so you can enjoy the moment.',
    benefits: [
      'Corporate events with full support',
      'Private celebrations with end-to-end coordination',
      'VIP table bookings with premium service and ambiance',
    ],
    overviewHighlights: [
      {
        title: 'Corporate events',
        description: 'Product launches, team offsites, and client entertaining in a distinguished setting with full event support.',
      },
      {
        title: 'Private celebrations',
        description: 'Birthdays, anniversaries, and intimate gatherings with complete coordination.',
      },
      {
        title: 'VIP table bookings',
        description: 'Reserve exclusive space for a premium night out experience.',
      },
    ],
    steps: ['Share your event vision, guest count, and preferred dates', 'Receive a tailored proposal for planning and venue setup', 'Confirm booking and execute event with SiamEZ coordination'],
    requirements: [
      'Event concept, expected attendance, and date options are needed for planning.',
      'Complex events may require longer planning and response times.',
      'Venue setup and service details are finalized during consultation.',
    ],
    pricingPackages: [
      {
        name: 'Event planning and venue hire',
        price: 'Quote-based',
        ctaLabel: 'Request custom quote',
        features: ['SiamEZ planning and coordination', 'Exclusive venue options with The Red Door Bkk', 'Tailored event experiences for corporate and private occasions'],
      },
    ],
    processingTime: 'We typically reply within 2-5 business days (complex events may take longer)',
    rating: '4.9 / 5.0 based on 150+ reviews',
    consultationNote: 'Free initial 15-minute call with our experts.',
    category: 'Business',
  },
];

export const serviceCategories = ['All', 'Legal', 'Translation', 'Mobility', 'Business', 'Concierge'] as const;

