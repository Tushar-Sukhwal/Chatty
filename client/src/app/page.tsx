"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Users,
  Shield,
  Zap,
  Globe,
  Heart,
  Star,
  ArrowRight,
  Check,
  Menu,
  X,
} from "lucide-react";

export default function ChatAppLanding() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const features = [
    {
      icon: <MessageCircle className="h-8 w-8 text-blue-500" />,
      title: "Real-time Messaging",
      description:
        "Lightning-fast messages with instant delivery and read receipts.",
    },
    {
      icon: <Users className="h-8 w-8 text-green-500" />,
      title: "Group Conversations",
      description:
        "Create unlimited groups and channels for team collaboration.",
    },
    {
      icon: <Shield className="h-8 w-8 text-purple-500" />,
      title: "End-to-End Encryption",
      description:
        "Your conversations are secure with military-grade encryption.",
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-500" />,
      title: "Lightning Fast",
      description:
        "Optimized performance for seamless communication experience.",
    },
    {
      icon: <Globe className="h-8 w-8 text-cyan-500" />,
      title: "Global Reach",
      description:
        "Connect with people worldwide with international infrastructure.",
    },
    {
      icon: <Heart className="h-8 w-8 text-red-500" />,
      title: "User-Friendly",
      description: "Intuitive design for users of all technical levels.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Manager",
      content:
        "This chat app has completely transformed how our team communicates. The interface is beautiful and the features are incredibly powerful.",
      rating: 5,
    },
    {
      name: "Alex Rivera",
      role: "Software Engineer",
      content:
        "The real-time messaging is incredibly fast and reliable. Our development team loves the group features.",
      rating: 5,
    },
    {
      name: "Maya Patel",
      role: "Designer",
      content:
        "The UI is clean and intuitive. Our clients have been impressed with the professional look and feel.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-8 w-8 text-blue-500" />
              <span className="text-2xl font-bold text-white">ChatApp</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Features
              </a>
              <a
                href="#testimonials"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Reviews
              </a>
              <a
                href="#pricing"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Pricing
              </a>
              <Button
                variant="ghost"
                onClick={() => router.push("/login")}
                className="text-white hover:bg-white/10"
              >
                Sign In
              </Button>
              <Button
                onClick={() => router.push("/signup")}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                Get Started
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/90 backdrop-blur-md border-t border-white/10">
            <div className="px-4 py-6 space-y-4">
              <a
                href="#features"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                Features
              </a>
              <a
                href="#testimonials"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                Reviews
              </a>
              <a
                href="#pricing"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                Pricing
              </a>
              <Button
                variant="ghost"
                onClick={() => router.push("/login")}
                className="w-full justify-start text-white hover:bg-white/10"
              >
                Sign In
              </Button>
              <Button
                onClick={() => router.push("/signup")}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600"
              >
                Get Started
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <Badge className="mb-8 bg-white/10 text-white border-white/20">
            ✨ Now with AI-powered features
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in-up">
            Connect, Chat,
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {" "}
              Collaborate
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 animate-fade-in-up animation-delay-300">
            Experience the future of communication with our next-generation chat
            platform. Connect with friends, collaborate with teams, and build
            communities like never before.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-600">
            <Button
              onClick={() => router.push("/signup")}
              size="lg"
              className="group px-8 py-6 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              onClick={() => router.push("/login")}
              variant="outline"
              size="lg"
              className="px-8 py-6 text-lg border-2 border-white/30 text-white hover:bg-white/10 transition-all duration-200"
            >
              Sign In
            </Button>
          </div>

          {/* Social Proof */}
          <div className="mt-16 animate-fade-in-up animation-delay-900">
            <p className="text-gray-400 mb-4">
              Trusted by over 10,000+ teams worldwide
            </p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-24 h-8 bg-gray-600 rounded animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Powerful Features for Modern Communication
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need for seamless communication and collaboration
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
              >
                <CardHeader>
                  <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-white text-xl">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400 text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Loved by Thousands
            </h2>
            <p className="text-xl text-gray-400">
              See what our users have to say about their experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
              >
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <CardDescription className="text-gray-300 text-base leading-relaxed">
                    "{testimonial.content}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <p className="text-white font-semibold">
                      {testimonial.name}
                    </p>
                    <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Communication?
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Join millions of users who trust our platform for their daily
            communication needs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push("/signup")}
              size="lg"
              className="px-12 py-6 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200"
            >
              Start Free Trial
            </Button>

            <Button
              onClick={() => router.push("/login")}
              variant="outline"
              size="lg"
              className="px-12 py-6 text-lg border-2 border-white/30 text-white hover:bg-white/10"
            >
              Sign In Now
            </Button>
          </div>

          <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-gray-400">
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-green-400" />
              <span>Free 14-day trial</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-green-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-green-400" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10 bg-black/20">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center items-center mb-6">
            <MessageCircle className="w-8 h-8 text-blue-500 mr-3" />
            <span className="text-2xl font-bold text-white">ChatApp</span>
          </div>
          <p className="text-gray-400">
            © 2025 ChatApp. All rights reserved. Built with ❤️ for better
            communication.
          </p>
        </div>
      </footer>

      <style jsx>{`
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
          transform: translateY(30px);
        }
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
        .animation-delay-900 {
          animation-delay: 0.9s;
        }
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
