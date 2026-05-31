import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  FileQuestion,
  GraduationCap,
  LayoutDashboard,
  Lock,
  NotebookPen,
  Route,
  ShieldCheck,
  WandSparkles,
} from "lucide-react";

import { HeroGeometric } from "@/components/ui/shape-landing-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const navItems = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

const solutionCards = [
  { icon: WandSparkles, title: "AI Course Outline Generator" },
  { icon: NotebookPen, title: "Detailed Chapter Notes" },
  { icon: FileQuestion, title: "Quiz Generator" },
  { icon: BrainCircuit, title: "Flashcard Generator" },
  { icon: GraduationCap, title: "Exam Generator" },
  { icon: Route, title: "Progress-Friendly Learning Flow" },
];

const workflowSteps = [
  {
    step: "01",
    title: "Describe what you want to learn",
    body: "Example: “I want to learn Python from beginner to advanced.”",
  },
  {
    step: "02",
    title: "SyllabroAI creates a course outline",
    body: "It organizes the topic into logical chapters from beginner to advanced.",
  },
  {
    step: "03",
    title: "AI generates detailed study notes",
    body: "Each chapter includes explanations, examples, common mistakes, practice tasks, and summaries.",
  },
  {
    step: "04",
    title: "Practice and test yourself",
    body: "Generate quizzes, flashcards, and exams from the course content.",
  },
  {
    step: "05",
    title: "Keep learning from your dashboard",
    body: "Your courses are saved, organized, and ready whenever you return.",
  },
];

const featureList = [
  "Structured course generation",
  "Beginner-to-advanced chapter flow",
  "Deep explanations with examples",
  "Programming, math, science, business, and general learning support",
  "Quizzes for active recall",
  "Flashcards for revision",
  "Exams for serious testing",
  "Saved courses in your dashboard",
  "Secure user accounts",
  "Weekly free course limit with upgrade option",
];

const useCases = [
  {
    title: "Students",
    body: "Prepare for topics, exams, and coursework with organized notes and practice questions.",
  },
  {
    title: "Self-learners",
    body: "Learn programming, business, languages, science, or any topic with a clear roadmap.",
  },
  {
    title: "Teachers and tutors",
    body: "Quickly create learning material, quizzes, and exams for students.",
  },
  {
    title: "Professionals",
    body: "Upskill faster by turning complex topics into structured learning paths.",
  },
];

const pricingTiers = [
  {
    name: "Free",
    price: "0 UGX",
    description: "For trying SyllabroAI and building your first study paths",
    points: [
      "2 courses per week",
      "AI-generated course chapters",
      "Basic quizzes and flashcards",
      "Private learner dashboard",
    ],
  },
  {
    name: "Standard",
    price: "20k UGX",
    description: "For learners who want more structure and practice",
    points: [
      "More weekly course generations",
      "Longer course outlines",
      "Quiz and flashcard generation",
      "Saved courses and study tools",
    ],
  },
  {
    name: "Pro",
    price: "50k UGX",
    description: "For serious self-learners and professionals",
    featured: true,
    points: [
      "Higher course generation limits",
      "Deeper chapters and revision tools",
      "Full quiz, flashcard, and exam workflows",
      "Priority generation when available",
    ],
  },
  {
    name: "School",
    price: "100k UGX",
    description: "For classes, tutors, and institutions",
    points: [
      "Multiple learner accounts",
      "Teacher and admin controls coming soon",
      "Class-based learning workflows",
      "Custom limits for institutions",
    ],
  },
];

const securityPoints = [
  "Secure authentication",
  "Private user dashboards",
  "Protected course access",
  "No user data leakage",
];

const faqs = [
  {
    question: "What is SyllabroAI?",
    answer:
      "SyllabroAI is an AI-powered learning platform that creates structured courses, chapters, quizzes, flashcards, and exams from a learning goal.",
  },
  {
    question: "Who is it for?",
    answer:
      "It is for students, self-learners, tutors, teachers, and professionals.",
  },
  {
    question: "Can I use it for programming?",
    answer:
      "Yes. SyllabroAI can generate structured programming courses with explanations, code examples, practice tasks, and common mistakes.",
  },
  {
    question: "Can it help with exams?",
    answer:
      "Yes. The platform is designed to generate quizzes, flashcards, and exams from course content.",
  },
  {
    question: "Is there a free plan?",
    answer: "Yes. Free users can create 2 courses per week.",
  },
  {
    question: "Are my courses private?",
    answer:
      "Yes. Your courses are connected to your account and protected from other users.",
  },
];

function SectionHeading({ badge, title, body }) {
  return (
    <div className="mx-auto max-w-3xl space-y-4 text-center">
      <Badge variant="secondary" className="w-fit mx-auto">
        {badge}
      </Badge>
      <h2 className="text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
        {title}
      </h2>
      <p className="text-base leading-8 text-white/58 sm:text-lg">{body}</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-black text-white">
      <header className="fixed left-1/2 top-3 z-50 w-[calc(100%-1rem)] max-w-5xl -translate-x-1/2 rounded-full border border-white/10 bg-[#1f1f1f57] px-3 py-2.5 backdrop-blur-xl sm:top-5 sm:w-[calc(100%-2rem)] sm:px-4 sm:py-3">
        <div className="flex w-full items-center justify-between gap-2 sm:gap-5">
          <Link
            href="/"
            className="inline-flex min-w-0 items-center gap-2 text-base font-semibold tracking-[-0.03em] text-white sm:gap-3 sm:text-lg"
          >
            <Image
              src="/syllabro-icon.png"
              alt="SyllabroAI logo"
              width={36}
              height={36}
              className="h-8 w-8 object-contain sm:h-9 sm:w-9"
              priority
            />
            <span className="truncate">SyllabroAI</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-white/58 transition hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            <Button asChild variant="ghost" size="sm" className="px-2 text-xs sm:px-3 sm:text-[0.8rem]">
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild size="sm" className="px-3 text-xs sm:px-3 sm:text-[0.8rem]">
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="h-12 sm:h-16" />

      <HeroGeometric
        badge="Built for students, self-learners, tutors, and modern schools."
        title1="Turn Any Learning Goal Into a"
        title2="Complete AI-Generated Course"
        description="SyllabroAI helps you generate structured courses, detailed chapters, quizzes, flashcards, and exams from a simple description of what you want to learn."
        trustLine="Built for students, self-learners, tutors, and modern schools."
      />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-14 px-4 py-14 sm:px-8 sm:py-20 lg:gap-24 lg:px-10 lg:py-24">
        <section id="features" className="space-y-6 sm:space-y-10">
          <SectionHeading
            badge="The solution"
            title="Your personal AI course builder"
            body="Describe what you want to learn, and SyllabroAI builds a structured course for you. It breaks the topic into chapters, writes detailed notes, creates revision tools, and helps you test your understanding."
          />

          <div className="grid gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-3">
            {solutionCards.map((item) => {
              const Icon = item.icon;

              return (
                <Card key={item.title} className="min-h-0 md:min-h-44">
                  <CardHeader className="space-y-3 md:space-y-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="leading-7">
                      Structured for focused learning and real revision, not just short summaries.
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section id="how-it-works" className="space-y-6 sm:space-y-10">
          <SectionHeading
            badge="How it works"
            title="From idea to full course in minutes"
            body="SyllabroAI turns a simple learning request into an organized, saved, and practice-ready course flow."
          />

          <div className="grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-5">
            {workflowSteps.map((item) => (
              <Card key={item.step} className="min-h-0 lg:min-h-56">
                <CardHeader className="space-y-3 md:space-y-5">
                  <div className="text-xs uppercase tracking-[0.28em] text-white/34">
                    Step {item.step}
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-7 text-white/58">{item.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-6 sm:space-y-10">
          <SectionHeading
            badge="Everything included"
            title="Everything you need to learn deeply"
            body="The platform is designed to support serious learning from the first outline to the final self-test."
          />

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {featureList.map((item) => (
              <div
                key={item}
                className="glass-panel flex items-start gap-3 rounded-[1.5rem] px-5 py-4"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-white" />
                <p className="text-sm leading-7 text-white/74">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6 sm:space-y-10">
          <SectionHeading
            badge="Use cases"
            title="Built for different kinds of learners"
            body="SyllabroAI is flexible enough for individual study, tutoring workflows, and structured classroom support."
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {useCases.map((item) => (
              <Card key={item.title} className="min-h-52">
                <CardHeader className="space-y-4">
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-7 text-white/58">{item.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="pricing" className="space-y-6 sm:space-y-10">
          <SectionHeading
            badge="Pricing"
            title="Simple plans for serious learning"
            body="Pricing is built for learners, professionals, and schools that need structured AI-generated study material."
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {pricingTiers.map((tier) => (
              <Card
                key={tier.name}
                className={tier.featured ? "glass-panel-strong ring-1 ring-white/16" : ""}
              >
                <CardHeader className="space-y-3 border-b border-white/8 pb-6">
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <p className="text-4xl font-semibold tracking-[-0.04em] text-white">
                    {tier.price}
                  </p>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  {tier.points.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-white" />
                      <p className="text-sm leading-7 text-white/72">{item}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-center">
            <Button asChild size="lg">
              <Link href="/sign-up">Start learning today</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
          <div className="space-y-5">
            <Badge variant="secondary">Security</Badge>
            <h2 className="text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
              Your learning data stays private
            </h2>
            <p className="text-base leading-8 text-white/58 sm:text-lg">
              Each user has a secure account. Courses are linked to the
              logged-in user, and users can only access their own learning material.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {securityPoints.map((item) => (
              <Card key={item}>
                <CardHeader className="space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
                    {item.includes("Secure") || item.includes("Protected") ? (
                      <ShieldCheck className="h-5 w-5 text-white" />
                    ) : item.includes("Private") ? (
                      <LayoutDashboard className="h-5 w-5 text-white" />
                    ) : (
                      <Lock className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <CardTitle className="text-xl">{item}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section id="faq" className="space-y-6 sm:space-y-10">
          <SectionHeading
            badge="FAQ"
            title="Questions people ask before they start"
            body="A quick overview of how SyllabroAI works, who it is for, and what you can expect from the platform."
          />

          <div className="grid gap-4 lg:grid-cols-2">
            {faqs.map((item) => (
              <Card key={item.question}>
                <CardHeader className="space-y-3">
                  <CardTitle className="text-xl">{item.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-7 text-white/58">{item.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="pb-4">
          <Card className="glass-panel-strong">
            <CardContent className="flex flex-col gap-8 px-6 py-8 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-4">
                <Badge variant="secondary">Final call to action</Badge>
                <div className="space-y-3">
                  <h2 className="text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
                    Ready to build your next course?
                  </h2>
                  <p className="max-w-2xl text-base leading-8 text-white/58">
                    Describe what you want to learn and let SyllabroAI turn it
                    into a structured learning experience.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link href="/sign-up">
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
