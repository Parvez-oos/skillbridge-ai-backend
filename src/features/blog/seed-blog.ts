import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { BlogPost } from './blog.model';
import { User } from '../user/user.model';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// ─── Seeded PRNG (mulberry32, seed=42) ───────────────────────────────────────
function mulberry32(seed: number): () => number {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);

function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => rand() - 0.5);
  return shuffled.slice(0, n);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// ─── Categories ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  'AI & Technology',
  'Machine Learning',
  'Deep Learning',
  'Data Science',
  'Web Development',
  'Programming',
  'Career Growth',
  'Interview Preparation',
  'Cybersecurity',
  'Cloud Computing',
  'DevOps',
  'Mobile Development',
  'System Design',
  'Open Source',
  'Productivity',
];

// ─── Tags ─────────────────────────────────────────────────────────────────────
const TAGS = [
  'ai', 'python', 'javascript', 'typescript', 'react', 'nextjs', 'nodejs',
  'express', 'mongodb', 'docker', 'kubernetes', 'aws', 'azure', 'github',
  'prompt-engineering', 'llm', 'chatgpt', 'data-analysis', 'tensorflow',
  'pytorch', 'career', 'resume', 'interview', 'algorithms', 'dsa',
  'system-design', 'problem-solving', 'machine-learning', 'deep-learning',
  'neural-networks', 'nlp', 'computer-vision', 'data-visualization',
  'web-design', 'api', 'database', 'security', 'cloud', 'devops',
  'testing', 'agile', 'leadership', 'communication', 'remote-work',
  'freelancing', 'startup', 'productivity', 'time-management', 'regex',
  'git', 'linux', 'sql', 'graphql', 'rest-api', 'microservices',
  'serverless', 'responsible-ai', 'generative-ai', 'reinforcement-learning',
  'transformers', 'bert', 'gpt', 'stable-diffusion', 'langchain', 'rag',
  'fine-tuning', 'model-deployment', 'mlops', 'data-pipeline', 'etl',
  'spark', 'hadoop', 'kafka', 'frontend', 'backend', 'fullstack', 'mobile',
  'ios', 'android', 'flutter', 'react-native', 'swift', 'kotlin', 'java',
  'c-plus-plus', 'rust', 'go', 'ruby', 'php', 'laravel', 'django', 'flask',
  'fastapi', 'tailwind', 'css', 'html', 'sass', 'webpack', 'vite', 'esbuild',
  'jest', 'cypress', 'playwright', 'selenium', 'ci-cd', 'github-actions',
  'terraform', 'ansible', 'jenkins', 'prometheus', 'grafana', 'elk', 'redis',
  'postgresql', 'mysql', 'elasticsearch', 'firebase', 'supabase',
];

// ─── Category-specific tag pools ──────────────────────────────────────────────
const CATEGORY_TAG_MAP: Record<string, string[]> = {
  'AI & Technology': ['ai', 'llm', 'generative-ai', 'responsible-ai', 'prompt-engineering', 'chatgpt', 'gpt', 'transformers', 'python', 'machine-learning', 'deep-learning'],
  'Machine Learning': ['machine-learning', 'python', 'tensorflow', 'pytorch', 'data-analysis', 'algorithms', 'dsa', 'fine-tuning', 'model-deployment', 'mlops', 'reinforcement-learning'],
  'Deep Learning': ['deep-learning', 'neural-networks', 'tensorflow', 'pytorch', 'transformers', 'bert', 'computer-vision', 'nlp', 'python', 'fine-tuning', 'gpu'],
  'Data Science': ['data-analysis', 'python', 'data-visualization', 'sql', 'data-pipeline', 'etl', 'spark', 'hadoop', 'kafka', 'machine-learning', 'database'],
  'Web Development': ['javascript', 'typescript', 'react', 'nextjs', 'nodejs', 'express', 'html', 'css', 'tailwind', 'frontend', 'backend', 'fullstack', 'web-design', 'vite', 'webpack'],
  'Programming': ['python', 'javascript', 'typescript', 'java', 'c-plus-plus', 'rust', 'go', 'ruby', 'php', 'algorithms', 'dsa', 'regex', 'git', 'linux'],
  'Career Growth': ['career', 'resume', 'leadership', 'communication', 'remote-work', 'freelancing', 'startup', 'productivity', 'time-management', 'agile'],
  'Interview Preparation': ['interview', 'algorithms', 'dsa', 'system-design', 'problem-solving', 'career', 'resume', 'python', 'javascript', 'data-structures'],
  'Cybersecurity': ['security', 'linux', 'python', 'networking', 'ethical-hacking', 'penetration-testing', 'owasp', 'encryption', 'firewall', 'authentication'],
  'Cloud Computing': ['cloud', 'aws', 'azure', 'serverless', 'docker', 'kubernetes', 'terraform', 'ci-cd', 'microservices', 'infrastructure'],
  'DevOps': ['devops', 'docker', 'kubernetes', 'ci-cd', 'github-actions', 'jenkins', 'terraform', 'ansible', 'prometheus', 'grafana', 'elk', 'linux'],
  'Mobile Development': ['mobile', 'ios', 'android', 'flutter', 'react-native', 'swift', 'kotlin', 'javascript', 'typescript', 'firebase', 'supabase'],
  'System Design': ['system-design', 'microservices', 'database', 'redis', 'postgresql', 'mysql', 'elasticsearch', 'kafka', 'api', 'rest-api', 'graphql', 'scalability'],
  'Open Source': ['github', 'git', 'open-source', 'community', 'documentation', 'testing', 'ci-cd', 'agile', 'leadership', 'communication'],
  'Productivity': ['productivity', 'time-management', 'remote-work', 'leadership', 'communication', 'agile', 'git', 'linux', 'automation', 'efficiency'],
};

// ─── Title Templates per category (15 each) ─────────────────────────────────
const TITLE_TEMPLATES: Record<string, string[]> = {
  'AI & Technology': [
    'The Future of {topic} in {year}: What You Need to Know',
    'How {topic} Is Reshaping Modern Technology',
    'A Comprehensive Guide to {topic} for Beginners',
    '{topic}: Trends, Challenges, and Opportunities in {year}',
    'Why {topic} Matters More Than Ever in {year}',
    'Exploring the Impact of {topic} on Industry',
    '{topic} Explained: From Theory to Real-World Applications',
    'Top {year} Predictions for {topic}',
    'How to Get Started with {topic} Today',
    '{topic}: The Definitive Guide for {year}',
    'Revolutionizing Technology with {topic}',
    '{topic} vs Traditional Approaches: A Comparison',
    'The Ultimate Introduction to {topic}',
    'Understanding {topic}: Core Concepts and Best Practices',
    '{topic}: What Every Developer Should Know in {year}',
  ],
  'Machine Learning': [
    'Mastering {topic}: A Hands-On Tutorial',
    '{topic} in Practice: Building Real-World Models',
    'The Complete Guide to {topic} for Data Scientists',
    'How to Implement {topic} from Scratch',
    '{topic}: From Concept to Production in {year}',
    'Advanced Techniques in {topic} You Should Know',
    'Breaking Down {topic}: Step by Step',
    '{topic} for Beginners: Where to Start',
    'Real-World Applications of {topic} in {year}',
    'Optimizing {topic} Performance: Tips and Tricks',
    '{topic}: Common Pitfalls and How to Avoid Them',
    'Deep Dive into {topic}: Architecture and Implementation',
    'Scaling {topic} for Enterprise Applications',
    '{topic} Fundamentals Every Engineer Needs',
    'State of the Art in {topic} ({year} Edition)',
  ],
  'Deep Learning': [
    'Deep Learning with {topic}: A Complete Tutorial',
    'Understanding {topic} in Neural Network Architecture',
    '{topic}: Building Intelligent Systems from Scratch',
    'The Power of {topic} in Modern AI',
    'How {topic} Is Transforming Deep Learning Research',
    'Practical Guide to Implementing {topic}',
    '{topic} Demystified: Concepts, Code, and Applications',
    'Advanced {topic} Techniques for Seasoned Developers',
    'Getting Started with {topic} in PyTorch',
    '{topic}: Training, Optimization, and Deployment',
    'Why {topic} Is a Game-Changer for AI',
    'End-to-End {topic} Pipeline in {year}',
    '{topic} Architecture Patterns for Production',
    'Troubleshooting {topic}: Debugging Deep Learning Models',
    '{topic} for Computer Vision and NLP Applications',
  ],
  'Data Science': [
    'Data Science with {topic}: The Complete Roadmap',
    '{topic}: From Raw Data to Actionable Insights',
    'How to Ace {topic} in Your Data Science Career',
    '{topic} Techniques Every Data Scientist Should Master',
    'Building Data Pipelines with {topic}',
    '{topic} for Business Intelligence in {year}',
    'The Art of {topic}: Best Practices and Case Studies',
    '{topic}: Tools, Libraries, and Frameworks',
    'Automating {topic} Workflows with Python',
    '{topic} at Scale: Handling Big Data Challenges',
    'Interactive {topic} with Modern Visualization Tools',
    '{topic}: Statistical Methods and Practical Applications',
    'From Jupyter to Production: Deploying {topic} Solutions',
    '{topic} for Predictive Analytics in {year}',
    'Mastering {topic}: Data Cleaning, Analysis, and Reporting',
  ],
  'Web Development': [
    'Building Modern Web Apps with {topic} in {year}',
    '{topic}: The Complete Developer\'s Guide',
    'How to Build Scalable Applications with {topic}',
    '{topic} Best Practices for Production Applications',
    'Getting Started with {topic}: A Practical Tutorial',
    '{topic} Architecture Patterns for Large-Scale Apps',
    'The Future of Web Development with {topic}',
    'Optimizing {topic} for Performance and SEO',
    '{topic}: Security Best Practices in {year}',
    'Full-Stack Development with {topic}: End to End',
    '{topic} Testing Strategies That Actually Work',
    'Modern UI/UX Design with {topic}',
    '{topic} for Backend Services: A Deep Dive',
    'Real-Time Features with {topic} and WebSockets',
    'Deploying {topic} Applications to the Cloud',
  ],
  'Programming': [
    '{topic} Programming: From Beginner to Expert',
    'Advanced {topic} Patterns and Idioms',
    'How to Write Clean {topic} Code',
    '{topic} for System Programming in {year}',
    'Mastering {topic}: Tips from Senior Developers',
    '{topic} Performance Optimization Techniques',
    'Building CLI Tools with {topic}',
    '{topic} Concurrency and Parallelism Explained',
    'Error Handling Best Practices in {topic}',
    '{topic} Design Patterns You Need to Know',
    'The Complete {topic} Reference Guide',
    '{topic} for Data Structures and Algorithms',
    'Testing {topic} Applications: A Comprehensive Guide',
    '{topic} Memory Management Deep Dive',
    'Migrating Legacy Code to {topic} in {year}',
  ],
  'Career Growth': [
    'The Ultimate Guide to {topic} for Tech Professionals',
    '{topic} Strategies That Actually Work in {year}',
    'How to Level Up Your Career with {topic}',
    '{topic} for Software Engineers: A Practical Guide',
    'Building a Successful Tech Career Through {topic}',
    '{topic}: Lessons from Industry Leaders',
    'The Importance of {topic} in Today\'s Job Market',
    '{topic} Skills That Employers Are Looking For in {year}',
    'Navigating Career Transitions with {topic}',
    '{topic}: From Junior to Senior Developer',
    'How {topic} Can Accelerate Your Professional Growth',
    '{topic} for Remote Tech Workers',
    'Creating Your Personal Brand with {topic}',
    '{topic} in the Age of AI: Adapting Your Career',
    'Mentorship and {topic}: Building Lasting Connections',
  ],
  'Interview Preparation': [
    'Cracking the {topic} Interview: Complete Guide',
    '{topic} Interview Questions and Answers for {year}',
    'How to Prepare for {topic} Technical Interviews',
    '{topic} Coding Challenges: Practice and Solutions',
    'The Ultimate {topic} Interview Cheat Sheet',
    '{topic} System Design Interview Preparation',
    'Behavioral Interview Tips for {topic} Roles',
    '{topic} Interview Mistakes to Avoid in {year}',
    'Mock {topic} Interview: Common Scenarios',
    '{topic} Data Structures and Algorithms for Interviews',
    'Whiteboarding {topic} Problems: A Step-by-Step Guide',
    '{topic} Interview Preparation Timeline',
    'Negotiating Your Offer After a {topic} Interview',
    '{topic} Interview Resources and Study Plans',
    'From Interview to Offer: Mastering {topic} Questions',
  ],
  'Cybersecurity': [
    'Cybersecurity Fundamentals: {topic} Guide',
    '{topic} Security in {year}: Threats and Defenses',
    'How to Implement {topic} for Secure Systems',
    '{topic}: Protecting Your Applications from Attacks',
    'The Complete {topic} Security Checklist',
    '{topic} for Developers: What You Must Know',
    'Incident Response with {topic}: A Practical Guide',
    '{topic} Vulnerabilities and How to Mitigate Them',
    'Building a {topic} Security Culture in Your Team',
    '{topic} Compliance and Regulatory Requirements in {year}',
    'Penetration Testing with {topic}: Hands-On Tutorial',
    '{topic} Encryption Techniques Explained',
    'Securing Cloud Infrastructure with {topic}',
    '{topic} Monitoring and Threat Detection',
    'Zero Trust Architecture with {topic}',
  ],
  'Cloud Computing': [
    'Cloud Computing with {topic}: The Complete Guide',
    '{topic} for Scalable Infrastructure in {year}',
    'How to Migrate to {topic}: A Step-by-Step Guide',
    '{topic} Cost Optimization Strategies',
    'Building Serverless Applications with {topic}',
    '{topic} Security Best Practices for {year}',
    'Multi-Cloud Strategies with {topic}',
    '{topic} for DevOps: Streamlining Deployment',
    'Disaster Recovery with {topic}: Planning and Implementation',
    '{topic} Performance Tuning and Optimization',
    'Container Orchestration with {topic} in Production',
    '{topic} Monitoring, Logging, and Observability',
    'Database Services in {topic}: A Comparison',
    '{topic} Networking Deep Dive',
    'Edge Computing with {topic}: The Next Frontier',
  ],
  'DevOps': [
    'DevOps Mastery: {topic} in Practice',
    '{topic} for Continuous Delivery in {year}',
    'How to Implement {topic} in Your Organization',
    '{topic}: Automating Your Infrastructure',
    'The Complete {topic} Pipeline Guide',
    '{topic} for Microservices Architecture',
    'GitOps with {topic}: A Hands-On Guide',
    '{topic} Monitoring and Alerting Best Practices',
    'Scaling DevOps with {topic}',
    '{topic} Configuration Management Deep Dive',
    'Infrastructure as Code with {topic}',
    '{topic} for CI/CD: Tools and Techniques',
    'Container Security with {topic} in {year}',
    '{topic} Incident Management and Post-Mortems',
    'Building a DevOps Culture with {topic}',
  ],
  'Mobile Development': [
    'Mobile App Development with {topic}: The Complete Guide',
    '{topic} for Cross-Platform Apps in {year}',
    'How to Build Production Apps with {topic}',
    '{topic}: From Prototype to App Store',
    'Advanced {topic} Techniques for Mobile Developers',
    '{topic} UI/UX Design Principles',
    'Offline-First Apps with {topic}',
    '{topic} Performance Optimization for Mobile',
    'Testing Mobile Apps with {topic}: Best Practices',
    '{topic} for Backend Integration',
    'Push Notifications with {topic}: A Complete Guide',
    '{topic} Security Best Practices for {year}',
    'Building Real-Time Features with {topic}',
    '{topic} for Enterprise Mobile Applications',
    'Publishing and Marketing Your {topic} App',
  ],
  'System Design': [
    'System Design Mastery: {topic} Deep Dive',
    '{topic} for Scalable Systems in {year}',
    'How to Design {topic} Systems from Scratch',
    '{topic}: Architecture Patterns and Trade-offs',
    'The Complete {topic} System Design Guide',
    '{topic} for High-Availability Systems',
    'Designing {topic} for Millions of Users',
    '{topic} Data Modeling and Database Design',
    '{topic} Caching Strategies Explained',
    'Load Balancing and {topic} Distribution',
    '{topic} for Real-Time Systems',
    'Designing {topic} for Fault Tolerance',
    '{topic} API Design Best Practices',
    'Capacity Planning with {topic}',
    '{topic}: From Requirements to Production Architecture',
  ],
  'Open Source': [
    'Contributing to {topic}: A Beginner\'s Guide',
    '{topic}: Building and Maintaining Open Source Projects',
    'How to Get Started with {topic} in Open Source',
    '{topic} for Open Source Communities in {year}',
    'The Art of {topic} in Open Source Development',
    '{topic}: From User to Contributor',
    'Maintaining {topic} Projects: Lessons Learned',
    '{topic} Documentation Best Practices',
    'How to Grow an {topic} Community',
    '{topic} Licensing and Legal Considerations',
    'CI/CD for {topic} Open Source Projects',
    '{topic} Release Management Strategies',
    'Funding and Sustainability for {topic} Projects',
    '{topic} Code Review Best Practices',
    'Building Your Reputation Through {topic} Contributions',
  ],
  'Productivity': [
    'Supercharge Your Productivity with {topic}',
    '{topic} Techniques for Developers in {year}',
    'How to Master {topic} for Better Results',
    '{topic}: The Developer\'s Guide to Getting Things Done',
    'Advanced {topic} Strategies for Tech Teams',
    '{topic} for Remote Developers: Staying Focused',
    'Automating Your Workflow with {topic}',
    '{topic} Tools and Techniques That Actually Work',
    'The Science Behind {topic} for Knowledge Workers',
    '{topic}: Balancing Speed and Quality',
    'How {topic} Can Transform Your Daily Routine',
    '{topic} for Managing Complex Projects',
    'Building Sustainable {topic} Habits',
    '{topic} in the Age of Constant Distractions',
    'Measuring and Improving Your {topic} with Data',
  ],
};

// ─── Topics per category (15 each) ───────────────────────────────────────────
const TOPICS_PER_CATEGORY: Record<string, string[]> = {
  'AI & Technology': [
    'Artificial Intelligence', 'Large Language Models', 'Generative AI',
    'AI Ethics', 'Prompt Engineering', 'AI in Healthcare',
    'Computer Vision', 'Natural Language Processing', 'AI Assistants',
    'Responsible AI', 'AI Governance', 'Edge AI',
    'Multimodal AI', 'AI Agents', 'AI Safety',
  ],
  'Machine Learning': [
    'Supervised Learning', 'Unsupervised Learning', 'Feature Engineering',
    'Model Selection', 'Hyperparameter Tuning', 'Ensemble Methods',
    'Gradient Boosting', 'Random Forests', 'Support Vector Machines',
    'Linear Regression', 'Decision Trees', 'Anomaly Detection',
    'Time Series Forecasting', 'Dimensionality Reduction', 'AutoML',
  ],
  'Deep Learning': [
    'Convolutional Neural Networks', 'Recurrent Neural Networks',
    'Transformer Architecture', 'Attention Mechanisms', 'GANs',
    'Variational Autoencoders', 'Transfer Learning', 'Batch Normalization',
    'Dropout Regularization', 'Neural Architecture Search',
    'Graph Neural Networks', 'Self-Supervised Learning',
    'Knowledge Distillation', 'Residual Networks', 'Autoencoders',
  ],
  'Data Science': [
    'Exploratory Data Analysis', 'Statistical Modeling', 'Data Visualization',
    'A/B Testing', 'Cohort Analysis', 'Regression Analysis',
    'Hypothesis Testing', 'Bayesian Statistics', 'Data Wrangling',
    'Data Cleaning', 'Feature Selection', 'Predictive Modeling',
    'Time Series Analysis', 'Geospatial Analysis', 'Survey Analysis',
  ],
  'Web Development': [
    'React', 'Next.js', 'Node.js', 'Express.js', 'TypeScript',
    'RESTful APIs', 'GraphQL', 'Server-Side Rendering',
    'Progressive Web Apps', 'Web Components', 'Micro-Frontends',
    'Web Performance', 'Web Accessibility', 'State Management',
    'API Design',
  ],
  'Programming': [
    'Python', 'JavaScript', 'TypeScript', 'Rust', 'Go',
    'Java', 'C++', 'Ruby', 'PHP', 'Kotlin',
    'Swift', 'Scala', 'Elixir', 'Clojure', 'Haskell',
  ],
  'Career Growth': [
    'Technical Leadership', 'Team Management', 'Mentorship',
    'Communication Skills', 'Negotiation', 'Personal Branding',
    'Networking', 'Work-Life Balance', 'Continuous Learning',
    'Remote Work', 'Freelancing', 'Entrepreneurship',
    'Public Speaking', 'Writing Technical Blog', 'Open Source Contribution',
  ],
  'Interview Preparation': [
    'Data Structures', 'Algorithms', 'System Design',
    'Behavioral Questions', 'Coding Challenges', 'Whiteboard Interviews',
    'Technical Phone Screens', 'On-Site Interviews', 'Salary Negotiation',
    'Portfolio Presentation', 'Mock Interviews', 'Company Research',
    'Problem Solving', 'Time Management', 'Stress Management',
  ],
  'Cybersecurity': [
    'Network Security', 'Web Application Security', 'Cloud Security',
    'Identity and Access Management', 'Encryption', 'Penetration Testing',
    'Incident Response', 'Vulnerability Assessment', 'Malware Analysis',
    'Social Engineering', 'Security Auditing', 'Compliance',
    'Threat Intelligence', 'Security Operations', 'Digital Forensics',
  ],
  'Cloud Computing': [
    'AWS', 'Microsoft Azure', 'Google Cloud Platform',
    'Serverless Computing', 'Container Services', 'Cloud Storage',
    'Cloud Networking', 'Infrastructure as a Service',
    'Platform as a Service', 'Software as a Service',
    'Cloud Migration', 'Cost Management', 'Cloud Architecture',
    'Hybrid Cloud', 'Multi-Cloud Strategy',
  ],
  'DevOps': [
    'Docker', 'Kubernetes', 'CI/CD Pipelines', 'Terraform',
    'Ansible', 'Jenkins', 'GitHub Actions', 'Prometheus',
    'Grafana', 'ELK Stack', 'GitOps', 'Infrastructure as Code',
    'Configuration Management', 'Container Orchestration', 'Site Reliability Engineering',
  ],
  'Mobile Development': [
    'React Native', 'Flutter', 'iOS Development', 'Android Development',
    'Swift', 'Kotlin', 'Mobile UI Design', 'Offline-First Apps',
    'Push Notifications', 'Mobile Testing', 'App Performance',
    'Mobile Security', 'Cross-Platform Development', 'Progressive Web Apps',
    'App Store Optimization',
  ],
  'System Design': [
    'Load Balancing', 'Caching Strategies', 'Database Sharding',
    'Message Queues', 'API Gateway', 'Microservices Architecture',
    'Event-Driven Architecture', 'Consistent Hashing', 'CAP Theorem',
    'Rate Limiting', 'CDN Design', 'Search Engine Design',
    'Real-Time Systems', 'Distributed Systems', 'High Availability',
  ],
  'Open Source': [
    'GitHub', 'Git Workflows', 'Open Source Licensing',
    'Community Building', 'Code Reviews', 'Documentation',
    'Release Management', 'CI/CD for Open Source', 'Contributor Guidelines',
    'Issue Management', 'Pull Request Best Practices',
    'Semantic Versioning', 'Changelog Management', 'Funding Models',
    'Governance Models',
  ],
  'Productivity': [
    'Time Management', 'Focus Techniques', 'Task Prioritization',
    'Automation', 'Keyboard Shortcuts', 'Note Taking',
    'Project Management', 'Goal Setting', 'Habit Building',
    'Deep Work', 'Pomodoro Technique', 'Kanban Board',
    'Knowledge Management', 'Email Management', 'Meeting Efficiency',
  ],
};

// ─── Summary Templates ────────────────────────────────────────────────────────
const SUMMARY_TEMPLATES = [
  'Learn how {topic} can transform your approach to technology. This in-depth guide covers everything from fundamentals to advanced techniques in {year}.',
  'Discover the power of {topic} with this comprehensive tutorial. We walk you through practical examples and real-world use cases for {year}.',
  'This article explores the latest trends in {topic}, offering actionable insights for developers and tech leaders in {year}.',
  'A deep dive into {topic}, covering core concepts, implementation strategies, and expert tips for mastering the subject.',
  'Understand how {topic} is revolutionizing the tech industry. This guide provides a structured learning path from beginner to advanced.',
  'Explore the fundamentals and advanced techniques of {topic}. Perfect for engineers looking to expand their skill set in {year}.',
  'This comprehensive resource breaks down {topic} into digestible sections, making complex concepts accessible for all skill levels.',
  'From theory to practice, this guide on {topic} equips you with the knowledge and tools needed to succeed in {year}.',
  'Stay ahead of the curve with this expert analysis of {topic}. Learn the strategies that top practitioners use in {year}.',
  'An essential guide to {topic} that covers everything you need to know to get started and excel in the field.',
];

// ─── Content Section Templates ────────────────────────────────────────────────
interface ContentSections {
  intro: string[];
  overview: string[];
  keyConcepts: string[];
  implementation: string[];
  advanced: string[];
  bestPractices: string[];
  tools: string[];
  conclusion: string[];
}

const CONTENT_BY_CATEGORY: Record<string, ContentSections> = {
  'AI & Technology': {
    intro: [
      'Artificial intelligence continues to reshape industries at an unprecedented pace. Understanding {topic} is no longer optional for technology professionals who want to remain relevant in an increasingly automated world.',
      'The rapid evolution of {topic} has created both opportunities and challenges for organizations worldwide. As we navigate through {year}, the implications of these technologies are becoming clearer and more impactful every day.',
    ],
    overview: [
      'At its core, {topic} represents a fundamental shift in how we approach complex problems. Traditional computing relied on explicit instructions, but modern AI systems learn patterns from data and make decisions with minimal human intervention. This paradigm shift has opened doors to solutions that were once considered impossible.',
      'The landscape of {topic} has matured significantly in recent years. What started as academic research has evolved into production-ready systems that power everything from recommendation engines to autonomous vehicles. Understanding this evolution helps appreciate where the technology stands today and where it is headed.',
    ],
    keyConcepts: [
      'Several foundational principles underpin {topic}. First, the quality and quantity of training data directly influence model performance. Second, the choice of architecture determines what types of problems the system can effectively solve. Third, ethical considerations must be woven into every stage of development.',
      'To truly grasp {topic}, one must understand the interplay between data, algorithms, and computational resources. Modern AI systems require carefully curated datasets, optimized algorithms, and often specialized hardware to achieve the performance levels expected in production environments.',
    ],
    implementation: [
      'Implementing {topic} begins with defining clear objectives and success metrics. Start by identifying the specific problem you want to solve, then gather and preprocess relevant data. Select appropriate tools and frameworks, build a baseline model, and iterate based on evaluation results.',
      'A practical approach to implementing {topic} involves starting small and scaling gradually. Begin with a proof of concept using public datasets, validate your assumptions, and then progressively add complexity as you gain confidence in the solution.',
    ],
    advanced: [
      'Advanced practitioners of {topic} often focus on optimization techniques that push the boundaries of what is possible. This includes ensemble methods, knowledge distillation, and novel architectures that achieve state-of-the-art results on benchmark tasks.',
      'For those looking to push the frontier of {topic}, exploring cutting-edge research papers and experimenting with emerging techniques is essential. The field moves quickly, and staying current requires active engagement with the latest developments.',
    ],
    bestPractices: [
      'When working with {topic}, always prioritize reproducibility and documentation. Use version control for both code and data, implement comprehensive logging, and maintain clear records of experiments and their outcomes.',
      'Ethical considerations should guide every decision in {topic} projects. This includes ensuring data privacy, mitigating bias in training data, and being transparent about the limitations of your systems.',
    ],
    tools: [
      'The ecosystem of tools for {topic} is vast and continually expanding. From cloud platforms offering pre-trained models to open-source libraries providing building blocks, choosing the right tools can significantly accelerate development.',
      'Building an effective {topic} toolkit requires balancing simplicity with capability. Start with well-established libraries and frameworks, then selectively adopt specialized tools as your needs become more sophisticated.',
    ],
    conclusion: [
      'As {topic} continues to evolve, the opportunities for innovation are boundless. By building a strong foundation in the fundamentals and staying curious about emerging trends, you can position yourself at the forefront of this technological revolution.',
      'The journey of mastering {topic} is ongoing and rewarding. Embrace continuous learning, engage with the community, and apply your knowledge to real-world problems to maximize your impact.',
    ],
  },
  'Machine Learning': {
    intro: [
      'Machine learning has moved from research labs to production systems across every industry. Understanding {topic} is essential for data scientists and engineers building the next generation of intelligent applications.',
      'The field of machine learning continues to evolve rapidly, with {topic} representing one of the most practical and widely applicable areas. This guide bridges the gap between theoretical foundations and real-world implementation.',
    ],
    overview: [
      'Machine learning encompasses a broad set of techniques that enable computers to learn from data. {topic} specifically addresses how to extract meaningful patterns and make predictions without being explicitly programmed for each scenario.',
      'The importance of {topic} in the machine learning landscape cannot be overstated. From fraud detection to recommendation systems, these techniques form the backbone of many AI applications we interact with daily.',
    ],
    keyConcepts: [
      'Mastering {topic} requires understanding several key principles: the bias-variance tradeoff, cross-validation strategies, feature engineering techniques, and the importance of proper evaluation metrics for assessing model performance.',
      'The theoretical foundations of {topic} rest on statistical learning theory and optimization. Understanding these mathematical underpinnings helps practitioners make informed decisions about model selection and hyperparameter tuning.',
    ],
    implementation: [
      'Successful implementation of {topic} follows a systematic approach: data collection and cleaning, exploratory analysis, feature engineering, model selection, training, evaluation, and deployment. Each stage requires careful attention to detail.',
      'When implementing {topic}, start with the simplest approach that could work. Establish a baseline, measure performance rigorously, and only add complexity when the gains justify the additional overhead.',
    ],
    advanced: [
      'Advanced techniques in {topic} include ensemble methods, stacking, and automated machine learning pipelines. These approaches can squeeze additional performance from models but require careful implementation to avoid overfitting.',
      'Scaling {topic} to handle large datasets and high-dimensional feature spaces presents unique challenges. Techniques like distributed training, approximate nearest neighbors, and dimensionality reduction become essential at scale.',
    ],
    bestPractices: [
      'Always split your data properly when working with {topic}. Use stratified sampling, maintain separate test sets, and be vigilant about data leakage that can inflate performance estimates.',
      'Version your experiments, track metrics systematically, and maintain reproducible pipelines. These practices are invaluable when debugging issues or building upon previous work.',
    ],
    tools: [
      'The Python ecosystem dominates {topic} development. Scikit-learn provides foundational algorithms, while XGBoost, LightGBM, and CatBoost offer gradient boosting implementations optimized for performance.',
      'MLOps tools like MLflow, DVC, and Kubeflow have emerged to address the operational challenges of deploying {topic} models at scale, providing experiment tracking, model versioning, and pipeline orchestration.',
    ],
    conclusion: [
      'Machine learning and {topic} offer tremendous potential to solve complex problems. By combining solid theoretical understanding with practical implementation skills, you can build systems that deliver real value.',
      'The field of machine learning rewards curiosity and persistence. Continue experimenting, learning from failures, and refining your craft to unlock the full potential of {topic}.',
    ],
  },
  'Web Development': {
    intro: [
      'The web development landscape evolves at breakneck speed, and staying current with {topic} is crucial for building modern, performant applications. This guide covers everything you need to know to master {topic} in {year}.',
      'Web applications have become the primary interface for most software products. Understanding {topic} enables developers to create experiences that are fast, accessible, and delightful for users.',
    ],
    overview: [
      'Modern web development is a multifaceted discipline. {topic} represents a critical piece of the puzzle, enabling developers to build applications that scale to millions of users while maintaining excellent performance.',
      'The evolution of {topic} reflects the broader trends in web development: a shift toward component-based architecture, server-side rendering, and full-stack frameworks that simplify the development process.',
    ],
    keyConcepts: [
      'Effective use of {topic} requires understanding core web fundamentals: the request-response cycle, HTTP protocols, browser rendering pipelines, and the document object model. These concepts underpin all modern frameworks.',
      'When learning {topic}, focus on understanding the underlying principles rather than memorizing syntax. Frameworks come and go, but fundamental concepts like composition, state management, and data flow remain constant.',
    ],
    implementation: [
      'Building with {topic} starts with setting up a proper development environment. Configure linting, formatting, and testing from the beginning. This investment pays dividends throughout the project lifecycle.',
      'A structured approach to implementing {topic} involves breaking the application into manageable components, defining clear interfaces between them, and writing tests that verify behavior at each level.',
    ],
    advanced: [
      'Advanced {topic} techniques include code splitting, lazy loading, service workers, and edge rendering. These optimizations can dramatically improve user experience, especially on slower connections and devices.',
      'Performance optimization in {topic} requires a systematic approach: measure first, identify bottlenecks, apply targeted optimizations, and verify the impact. Tools like Lighthouse and Web Viles provide actionable insights.',
    ],
    bestPractices: [
      'Accessibility should be a first-class concern in {topic}. Follow WCAG guidelines, test with screen readers, and ensure keyboard navigation works throughout your application.',
      'Security in {topic} requires vigilance. Sanitize user input, implement Content Security Policy headers, use HTTPS everywhere, and keep dependencies updated to protect against known vulnerabilities.',
    ],
    tools: [
      'The modern {topic} toolkit includes bundlers like Vite and esbuild, testing frameworks like Jest and Playwright, and deployment platforms like Vercel and Netlify that simplify the deployment process.',
      'Developer experience tools for {topic} have improved dramatically. Hot module replacement, TypeScript support, and integrated debugging make modern web development more productive than ever.',
    ],
    conclusion: [
      'Web development with {topic} offers endless opportunities to create impactful applications. Stay curious, build projects, and engage with the community to continuously improve your skills.',
      'The best way to master {topic} is through practice. Start with small projects, progressively take on more complex challenges, and always seek feedback from peers and mentors.',
    ],
  },
  'Programming': {
    intro: [
      'Programming is both an art and a science, and mastering {topic} opens doors to solving a wide range of problems. Whether you are a beginner or an experienced developer, deepening your knowledge of {topic} will enhance your capabilities.',
      'The programming landscape is diverse, and {topic} occupies a unique position. This guide explores the language features, paradigms, and idioms that make {topic} a powerful tool for software development.',
    ],
    overview: [
      '{topic} offers a distinctive approach to software development. Understanding its design philosophy, standard library, and ecosystem is essential for writing idiomatic and efficient code.',
      'The evolution of {topic} reflects broader trends in programming language design. From memory management to concurrency models, each aspect has been carefully considered to address real-world development challenges.',
    ],
    keyConcepts: [
      'Core concepts in {topic} include type systems, memory management, concurrency primitives, and error handling. Understanding these fundamentals enables you to write code that is correct, efficient, and maintainable.',
      'Proficiency in {topic} requires mastering its control flow mechanisms, data structures, and standard library functions. These building blocks are the foundation for solving complex programming problems.',
    ],
    implementation: [
      'When implementing solutions with {topic}, start by understanding the problem domain thoroughly. Design your solution before writing code, consider edge cases early, and write tests alongside your implementation.',
      'Good {topic} code is characterized by clarity, simplicity, and consistency. Follow established conventions, use meaningful names, and break complex logic into well-documented functions.',
    ],
    advanced: [
      'Advanced {topic} programming involves understanding metaprogramming, compiler optimizations, and low-level system interactions. These skills enable you to build high-performance libraries and frameworks.',
      'Mastering {topic} also means understanding its performance characteristics. Profiling, benchmarking, and optimizing hot paths are essential skills for building production-quality software.',
    ],
    bestPractices: [
      'Version control is non-negotiable in {topic} development. Use meaningful commit messages, create focused pull requests, and maintain a clean git history that tells the story of your project.',
      'Code review is one of the most effective ways to improve {topic} skills. Both reviewing others code and inviting feedback on your own helps identify issues and spread knowledge across teams.',
    ],
    tools: [
      'A well-configured development environment is crucial for {topic} productivity. Choose an editor or IDE that supports your workflow, and invest time in learning keyboard shortcuts and extensions.',
      'Testing tools for {topic} have matured significantly. From unit testing to property-based testing, the available tooling enables comprehensive verification of your programs.',
    ],
    conclusion: [
      'Programming in {topic} is a rewarding pursuit that combines logical thinking with creative problem-solving. Continue learning, building, and sharing your knowledge with the community.',
      'The journey of a programmer is one of continuous improvement. Embrace challenges, learn from mistakes, and celebrate the small victories along the way.',
    ],
  },
};

// ─── Generate Content for Any Category ────────────────────────────────────────
function generateContent(category: string, topic: string, year: number): string {
  const sections = CONTENT_BY_CATEGORY[category];
  if (sections) {
    return buildContentFromSections(sections, topic, year);
  }
  return buildGenericContent(category, topic, year);
}

function buildContentFromSections(sections: ContentSections, topic: string, year: number): string {
  const intro = pick(sections.intro).replace(/\{topic\}/g, topic).replace(/\{year\}/g, String(year));
  const overview = pick(sections.overview).replace(/\{topic\}/g, topic).replace(/\{year\}/g, String(year));
  const keyConcepts = pick(sections.keyConcepts).replace(/\{topic\}/g, topic).replace(/\{year\}/g, String(year));
  const implementation = pick(sections.implementation).replace(/\{topic\}/g, topic).replace(/\{year\}/g, String(year));
  const advanced = pick(sections.advanced).replace(/\{topic\}/g, topic).replace(/\{year\}/g, String(year));
  const bestPractices = pick(sections.bestPractices).replace(/\{topic\}/g, topic).replace(/\{year\}/g, String(year));
  const tools = pick(sections.tools).replace(/\{topic\}/g, topic).replace(/\{year\}/g, String(year));
  const conclusion = pick(sections.conclusion).replace(/\{topic\}/g, topic).replace(/\{year\}/g, String(year));

  return `<h2 id="introduction">Introduction</h2>
<p>${intro}</p>
<p>In this article, we will explore the various dimensions of ${topic}, providing you with practical knowledge that you can apply immediately. Whether you are looking to deepen your understanding or start from scratch, this guide has something for everyone.</p>

<h2 id="overview">Overview of ${topic}</h2>
<p>${overview}</p>
<p>By the end of this section, you will have a clear understanding of what ${topic} entails and why it matters in today's technology landscape.</p>

<h2 id="key-concepts">Key Concepts</h2>
<p>${keyConcepts}</p>
<p>These foundational ideas form the basis for everything else we will discuss. Take time to internalize each concept before moving on to the practical sections.</p>

<h2 id="implementation">Implementation Guide</h2>
<p>${implementation}</p>
<p>Following this structured approach will help you avoid common pitfalls and build a solid foundation for your ${topic} projects.</p>

<h2 id="advanced-techniques">Advanced Techniques</h2>
<p>${advanced}</p>
<p>These advanced strategies separate beginners from experts. Mastering them will give you a significant advantage in your projects and career.</p>

<h2 id="best-practices">Best Practices</h2>
<p>${bestPractices}</p>
<p>Incorporating these best practices into your workflow will lead to more maintainable, reliable, and efficient code.</p>

<h2 id="tools-and-resources">Tools and Resources</h2>
<p>${tools}</p>
<p>Choosing the right tools can dramatically improve your productivity. Invest time in evaluating options and selecting the stack that best fits your needs.</p>

<h2 id="conclusion">Conclusion</h2>
<p>${conclusion}</p>
<p>We hope this comprehensive guide to ${topic} has provided you with valuable insights and practical knowledge. Share your experiences and continue learning as the field evolves.</p>`;
}

function buildGenericContent(category: string, topic: string, year: number): string {
  return `<h2 id="introduction">Introduction</h2>
<p>${topic} is a critical area within ${category} that every aspiring professional should understand. As we move through ${year}, the importance of mastering these concepts continues to grow.</p>
<p>This guide is designed to give you a thorough understanding of ${topic}, from the foundational principles to the most advanced techniques being used in the industry today.</p>

<h2 id="fundamentals">Fundamentals</h2>
<p>Before diving into the complexities of ${topic}, it is essential to establish a strong foundation. The fundamentals include understanding the core principles, historical context, and the problems that ${topic} aims to solve.</p>
<p>A solid grasp of these basics will make the more advanced topics much easier to understand and apply in practice.</p>

<h2 id="core-concepts">Core Concepts</h2>
<p>The key concepts of ${topic} revolve around understanding how different components interact to produce desired outcomes. Each concept builds upon the previous ones, creating a cohesive framework for solving real-world problems.</p>
<p>Take time to experiment with each concept individually before combining them. This approach helps build intuition and makes debugging easier when things do not work as expected.</p>

<h2 id="practical-implementation">Practical Implementation</h2>
<p>Implementing ${topic} in a real project requires careful planning and execution. Start by defining clear requirements, selecting appropriate tools, and creating a step-by-step implementation plan.</p>
<p>Iterative development is key. Build a minimum viable version first, gather feedback, and progressively enhance the solution based on real usage patterns and performance data.</p>

<h2 id="performance-optimization">Performance Optimization</h2>
<p>Once you have a working implementation, the next step is optimization. Profiling your application will reveal bottlenecks that can be addressed through algorithmic improvements, caching, or architectural changes.</p>
<p>Remember that premature optimization is the root of all evil. Always measure first, then optimize the parts that actually need improvement.</p>

<h2 id="common-pitfalls">Common Pitfalls</h2>
<p>Every practitioner encounters challenges when working with ${topic}. Being aware of common mistakes helps you avoid them and build more robust solutions from the start.</p>
<p>Learning from the mistakes of others is far more efficient than making them yourself. Study post-mortems, read war stories, and incorporate those lessons into your approach.</p>

<h2 id="future-trends">Future Trends</h2>
<p>The field of ${topic} is constantly evolving. Staying informed about emerging trends and technologies ensures that you can adapt your skills and remain competitive.</p>
<p>Subscribe to industry newsletters, follow thought leaders, and participate in community discussions to stay ahead of the curve.</p>

<h2 id="conclusion">Conclusion</h2>
<p>Mastering ${topic} within ${category} is a journey that requires dedication, practice, and continuous learning. The knowledge and skills you develop will serve you throughout your career.</p>
<p>We encourage you to apply what you have learned, share your experiences with the community, and never stop exploring the possibilities that ${topic} offers.</p>`;
}

// ─── Table of Contents Extractor ──────────────────────────────────────────────
function extractTableOfContents(html: string): { id: string; title: string; level: number }[] {
  const toc: { id: string; title: string; level: number }[] = [];
  const regex = /<h([23])\s+id="([^"]+)"[^>]*>([^<]+)<\/h[23]>/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    toc.push({
      level: parseInt(match[1]),
      id: match[2],
      title: match[3],
    });
  }
  return toc;
}

// ─── Blog Post Generator ─────────────────────────────────────────────────────
interface GeneratedPost {
  title: string;
  slug: string;
  subtitle: string;
  summary: string;
  content: string;
  coverImage: string;
  thumbnail: string;
  author: mongoose.Types.ObjectId;
  publishDate: Date;
  updatedDate: Date;
  readingTime: number;
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  featured: boolean;
  featuredImage: string;
  seoTitle: string;
  seoDescription: string;
  tableOfContents: { id: string; title: string; level: number }[];
  views: number;
  likes: number;
  bookmarks: number;
  isPublished: boolean;
  isDeleted: boolean;
}

function generatePost(
  index: number,
  category: string,
  topic: string,
  titleTemplate: string,
  authorId: mongoose.Types.ObjectId,
): GeneratedPost {
  const year = 2026;
  const title = titleTemplate.replace(/\{topic\}/g, topic).replace(/\{year\}/g, String(year));
  const uniqueSlug = `${slugify(title)}-${index}`;
  const summary = pick(SUMMARY_TEMPLATES)
    .replace(/\{topic\}/g, topic)
    .replace(/\{year\}/g, String(year));
  const content = generateContent(category, topic, year);
  const toc = extractTableOfContents(content);
  const categoryTags = CATEGORY_TAG_MAP[category] || TAGS;
  const tagCount = randInt(2, Math.min(5, categoryTags.length));
  const tags = pickN(categoryTags, tagCount);
  const difficulties: Array<'beginner' | 'intermediate' | 'advanced'> = ['beginner', 'intermediate', 'advanced'];
  const difficulty = pick(difficulties);
  const isFeatured = rand() < 0.05;
  const publishDate = new Date(Date.now() - randInt(0, 365) * 24 * 60 * 60 * 1000);
  const wordCount = content.replace(/<[^>]+>/g, '').split(/\s+/).length;
  const readingTime = Math.max(3, Math.min(25, Math.ceil(wordCount / 200)));
  const seed = index + 1;

  return {
    title,
    slug: uniqueSlug,
    subtitle: `${topic}: A comprehensive deep dive for ${category} enthusiasts`,
    summary,
    content,
    coverImage: `https://picsum.photos/seed/cover${seed}/1200/600`,
    thumbnail: `https://picsum.photos/seed/thumb${seed}/400/300`,
    author: authorId,
    publishDate,
    updatedDate: publishDate,
    readingTime,
    category,
    tags,
    difficulty,
    featured: isFeatured,
    featuredImage: `https://picsum.photos/seed/featured${seed}/800/450`,
    seoTitle: title.substring(0, 70),
    seoDescription: summary.substring(0, 160),
    tableOfContents: toc,
    views: randInt(50, 10000),
    likes: randInt(5, 500),
    bookmarks: randInt(2, 200),
    isPublished: true,
    isDeleted: false,
  };
}

// ─── Seed Function ────────────────────────────────────────────────────────────
const seedBlog = async (): Promise<void> => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      console.error('MONGODB_URI is not defined in the environment variables.');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully.');

    // Find or create admin user
    let adminUser = await User.findOne({ email: 'admin@skillbridge.ai', role: 'admin' });
    if (!adminUser) {
      console.log('Admin user not found. Creating one...');
      adminUser = await User.create({
        name: 'SkillBridge Admin',
        email: 'admin@skillbridge.ai',
        password: 'placeholder-password-hash',
        role: 'admin',
        provider: 'local',
        isEmailVerified: true,
      });
      console.log('Admin user created.');
    } else {
      console.log('Admin user found.');
    }

    // Skip if enough posts already exist
    const existingCount = await BlogPost.countDocuments();
    if (existingCount > 100) {
      console.log(`Database already has ${existingCount} posts. Skipping seed.`);
      await mongoose.disconnect();
      process.exit(0);
    }

    // Clear existing posts
    await BlogPost.deleteMany({});
    console.log('Cleared existing blog posts.');

    // Generate 1500 posts
    const TOTAL_POSTS = 1500;
    const allPosts: GeneratedPost[] = [];
    let categoryIndex = 0;

    console.log(`Generating ${TOTAL_POSTS} blog posts...`);

    for (let i = 0; i < TOTAL_POSTS; i++) {
      const category = CATEGORIES[categoryIndex];
      const topics = TOPICS_PER_CATEGORY[category];
      const templates = TITLE_TEMPLATES[category];
      const topic = topics[i % topics.length];
      const template = templates[i % templates.length];

      const post = generatePost(i, category, topic, template, adminUser._id);
      allPosts.push(post);

      categoryIndex = (categoryIndex + 1) % CATEGORIES.length;

      if ((i + 1) % 100 === 0) {
        console.log(`  Generated ${i + 1} / ${TOTAL_POSTS} posts...`);
      }
    }

    console.log('Inserting posts into database...');
    const batchSize = 500;
    for (let i = 0; i < allPosts.length; i += batchSize) {
      const batch = allPosts.slice(i, i + batchSize);
      await BlogPost.insertMany(batch, { ordered: false });
      console.log(`  Inserted batch ${Math.floor(i / batchSize) + 1} (${batch.length} posts).`);
    }

    console.log(`Successfully seeded ${allPosts.length} blog posts!`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding blog:', error);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

seedBlog();
