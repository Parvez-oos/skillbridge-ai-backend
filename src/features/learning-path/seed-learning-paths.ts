import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { LearningPath } from './learning-path.model';
import { User } from '../user/user.model';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://tileUser:12345parvez@tile-app-cluster.ayildnn.mongodb.net/?appName=tile-app-cluster';

const categories = [
  'Web Development',
  'Data Science',
  'Machine Learning',
  'Mobile Development',
  'Cloud Computing',
  'DevOps',
  'Cybersecurity',
  'UI/UX Design',
];

const learningPaths = [
  {
    title: 'Complete React Developer',
    description: 'Master React from fundamentals to advanced patterns. Build real-world projects with hooks, context, Redux, Next.js, and testing. Learn component architecture, state management, performance optimization, and deployment strategies used by top companies.',
    shortDescription: 'Master React with hooks, Redux, Next.js and build production-ready apps',
    category: 'Web Development',
    tags: ['react', 'javascript', 'hooks', 'nextjs', 'frontend'],
    difficulty: 'intermediate',
    duration: 40,
    rating: 4.8,
    studentsCount: 12500,
    thumbnail: 'https://picsum.photos/seed/react/400/300',
    learningOutcomes: [
      'Build complex React applications from scratch',
      'Master React hooks and custom hooks',
      'Implement state management with Redux and Context API',
      'Create full-stack apps with Next.js',
      'Write tests with Jest and React Testing Library',
    ],
    requiredSkills: ['HTML', 'CSS', 'JavaScript basics'],
    isPublished: true,
  },
  {
    title: 'Python for Data Science',
    description: 'Learn Python programming for data analysis and visualization. Cover NumPy, Pandas, Matplotlib, Seaborn, and Jupyter notebooks. Work with real datasets, perform statistical analysis, and create compelling visualizations.',
    shortDescription: 'Learn Python, NumPy, Pandas and data visualization from scratch',
    category: 'Data Science',
    tags: ['python', 'data-science', 'pandas', 'numpy', 'visualization'],
    difficulty: 'beginner',
    duration: 35,
    rating: 4.7,
    studentsCount: 18000,
    thumbnail: 'https://picsum.photos/seed/python/400/300',
    learningOutcomes: [
      'Write Python programs for data analysis',
      'Manipulate data with Pandas and NumPy',
      'Create visualizations with Matplotlib and Seaborn',
      'Work with real-world datasets',
      'Perform statistical analysis',
    ],
    requiredSkills: [],
    isPublished: true,
  },
  {
    title: 'Machine Learning Engineering',
    description: 'Deep dive into machine learning algorithms, model training, and deployment. Cover supervised and unsupervised learning, neural networks, feature engineering, model evaluation, and MLOps practices.',
    shortDescription: 'Build and deploy ML models with scikit-learn, TensorFlow and PyTorch',
    category: 'Machine Learning',
    tags: ['machine-learning', 'python', 'tensorflow', 'pytorch', 'ai'],
    difficulty: 'advanced',
    duration: 60,
    rating: 4.9,
    studentsCount: 8500,
    thumbnail: 'https://picsum.photos/seed/ml/400/300',
    learningOutcomes: [
      'Implement classical ML algorithms from scratch',
      'Build and train neural networks',
      'Deploy models to production',
      'Perform feature engineering and selection',
      'Evaluate and tune model performance',
    ],
    requiredSkills: ['Python', 'Linear Algebra', 'Statistics basics'],
    isPublished: true,
  },
  {
    title: 'Flutter Mobile Development',
    description: 'Build beautiful cross-platform mobile apps with Flutter and Dart. Learn widget architecture, state management, API integration, animations, and publish to both App Store and Google Play.',
    shortDescription: 'Build iOS and Android apps with Flutter and Dart',
    category: 'Mobile Development',
    tags: ['flutter', 'dart', 'mobile', 'ios', 'android'],
    difficulty: 'intermediate',
    duration: 45,
    rating: 4.6,
    studentsCount: 9200,
    thumbnail: 'https://picsum.photos/seed/flutter/400/300',
    learningOutcomes: [
      'Build cross-platform mobile apps with Flutter',
      'Master Dart programming language',
      'Implement state management patterns',
      'Integrate REST APIs and Firebase',
      'Publish apps to App Store and Google Play',
    ],
    requiredSkills: ['Programming basics'],
    isPublished: true,
  },
  {
    title: 'AWS Cloud Architecture',
    description: 'Master Amazon Web Services for cloud computing. Learn EC2, S3, RDS, Lambda, VPC, IAM, and more. Design scalable, secure, and cost-effective architectures. Prepare for the AWS Solutions Architect certification.',
    shortDescription: 'Master AWS services and design scalable cloud architectures',
    category: 'Cloud Computing',
    tags: ['aws', 'cloud', 'devops', 'architecture', 'certification'],
    difficulty: 'intermediate',
    duration: 50,
    rating: 4.7,
    studentsCount: 11000,
    thumbnail: 'https://picsum.photos/seed/aws/400/300',
    learningOutcomes: [
      'Design and deploy AWS architectures',
      'Manage compute, storage, and networking',
      'Implement security best practices',
      'Optimize for cost and performance',
      'Prepare for AWS certification',
    ],
    requiredSkills: ['Basic networking', 'Linux command line'],
    isPublished: true,
  },
  {
    title: 'Docker & Kubernetes Mastery',
    description: 'Learn containerization with Docker and orchestration with Kubernetes. Build CI/CD pipelines, manage microservices, and deploy applications at scale. Covers Docker Compose, Helm, and cloud deployments.',
    shortDescription: 'Containerize apps with Docker and orchestrate with Kubernetes',
    category: 'DevOps',
    tags: ['docker', 'kubernetes', 'devops', 'containers', 'ci-cd'],
    difficulty: 'intermediate',
    duration: 38,
    rating: 4.8,
    studentsCount: 7800,
    thumbnail: 'https://picsum.photos/seed/docker/400/300',
    learningOutcomes: [
      'Containerize applications with Docker',
      'Deploy and manage Kubernetes clusters',
      'Build CI/CD pipelines',
      'Manage microservices architecture',
      'Monitor and scale containerized apps',
    ],
    requiredSkills: ['Linux basics', 'Command line'],
    isPublished: true,
  },
  {
    title: 'Full-Stack JavaScript',
    description: 'Become a full-stack JavaScript developer. Learn Node.js, Express, MongoDB, React, and deployment. Build complete web applications from database to frontend with authentication, API design, and testing.',
    shortDescription: 'Build full-stack apps with Node.js, Express, MongoDB and React',
    category: 'Web Development',
    tags: ['javascript', 'nodejs', 'express', 'mongodb', 'react', 'fullstack'],
    difficulty: 'intermediate',
    duration: 55,
    rating: 4.6,
    studentsCount: 14000,
    thumbnail: 'https://picsum.photos/seed/fullstack/400/300',
    learningOutcomes: [
      'Build RESTful APIs with Node.js and Express',
      'Design and query MongoDB databases',
      'Create React frontends with authentication',
      'Implement JWT authentication and authorization',
      'Deploy full-stack applications',
    ],
    requiredSkills: ['HTML', 'CSS', 'JavaScript basics'],
    isPublished: true,
  },
  {
    title: 'Ethical Hacking & Penetration Testing',
    description: 'Learn cybersecurity through ethical hacking. Cover reconnaissance, scanning, exploitation, post-exploitation, and reporting. Practice with hands-on labs using Kali Linux, Metasploit, Burp Suite, and more.',
    shortDescription: 'Learn penetration testing and cybersecurity defense techniques',
    category: 'Cybersecurity',
    tags: ['cybersecurity', 'hacking', 'penetration-testing', 'kali-linux'],
    difficulty: 'advanced',
    duration: 48,
    rating: 4.5,
    studentsCount: 6500,
    thumbnail: 'https://picsum.photos/seed/hacking/400/300',
    learningOutcomes: [
      'Perform reconnaissance and vulnerability scanning',
      'Exploit common vulnerabilities',
      'Conduct penetration tests',
      'Write professional security reports',
      'Implement defensive security measures',
    ],
    requiredSkills: ['Networking basics', 'Linux basics', 'Programming basics'],
    isPublished: true,
  },
  {
    title: 'UI/UX Design Fundamentals',
    description: 'Learn the principles of great user interface and user experience design. Cover design thinking, wireframing, prototyping, user research, and Figma. Create professional designs that users love.',
    shortDescription: 'Master UI/UX design principles with Figma and design thinking',
    category: 'UI/UX Design',
    tags: ['ui', 'ux', 'figma', 'design', 'prototyping'],
    difficulty: 'beginner',
    duration: 25,
    rating: 4.7,
    studentsCount: 10500,
    thumbnail: 'https://picsum.photos/seed/uiux/400/300',
    learningOutcomes: [
      'Apply design thinking methodology',
      'Create wireframes and prototypes in Figma',
      'Conduct user research and testing',
      'Design responsive interfaces',
      'Build a professional design portfolio',
    ],
    requiredSkills: [],
    isPublished: true,
  },
  {
    title: 'TypeScript Deep Dive',
    description: 'Master TypeScript from basics to advanced type manipulation. Learn generics, utility types, mapped types, conditional types, and decorators. Build type-safe applications with confidence.',
    shortDescription: 'Master TypeScript types, generics and advanced patterns',
    category: 'Web Development',
    tags: ['typescript', 'javascript', 'types', 'programming'],
    difficulty: 'intermediate',
    duration: 30,
    rating: 4.8,
    studentsCount: 9800,
    thumbnail: 'https://picsum.photos/seed/typescript/400/300',
    learningOutcomes: [
      'Write type-safe TypeScript code',
      'Use generics and utility types effectively',
      'Implement advanced type patterns',
      'Integrate TypeScript with React and Node.js',
      'Configure TypeScript projects properly',
    ],
    requiredSkills: ['JavaScript fundamentals'],
    isPublished: true,
  },
  {
    title: 'Data Engineering with Python',
    description: 'Build data pipelines and ETL processes with Python. Learn about data warehousing, Apache Airflow, Spark, and data modeling. Process and transform large datasets efficiently.',
    shortDescription: 'Build data pipelines with Python, Airflow and Spark',
    category: 'Data Science',
    tags: ['data-engineering', 'python', 'etl', 'airflow', 'spark'],
    difficulty: 'advanced',
    duration: 52,
    rating: 4.6,
    studentsCount: 5200,
    thumbnail: 'https://picsum.photos/seed/dataeng/400/300',
    learningOutcomes: [
      'Design and build data pipelines',
      'Use Apache Airflow for workflow orchestration',
      'Process big data with Apache Spark',
      'Model data warehouses',
      'Implement data quality checks',
    ],
    requiredSkills: ['Python', 'SQL', 'Database basics'],
    isPublished: true,
  },
  {
    title: 'React Native Mobile Apps',
    description: 'Build native mobile apps for iOS and Android using React Native and Expo. Learn navigation, state management, native modules, and publish to app stores.',
    shortDescription: 'Build cross-platform mobile apps with React Native and Expo',
    category: 'Mobile Development',
    tags: ['react-native', 'mobile', 'expo', 'javascript', 'ios', 'android'],
    difficulty: 'intermediate',
    duration: 42,
    rating: 4.5,
    studentsCount: 7200,
    thumbnail: 'https://picsum.photos/seed/reactnative/400/300',
    learningOutcomes: [
      'Build cross-platform mobile apps',
      'Implement navigation and routing',
      'Use native device features',
      'Manage state with Redux',
      'Publish to App Store and Google Play',
    ],
    requiredSkills: ['React basics', 'JavaScript'],
    isPublished: true,
  },
];

const seedLearningPaths = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    await LearningPath.deleteMany({ slug: null });
    const existingCount = await LearningPath.countDocuments();
    if (existingCount > 0) {
      console.log(`Database already has ${existingCount} learning paths. Skipping seed.`);
      await mongoose.disconnect();
      return;
    }

    let creator = await User.findOne({ email: 'admin@skillbridge.ai' });
    if (!creator) {
      creator = await User.create({
        name: 'Admin User',
        email: 'admin@skillbridge.ai',
        password: 'Admin123!',
        provider: 'local',
        role: 'admin',
        isEmailVerified: true,
      });
      console.log('Created admin user');
    }

    const pathsWithCreator = learningPaths.map((lp) => ({
      ...lp,
      creator: creator!._id,
    }));

    const inserted: InstanceType<typeof LearningPath>[] = [];
    for (const lp of pathsWithCreator) {
      const doc = new LearningPath(lp);
      await doc.save();
      inserted.push(doc);
    }
    console.log(`Successfully seeded ${inserted.length} learning paths!`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding learning paths:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedLearningPaths();
