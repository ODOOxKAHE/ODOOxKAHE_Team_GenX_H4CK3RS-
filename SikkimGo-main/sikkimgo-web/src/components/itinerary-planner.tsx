"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { personalizedItinerarySuggestions } from "@/ai/flows/personalized-itinerary-suggestions";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Wand2 } from "lucide-react";
import { interests } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

const ItinerarySchema = z.object({
  duration: z.coerce.number().min(1, "Duration must be at least 1 day.").max(30, "Duration cannot exceed 30 days."),
  interests: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one interest.",
  }),
});

type ItineraryFormValues = z.infer<typeof ItinerarySchema>;

export default function ItineraryPlanner() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const { toast } = useToast();

  const form = useForm<ItineraryFormValues>({
    resolver: zodResolver(ItinerarySchema),
    defaultValues: {
      duration: 7,
      interests: ["nature", "culture"],
    },
  });

  async function onSubmit(data: ItineraryFormValues) {
    setLoading(true);
    setResult("");
    try {
      const response = await personalizedItinerarySuggestions(data);
      setResult(response.itinerary);
    } catch (error) {
      console.error("Failed to generate itinerary:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate itinerary. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="shadow-2xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <Wand2 className="text-accent" />
          Create Your Custom Itinerary
        </CardTitle>
        <CardDescription>
          Adjust the details below and let our AI craft your perfect Sikkim adventure.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration of Stay (in days)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 7" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="interests"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Interests</FormLabel>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {interests.map((item) => (
                        <FormField
                          key={item.id}
                          control={form.control}
                          name="interests"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={item.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, item.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== item.id
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {item.label}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full md:w-auto" size="lg">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Itinerary
                </>
              )}
            </Button>
          </form>
        </Form>

        {(loading || result) && (
          <div className="mt-8 pt-8 border-t">
            <h3 className="font-headline text-xl font-bold mb-4">Your Personalized Itinerary</h3>
            {loading && (
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse mt-6"></div>
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
              </div>
            )}
            {result && (
              <Card className="bg-secondary/30">
                <CardContent className="p-6">
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap font-body text-foreground">
                    {result}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
