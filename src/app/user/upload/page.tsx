"use client";

import { useState, useRef } from "react";
import { Upload, Check } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";

export default function UploadPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
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
    <main className="bg-bg-50 text-txt-50 flex min-h-screen">
      {/* Left half of the screen */}
      <div className="flex w-1/2 flex-col gap-y-8 p-6 text-center">
        <div className="flex flex-col gap-y-8">
          <h1 className="text-4xl font-bold">Upload Your 3D Model</h1>

          {/* Upload Box */}
          <Card
            className={`mx-auto flex h-48 w-full max-w-md flex-col items-center justify-center p-6 transition-all ${
              isDragOver
                ? "border-orange-500 bg-orange-500/10"
                : "border-2 border-dashed border-gray-300"
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
                <p className="font-medium">{uploadedFile.name}</p>
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
                <div className="mb-2 rounded-full bg-gray-500/20 p-3">
                  <Upload className="h-6 w-6 text-gray-400" />
                </div>
                <p className="font-medium">Drop your 3D model here</p>
                <p className="text-sm text-gray-400">
                  or click to browse files
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
            accept=".stl,.obj,.glb,.gltf"
            className="hidden"
          />

          <p className="text-sm text-gray-400">
            Supported formats: .STL, .OBJ, .GLB, .GLTF
          </p>
        </div>

        <hr className="border-bg-200 border-2" />
      </div>

      {/* Right half of the screen */}
      <div className="w-1/2 p-6">
        <div className="flex flex-col gap-2">
          <h1>Right Side Content</h1>
          <p>This is the right half of the screen</p>
        </div>
      </div>
    </main>
  );
}
