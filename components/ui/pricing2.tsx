"use client";

import { ArrowRight, CircleCheck } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface PricingFeature {
  text: string;
}

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  isFree?: boolean;
  highlighted?: boolean;
  monthlyPrice: string;
  yearlyPrice: string;
  features: PricingFeature[];
  button: {
    text: string;
    url: string;
  };
}

interface Pricing2Props {
  heading?: string;
  description?: string;
  plans?: PricingPlan[];
}

const Pricing2 = ({
  heading = "Plans",
  description = "Start free. Upgrade when you want more.",
  plans = [
    {
      id: "free",
      name: "Free",
      description: "For every student",
      isFree: true,
      monthlyPrice: "$0",
      yearlyPrice: "$0",
      features: [
        { text: "Browse all published courses and chapters" },
        { text: "Full text search across notes and files" },
        { text: "Inline previews for PDFs, slides, and video" },
        { text: "Continue where you left off" },
      ],
      button: {
        text: "Get started",
        url: "/login?mode=signup",
      },
    },
    {
      id: "pro",
      name: "Pro",
      description: "For the dedicated",
      highlighted: true,
      monthlyPrice: "$5",
      yearlyPrice: "$4",
      features: [
        { text: "Offline downloads" },
        { text: "Early access to new material" },
        { text: "Priority support" },
      ],
      button: {
        text: "Choose Pro",
        url: "/login?mode=signup",
      },
    },
  ],
}: Pricing2Props) => {
  const [isYearly, setIsYearly] = useState(false);
  return (
    <section className="py-24 text-ink">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
          <h2 className="font-display text-pretty text-4xl font-semibold tracking-[-0.02em] lg:text-6xl">
            {heading}
          </h2>
          <p className="text-muted-foreground lg:text-xl">{description}</p>
          <div className="flex items-center gap-3 text-lg">
            Monthly
            <Switch
              checked={isYearly}
              onCheckedChange={() => setIsYearly(!isYearly)}
            />
            Yearly
          </div>
          <div className="flex flex-col items-stretch gap-6 md:flex-row">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={cn(
                  "flex w-80 flex-col justify-between border-line text-left",
                  plan.highlighted && "border-ink",
                )}
              >
                <CardHeader>
                  <CardTitle>
                    <p className="font-display">{plan.name}</p>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                  <span className="font-display text-4xl font-semibold">
                    {plan.isFree ? "Free" : isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  {plan.isFree ? (
                    <p className="text-muted-foreground">Always free for students</p>
                  ) : (
                    <p className="text-muted-foreground">
                      Billed{" "}
                      {isYearly
                        ? `$${Number(plan.yearlyPrice.slice(1)) * 12}`
                        : `$${Number(plan.monthlyPrice.slice(1)) * 12}`}{" "}
                      annually
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <Separator className="mb-6" />
                  {plan.highlighted && (
                    <p className="mb-3 font-semibold">Everything in Free, and:</p>
                  )}
                  <ul className="space-y-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CircleCheck className="size-4" />
                        <span>{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="mt-auto">
                  <Button asChild className="w-full">
                    <a href={plan.button.url}>
                      {plan.button.text}
                      <ArrowRight className="ml-2 size-4" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export { Pricing2 };
