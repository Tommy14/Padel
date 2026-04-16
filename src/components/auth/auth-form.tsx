"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [method, setMethod] = useState<"email" | "sms">("email");
  const [smsPhone, setSmsPhone] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [smsName, setSmsName] = useState("");
  const [smsStep, setSmsStep] = useState<"request" | "verify">("request");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setMessage(null);

    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "").trim();
    const supabase = createClient();

    try {
      if (mode === "signup") {
        const name = String(formData.get("name") ?? "").trim();
        const phone = String(formData.get("phone") ?? "").trim();
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              phone,
            },
          },
        });

        if (signUpError) {
          throw signUpError;
        }

        if (data.session) {
          router.push("/auth/redirect");
          router.refresh();
          return;
        }

        setMessage("Account created. Check your email if confirmation is enabled, then log in.");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          throw signInError;
        }

        router.push("/auth/redirect");
        router.refresh();
      }
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSmsSubmit() {
    setLoading(true);
    setError(null);
    setMessage(null);
    const supabase = createClient();

    try {
      if (smsStep === "request") {
        const payload =
          mode === "signup"
            ? {
                phone: smsPhone.trim(),
                options: {
                  shouldCreateUser: true,
                  data: {
                    name: smsName.trim() || "New player",
                    phone: smsPhone.trim(),
                  },
                },
              }
            : {
                phone: smsPhone.trim(),
                options: {
                  shouldCreateUser: false,
                },
              };

        const { error: otpError } = await supabase.auth.signInWithOtp(payload);
        if (otpError) {
          throw otpError;
        }

        setSmsStep("verify");
        setMessage("Verification code sent by SMS. Enter it below to continue.");
      } else {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          phone: smsPhone.trim(),
          token: smsCode.trim(),
          type: "sms",
        });

        if (verifyError) {
          throw verifyError;
        }

        router.push("/auth/redirect");
        router.refresh();
      }
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function switchMethod(nextMethod: "email" | "sms") {
    setMethod(nextMethod);
    setError(null);
    setMessage(null);
    setSmsStep("request");
    setSmsCode("");
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>{mode === "login" ? "Welcome back" : "Create your account"}</CardTitle>
        <CardDescription>
          {mode === "login" ? "Sign in with email/password or SMS OTP." : "Create your account with email/password or SMS OTP."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-2 gap-2">
          <Button onClick={() => switchMethod("email")} type="button" variant={method === "email" ? "default" : "outline"}>
            Email
          </Button>
          <Button onClick={() => switchMethod("sms")} type="button" variant={method === "sms" ? "default" : "outline"}>
            SMS OTP
          </Button>
        </div>
        {method === "email" ? (
          <form
            action={async (formData) => {
              await handleSubmit(formData);
            }}
            className="space-y-4"
          >
            {mode === "signup" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" placeholder="+94771234567" required />
                </div>
              </>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" minLength={6} required />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {message ? <p className="text-sm text-success">{message}</p> : null}
            <Button className="w-full" disabled={loading} type="submit">
              {loading ? "Please wait..." : mode === "login" ? "Log in" : "Sign up"}
            </Button>
          </form>
        ) : (
          <form
            action={async () => {
              await handleSmsSubmit();
            }}
            className="space-y-4"
          >
            {mode === "signup" ? (
              <div className="space-y-2">
                <Label htmlFor="sms-name">Name</Label>
                <Input
                  id="sms-name"
                  onChange={(event) => setSmsName(event.target.value)}
                  placeholder="Player name"
                  required
                  value={smsName}
                />
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="sms-phone">Phone</Label>
              <Input
                id="sms-phone"
                onChange={(event) => setSmsPhone(event.target.value)}
                placeholder="+94771234567"
                required
                value={smsPhone}
              />
            </div>
            {smsStep === "verify" ? (
              <div className="space-y-2">
                <Label htmlFor="sms-code">Verification code</Label>
                <Input
                  id="sms-code"
                  inputMode="numeric"
                  onChange={(event) => setSmsCode(event.target.value)}
                  placeholder="123456"
                  required
                  value={smsCode}
                />
              </div>
            ) : null}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {message ? <p className="text-sm text-success">{message}</p> : null}
            <Button className="w-full" disabled={loading} type="submit">
              {loading ? "Please wait..." : smsStep === "request" ? "Send SMS code" : "Verify and continue"}
            </Button>
            {smsStep === "verify" ? (
              <Button
                className="w-full"
                onClick={() => {
                  setSmsStep("request");
                  setSmsCode("");
                  setError(null);
                  setMessage(null);
                }}
                type="button"
                variant="outline"
              >
                Use a different number
              </Button>
            ) : null}
          </form>
        )}
        <p className="mt-4 text-sm text-muted-foreground">
          {mode === "login" ? "Need an account? " : "Already have an account? "}
          <Link className="font-medium text-primary hover:underline" href={mode === "login" ? "/signup" : "/login"}>
            {mode === "login" ? "Sign up" : "Log in"}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
