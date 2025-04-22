import { Link } from "wouter";

export function HomeBanner() {
  return (
    <div className="bg-gradient-to-r from-indigo-500 to-primary rounded-2xl overflow-hidden mb-8">
      <div className="md:flex items-center">
        <div className="p-6 md:p-8 md:w-2/3">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Need a ride to campus?</h2>
          <p className="text-indigo-100 mb-4">Connect with fellow students heading your way. Save money and make friends!</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/post-ride">
              <a className="bg-white text-primary font-medium px-5 py-2 rounded-lg hover:bg-indigo-50 transition inline-block">
                Post a Ride
              </a>
            </Link>
            <button className="bg-indigo-400 bg-opacity-30 text-white font-medium px-5 py-2 rounded-lg hover:bg-opacity-40 transition">
              Find a Ride
            </button>
          </div>
        </div>
        <div className="hidden md:block md:w-1/3 p-8">
          <svg width="100%" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50,110 L150,110 L170,140 L30,140 Z" fill="#ffffff" opacity="0.8" />
            <rect x="40" y="70" width="120" height="40" rx="5" fill="#ffffff" opacity="0.9" />
            <rect x="60" y="50" width="80" height="20" rx="10" fill="#ffffff" opacity="0.8" />
            <circle cx="70" cy="120" r="10" fill="#111827" />
            <circle cx="130" cy="120" r="10" fill="#111827" />
            <path d="M75,90 L125,90" stroke="#4F46E5" strokeWidth="2" />
            <path d="M65,80 L135,80" stroke="#4F46E5" strokeWidth="2" />
            <path d="M110,70 C110,60 90,60 90,70" stroke="#4F46E5" strokeWidth="2" fill="none" />
          </svg>
        </div>
      </div>
    </div>
  );
}
