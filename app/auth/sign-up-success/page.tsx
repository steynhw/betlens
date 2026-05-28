import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Mail } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription>
            {"We've sent you a confirmation link. Please check your email to verify your account."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {"Once verified, you'll be able to sign in and start tracking your bets."}
          </p>
          <Link href="/auth/login">
            <Button variant="outline" className="w-full">
              <TrendingUp className="mr-2 h-4 w-4" />
              Return to Sign In
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
