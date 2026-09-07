import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Logo from "@/components/logo";
import GoogleOauthButton from "@/components/auth/google-oauth-button";
import { useMutation } from "@tanstack/react-query";
import { registerMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Loader, ArrowRight, Zap, Shield, Users } from "lucide-react";

const perks = [
  { icon: Zap, label: "Set up in under 2 minutes" },
  { icon: Shield, label: "Enterprise-grade security" },
  { icon: Users, label: "Unlimited collaborators on free tier" },
];

const SignUp = () => {
  const navigate = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationFn: registerMutationFn,
  });

  const formSchema = z.object({
    name: z.string().trim().min(1, { message: "Name is required" }),
    email: z.string().trim().email("Invalid email address").min(1, {
      message: "Email is required",
    }),
    password: z.string().trim().min(1, { message: "Password is required" }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return;
    mutate(values, {
      onSuccess: () => {
        navigate("/sign-in");
      },
      onError: (error) => {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel – branding */}
      <div className="hidden lg:flex lg:flex-1 relative bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 items-center justify-center p-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-ambient-glow-reverse" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px] animate-ambient-glow" />

        <div className="relative z-10 max-w-sm text-center">
          <div className="flex items-center gap-3 justify-center mb-10">
            <Logo />
            <span className="font-extrabold text-3xl bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent tracking-tight">
              GPMS
            </span>
          </div>

          <h2 className="text-3xl font-extrabold text-white mb-4 leading-tight">
            Start shipping faster
            <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              with your team.
            </span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-10">
            Join thousands of teams that trust GPMS to plan, collaborate, and deliver remarkable projects.
          </p>

          {/* Perks */}
          <div className="space-y-4">
            {perks.map(({ icon: Icon, label }, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-300 text-sm bg-white/5 rounded-xl px-4 py-3">
                <div className="p-1.5 rounded-lg bg-indigo-500/20">
                  <Icon className="w-4 h-4 text-indigo-400" />
                </div>
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel – form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 relative bg-slate-50 dark:bg-slate-950 overflow-hidden">
        <div className="lg:hidden absolute top-0 right-0 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl" />
        <div className="lg:hidden absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl" />

        <div className="w-full max-w-sm relative z-10">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 self-start mb-8 lg:hidden">
            <Logo />
            <span className="font-extrabold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              GPMS
            </span>
          </div>

          {/* Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8">
            <div className="mb-7">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Create your account
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                Free forever · No credit card required
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* Google OAuth */}
                <GoogleOauthButton label="Signup" />

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white dark:bg-slate-900 px-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                      or sign up with email
                    </span>
                  </div>
                </div>

                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          autoComplete="name"
                          className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 focus-visible:ring-2 focus-visible:ring-indigo-500 text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Work Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@company.com"
                          autoComplete="email"
                          className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 focus-visible:ring-2 focus-visible:ring-indigo-500 text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Create a strong password"
                          autoComplete="new-password"
                          className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 focus-visible:ring-2 focus-visible:ring-indigo-500 text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 text-sm"
                >
                  {isPending ? (
                    <Loader className="animate-spin mr-2 h-4 w-4" />
                  ) : (
                    <ArrowRight className="mr-2 h-4 w-4" />
                  )}
                  Create account
                </Button>

                {/* Switch to sign in */}
                <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                  Already have an account?{" "}
                  <Link
                    to="/sign-in"
                    className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors underline-offset-4 hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </form>
            </Form>
          </div>

          {/* ToS */}
          <p className="text-center text-xs text-slate-400 mt-5 leading-relaxed">
            By creating an account, you agree to our{" "}
            <a href="#" className="underline underline-offset-2 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="underline underline-offset-2 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
