"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { categories } from "@/lib/data";
import { generateSummaryAction } from "@/app/actions";
import { Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function SummaryGenerator() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [timePeriod, setTimePeriod] = useState<string>("last-30-days");
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!selectedCategory) {
      toast({
        title: "No Category Selected",
        description: "Please select a category to generate a summary.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setSummary("");
    try {
      const result = await generateSummaryAction({
        category: selectedCategory,
        timePeriod,
      });
      if (result.summary) {
        setSummary(result.summary);
      } else {
        throw new Error("Failed to generate summary.");
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Could not generate summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Transaction Summary</CardTitle>
        <CardDescription>
          Generate a brief summary of your transactions for journaling or
          reflection.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Category</label>
            <Select onValueChange={setSelectedCategory} value={selectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Time Period</label>
            <Select onValueChange={setTimePeriod} value={timePeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last-7-days">Last 7 days</SelectItem>
                <SelectItem value="last-30-days">Last 30 days</SelectItem>
                <SelectItem value="last-quarter">Last Quarter</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Textarea
            placeholder="Your AI-generated summary will appear here..."
            value={summary}
            readOnly
            className="min-h-[150px]"
          />
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button onClick={handleGenerate} disabled={isLoading}>
          <Wand2 className="mr-2 h-4 w-4" />
          {isLoading ? "Generating..." : "Generate Summary"}
        </Button>
      </CardFooter>
    </Card>
  );
}
