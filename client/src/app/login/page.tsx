"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { loginWithEmail, loginWithGoogle } = useAuth();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      await loginWithEmail(email, password);
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Google login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const { user, hasHydrated } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (hasHydrated && user) {
      router.push("/dashboard");
    }
  }, [user, hasHydrated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-background dark:to-muted p-4">
      <Card className="w-full max-w-md shadow-lg dark:border-border">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-blue-600 dark:bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white dark:text-primary-foreground font-bold text-xl">
              C
            </span>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-foreground">
            Welcome to Chatty
          </CardTitle>
          <p className="text-gray-600 dark:text-muted-foreground">
            Sign in to your account
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !email || !password}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-card px-2 text-gray-500 dark:text-muted-foreground">
                or continue with
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
              <g>
                <path
                  fill="#4285F4"
                  d="M44.5 20H24v8.5h11.7C34.7 32.9 30.1 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8.1 2.9l6.1-6.1C34.5 6.5 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.3-4z"
                />
                <path
                  fill="#34A853"
                  d="M6.3 14.7l7 5.1C15.5 16.1 19.4 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.1-6.1C34.5 6.5 29.6 4 24 4c-7.2 0-13.3 4.1-16.7 10.7z"
                />
                <path
                  fill="#FBBC05"
                  d="M24 44c5.6 0 10.5-1.9 14.3-5.1l-6.6-5.4C29.7 35.5 27 36.5 24 36.5c-6.1 0-10.7-4.1-12.5-9.6l-7 5.4C6.7 39.9 14.1 44 24 44z"
                />
                <path
                  fill="#EA4335"
                  d="M44.5 20H24v8.5h11.7c-1.1 3.1-4.1 5.5-7.7 5.5-2.2 0-4.2-.7-5.7-2l-7 5.4C18.3 41.1 21 44 24 44c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.3-4z"
                />
              </g>
            </svg>
            Continue with Google
          </Button>

          <div className="text-center">
            <Button
              variant="link"
              onClick={() => router.push("/signup")}
              className="text-sm"
            >
              Don't have an account? Sign up
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
