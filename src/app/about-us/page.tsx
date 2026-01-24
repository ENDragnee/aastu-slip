import Image from "next/image";
import { GraduationCap, Zap, ShieldCheck, Leaf, Users, Code } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      <section className="relative py-20 px-4 md:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -skew-y-3 origin-top-left transform scale-110 z-0" />
        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-6">
          <Badge variant="outline" className="border-secondary text-secondary-foreground px-4 py-1 text-sm bg-background">
            EST. 2026
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-primary">
            Streamlining <span className="text-foreground">Student Exits</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            The AASTU Digital Slip System replaces outdated paper trails with a fast, secure, and eco-friendly clearance process for students and staff.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative h-64 md:h-96 w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white rotate-2 hover:rotate-0 transition-transform duration-500">
            {/* Ensure you have an image here, or use a placeholder div */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary opacity-90" />
            <Image
              src="/AASTU.jpg"
              alt="AASTU Campus"
              fill
              className="object-cover mix-blend-overlay"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <GraduationCap className="h-32 w-32 text-white/20" />
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-foreground">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              At AASTU, we believe that administrative hurdles shouldn't stand in the way of your next chapter. Our mission is to digitize the exit process, ensuring that students can clear their obligations with the Library, Dormitory, and Proctors in minutes, not days.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <FeatureItem icon={Zap} title="Instant Processing" text="Real-time approvals." />
              <FeatureItem icon={ShieldCheck} title="Secure Verification" text="Fraud-proof QR codes." />
              <FeatureItem icon={Leaf} title="Eco-Friendly" text="100% Paperless workflow." />
              <FeatureItem icon={Users} title="Centralized" text="All departments in one app." />
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-muted/30 py-20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl font-bold">Built by Students, For Students</h2>
          <p className="text-muted-foreground">
            This platform is a project by the <span className="font-bold text-primary">SAAS Founders Club</span> of AASTU. We are a group of passionate developers dedicated to solving campus problems through technology.
          </p>

          <div className="flex justify-center">
            <Card className="max-w-md w-full border-t-4 border-t-secondary shadow-lg">
              <CardContent className="p-6 flex flex-col items-center gap-4">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <Code className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">SAAS Founders Club</h3>
                  <p className="text-sm text-muted-foreground">Software Engineering Dept.</p>
                </div>
                <p className="text-sm italic">"Innovating for a better campus experience."</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureItem({ icon: Icon, title, text }: { icon: any, title: string, text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h4 className="font-semibold text-sm">{title}</h4>
        <p className="text-xs text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}
