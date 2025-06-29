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
import {
  MessageCircle,
  Users,
  Shield,
  Zap,
  ArrowRight,
  Check,
  Menu,
  X,
  Cloud,
  Database,
  Github as GithubIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function ChatAppLanding() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <Cloud className="h-8 w-8 text-blue-600" />,
      title: "Scalable Infrastructure",
      description: "Stateless nodes that scale horizontally on any cloud.",
    },
    {
      icon: <Database className="h-8 w-8 text-green-600" />,
      title: "Redis Presence",
      description: "Instant online/offline status powered by Redis.",
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-600" />,
      title: "Kafka Event Streaming",
      description: "High-throughput event pipeline using Apache Kafka.",
    },
    {
      icon: <Shield className="h-8 w-8 text-purple-600" />,
      title: "Secure Auth",
      description: "JWT & Firebase secured authentication flow.",
    },
    {
      icon: <GithubIcon className="h-8 w-8 text-black" />,
      title: "Open-source",
      description: "Source code available on GitHub – contributions welcome!",
    },
    {
      icon: <Users className="h-8 w-8 text-cyan-600" />,
      title: "Modern UI",
      description: "Next.js 15, React 19, Tailwind 4 & shadcn-ui.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Chatty</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Features
              </a>
              <a
                href="https://github.com/Tushar-Sukhwal/Chatty"
                target="_blank"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
              {isAuthenticated ? (
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                >
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => router.push("/login")}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => router.push("/signup")}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-gray-700"
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
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200/50">
            <div className="px-4 py-6 space-y-4">
              <a
                href="#features"
                className="block text-gray-600 hover:text-gray-900 transition-colors"
              >
                Features
              </a>
              <a
                href="https://github.com/Tushar-Sukhwal/Chatty"
                target="_blank"
                className="block text-gray-600 hover:text-gray-900 transition-colors"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
              {isAuthenticated ? (
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="w-full justify-start text-gray-600 hover:text-gray-900"
                >
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => router.push("/login")}
                    className="w-full justify-start text-gray-600 hover:text-gray-900"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => router.push("/signup")}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 animate-fade-in-up">
            Connect, Chat,
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}
              Collaborate
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 animate-fade-in-up animation-delay-300">
            Experience the future of communication with our next-generation chat
            platform. Connect with friends, collaborate with teams, and build
            communities like never before.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-600">
            {isAuthenticated ? (
              <>
                <Button
                  onClick={() => router.push("/dashboard")}
                  size="lg"
                  className="group px-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  Go to Dashboard
                </Button>
                <Button
                  onClick={() =>
                    window.open(
                      "https://github.com/Tushar-Sukhwal/Chatty",
                      "_blank"
                    )
                  }
                  variant="outline"
                  size="lg"
                  className="px-8 py-6 text-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
                >
                  GitHub Repo
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => router.push("/signup")}
                  size="lg"
                  className="group px-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  onClick={() => router.push("/login")}
                  variant="outline"
                  size="lg"
                  className="px-8 py-6 text-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
                >
                  Sign In
                </Button>
              </>
            )}
          </div>

          {/* Social Proof */}
          <div className="mt-16 animate-fade-in-up animation-delay-900">
            <p className="text-gray-500 mb-4">
              Trusted by over 10,000+ teams worldwide
            </p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-24 h-8 bg-gray-300 rounded animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Powerful Features for Modern Communication
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need for seamless communication and collaboration
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group bg-white/80 border-gray-200 hover:bg-white hover:shadow-lg transition-all duration-300 hover:scale-105 backdrop-blur-sm"
              >
                <CardHeader>
                  <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-gray-900 text-xl">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-100 to-purple-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Communication?
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Join millions of users who trust our platform for their daily
            communication needs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push("/signup")}
              size="lg"
              className="px-12 py-6 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Start Free Trial
            </Button>

            <Button
              onClick={() => router.push("/login")}
              variant="outline"
              size="lg"
              className="px-12 py-6 text-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Sign In Now
            </Button>
          </div>

          <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-gray-600">
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-green-600" />
              <span>Free 14-day trial</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-green-600" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-green-600" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-200 bg-white/50">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center items-center mb-6">
            <MessageCircle className="w-8 h-8 text-blue-600 mr-3" />
            <span className="text-2xl font-bold text-gray-900">Chatty</span>
          </div>
          <p className="text-gray-600">
            Made with ❤️ by{" "}
            <a
              href="https://tusharsukhwal.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Tushar&nbsp;Sukhwal
            </a>
            . Source code on{" "}
            <a
              href="https://github.com/Tushar-Sukhwal/Chatty"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              GitHub
            </a>
            .
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
