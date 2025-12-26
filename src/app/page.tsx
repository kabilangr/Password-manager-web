import Link from "next/link";
import { Shield, Lock, Share2, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center lg:p-24">
      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center space-y-8 max-w-4xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary animate-in fade-in slide-in-from-top-4 duration-1000">
          <Shield className="h-4 w-4" />
          <span className="text-xs font-bold tracking-wider uppercase">Zero-Knowledge Security</span>
        </div>

        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-foreground">
          Your Secrets, <br />
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Perfectly Secured.
          </span>
        </h1>

        <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl leading-relaxed">
          The enterprise-grade password manager that gives you total control.
          End-to-end encrypted, zero-knowledge, and built for modern teams.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link
            href="/register"
            className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
          >
            Get Started Free
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 bg-background border border-border font-bold rounded-xl hover:bg-muted transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-6xl w-full relative z-10">
        <div className="p-8 rounded-3xl bg-card border border-border hover:border-primary/50 transition-colors group">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-card-foreground">End-to-End Encryption</h3>
          <p className="text-muted-foreground leading-relaxed">
            Data is encrypted on your device and never sent to our servers in plaintext. Only you have the key.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-card border border-border hover:border-secondary/50 transition-colors group">
          <div className="h-12 w-12 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Share2 className="h-6 w-6 text-secondary" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-card-foreground">Secure Sharing</h3>
          <p className="text-muted-foreground leading-relaxed">
            Share passwords and sensitive documents with your team securely using RSA asymmetric encryption.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-card border border-border hover:border-primary/50 transition-colors group">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-card-foreground">Auto-fill & Sync</h3>
          <p className="text-muted-foreground leading-relaxed">
            Access your passwords anywhere with our secure browser extension and cloud-synced mobile app.
          </p>
        </div>
      </div>

      <footer className="mt-32 text-muted-foreground text-sm flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold">
            C
          </div>
          <span className="font-bold text-foreground">CipherVault</span>
        </div>
        <p>© 2025 CipherVault. All rights reserved.</p>
      </footer>
    </div>
  );
}
