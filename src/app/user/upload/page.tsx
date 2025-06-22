"use client";

import { useState, useRef } from "react";
import { Upload, Check } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";

export default function UploadPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedSceneColor, setSelectedSceneColor] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <main className="text-txt-50 flex min-h-screen">
      {/* Left half of the screen */}
      <div className="flex w-1/2 flex-col gap-y-8 p-6 text-center">
        <div className="flex flex-col gap-y-8">
          <h1 className="text-4xl font-bold">Upload Your 3D Model</h1>

          {/* Upload Box */}
          <Card
            className={`bg-primary-600 mx-auto flex h-48 w-full flex-col items-center justify-center p-6 transition-all ${
              isDragOver ? "border-orange-500 bg-orange-500/10" : ""
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {uploadedFile ? (
              <div className="flex flex-col items-center text-center">
                <div className="mb-2 rounded-full bg-green-500/20 p-3">
                  <Check className="h-6 w-6 text-green-500" />
                </div>
                <p className="font-medium text-white">{uploadedFile.name}</p>
                <p className="txt-50 text-sm">
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
                <div className="mb-2 rounded-full border-2 border-white p-3">
                  <Upload className="h-6 w-6 text-white" />
                </div>
                <p className="font-medium text-white">
                  Drop your 3D model here
                </p>
                <p className="txt-50 text-sm">
                  Supported: .STL, .OBJ, .GLB, .GLTF, .STP
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={triggerFileInput}
                >
                  Browse Files
                </Button>
              </div>
            )}
          </Card>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".stl,.obj,.glb,.gltf,.stp"
            className="hidden"
          />
        </div>

        <hr className="border-bg-200 border-2" />

        <div className="flex flex-col gap-y-8">
          <h1 className="text-4xl font-bold">Choose a Scene:</h1>
          <div className="flex flex-row gap-4">
            <div
              className="aspect-video w-full max-w-1/2 cursor-pointer rounded-lg bg-green-500 transition-opacity hover:opacity-80"
              onClick={() => setSelectedSceneColor("bg-green-500")}
            ></div>
            <div
              className="aspect-video w-full max-w-1/2 cursor-pointer rounded-lg bg-blue-500 transition-opacity hover:opacity-80"
              onClick={() => setSelectedSceneColor("bg-blue-500")}
            ></div>
          </div>
          {selectedSceneColor && (
            <Button
              size="sm"
              onClick={() => setSelectedSceneColor("")}
              className="hover:bg-accent-500 bg-bg-500 self-center text-black"
            >
              Clear Selection
            </Button>
          )}
        </div>

        {/* Next Step Button */}
        {uploadedFile && selectedSceneColor && (
          <div className="fixed top-4 right-4 z-50">
            <Button
              size="lg"
              className="bg-green-600 text-white hover:bg-green-700"
            >
              Next Step
            </Button>
          </div>
        )}
      </div>

      {/* Right half of the screen */}
      <div
        className={`w-1/2 p-6 transition-colors ${selectedSceneColor || "bg-1background"}`}
      >
        <div className="flex flex-col gap-4">
          {!selectedSceneColor ? (
            <div className="flex h-full items-center justify-center">
              <h1 className="text-center text-4xl">Fill out the options</h1>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <h1 className="text-center text-4xl">Scene Selected!</h1>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
