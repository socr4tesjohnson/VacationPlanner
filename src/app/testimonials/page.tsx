import { Metadata } from "next";
import TestimonialsClient from "./TestimonialsClient";

export const metadata: Metadata = {
  title: "Customer Testimonials | Vacation Planner",
  description:
    "Read reviews from our satisfied customers about their amazing Disney vacations, cruises, and travel experiences. See why families trust us for their dream vacations.",
  keywords:
    "testimonials, reviews, customer feedback, Disney vacation reviews, cruise reviews, travel reviews",
};

export default function TestimonialsPage() {
  return <TestimonialsClient />;
}
