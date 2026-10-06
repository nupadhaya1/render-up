// The /home page as it was before the coming-soon page (2026-10-06). Not routed: _previous is a private folder.

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Zap } from "lucide-react";
import ImageCarousel from "~/components/image-carousel";

export default function Home() {
  const example_images = [
    "https://t7w2berwuw.ufs.sh/f/dXEDHi63tXLV06GQuweqjxf2uVMwgSkXCrRv16sFYDKtEZTL",
    "https://t7w2berwuw.ufs.sh/f/dXEDHi63tXLVgm2QaRY4im1trLZOPjN8bS7MpvV0hWAcGdKg",
    "https://t7w2berwuw.ufs.sh/f/dXEDHi63tXLVon0p7aKOymEAqUeD3R2KpL695rQWMslcSkCT",
    "https://t7w2berwuw.ufs.sh/f/dXEDHi63tXLVNhba80D3PIothzmYv8QGlrCRgZyiF2KL5bTU",
    "https://t7w2berwuw.ufs.sh/f/dXEDHi63tXLVQC3b0bRA7QYtOrcTUwBI0ZLf9R8ikDmCENnM",
    "https://t7w2berwuw.ufs.sh/f/dXEDHi63tXLVM8XsPBL9sYEhA4xZ7P8u2BifvcOWm1HCjyGt",
    "https://t7w2berwuw.ufs.sh/f/dXEDHi63tXLVOA9sf43C5WopEweD8UluBnv2z47abXyIGmfZ",
    "https://t7w2berwuw.ufs.sh/f/dXEDHi63tXLVT0nPojljN52dnf3YqLJbZB64MxoRyVrk8lh0",
  ];

  return (
    <main className="flex min-h-screen flex-col">
      {/* Top row - matching heights */}
      <div className="flex h-1/2 flex-row">
        {/* left side - image carousel */}
        <div className="w-2/3">
          <div className="bg-background-900 m-2 mt-0 mr-1 flex h-full flex-col rounded-md p-4">
            <ImageCarousel images={example_images} className="flex-1" />
          </div>
        </div>

        {/* right side - text */}
        <div className="w-1/3">
          <div className="bg-background-900 m-2 mt-0 ml-1 flex h-full flex-col justify-center rounded-md p-4">
            <div>
              <p
                className="text-primary-500 text-5xl font-medium"
                style={{ letterSpacing: "0.2em" }}
              >
                Clean professional renders.
              </p>
              <br />
              <p
                className="text-primary-500 text-5xl font-medium"
                style={{ letterSpacing: "0.2em" }}
              >
                For every purpose.
              </p>
              <br />
              <p
                className="text-primary-500 text-5xl font-medium"
                style={{ letterSpacing: "0.2em" }}
              >
                For every project.
              </p>
              <br />
              <p
                className="text-primary-500 text-5xl"
                style={{ letterSpacing: "0.2em" }}
              >
                Big or small.
              </p>

              <br />
              <h1
                className="text-secondary-400 text-5xl font-bold italic"
                style={{ letterSpacing: "0.2em" }}
              >
                Everytime.
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="flex h-1/2 flex-row">
        <div className="w-2/3">
          <div className="bg-background-900 m-2 mr-1 h-full rounded-md p-4">
            Bottom Left Side
          </div>
        </div>
        <div className="w-1/3">
          <div className="bg-background-900 m-2 ml-1 h-full rounded-md p-4">
            Bottom Right Side
          </div>
        </div>
      </div>
    </main>
  );
}
