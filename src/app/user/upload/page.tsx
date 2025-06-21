"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Upload, ArrowRight, Check } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";

export default function UploadPage() {
  const [selectedBackground, setSelectedBackground] = useState<number>(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const backgrounds = [
    "bg-gradient-to-b from-yellow-500/20 to-white",
    "bg-gradient-to-b from-purple-500/20 to-white",
    "bg-gradient-to-b from-blue-500/20 to-white",
    "bg-gradient-to-b from-green-500/20 to-white",
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-orange-500/15 p-6">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">
            Upload Your 3D Model
          </h1>
          <p className="mt-2 text-gray-400">
            Choose a background and upload your 3D model file
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="mb-3 text-xl font-medium text-white">
              1. Select a background
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {backgrounds.map((bg, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedBackground(index)}
                  className={`relative h-24 w-full rounded-lg ${bg} transition-all hover:opacity-90 ${
                    selectedBackground === index ? "ring-2 ring-orange-500" : ""
                  }`}
                >
                  {selectedBackground === index && (
                    <div className="absolute top-2 right-2 rounded-full bg-orange-500 p-1">
                      <Check className="h-4 w-4 text-black" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-xl font-medium text-white">
              2. Upload your 3D model
            </h2>
            <div className="space-y-6">
              <Card
                className={`flex aspect-video w-full flex-col items-center justify-center p-6 ${backgrounds[selectedBackground]}`}
              >
                {uploadedFile ? (
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-2 rounded-full bg-white/10 p-3">
                      <Check className="h-6 w-6 text-green-500" />
                    </div>
                    <p className="text-white">{uploadedFile.name}</p>
                    <p className="text-sm text-gray-400">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={triggerFileInput}
                    >
                      Change file
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-2 rounded-full bg-white/10 p-3">
                      <Upload className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-white">Your 3D model will appear here</p>
                    <p className="text-sm text-gray-400">
                      Preview with your selected background
                    </p>
                  </div>
                )}
              </Card>

              <div className="flex flex-col items-center space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".stl,.obj,.glb,.gltf"
                  className="hidden"
                />
                <Button
                  onClick={triggerFileInput}
                  className="h-12 w-full max-w-md bg-orange-500 hover:bg-orange-600"
                >
                  <Upload className="mr-2 h-5 w-5" />
                  {uploadedFile ? "Change 3D Model" : "Upload 3D Model"}
                </Button>
                <p className="text-sm text-gray-400">
                  Supported formats: .STL, .OBJ, .GLB, .GLTF
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-xl font-medium text-white">
              3. Continue to next step
            </h2>
            <Button
              className="h-12 w-full bg-orange-500 hover:bg-orange-600"
              disabled={!uploadedFile}
            >
              Next Step
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            {!uploadedFile && (
              <p className="mt-2 text-sm text-gray-400">
                Please upload a 3D model file to continue
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
