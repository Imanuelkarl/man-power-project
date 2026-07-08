// app/page.tsx (or app/landing/page.tsx)
'use client';

import { useState, useEffect, type AnchorHTMLAttributes, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Map, 
  Download, 
  BarChart3, 
  Factory,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle,
  Menu,
  X
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { ThemeToggle } from '../components/ThemeToggle';

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
};

function Link({ href, children, ...props }: LinkProps) {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}

// Feature slides data
const features = [
  {
    id: 1,
    title: "Geographic Cluster Visualization",
    description: "See manufacturing clusters emerge across Nigeria on an interactive map. Identify industrial hubs and regional concentrations at a glance.",
    icon: Map,
    color: "from-emerald-500/20 to-teal-500/20",
    bgImage: "bg-gradient-to-br from-emerald-900/30 to-teal-900/30",
    stats: "43 clusters identified",
    image: "/api/placeholder/600/400"
  },
  {
    id: 2,
    title: "MAN Questionnaire Digital Form",
    description: "Complete the official MAN questionnaire digitally. Streamlined data collection with validation and progress tracking for manufacturers.",
    icon: FileSpreadsheet,
    color: "from-blue-500/20 to-cyan-500/20",
    bgImage: "bg-gradient-to-br from-blue-900/30 to-cyan-900/30",
    stats: "98% completion rate",
    image: "/api/placeholder/600/400"
  },
  {
    id: 3,
    title: "Advanced Data Export",
    description: "Export manufacturing data in multiple formats - Excel, CSV, and PDF. Generate comprehensive reports for stakeholders and analysis.",
    icon: Download,
    color: "from-purple-500/20 to-pink-500/20",
    bgImage: "bg-gradient-to-br from-purple-900/30 to-pink-900/30",
    stats: "3 export formats",
    image: "/api/placeholder/600/400"
  },
  {
    id: 4,
    title: "Real-time Dashboard Analytics",
    description: "Monitor key metrics including total manufacturers, cluster count, and state-wise distribution. Make data-driven decisions instantly.",
    icon: BarChart3,
    color: "from-amber-500/20 to-orange-500/20",
    bgImage: "bg-gradient-to-br from-amber-900/30 to-orange-900/30",
    stats: "Live analytics",
    image: "/api/placeholder/600/400"
  }
];



export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const FeatureIcon = features[currentSlide].icon;

  // Auto-play slider
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Navigation functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % features.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + features.length) % features.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header / Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-primary grid place-items-center text-primary-foreground transition-transform group-hover:scale-105">
                <Factory className="w-5 h-5" />
              </div>
              <div>
                <div className="font-display font-semibold text-lg leading-none text-foreground">MAN</div>
                <div className="text-xs text-muted-foreground">Manufacturing Intelligence</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#stats" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Stats
              </Link>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/login">Get Started</Link>
                </Button>
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border bg-background/95 backdrop-blur-lg"
            >
              <div className="container mx-auto px-4 py-4 space-y-3">
                <Link href="#features" className="block py-2 text-muted-foreground hover:text-foreground">
                  Features
                </Link>
                <Link href="#testimonials" className="block py-2 text-muted-foreground hover:text-foreground">
                  Testimonials
                </Link>
                <Link href="#stats" className="block py-2 text-muted-foreground hover:text-foreground">
                  Stats
                </Link>
                <div className="flex items-center gap-3 pt-2">
                  <ThemeToggle />
                  <Button variant="ghost" size="sm" asChild className="flex-1">
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button size="sm" asChild className="flex-1">
                    <Link href="/login">Get Started</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                MVP Preview - H1 2026
              </div>
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                Economic Review,
                <br />
                <span className="text-primary">Reimagined.</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                Submit the H1 2026 MAN questionnaire digitally, watch manufacturing clusters 
                emerge across Nigeria on an interactive map, and export the whole review in a click.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="group" asChild>
                  <Link href="/login">
                    Get Started
                    <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#features">Explore Features</Link>
                </Button>
              </div>
              <div className="flex items-center gap-6 mt-8">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="text-foreground font-semibold">200+</span> manufacturers already onboard
                </div>
              </div>
            </div>
            
            {/* Hero Image / Slider Preview */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 border border-border">
                <div className="aspect-[4/3] relative">
                  <div className="absolute inset-0 bg-grid-pattern opacity-5" />
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="text-center">
                      <Map className="w-16 h-16 text-primary/30 mx-auto mb-4" />
                      <div className="h-2 w-24 bg-primary/20 rounded-full mx-auto mb-2" />
                      <div className="h-2 w-32 bg-primary/10 rounded-full mx-auto" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-card p-4 rounded-xl shadow-xl border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">+23.5%</div>
                    <div className="text-xs text-muted-foreground">Manufacturing growth</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Slider Section */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              Powerful Features for Modern Manufacturing
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to collect, visualize, and analyze manufacturing data across Nigeria
            </p>
          </div>

          {/* Slider Container */}
          <div className="relative max-w-5xl mx-auto">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                  className="grid md:grid-cols-2 gap-0"
                >
                  {/* Content Side */}
                  <div className="p-8 md:p-12 flex flex-col justify-between">
                    <div>
                      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${features[currentSlide].color} mb-6`}>
                        <FeatureIcon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-display text-2xl font-bold mb-3">
                        {features[currentSlide].title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {features[currentSlide].description}
                      </p>
                      <div className="mt-4 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">{features[currentSlide].stats}</span>
                      </div>
                    </div>
                    <Button variant="ghost" className="group w-fit mt-6" asChild>
                      <Link href="/login">
                        Learn More
                        <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </div>

                  {/* Image Side */}
                  <div className={`p-8 md:p-12 flex items-center justify-center ${features[currentSlide].bgImage}`}>
                    <div className="w-full aspect-square max-w-xs rounded-2xl bg-card/50 border border-border flex items-center justify-center">
                      <FeatureIcon className="w-24 h-24 text-primary/30" />
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={prevSlide}
              className="absolute -left-4 top-1/2 -translate-y-1/2 bg-card border border-border rounded-full p-2 shadow-lg hover:bg-muted transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute -right-4 top-1/2 -translate-y-1/2 bg-card border border-border rounded-full p-2 shadow-lg hover:bg-muted transition-colors"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Slider Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === index 
                    ? 'w-8 bg-primary' 
                    : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Quick Stats Section */}
      <section id="stats" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card p-6 rounded-xl border border-border text-center">
              <div className="text-3xl font-display font-bold text-primary">200+</div>
              <div className="text-sm text-muted-foreground mt-1">Manufacturers</div>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border text-center">
              <div className="text-3xl font-display font-bold text-primary">43</div>
              <div className="text-sm text-muted-foreground mt-1">Clusters Identified</div>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border text-center">
              <div className="text-3xl font-display font-bold text-primary">36</div>
              <div className="text-sm text-muted-foreground mt-1">States Covered</div>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border text-center">
              <div className="text-3xl font-display font-bold text-primary">98%</div>
              <div className="text-sm text-muted-foreground mt-1">Data Accuracy</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="relative rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 p-8 md:p-12 overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-5" />
            <div className="relative text-center max-w-3xl mx-auto">
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
                Ready to Transform Manufacturing Intelligence?
              </h2>
              <p className="text-muted-foreground mb-8">
                Join the MVP preview and be among the first to experience the future of manufacturing data collection and analysis in Nigeria.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/login">
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#features">View Features</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary grid place-items-center text-primary-foreground">
                  <Factory className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-display font-semibold text-sm leading-none">MAN</div>
                  <div className="text-[10px] text-muted-foreground">Manufacturing Intelligence</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Manufacturers Association of Nigeria · MVP Preview
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="#stats" className="hover:text-foreground transition-colors">Stats</Link></li>
                <li><Link href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">API Reference</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Support</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Manufacturers Association of Nigeria. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}