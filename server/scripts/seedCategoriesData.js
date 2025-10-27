export default [
  {
    name: 'Graphics & Design',
    slug: 'graphics-design',
    description: 'Logo design, brand identity, illustrations, and more',
    icon: '🎨',
    order: 1,
    subcategories: [
      { name: 'Logo Design', slug: 'logo-design', description: 'Custom logo creation' },
      { name: 'Brand Identity', slug: 'brand-identity', description: 'Complete branding packages' },
      { name: 'Illustration', slug: 'illustration', description: 'Custom illustrations' },
      { name: 'Graphic Design', slug: 'graphic-design', description: 'Posters, flyers, banners' },
      { name: 'Packaging Design', slug: 'packaging-design', description: 'Product packaging' },
      { name: 'Social Media Design', slug: 'social-media-design', description: 'Posts and covers' },
    ]
  },
  {
    name: 'Digital Marketing',
    slug: 'digital-marketing',
    description: 'SEO, social media marketing, content marketing, and more',
    icon: '📱',
    order: 2,
    subcategories: [
      { name: 'SEO', slug: 'seo', description: 'Search engine optimization' },
      { name: 'Social Media Marketing', slug: 'social-media-marketing', description: 'Facebook, Instagram, Twitter' },
      { name: 'Content Marketing', slug: 'content-marketing', description: 'Blog posts, articles' },
      { name: 'Email Marketing', slug: 'email-marketing', description: 'Email campaigns' },
      { name: 'PPC Advertising', slug: 'ppc-advertising', description: 'Google Ads, Facebook Ads' },
      { name: 'Influencer Marketing', slug: 'influencer-marketing', description: 'Influencer campaigns' },
    ]
  },
  {
    name: 'Writing & Translation',
    slug: 'writing-translation',
    description: 'Content writing, copywriting, translation services',
    icon: '✍️',
    order: 3,
    subcategories: [
      { name: 'Article Writing', slug: 'article-writing', description: 'Blog posts and articles' },
      { name: 'Copywriting', slug: 'copywriting', description: 'Sales copy and ads' },
      { name: 'Technical Writing', slug: 'technical-writing', description: 'Documentation and guides' },
      { name: 'Translation', slug: 'translation', description: 'Language translation' },
      { name: 'Proofreading', slug: 'proofreading', description: 'Grammar and spelling check' },
      { name: 'Creative Writing', slug: 'creative-writing', description: 'Stories and scripts' },
    ]
  },
  {
    name: 'Video & Animation',
    slug: 'video-animation',
    description: 'Video editing, animation, motion graphics',
    icon: '🎬',
    order: 4,
    subcategories: [
      { name: 'Video Editing', slug: 'video-editing', description: 'Professional video editing' },
      { name: 'Animation', slug: 'animation', description: '2D and 3D animation' },
      { name: 'Motion Graphics', slug: 'motion-graphics', description: 'Animated graphics' },
      { name: 'Whiteboard Animation', slug: 'whiteboard-animation', description: 'Explainer videos' },
      { name: 'Video Production', slug: 'video-production', description: 'Full video production' },
      { name: 'Intro & Outro', slug: 'intro-outro', description: 'Video intros and outros' },
    ]
  },
  {
    name: 'Music & Audio',
    slug: 'music-audio',
    description: 'Voice over, music production, audio editing',
    icon: '🎵',
    order: 5,
    subcategories: [
      { name: 'Voice Over', slug: 'voice-over', description: 'Professional voice recording' },
      { name: 'Music Production', slug: 'music-production', description: 'Original music creation' },
      { name: 'Audio Editing', slug: 'audio-editing', description: 'Audio post-production' },
      { name: 'Sound Design', slug: 'sound-design', description: 'Sound effects and design' },
      { name: 'Mixing & Mastering', slug: 'mixing-mastering', description: 'Audio mixing and mastering' },
      { name: 'Podcast Editing', slug: 'podcast-editing', description: 'Podcast production' },
    ]
  },
  {
    name: 'Programming & Tech',
    slug: 'programming-tech',
    description: 'Web development, mobile apps, software development',
    icon: '💻',
    order: 6,
    subcategories: [
      { name: 'Web Development', slug: 'web-development', description: 'Website creation' },
      { name: 'Mobile Apps', slug: 'mobile-apps', description: 'iOS and Android apps' },
      { name: 'WordPress', slug: 'wordpress', description: 'WordPress development' },
      { name: 'E-commerce', slug: 'e-commerce', description: 'Online store development' },
      { name: 'Database', slug: 'database', description: 'Database design and management' },
      { name: 'API Development', slug: 'api-development', description: 'REST and GraphQL APIs' },
    ]
  },
  {
    name: 'Business',
    slug: 'business',
    description: 'Virtual assistant, data entry, market research',
    icon: '💼',
    order: 7,
    subcategories: [
      { name: 'Virtual Assistant', slug: 'virtual-assistant', description: 'Administrative support' },
      { name: 'Data Entry', slug: 'data-entry', description: 'Data input and management' },
      { name: 'Market Research', slug: 'market-research', description: 'Market analysis' },
      { name: 'Business Plans', slug: 'business-plans', description: 'Business plan writing' },
      { name: 'Financial Consulting', slug: 'financial-consulting', description: 'Financial advice' },
      { name: 'Legal Consulting', slug: 'legal-consulting', description: 'Legal advice' },
    ]
  },
  {
    name: 'AI Services',
    slug: 'ai-services',
    description: 'AI development, machine learning, chatbots',
    icon: '🤖',
    order: 8,
    subcategories: [
      { name: 'AI Development', slug: 'ai-development', description: 'AI model development' },
      { name: 'Machine Learning', slug: 'machine-learning', description: 'ML solutions' },
      { name: 'Chatbot Development', slug: 'chatbot-development', description: 'AI chatbots' },
      { name: 'Data Science', slug: 'data-science', description: 'Data analysis and insights' },
      { name: 'Computer Vision', slug: 'computer-vision', description: 'Image recognition' },
      { name: 'Natural Language Processing', slug: 'nlp', description: 'Text processing' },
    ]
  },
  {
    name: 'Lifestyle',
    slug: 'lifestyle',
    description: 'Gaming, fitness, travel, relationship advice',
    icon: '🌟',
    order: 9,
    subcategories: [
      { name: 'Gaming', slug: 'gaming', description: 'Gaming services' },
      { name: 'Fitness', slug: 'fitness', description: 'Fitness coaching' },
      { name: 'Travel', slug: 'travel', description: 'Travel planning' },
      { name: 'Relationship Advice', slug: 'relationship-advice', description: 'Relationship coaching' },
      { name: 'Nutrition', slug: 'nutrition', description: 'Diet and nutrition' },
      { name: 'Life Coaching', slug: 'life-coaching', description: 'Personal development' },
    ]
  },
  {
    name: 'Photography',
    slug: 'photography',
    description: 'Photo editing, product photography, portrait photography',
    icon: '📷',
    order: 10,
    subcategories: [
      { name: 'Photo Editing', slug: 'photo-editing', description: 'Professional photo editing' },
      { name: 'Product Photography', slug: 'product-photography', description: 'Product photos' },
      { name: 'Portrait Photography', slug: 'portrait-photography', description: 'Portrait photos' },
      { name: 'Event Photography', slug: 'event-photography', description: 'Event coverage' },
      { name: 'Real Estate Photography', slug: 'real-estate-photography', description: 'Property photos' },
      { name: 'Food Photography', slug: 'food-photography', description: 'Food photos' },
    ]
  },
  {
    name: 'Blockchain & Crypto',
    slug: 'blockchain-crypto',
    description: 'Smart contracts, NFT, DeFi, blockchain development',
    icon: '⛓️',
    order: 11,
    subcategories: [
      { name: 'Smart Contracts', slug: 'smart-contracts', description: 'Solidity development' },
      { name: 'NFT Development', slug: 'nft-development', description: 'NFT creation' },
      { name: 'DeFi', slug: 'defi', description: 'DeFi applications' },
      { name: 'Blockchain Development', slug: 'blockchain-development', description: 'Blockchain solutions' },
      { name: 'Crypto Trading', slug: 'crypto-trading', description: 'Trading strategies' },
      { name: 'Token Development', slug: 'token-development', description: 'Cryptocurrency tokens' },
    ]
  },
  {
    name: '3D Design',
    slug: '3d-design',
    description: '3D modeling, rendering, product design',
    icon: '🎲',
    order: 12,
    subcategories: [
      { name: '3D Modeling', slug: '3d-modeling', description: '3D model creation' },
      { name: '3D Rendering', slug: '3d-rendering', description: 'Photorealistic renders' },
      { name: 'Product Design', slug: 'product-design', description: '3D product design' },
      { name: 'Architecture Design', slug: 'architecture-design', description: 'Architectural visualization' },
      { name: 'Character Design', slug: 'character-design', description: '3D characters' },
      { name: '3D Printing', slug: '3d-printing', description: 'Print-ready models' },
    ]
  },
  {
    name: 'Data',
    slug: 'data',
    description: 'Data analysis, data visualization, data mining',
    icon: '📊',
    order: 13,
    subcategories: [
      { name: 'Data Analysis', slug: 'data-analysis', description: 'Statistical analysis' },
      { name: 'Data Visualization', slug: 'data-visualization', description: 'Charts and dashboards' },
      { name: 'Data Mining', slug: 'data-mining', description: 'Extract insights from data' },
      { name: 'Data Entry', slug: 'data-entry-service', description: 'Professional data entry' },
      { name: 'Excel Expert', slug: 'excel-expert', description: 'Excel automation and formulas' },
      { name: 'Database Management', slug: 'database-management', description: 'Database administration' },
    ]
  },
  {
    name: 'E-commerce',
    slug: 'e-commerce-category',
    description: 'Online store setup, product listing, store management',
    icon: '🛒',
    order: 14,
    subcategories: [
      { name: 'Shopify Development', slug: 'shopify-development', description: 'Shopify store setup' },
      { name: 'WooCommerce', slug: 'woocommerce', description: 'WordPress e-commerce' },
      { name: 'Product Listing', slug: 'product-listing', description: 'Product upload and optimization' },
      { name: 'Amazon FBA', slug: 'amazon-fba', description: 'Amazon seller services' },
      { name: 'Dropshipping', slug: 'dropshipping', description: 'Dropshipping store setup' },
      { name: 'E-commerce Marketing', slug: 'ecommerce-marketing', description: 'Online store promotion' },
    ]
  },
  {
    name: 'Legal',
    slug: 'legal',
    description: 'Legal consulting, contract writing, legal research',
    icon: '⚖️',
    order: 15,
    subcategories: [
      { name: 'Legal Consulting', slug: 'legal-consulting-service', description: 'Legal advice' },
      { name: 'Contract Writing', slug: 'contract-writing', description: 'Legal contracts and agreements' },
      { name: 'Legal Research', slug: 'legal-research', description: 'Legal case research' },
      { name: 'Terms & Conditions', slug: 'terms-conditions', description: 'T&C and privacy policy' },
      { name: 'Trademark Registration', slug: 'trademark-registration', description: 'Trademark services' },
      { name: 'Business Registration', slug: 'business-registration', description: 'Company formation' },
    ]
  },
  {
    name: 'Architecture & Interior',
    slug: 'architecture-interior',
    description: 'Architecture design, interior design, floor plans',
    icon: '🏛️',
    order: 16,
    subcategories: [
      { name: 'Architecture Design', slug: 'architecture-design-service', description: 'Building design' },
      { name: 'Interior Design', slug: 'interior-design', description: 'Interior decoration' },
      { name: 'Floor Plans', slug: 'floor-plans', description: '2D and 3D floor plans' },
      { name: 'Landscape Design', slug: 'landscape-design', description: 'Garden and outdoor design' },
      { name: 'AutoCAD', slug: 'autocad', description: 'CAD drawings' },
      { name: 'SketchUp', slug: 'sketchup', description: '3D modeling with SketchUp' },
    ]
  },
  {
    name: 'Fashion & Modeling',
    slug: 'fashion-modeling',
    description: 'Fashion design, modeling, styling',
    icon: '👗',
    order: 17,
    subcategories: [
      { name: 'Fashion Design', slug: 'fashion-design', description: 'Clothing design' },
      { name: 'Fashion Illustration', slug: 'fashion-illustration', description: 'Fashion sketches' },
      { name: 'Modeling', slug: 'modeling', description: 'Fashion modeling' },
      { name: 'Styling', slug: 'styling', description: 'Personal styling' },
      { name: 'Pattern Making', slug: 'pattern-making', description: 'Garment patterns' },
      { name: 'Fashion Consulting', slug: 'fashion-consulting', description: 'Fashion advice' },
    ]
  },
  {
    name: 'Gaming',
    slug: 'gaming-category',
    description: 'Game development, game design, game testing',
    icon: '🎮',
    order: 18,
    subcategories: [
      { name: 'Game Development', slug: 'game-development', description: 'Full game creation' },
      { name: 'Unity Development', slug: 'unity-development', description: 'Unity 3D games' },
      { name: 'Unreal Engine', slug: 'unreal-engine', description: 'Unreal Engine games' },
      { name: 'Game Design', slug: 'game-design', description: 'Game mechanics and levels' },
      { name: 'Game Art', slug: 'game-art', description: 'Game graphics and assets' },
      { name: 'Game Testing', slug: 'game-testing', description: 'QA and bug testing' },
    ]
  },
  {
    name: 'Education & Training',
    slug: 'education-training',
    description: 'Online tutoring, course creation, training',
    icon: '📚',
    order: 19,
    subcategories: [
      { name: 'Online Tutoring', slug: 'online-tutoring', description: 'One-on-one teaching' },
      { name: 'Course Creation', slug: 'course-creation', description: 'Online course development' },
      { name: 'E-learning', slug: 'e-learning', description: 'E-learning content' },
      { name: 'Academic Writing', slug: 'academic-writing', description: 'Research papers and essays' },
      { name: 'Presentation Design', slug: 'presentation-design', description: 'PowerPoint and Keynote' },
      { name: 'Training Materials', slug: 'training-materials', description: 'Training content creation' },
    ]
  },
  {
    name: 'Health & Wellness',
    slug: 'health-wellness',
    description: 'Fitness coaching, nutrition, mental health',
    icon: '💪',
    order: 20,
    subcategories: [
      { name: 'Fitness Coaching', slug: 'fitness-coaching', description: 'Personal training' },
      { name: 'Nutrition Planning', slug: 'nutrition-planning', description: 'Diet and meal plans' },
      { name: 'Yoga Instruction', slug: 'yoga-instruction', description: 'Yoga classes' },
      { name: 'Mental Health', slug: 'mental-health', description: 'Counseling and therapy' },
      { name: 'Meditation', slug: 'meditation', description: 'Meditation guidance' },
      { name: 'Weight Loss', slug: 'weight-loss', description: 'Weight loss programs' },
    ]
  },
  {
    name: 'Automotive',
    slug: 'automotive',
    description: 'Car design, automotive consulting, vehicle services',
    icon: '🚗',
    order: 21,
    subcategories: [
      { name: 'Car Design', slug: 'car-design', description: 'Vehicle design and rendering' },
      { name: 'Automotive Consulting', slug: 'automotive-consulting', description: 'Car buying advice' },
      { name: 'Car Modification', slug: 'car-modification', description: 'Custom car modifications' },
      { name: 'Auto CAD', slug: 'auto-cad', description: 'Automotive CAD drawings' },
      { name: 'Vehicle Inspection', slug: 'vehicle-inspection', description: 'Pre-purchase inspection' },
      { name: 'Auto Parts', slug: 'auto-parts', description: 'Parts sourcing and advice' },
    ]
  },
  {
    name: 'Real Estate',
    slug: 'real-estate',
    description: 'Property listing, real estate consulting, virtual tours',
    icon: '🏠',
    order: 22,
    subcategories: [
      { name: 'Property Listing', slug: 'property-listing', description: 'Real estate listings' },
      { name: 'Real Estate Consulting', slug: 'real-estate-consulting', description: 'Property investment advice' },
      { name: 'Virtual Tours', slug: 'virtual-tours', description: '360° property tours' },
      { name: 'Property Management', slug: 'property-management', description: 'Property management services' },
      { name: 'Real Estate Marketing', slug: 'real-estate-marketing', description: 'Property promotion' },
      { name: 'Home Staging', slug: 'home-staging', description: 'Property staging advice' },
    ]
  },
  {
    name: 'Event Planning',
    slug: 'event-planning',
    description: 'Event management, wedding planning, party planning',
    icon: '🎉',
    order: 23,
    subcategories: [
      { name: 'Event Management', slug: 'event-management', description: 'Full event planning' },
      { name: 'Wedding Planning', slug: 'wedding-planning', description: 'Wedding coordination' },
      { name: 'Party Planning', slug: 'party-planning', description: 'Birthday and parties' },
      { name: 'Event Design', slug: 'event-design', description: 'Event decoration and design' },
      { name: 'Virtual Events', slug: 'virtual-events', description: 'Online event planning' },
      { name: 'Corporate Events', slug: 'corporate-events', description: 'Business event planning' },
    ]
  },
  {
    name: 'Mobile Apps',
    slug: 'mobile-apps-category',
    description: 'iOS development, Android development, cross-platform apps',
    icon: '📱',
    order: 24,
    subcategories: [
      { name: 'iOS Development', slug: 'ios-development', description: 'iPhone and iPad apps' },
      { name: 'Android Development', slug: 'android-development', description: 'Android apps' },
      { name: 'React Native', slug: 'react-native', description: 'Cross-platform apps' },
      { name: 'Flutter', slug: 'flutter', description: 'Flutter development' },
      { name: 'App Design', slug: 'app-design', description: 'Mobile UI/UX design' },
      { name: 'App Testing', slug: 'app-testing', description: 'Mobile app QA' },
    ]
  },
  {
    name: 'Consulting',
    slug: 'consulting',
    description: 'Business consulting, career coaching, strategy',
    icon: '💡',
    order: 25,
    subcategories: [
      { name: 'Business Consulting', slug: 'business-consulting', description: 'Business strategy' },
      { name: 'Career Coaching', slug: 'career-coaching', description: 'Career development' },
      { name: 'HR Consulting', slug: 'hr-consulting', description: 'Human resources' },
      { name: 'Management Consulting', slug: 'management-consulting', description: 'Management advice' },
      { name: 'Startup Consulting', slug: 'startup-consulting', description: 'Startup guidance' },
      { name: 'Strategy Consulting', slug: 'strategy-consulting', description: 'Strategic planning' },
    ]
  },
  {
    name: 'Accounting & Finance',
    slug: 'accounting-finance',
    description: 'Bookkeeping, tax preparation, financial planning',
    icon: '💰',
    order: 26,
    subcategories: [
      { name: 'Bookkeeping', slug: 'bookkeeping', description: 'Financial record keeping' },
      { name: 'Tax Preparation', slug: 'tax-preparation', description: 'Tax filing services' },
      { name: 'Financial Planning', slug: 'financial-planning', description: 'Financial advice' },
      { name: 'Accounting', slug: 'accounting', description: 'Accounting services' },
      { name: 'Payroll', slug: 'payroll', description: 'Payroll management' },
      { name: 'QuickBooks', slug: 'quickbooks', description: 'QuickBooks services' },
    ]
  },
  {
    name: 'Sales & Lead Generation',
    slug: 'sales-lead-generation',
    description: 'Lead generation, sales funnel, cold calling',
    icon: '📈',
    order: 27,
    subcategories: [
      { name: 'Lead Generation', slug: 'lead-generation', description: 'Generate quality leads' },
      { name: 'Sales Funnel', slug: 'sales-funnel', description: 'Funnel optimization' },
      { name: 'Cold Calling', slug: 'cold-calling', description: 'Outbound sales calls' },
      { name: 'Email Outreach', slug: 'email-outreach', description: 'Email campaigns' },
      { name: 'LinkedIn Marketing', slug: 'linkedin-marketing', description: 'LinkedIn lead gen' },
      { name: 'CRM Setup', slug: 'crm-setup', description: 'CRM configuration' },
    ]
  },
  {
    name: 'Customer Service',
    slug: 'customer-service',
    description: 'Customer support, chat support, call center',
    icon: '🎧',
    order: 28,
    subcategories: [
      { name: 'Customer Support', slug: 'customer-support', description: 'Support services' },
      { name: 'Chat Support', slug: 'chat-support', description: 'Live chat support' },
      { name: 'Call Center', slug: 'call-center', description: 'Phone support' },
      { name: 'Email Support', slug: 'email-support', description: 'Email customer service' },
      { name: 'Technical Support', slug: 'technical-support', description: 'Tech support' },
      { name: 'Help Desk', slug: 'help-desk', description: 'Help desk services' },
    ]
  },
  {
    name: 'Product Management',
    slug: 'product-management',
    description: 'Product strategy, roadmap, user research',
    icon: '📦',
    order: 29,
    subcategories: [
      { name: 'Product Strategy', slug: 'product-strategy', description: 'Product planning' },
      { name: 'Product Roadmap', slug: 'product-roadmap', description: 'Roadmap creation' },
      { name: 'User Research', slug: 'user-research', description: 'User studies' },
      { name: 'Product Launch', slug: 'product-launch', description: 'Launch planning' },
      { name: 'Feature Prioritization', slug: 'feature-prioritization', description: 'Feature planning' },
      { name: 'Product Analytics', slug: 'product-analytics', description: 'Product metrics' },
    ]
  },
  {
    name: 'UX/UI Design',
    slug: 'ux-ui-design',
    description: 'User experience, user interface, prototyping',
    icon: '🎨',
    order: 30,
    subcategories: [
      { name: 'UX Design', slug: 'ux-design', description: 'User experience design' },
      { name: 'UI Design', slug: 'ui-design', description: 'User interface design' },
      { name: 'Prototyping', slug: 'prototyping', description: 'Interactive prototypes' },
      { name: 'Wireframing', slug: 'wireframing', description: 'Wireframe creation' },
      { name: 'Figma Design', slug: 'figma-design', description: 'Figma projects' },
      { name: 'Adobe XD', slug: 'adobe-xd', description: 'Adobe XD design' },
    ]
  },
  {
    name: 'DevOps & Cloud',
    slug: 'devops-cloud',
    description: 'AWS, Azure, Docker, Kubernetes, CI/CD',
    icon: '☁️',
    order: 31,
    subcategories: [
      { name: 'AWS', slug: 'aws', description: 'Amazon Web Services' },
      { name: 'Azure', slug: 'azure', description: 'Microsoft Azure' },
      { name: 'Docker', slug: 'docker', description: 'Container deployment' },
      { name: 'Kubernetes', slug: 'kubernetes', description: 'Container orchestration' },
      { name: 'CI/CD', slug: 'ci-cd', description: 'Continuous integration' },
      { name: 'Server Management', slug: 'server-management', description: 'Server administration' },
    ]
  },
  {
    name: 'Cybersecurity',
    slug: 'cybersecurity',
    description: 'Security audit, penetration testing, security consulting',
    icon: '🔒',
    order: 32,
    subcategories: [
      { name: 'Security Audit', slug: 'security-audit', description: 'Security assessment' },
      { name: 'Penetration Testing', slug: 'penetration-testing', description: 'Ethical hacking' },
      { name: 'Security Consulting', slug: 'security-consulting', description: 'Security advice' },
      { name: 'Network Security', slug: 'network-security', description: 'Network protection' },
      { name: 'Application Security', slug: 'application-security', description: 'App security' },
      { name: 'Compliance', slug: 'compliance', description: 'Security compliance' },
    ]
  },
  {
    name: 'QA & Testing',
    slug: 'qa-testing',
    description: 'Quality assurance, software testing, test automation',
    icon: '🧪',
    order: 33,
    subcategories: [
      { name: 'Manual Testing', slug: 'manual-testing', description: 'Manual QA testing' },
      { name: 'Test Automation', slug: 'test-automation', description: 'Automated testing' },
      { name: 'Performance Testing', slug: 'performance-testing', description: 'Load and stress testing' },
      { name: 'Mobile Testing', slug: 'mobile-testing', description: 'Mobile app testing' },
      { name: 'API Testing', slug: 'api-testing', description: 'API testing services' },
      { name: 'User Acceptance Testing', slug: 'uat', description: 'UAT services' },
    ]
  },
  {
    name: 'Voiceover & Narration',
    slug: 'voiceover-narration',
    description: 'Professional voice recording, narration, dubbing',
    icon: '🎙️',
    order: 34,
    subcategories: [
      { name: 'Commercial Voiceover', slug: 'commercial-voiceover', description: 'Ads and commercials' },
      { name: 'Narration', slug: 'narration', description: 'Audiobook and documentary' },
      { name: 'Character Voice', slug: 'character-voice', description: 'Animation and games' },
      { name: 'IVR Recording', slug: 'ivr-recording', description: 'Phone system voices' },
      { name: 'Dubbing', slug: 'dubbing', description: 'Video dubbing' },
      { name: 'Podcast Voiceover', slug: 'podcast-voiceover', description: 'Podcast intros' },
    ]
  },
  {
    name: 'Transcription',
    slug: 'transcription',
    description: 'Audio transcription, video transcription, subtitles',
    icon: '📝',
    order: 35,
    subcategories: [
      { name: 'Audio Transcription', slug: 'audio-transcription', description: 'Audio to text' },
      { name: 'Video Transcription', slug: 'video-transcription', description: 'Video to text' },
      { name: 'Subtitles', slug: 'subtitles', description: 'Subtitle creation' },
      { name: 'Closed Captions', slug: 'closed-captions', description: 'CC for videos' },
      { name: 'Legal Transcription', slug: 'legal-transcription', description: 'Legal documents' },
      { name: 'Medical Transcription', slug: 'medical-transcription', description: 'Medical records' },
    ]
  },
  {
    name: 'Research & Summaries',
    slug: 'research-summaries',
    description: 'Market research, academic research, report writing',
    icon: '🔍',
    order: 36,
    subcategories: [
      { name: 'Market Research', slug: 'market-research-service', description: 'Market analysis' },
      { name: 'Academic Research', slug: 'academic-research', description: 'Research papers' },
      { name: 'Industry Research', slug: 'industry-research', description: 'Industry reports' },
      { name: 'Competitor Analysis', slug: 'competitor-analysis', description: 'Competition research' },
      { name: 'Report Writing', slug: 'report-writing', description: 'Professional reports' },
      { name: 'Executive Summaries', slug: 'executive-summaries', description: 'Business summaries' },
    ]
  },
  {
    name: 'Recruitment & HR',
    slug: 'recruitment-hr',
    description: 'Recruitment, resume writing, HR consulting',
    icon: '👥',
    order: 37,
    subcategories: [
      { name: 'Recruitment', slug: 'recruitment', description: 'Talent acquisition' },
      { name: 'Resume Writing', slug: 'resume-writing', description: 'Professional resumes' },
      { name: 'Cover Letter', slug: 'cover-letter', description: 'Cover letter writing' },
      { name: 'LinkedIn Profile', slug: 'linkedin-profile', description: 'LinkedIn optimization' },
      { name: 'Interview Coaching', slug: 'interview-coaching', description: 'Interview preparation' },
      { name: 'HR Policies', slug: 'hr-policies', description: 'HR policy creation' },
    ]
  },
  {
    name: 'Book & eBook',
    slug: 'book-ebook',
    description: 'Book writing, eBook creation, book cover design',
    icon: '📖',
    order: 38,
    subcategories: [
      { name: 'Book Writing', slug: 'book-writing', description: 'Ghostwriting services' },
      { name: 'eBook Writing', slug: 'ebook-writing', description: 'eBook creation' },
      { name: 'Book Editing', slug: 'book-editing', description: 'Manuscript editing' },
      { name: 'Book Cover Design', slug: 'book-cover-design', description: 'Cover design' },
      { name: 'Book Formatting', slug: 'book-formatting', description: 'Book layout' },
      { name: 'Self-Publishing', slug: 'self-publishing', description: 'Publishing assistance' },
    ]
  },
  {
    name: 'Podcast Production',
    slug: 'podcast-production',
    description: 'Podcast editing, production, distribution',
    icon: '🎧',
    order: 39,
    subcategories: [
      { name: 'Podcast Editing', slug: 'podcast-editing-service', description: 'Audio editing' },
      { name: 'Podcast Production', slug: 'podcast-production-service', description: 'Full production' },
      { name: 'Podcast Cover Art', slug: 'podcast-cover-art', description: 'Cover design' },
      { name: 'Podcast Distribution', slug: 'podcast-distribution', description: 'Platform distribution' },
      { name: 'Podcast Consulting', slug: 'podcast-consulting', description: 'Strategy and growth' },
      { name: 'Show Notes', slug: 'show-notes', description: 'Episode summaries' },
    ]
  },
  {
    name: 'NFT & Metaverse',
    slug: 'nft-metaverse',
    description: 'NFT creation, metaverse development, digital art',
    icon: '🌐',
    order: 40,
    subcategories: [
      { name: 'NFT Creation', slug: 'nft-creation', description: 'NFT art and minting' },
      { name: 'NFT Marketing', slug: 'nft-marketing', description: 'NFT promotion' },
      { name: 'Metaverse Development', slug: 'metaverse-development', description: 'Virtual worlds' },
      { name: 'Digital Collectibles', slug: 'digital-collectibles', description: 'Collectible creation' },
      { name: 'Virtual Land', slug: 'virtual-land', description: 'Metaverse real estate' },
      { name: 'Avatar Design', slug: 'avatar-design', description: '3D avatars' },
    ]
  },
];
