"use client";

import Image from "next/image";

import { useState, useRef } from "react";
import { Upload, Check, ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import type { ChangeEvent } from "react";
import { motion } from "motion/react";

const backgroundImages = [
  { src: "/redFront.png", alt: "Red Front Scene" },
  { src: "/glitchFront.png", alt: "Glitch Front" },
  { src: "/redTop.png", alt: "Red Top" },
  { src: "/greyscaleFront.png", alt: "Greyscale Front" },
  { src: "/orcas.png", alt: "Orcas" },
];

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedBg, setSelectedBg] = useState(backgroundImages[0]);

  function handleFileUpload(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  }
  return (
    <main className="bg-background-950 flex min-h-screen">
      {/* Left half of the screen */}
      <div className="flex w-1/3 flex-col gap-y-8 p-6 pr-3 text-center">
        {/* upload model section */}
        <Card className="bg-background-900 border-primary-800">
          <CardContent className="">
            <h2 className="text-text-50 mb-4 text-2xl font-bold">
              Upload 3D Model
            </h2>
            <div className="border-primary-800 hover:border-primary-600 flex flex-col justify-center rounded-lg border-2 border-dashed p-2 text-center transition-colors">
              <input
                type="file"
                id="model-upload"
                className="hidden"
                accept=".glb,.gltf,.obj,.fbx,.stp"
                onChange={handleFileUpload}
              />
              <label htmlFor="model-upload" className="cursor-pointer">
                <Upload className="text-accent-100 mx-auto mb-2 h-8 w-8" />
                <p className="text-text-50 mb-1 text-base font-medium">
                  {selectedFile ? selectedFile.name : "Drop your 3D model here"}
                </p>
                <p className="text-text-500 text-xs">
                  Supports GLB, GLTF, OBJ, FBX files
                </p>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* background selection */}
        <Card className="bg-background-900 border-primary-800">
          <CardContent className="">
            <h2 className="text-text-50 mb-4 text-2xl font-bold">
              Choose Background
            </h2>
            <div className="max-h-[400px] overflow-y-auto pr-2 [scrollbar-width:none]">
              <div className="flex flex-col gap-y-4">
                {backgroundImages.map((img) => (
                  <div
                    key={img.src}
                    className="border-primary-800 relative aspect-video w-full cursor-pointer rounded-md border p-4"
                    onClick={() => setSelectedBg(img)}
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      className={`rounded-md object-cover transition-all p-4${
                        selectedBg && selectedBg.src === img.src
                          ? "ring-primary-500 ring-offset-primary-500 ring-2 ring-offset-2"
                          : "ring-0"
                      }`}
                    />
                    {selectedBg && selectedBg.src === img.src && (
                      <span className="bg-background-700 absolute top-2 right-2 flex h-10 w-10 items-center justify-center rounded-full shadow">
                        <Check className="text-primary-200 h-8 w-8" />
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right half of the screen */}
      <div className="flex w-2/3 flex-col items-start gap-y-8 p-6 pl-3">
        <Card className="bg-background-900 border-primary-800 w-full pb-8">
          <CardContent className="">
            <h2 className="text-text-50 mb-4 text-center text-2xl">
              <span className="font-bold">Preview: </span>
              <span className="text-primary-500">
                {selectedBg ? selectedBg.alt : "Select a background"}
              </span>
            </h2>
            <div className="relative aspect-video w-full">
              {selectedBg && (
                <Image
                  src={selectedBg.src}
                  alt={selectedBg.alt}
                  fill
                  className="rounded-xl object-cover"
                />
              )}
            </div>
          </CardContent>
        </Card>
        <motion.button
          whileHover={
            selectedFile && selectedBg ? { scaleX: 1.9, originX: 0 } : {}
          }
          whileTap={selectedFile && selectedBg ? { scaleX: 2, originX: 0 } : {}}
          className={`w-1/2 overflow-hidden ${
            !selectedFile || !selectedBg
              ? "cursor-not-allowed"
              : "cursor-pointer"
          }`}
          disabled={!selectedFile || !selectedBg}
          onClick={() => {
            if (selectedFile && selectedBg) {
              window.location.href = "/user/options";
            }
          }}
        >
          <Card
            className={`bg-background-900 border-primary-800 ${
              !selectedFile || !selectedBg ? "opacity-50 grayscale" : ""
            }`}
          >
            <CardContent className="flex items-center justify-center gap-4 overflow-hidden">
              <h2
                className={`text-4xl font-bold tracking-widest ${
                  !selectedFile || !selectedBg
                    ? "text-text-500"
                    : "text-text-50"
                }`}
              >
                Next Steps
              </h2>
              <ArrowRight
                className={`text-4xl font-bold ${
                  !selectedFile || !selectedBg
                    ? "text-text-500"
                    : "text-primary-500"
                }`}
              />
            </CardContent>
          </Card>
        </motion.button>
      </div>
    </main>
  );
}
