import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function getAppUrl(path: string = "") {
  let baseUrl = "http://localhost:3000";

  if (process.env.NEXT_PUBLIC_APP_URL) {
    baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  } else if (typeof window !== "undefined") {
    baseUrl = window.location.origin;
  }

  return `${baseUrl}${path}`;
}
