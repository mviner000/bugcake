// src/components/NotFound.tsx

import { Link } from "react-router-dom"
import { Button } from "./ui/button"

export function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="flex items-center gap-12 max-w-4xl mx-auto">
        {/* Bee illustration with 404 speech bubble */}
        <div className="relative">
          <img src="/404-bee.png" alt="Lost bee with 404 speech bubble" className="w-80 h-auto" />
        </div>

        {/* Text and button section */}
        <div className="flex flex-col items-start">
          {/* Message */}
          <div className="mb-8">
            <h1 className="text-4xl font-normal text-gray-800 mb-2 italic">Looks like you're lost</h1>
            <p className="text-4xl font-normal text-gray-800 italic">in the sweetness</p>
          </div>

          {/* Back to Homepage Button */}
          <Link to="/">
            <Button size="xl" className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-full transition-colors duration-200 text-2xl">
              Back to homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}