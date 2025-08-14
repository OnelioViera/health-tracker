import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Activity, Stethoscope, TrendingUp, Shield, Zap, History } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img 
              src="/logo.svg" 
              alt="MyHealthFirst Logo" 
              width={32} 
              height={32} 
              className="rounded-lg"
            />
            <span className="text-2xl font-bold text-gray-900">MyHealthFirst</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Take Control of Your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Health</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Track your blood pressure, medical history, doctor visits, and more with our modern, 
            comprehensive health tracking app designed for your wellness journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="text-lg px-8 py-6">
                Start Tracking Today
                <Zap className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Track
          </h2>
          <p className="text-xl text-gray-600">
            Comprehensive health monitoring in one beautiful, easy-to-use app
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle>Blood Pressure</CardTitle>
              <CardDescription>
                Track your systolic and diastolic readings with automatic categorization and trends
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <History className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Medical History</CardTitle>
              <CardDescription>
                Record and monitor your medical conditions, symptoms, and treatment plans
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Stethoscope className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Doctor Visits</CardTitle>
              <CardDescription>
                Log appointments, diagnoses, treatments, and follow-up schedules
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Secure & Private</CardTitle>
              <CardDescription>
                Your health data is encrypted and protected with enterprise-grade security
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Weight & Body Metrics</CardTitle>
              <CardDescription>
                Monitor your weight and BMI over time with trend analysis
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle>Smart Insights</CardTitle>
              <CardDescription>
                Get personalized insights and trends to better understand your health patterns
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
          <CardContent className="text-center py-16">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Take Control?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of users who are already tracking their health with MyHealthFirst
            </p>
            <Link href="/sign-up">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                Start Your Health Journey
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t">
        <div className="text-center text-gray-600">
          <p>&copy; 2024 MyHealthFirst. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
