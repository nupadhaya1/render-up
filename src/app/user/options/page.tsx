"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import { User } from "lucide-react";

const priceTiers = [
  { id: "$12", price: 12, num_photos: 2, price_per_photo: 6 },
  { id: "$16", price: 16, num_photos: 3, price_per_photo: 5.33 },
  { id: "$20", price: 20, num_photos: 4, price_per_photo: 5 },
];

const resolutions = [
  { id: "1080p", name: "1080p", additionalCost: 0 },
  { id: "4k", name: "4K", additionalCost: 2 },
  { id: "custom", name: "Custom", additionalCost: 3 },
];
export default function OptionsPage() {
  const [selectedTier, setSelectedTier] = useState("$12");
  const [selectedResolution, setSelectedResolution] = useState("1080p");
  const [customResolution, setCustomResolution] = useState("");

  const basePriceObj = priceTiers.find((tier) => tier.id === selectedTier);
  const resolutionObj = resolutions.find(
    (res) => res.id === selectedResolution,
  );

  const totalPrice =
    (basePriceObj?.price ?? 0) + (resolutionObj?.additionalCost ?? 0);

  return (
    <main className="bg-background-950 flex">
      <div className="flex w-1/3 flex-col gap-y-8 p-6 pr-3 text-center">
        <Card className="bg-background-900 border-primary-800">
          <CardContent className="">
            <h1 className="text-text-50 mb-4 text-2xl font-bold">
              Pricing / Photo Amount
            </h1>

            <RadioGroup value={selectedTier} onValueChange={setSelectedTier}>
              <div className="space-y-3">
                {priceTiers.map((tier) => (
                  <div key={tier.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={tier.id} id={tier.id} />
                    <Label
                      htmlFor={tier.id}
                      className={
                        `border-background-700 bg-background-900 hover:bg-background-800 flex flex-1 cursor-pointer items-center justify-between rounded-lg border p-3 text-lg ` +
                        (selectedTier === tier.id ? "bg-background-800" : "")
                      }
                    >
                      <span className="text-primary-500 font-bold">
                        {tier.id}

                        <span className="text-secondary-200 font-normal">
                          {" - " + tier.num_photos} Photos
                        </span>
                      </span>
                      <span className="text-accent-200 font-medium">
                        {"$" + tier.price_per_photo + " per photo"}
                      </span>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card className="bg-background-900 border-primary-800 h-[420px]">
          <CardContent className="">
            <h1 className="text-text-50 mb-4 text-2xl font-bold">Resolution</h1>
            <RadioGroup
              value={selectedResolution}
              onValueChange={setSelectedResolution}
            >
              <div className="space-y-3">
                {resolutions.map((res) => (
                  <div key={res.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={res.id} id={res.id} />
                    <Label
                      htmlFor={res.id}
                      className={
                        `border-background-700 bg-background-900 hover:bg-background-800 flex flex-1 cursor-pointer items-center justify-between rounded-lg border p-3 text-lg ` +
                        (selectedResolution === res.id
                          ? "bg-background-800"
                          : "")
                      }
                    >
                      <span className="text-primary-500 font-bold">
                        {res.name}
                        {res.additionalCost > 0 && (
                          <span className="text-accent-200 ml-2 font-normal">
                            {`+$${res.additionalCost}`}
                          </span>
                        )}
                      </span>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
            {selectedResolution === "custom" && (
              <div className="mt-8 flex w-full flex-col items-start">
                <label
                  htmlFor="custom-resolution"
                  className="text-text-50 mb-2 font-medium"
                >
                  Custom Resolution
                </label>
                <input
                  id="custom-resolution"
                  type="text"
                  value={customResolution}
                  onChange={(e) => setCustomResolution(e.target.value)}
                  placeholder="e.g. 2560x1440"
                  className="border-background-700 bg-background-900 text-text-50 focus:border-primary-500 w-full rounded border p-2 focus:outline-none"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="flex w-2/3 flex-col items-start gap-y-8 p-6 pl-3">
        <Card className="bg-background-900 border-primary-800 w-full">
          <CardContent>
            <h1 className="text-text-50 text-center text-2xl">
              Resolution Preview
            </h1>
            <div className="bg-background-900 relative flex min-h-[350px] items-center justify-center rounded-lg p-8">
              {/* Custom (outer), 4K (middle), 1080p (inner) */}
              <div
                className={`relative flex items-center justify-center rounded-lg border-4 ${
                  selectedResolution === "custom"
                    ? "border-primary-500 bg-primary-950"
                    : "border-primary-700 bg-primary-950/50"
                } aspect-video w-4/5`}
              >
                <div className="text-primary-400 absolute -top-8 left-0 text-base font-bold">
                  {customResolution ? customResolution : "Custom"}
                </div>
                {/* 4K Container (middle) */}
                <div
                  className={`relative flex items-center justify-center rounded-lg border-4 ${
                    selectedResolution === "4k"
                      ? "border-accent-500 bg-accent-950"
                      : "border-accent-700 bg-accent-950/50"
                  } aspect-video w-2/3`}
                >
                  <div className="text-accent-400 absolute -top-8 left-0 text-sm font-bold">
                    4K (3840×2160)
                  </div>
                  {/* 1080P Container (innermost) */}
                  <div
                    className={`relative flex items-center justify-center rounded-lg border-4 ${
                      selectedResolution === "1080p"
                        ? "border-secondary-500 bg-secondary-950"
                        : "border-secondary-700 bg-secondary-950/50"
                    } aspect-video w-1/2`}
                  >
                    <div className="text-secondary-400 absolute -top-6 left-0 text-xs font-bold">
                      1080P (1920×1080)
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-text-300 mt-4 text-center text-sm">
              Visual representation of 1080p, 4K, and custom resolution
              hierarchy.
              <br />
              Your selected resolution is highlighted.
            </div>
          </CardContent>
        </Card>

        <div className="flex w-full gap-4">
          <Card className="bg-background-900 border-primary-800 flex w-1/2">
            <CardContent>
              <h1 className="text-text-50 text-center text-2xl">
                Total Price{": "}
                <span className="font-bold text-green-500">
                  {"$" + totalPrice}
                </span>
              </h1>
              <p>
                <span className="text-text-200 flex w-full items-center justify-center pt-4 text-center text-sm">
                  {`Price $${basePriceObj?.price ?? 0} + `}
                  {selectedResolution === "custom"
                    ? `Custom Resolution (+$${resolutionObj?.additionalCost ?? 0})`
                    : `${resolutionObj?.name} Resolution${resolutionObj?.additionalCost ? ` (+$${resolutionObj.additionalCost})` : ""}`}
                </span>
              </p>
            </CardContent>
          </Card>
          <Card className="bg-background-900 border-primary-800 flex w-1/2 items-center justify-center">
            <CardContent className="flex w-full items-center justify-center">
              <h1 className="text-text-50 text-center text-2xl">
                Checkout Coming Soon
              </h1>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
