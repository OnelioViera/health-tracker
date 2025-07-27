# MyHealthFirst - Personal Health Tracking App

A modern, comprehensive health tracking application built with Next.js, shadcn/ui, Tailwind CSS, MongoDB Atlas, and Clerk authentication.

## Features

### 🩺 Health Tracking
- **Blood Pressure Monitoring**: Track systolic, diastolic, and pulse with automatic categorization
- **Blood Work Results**: Log lab results with reference ranges and status indicators
- **Doctor Visits**: Manage appointments, diagnoses, treatments, and follow-ups
- **Weight & Body Metrics**: Monitor weight and BMI with trend analysis

### 🎨 Modern UI/UX
- Beautiful, responsive design with Tailwind CSS
- shadcn/ui components for consistent styling
- Intuitive navigation and user experience
- Real-time data visualization and trends

### 🔐 Security & Authentication
- Clerk authentication for secure user management
- Protected routes and user-specific data
- Enterprise-grade security for health data

### 📊 Analytics & Insights
- Health trend analysis
- Progress tracking
- Personalized insights
- Data visualization

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Authentication**: Clerk
- **Database**: MongoDB Atlas
- **ORM**: Mongoose
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB Atlas account
- Clerk account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd myhealthfirst
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

   # MongoDB Atlas
   MONGODB_URI=your_mongodb_atlas_connection_string

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up Clerk**
   - Create a Clerk account at [clerk.com](https://clerk.com)
   - Create a new application
   - Copy your publishable key and secret key to `.env.local`

5. **Set up MongoDB Atlas**
   - Create a MongoDB Atlas account
   - Create a new cluster
   - Get your connection string
   - Add it to `.env.local`

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
myhealthfirst/
├── src/
│   ├── app/
│   │   ├── api/                 # API routes
│   │   ├── dashboard/           # Dashboard pages
│   │   ├── sign-in/            # Authentication pages
│   │   ├── sign-up/
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   └── dashboard-nav.tsx   # Navigation component
│   └── lib/
│       ├── models/             # MongoDB models
│       ├── mongodb.ts          # Database connection
│       └── utils.ts            # Utility functions
├── public/                     # Static assets
├── components.json             # shadcn/ui configuration
├── tailwind.config.js          # Tailwind configuration
└── package.json
```

## Key Features

### Blood Pressure Tracking
- Automatic categorization (Normal, Elevated, High, Crisis)
- Trend analysis and visualization
- Historical data tracking
- Pulse monitoring

### Blood Work Management
- Comprehensive lab result logging
- Reference range tracking
- Abnormal result highlighting
- Test categorization

### Doctor Visit Management
- Appointment scheduling
- Visit type categorization
- Treatment and medication tracking
- Follow-up scheduling

### Weight & Body Metrics
- Weight tracking with trends
- Body composition monitoring
- Progress visualization

## API Endpoints

- `POST /api/blood-pressure` - Create blood pressure reading
- `GET /api/blood-pressure` - Get blood pressure records
- `POST /api/blood-work` - Create blood work record
- `GET /api/blood-work` - Get blood work records
- `POST /api/doctor-visits` - Create doctor visit
- `GET /api/doctor-visits` - Get doctor visits
- `POST /api/weight` - Create weight record
- `GET /api/weight` - Get weight records

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**MyHealthFirst** - Take control of your health journey with modern, comprehensive tracking.
