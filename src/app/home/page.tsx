import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Zap } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden bg-black py-12 md:py-16">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-orange-500/15 via-transparent to-transparent" />
        <div className="relative z-10 container px-4 text-center md:px-6">
          <h1 className="font-aldrich group mb-6 inline-block text-5xl font-bold tracking-tighter text-white transition-all duration-300 sm:text-6xl md:text-7xl">
            Render - Up
          </h1>
          <p className="mx-auto mb-8 max-w-[700px] text-lg text-zinc-400 md:text-xl">
            Transform your 3D objects with stunning backgrounds and professional
            rendering. Fast, simple, and incredibly powerful.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/upload"
              className="group inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-orange-500/25 transition-all hover:gap-3 hover:shadow-orange-500/40"
            >
              Start Rendering <ArrowRight className="h-4 w-4 transition-all" />
            </Link>
          </div>
        </div>
      </section>

      {/* Examples Section */}
      <section className="bg-black px-4 py-8 md:px-6">
        {/* Example start */}
        <section className="relative h-[400px] w-full overflow-hidden md:h-[600px]">
          <Image
            src="/redFront.png"
            alt="Background"
            fill
            className="-translate-y-[20px] transform object-cover md:-translate-y-[50px]"
            style={{ objectPosition: "center" }}
            sizes="100vw"
            priority
          />

          <div className="relative z-10 flex h-full -translate-y-[80px] transform flex-col items-center justify-center px-4 text-center md:-translate-y-[150px]">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-5xl">
              Example Renders
            </h2>
            <p className="max-w-[700px] text-gray-200 md:text-xl">
              Check out these stunning examples created with Render Up below.
            </p>
            <p className="max-w-[700px] text-gray-200 md:text-xl">
              Your 3D models could look this good too!
            </p>
          </div>
        </section>

        {/* Image grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          {[
            { src: "/glitchFront.png", alt: "redFront.png" },
            { src: "/redTop.png", alt: "redTop.png" },
            { src: "/greyscaleFront.png", alt: "greyscaleFront.png" },
            { src: "/orcas.png", alt: "orcas.png" },
          ].map((img) => (
            <div
              key={img.src}
              className="rounded-lg transition-all duration-300 hover:scale-105"
            >
              <Image
                src={img.src}
                alt={img.alt}
                width={600}
                height={400}
                className="w-full rounded-lg"
              />
            </div>
          ))}
        </div>
      </section>
      {/* Features Section */}
      <section className="items-center justify-center bg-gradient-to-b from-black via-zinc-900 to-zinc-800 px-4 py-8 md:px-6">
        <div className="mb-8 flex items-center justify-center gap-2">
          <Zap className="h-6 w-6 text-orange-500" />
          <h2 className="text-2xl font-bold text-white md:text-3xl">
            How It Works
          </h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-orange-900/50 hover:bg-zinc-900/80">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
              <span className="text-xl font-bold">1</span>
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">
              Choose Background
            </h3>
            <p className="text-zinc-400">
              Select from our curated collection of professional backgrounds or
              upload your own.
            </p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-orange-900/50 hover:bg-zinc-900/80">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
              <span className="text-xl font-bold">2</span>
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">
              Upload Your Model
            </h3>
            <p className="text-zinc-400">
              Drag and drop your 3D model ZIP file. We support all major 3D
              formats.
            </p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-orange-900/50 hover:bg-zinc-900/80">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
              <span className="text-xl font-bold">3</span>
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">
              Get Your Render
            </h3>
            <p className="text-zinc-400">
              Our powerful engine processes your model and delivers a
              high-quality render in minutes.
            </p>
          </div>
        </div>
        <div className="mt-8 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-orange-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-orange-600/20 transition-all hover:bg-orange-500"
          >
            Create Your Own Render <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
