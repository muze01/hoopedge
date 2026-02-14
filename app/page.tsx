"use client";
import { ArrowRight, BarChart3, TrendingUp, Layers } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AnimatedCTA from "@/components/AnimatedCTA";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white">
      {/* Hero Section - Split Layout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 md:pt-24 lg:pt-28 pb-16 md:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 md:space-y-6">
            <h1 className="font-extrabold tracking-tight text-gray-900 leading-tight">
              <span className="block text-2xl md:text-3xl lg:text-4xl mb-3">
                Find the Edge in
              </span>
              <span className="block text-3xl md:text-4xl lg:text-6xl text-blue-600">
                Half-Time Totals
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
              Advanced analytics platform that identifies consistent first-half
              scoring patterns, odds inefficiencies, and profitable betting
              opportunities across major basketball leagues.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/analytics">
                <Button
                  size="lg"
                  className="gap-2 bg-blue-600 text-white hover:bg-blue-700 text-base md:text-lg px-6 md:px-8 py-4 md:py-6 cursor-pointer w-full sm:w-auto"
                >
                  Open Analytics{" "}
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-6 md:pt-4">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                  20+
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  Teams Analyzed
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                  88%
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  Avg. Hit Rate
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Live
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  Data Updates
                </div>
              </div>
            </div>
          </div>

          {/* Right - Browser Mockup */}
          <div className="relative lg:ml-auto mt-12 lg:mt-0">
            {/* linear Background Blur */}
            <div className="absolute inset-0 bg-linear-to-br from-blue-400/30 to-purple-400/30 rounded-3xl blur-3xl transform scale-110" />

            {/* Browser Window */}
            <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
              {/* Browser Chrome */}
              <div className="bg-gray-100 border-b border-gray-200 px-3 md:px-4 py-2 md:py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 ml-2 md:ml-4">
                  <div className="bg-white rounded-md px-2 md:px-3 py-1 md:py-1.5 text-xs text-gray-600 border border-gray-200 truncate">
                    hoopedge.com/analytics
                  </div>
                </div>
              </div>

              {/* Dashboard Screenshot */}
              <div className="bg-white">
                <Image
                  src="/uploads/Screenshot (530).png"
                  alt="HoopEdge Analytics Interface"
                  width={1200}
                  height={800}
                  className="w-full h-auto"
                  priority
                />
              </div>
            </div>

            {/* Floating Feature Cards */}
            <div className="absolute -left-6 top-1/4 bg-white rounded-xl shadow-lg p-4 border border-gray-100 hidden xl:block animate-float">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Over Rate</div>
                  <div className="text-lg font-bold text-gray-900">83%</div>
                </div>
              </div>
            </div>

            <div className="absolute -right-6 bottom-1/3 bg-white rounded-xl shadow-lg p-4 border border-gray-100 hidden xl:block animate-float-delayed">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Avg HT Points</div>
                  <div className="text-lg font-bold text-gray-900">45.2</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 md:pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="rounded-2xl shadow-sm hover:shadow-lg transition-shadow border-2">
            <CardContent className="p-6">
              <TrendingUp className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="text-lg font-bold mb-2 text-gray-900">
                Half-Time Edge
              </h3>
              <p className="text-gray-600 text-sm">
                Identify consistent first-half scoring patterns using team-level
                performance data and odds behavior.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm hover:shadow-lg transition-shadow border-2">
            <CardContent className="p-6">
              <BarChart3 className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="text-lg font-bold mb-2 text-gray-900">
                Odds Intelligence
              </h3>
              <p className="text-gray-600 text-sm">
                Analyze odds ranges to uncover teams and leagues that outperform
                bookmaker expectations.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm hover:shadow-lg transition-shadow border-2">
            <CardContent className="p-6">
              <Layers className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="text-lg font-bold mb-2 text-gray-900">
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

      {/* Features Showcase */}
      <section className="bg-slate-50 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
              Everything you need to find winning edges
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Comprehensive analytics tools designed for serious basketball
              bettors
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border-2 border-gray-100">
              <div className="rounded-xl overflow-hidden mb-4 md:mb-6 border border-gray-200">
                <Image
                  src="/uploads/Screenshot (533).png"
                  alt="Head-to-Head Analysis"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                Head-to-Head Matchups
              </h3>
              <p className="text-sm md:text-base text-gray-600">
                Deep dive into team comparisons with historical performance
                data, recent form, and odds analysis for every matchup.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border-2 border-gray-100">
              <div className="rounded-xl overflow-hidden mb-4 md:mb-6 border border-gray-200">
                <Image
                  src="/uploads/Screenshot (529).png"
                  alt="Performance Trends"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                Visual Performance Trends
              </h3>
              <p className="text-sm md:text-base text-gray-600">
                Interactive charts showing home and away scoring patterns,
                helping you spot consistent over/under opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 text-gray-900">
            How HoopEdge Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            <div className="text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-xl md:text-2xl">
                  01
                </span>
              </div>
              <h4 className="text-lg md:text-xl font-semibold mt-2 text-gray-900 mb-3">
                Select League
              </h4>
              <p className="text-gray-600 text-sm">
                Choose a league to instantly load team scoring behavior and
                historical half-time performance.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-xl md:text-2xl">
                  02
                </span>
              </div>
              <h4 className="text-lg md:text-xl font-semibold mt-2 text-gray-900 mb-3">
                Apply Filters
              </h4>
              <p className="text-gray-600 text-sm">
                Narrow by odds ranges or recent games to isolate high-confidence
                scenarios.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-xl md:text-2xl">
                  03
                </span>
              </div>
              <h4 className="text-lg md:text-xl font-semibold mt-2 text-gray-900 mb-3">
                Find the Edge
              </h4>
              <p className="text-gray-600 text-sm">
                Spot recurring patterns and take advantage of them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 text-center bg-linear-to-b from-slate-50 to-white px-6">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
          Ready to explore the edge?
        </h2>
        <p className="mt-3 text-base md:text-lg text-gray-600">
          Start with half-time analysis. More layers coming soon.
        </p>
        <div className="mt-6">
          <Link href="/analytics">
            <Button
              size="lg"
              className="gap-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors text-base md:text-lg px-6 md:px-8 py-5 md:py-6 cursor-pointer"
            >
              Open Analytics <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </Link>
        </div>
      </section>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 3s ease-in-out infinite;
          animation-delay: 1.5s;
        }
      `}</style>
    </div>
  );
}
