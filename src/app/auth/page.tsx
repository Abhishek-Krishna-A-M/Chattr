import { Button } from "@/components/ui/button";

const page = () => {
  return (
    <div className="flex flex-col lg:flex-row h-screen w-full">
      {/* Left Side - Brand Section */}
      <div className="flex-1 flex overflow-hidden dark:bg-[#651c2b55] bg-[#651c2b] relative justify-center items-center py-8 lg:py-0">
        <div className="text-center text-white px-8">
          <div className="mb-4 lg:mb-6">
            <h1 className="text-4xl lg:text-5xl font-bold mb-2">Chattr</h1>
            <p className="text-lg lg:text-xl opacity-90">Connect. Chat. Collaborate.</p>
            {/* Desktop footer */}
            <div className="hidden lg:block absolute bottom-8 left-0 right-0 text-center">
              <p className="text-white/70 text-sm">Where conversations come to life</p>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-5 left-5 lg:top-10 lg:left-10 w-16 h-16 lg:w-20 lg:h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-8 lg:bottom-20 lg:right-16 w-24 h-24 lg:w-32 lg:h-32 bg-white/5 rounded-full blur-2xl"></div>

        {/* Mobile footer */}
        <div className="absolute bottom-4 left-0 right-0 text-center lg:hidden">
          <p className="text-white/70 text-sm">Where conversations come to life</p>
        </div>
      </div>

      {/* Right Side - Auth Section */}
      <div className="flex-1 flex flex-col justify-center items-center bg-background py-8 lg:py-0">
        <div className="w-full max-w-md px-6 sm:px-8">
          {/* Header */}
          <div className="text-center mb-8 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Welcome to Chattr
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Choose how you'd like to continue your journey
            </p>
          </div>

          {/* Auth Buttons */}
          <div className="space-y-4">
            <Button
              className="w-full h-12 text-base font-semibold bg-[#651c2b] hover:bg-[#7a2335] text-white transition-all duration-200"
              size="lg"
            >
              Create Account
            </Button>

            <Button
              variant="outline"
              className="w-full h-12 text-base font-semibold border-2 border-[#651c2b] text-[#651c2b] hover:bg-[#651c2b] hover:text-white transition-all duration-200"
              size="lg"
            >
              Sign In
            </Button>
          </div>

          {/* Divider */}
          <div className="flex items-center my-6 lg:my-8">
            <div className="flex-1 border-t border-muted"></div>
            <span className="px-4 text-sm text-muted-foreground">or</span>
            <div className="flex-1 border-t border-muted"></div>
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-11 gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </Button>

          </div>

          {/* Footer */}
          <div className="mt-8 lg:mt-12 text-center">
            <p className="text-xs text-muted-foreground">
              By continuing, you agree to our{" "}
              <a href="#" className="text-[#651c2b] hover:underline font-medium">Terms</a>
              {" "}and{" "}
              <a href="#" className="text-[#651c2b] hover:underline font-medium">Privacy</a>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

export default page
