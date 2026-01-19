import { ArrowRight, BarChart3, TrendingUp, Layers } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AnimatedCTA from "@/components/AnimatedCTA";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-32 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900">
          HoopEdge
        </h1>
        <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Data-driven basketball analytics focused on finding edges in
          <span className="font-semibold text-gray-900">
            {" "}
            half-time totals
          </span>{" "}
          — with full-game and quarter analysis coming soon.
        </p>

        <AnimatedCTA />
      </section>

      {/* Value Proposition */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-6">
              <TrendingUp className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="text-lg font-bold mb-2 text-gray-500">
                Half-Time Edge
              </h3>
              <p className="text-gray-600 text-sm">
                Identify consistent first-half scoring patterns using team-level
                performance data and odds behavior.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-6">
              <BarChart3 className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="text-lg font-bold mb-2 text-gray-500">
                Odds Intelligence
              </h3>
              <p className="text-gray-600 text-sm">
                Analyze odds ranges to uncover teams and leagues that outperform
                bookmaker expectations.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-6">
              <Layers className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="text-lg font-bold mb-2 text-gray-500">
                Built for Expansion
              </h3>
              <p className="text-gray-600 text-sm">
                Designed to scale into full-time totals, quarter breakdowns, and
                matchup-level analysis.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-100 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-500">
            How HoopEdge Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <span className="text-blue-600 font-bold">01</span>
              <h4 className="text-xl font-semibold mt-2 text-gray-500">
                Select League
              </h4>
              <p className="text-gray-600 mt-2 text-sm">
                Choose a league to instantly load team scoring behavior and
                historical half-time performance.
              </p>
            </div>
            <div>
              <span className="text-blue-600 font-bold">02</span>
              <h4 className="text-xl font-semibold mt-2 text-gray-500">
                Apply Filters
              </h4>
              <p className="text-gray-600 mt-2 text-sm">
                Narrow by odds ranges or recent games to isolate high-confidence
                scenarios.
              </p>
            </div>
            <div>
              <span className="text-blue-600 font-bold">03</span>
              <h4 className="text-xl font-semibold mt-2 text-gray-500">
                Find the Edge
              </h4>
              <p className="text-gray-600 mt-2 text-sm">
                Spot recurring patterns and take advantage of them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center">
        <h2 className="text-3xl font-bold text-gray-500">
          Ready to explore the edge?
        </h2>
        <p className="mt-3 text-gray-600">
          Start with half-time analysis. More layers coming soon.
        </p>
        <div className="mt-6">
          <Link href="/analytics">
          <Button size="lg" className="gap-2 bg-transparent  text-blue-500 cursor-pointer hover:underline hover:bg-transparent">
            Open Analytics <ArrowRight className="w-4 h-4" />
          </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
