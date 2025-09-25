import { useState, useEffect } from "react";

// Define a type for our testimonial data
interface Testimonial {
  name: string;
  text: string;
  image: string;
}

interface IllustrationProps {
  flow: "signIn" | "signUp";
}

export function Illustration({ flow }: IllustrationProps) {
  // State for the animated testimonial gallery
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);

  // Data for the customer testimonials
  const testimonials: Testimonial[] = [
    {
      name: "Sarah K.",
      text: '"This app is absolutely amazing! Bug tracking has never been easier."',
      image: "https://placehold.co/100x100/1e90ff/ffffff?text=SK",
    },
    {
      name: "John B.",
      text: '"An intuitive and powerful tool. It has completely streamlined our workflow."',
      image: "https://placehold.co/100x100/3cb371/ffffff?text=JB",
    },
    {
      name: "Maria L.",
      text: '"The best bug-tracking solution we\'ve ever used. The team is incredibly responsive."',
      image: "https://placehold.co/100x100/ff6347/ffffff?text=ML",
    },
  ];

  // Effect for the testimonial animation
  useEffect(() => {
    const testimonialInterval = setInterval(() => {
      setCurrentTestimonialIndex((prevIndex) =>
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000); // Change testimonial every 4 seconds

    return () => clearInterval(testimonialInterval); // Cleanup on unmount
  }, [testimonials.length]);

  return (
    <div className={`hidden lg:block bg-gradient-to-br from-orange-400 to-orange-500 p-8 relative overflow-hidden ${flow === 'signUp' ? 'order-1' : 'order-2'}`}>
      <div className="relative h-full flex items-center justify-center">
        {/* Bug Reports Window */}
        <div className="bg-white rounded-lg shadow-lg p-4 w-64 relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="ml-2 text-sm font-medium text-gray-700 blur-sm">Bug Reports</span>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-600 blur-sm">Bug Reports</div>
            <div className="text-sm text-gray-600 blur-sm">Bug Reports</div>
            <div className="w-16 h-2 bg-blue-400 rounded-full"></div>
          </div>
        </div>

        {/* Code Editor Window */}
        <div className="absolute top-20 rotate-4 right-8 bg-gray-900 rounded-lg shadow-lg p-4 w-72 text-sm font-mono">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="ml-2 text-sm text-white blur-sm">kekyvodts</span>
          </div>
          <div className="text-purple-400 blur-sm">astril:</div>
          <div className="text-green-400 blur-sm">string(ted{"{}"});</div>
          <div className="text-white blur-sm">
            2{"{"}
            {"{"}
          </div>
          <div className="text-white ml-4 blur-sm">4</div>
          <div className="text-orange-400 ml-4 blur-sm">bug</div>
          <div className="text-white ml-4 blur-sm">1</div>
          <div className="text-white ml-4 blur-sm">8</div>
          <div className="text-green-400 blur-sm">66om7{"}"}</div>
          <div className="text-white blur-sm">7{"}"}</div>
        </div>

        {/* Floating Bug Icon */}
        <div className="absolute top-32 left-6 bg-orange-400 rounded-lg p-3 shadow-lg rotate-6">
          <div className="w-6 h-6 text-white text-xl">✓</div>
        </div>

        {/* Floating Dialog */}
        <div className="absolute top-14 left-32 bg-white rounded-lg shadow-lg p-2 w-24 -rotate-12">
          <div className="flex items-center justify-between">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <div className="text-xs">•</div>
          </div>
        </div>

        {/* Notification Badge */}
        <div className="absolute top-24 right-4 bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
          <span className="text-white text-xs font-bold blur-sm">3</span>
        </div>

        {/* Progress Bar Card */}
        <div className="absolute top-56 left-14 -rotate-4 bg-white rounded-lg shadow-lg p-3 w-28">
          <div className="space-y-2">
            <div className="w-full h-1 bg-gray-200 rounded">
              <div className="w-3/4 h-1 bg-green-500 rounded"></div>
            </div>
            <div className="w-full h-1 bg-gray-200 rounded">
              <div className="w-1/2 h-1 bg-blue-500 rounded"></div>
            </div>
            <div className="w-full h-1 bg-gray-200 rounded">
              <div className="w-1/4 h-1 bg-orange-500 rounded"></div>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="absolute top-20 left-28 bg-green-500 rounded-full px-3 py-1 shadow-lg rotate-[-8deg]">
          <span className="text-white text-xs font-medium blur-sm">Active</span>
        </div>

        {/* Floating Button */}
        <div className="absolute top-40 right-20 bg-purple-500 rounded-lg px-3 py-2 shadow-lg rotate-[-12deg]">
          <span className="text-white text-xs font-medium blur-sm">Save</span>
        </div>

        {/* New Random Element 2: Mini Chart Card */}
        <div className="absolute top-1/4 right-0 bg-white rounded-lg shadow-xl p-2 w-20 rotate-[110deg] z-20">
          <div className="h-8 flex justify-around items-end">
            <div className="w-1 bg-blue-300 h-2/3 rounded-sm"></div>
            <div className="w-1 bg-green-400 h-full rounded-sm"></div>
            <div className="w-1 bg-red-300 h-1/2 rounded-sm"></div>
            <div className="w-1 bg-yellow-400 h-3/4 rounded-sm"></div>
          </div>
        </div>

        {/* New Random Element 4: Placeholder Text Block */}
        <div className="absolute top-2/3 left-10 bg-gray-100 rounded-md shadow-sm p-2 w-28 -rotate-6 z-20">
          <div className="w-3/4 h-2 bg-gray-300 rounded mb-1"></div>
          <div className="w-full h-2 bg-gray-300 rounded mb-1"></div>
          <div className="w-1/2 h-2 bg-gray-300 rounded"></div>
        </div>

        {/* Animated Customer Satisfaction Cards */}
        <div className="absolute bottom-12 left-16 w-96 h-40"> {/* Container for the animated cards */}
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`
                absolute top-0 left-0 w-full h-full
                bg-white rounded-lg shadow-2xl p-4 border border-gray-100
                transition-opacity duration-1000 ease-in-out
                ${index === currentTestimonialIndex ? 'opacity-100 z-30' : 'opacity-0 z-20'}
              `}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <img src={testimonial.image} alt={`Avatar of ${testimonial.name}`} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-yellow-400">★★★★★</span>
                  </div>
                  <p className="text-sm text-gray-800 font-medium leading-relaxed">
                    {testimonial.text}
                  </p>
                  <p className="text-xs text-gray-500 mt-2 font-medium">- {testimonial.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}