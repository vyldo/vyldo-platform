import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="inline-block mb-4">
              <img 
                src="https://images.hive.blog/DQmTpydjYqPqF4qJuLXfHXzWs1VeuNhAawMrsqjt9qDiyEJ/Logo.png" 
                alt="Vyldo" 
                className="h-12 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              Professional freelancing marketplace powered by Hive blockchain technology.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">For Buyers</h3>
            <ul className="space-y-2">
              <li><Link to="/search" className="text-sm hover:text-white transition-colors">Find Services</Link></li>
              <li><Link to="/search" className="text-sm hover:text-white transition-colors">Browse Categories</Link></li>
              <li><Link to="/register" className="text-sm hover:text-white transition-colors">Post a Request</Link></li>
              <li><Link to="/register" className="text-sm hover:text-white transition-colors">How It Works</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">For Sellers</h3>
            <ul className="space-y-2">
              <li><Link to="/register" className="text-sm hover:text-white transition-colors">Become a Seller</Link></li>
              <li><Link to="/gigs/create" className="text-sm hover:text-white transition-colors">Create a Gig</Link></li>
              <li><Link to="/dashboard" className="text-sm hover:text-white transition-colors">Seller Dashboard</Link></li>
              <li><Link to="/wallet" className="text-sm hover:text-white transition-colors">Earnings & Payments</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/help-center" className="text-sm hover:text-white transition-colors">Help Center</Link></li>
              <li><Link to="/trust-and-safety" className="text-sm hover:text-white transition-colors">Trust & Safety</Link></li>
              <li><Link to="/terms-of-service" className="text-sm hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy-policy" className="text-sm hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Vyldo. All rights reserved.
          </p>
          <p className="text-sm text-gray-400 mt-2 md:mt-0">
            Created by <span className="text-primary-400 font-medium">Aftab Irshad</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
