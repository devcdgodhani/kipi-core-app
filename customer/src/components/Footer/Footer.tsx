import React from 'react';
import { Facebook, Twitter, Instagram, Globe, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-50 pt-16 pb-8 border-t border-gray-100 mt-auto">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center font-bold text-sm text-primary">K</div>
                            <span className="font-bold tracking-widest text-xs uppercase text-primary">Kipi</span>
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Redefining modern elegance with curated collections for the discerning individual.
                        </p>
                        <div className="flex items-center gap-4 text-gray-400">
                            <a href="#" className="hover:text-primary transition-colors"><Facebook size={20} /></a>
                            <a href="#" className="hover:text-primary transition-colors"><Twitter size={20} /></a>
                            <a href="#" className="hover:text-primary transition-colors"><Instagram size={20} /></a>
                        </div>
                    </div>

                    {/* Links Column 1 */}
                    <div>
                        <h4 className="font-bold text-primary mb-6 uppercase text-xs tracking-widest">Shop</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><a href="#" className="hover:text-primary transition-colors">New Arrivals</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Best Sellers</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Men's Collection</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Women's Collection</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Accessories</a></li>
                        </ul>
                    </div>

                    {/* Links Column 2 */}
                    <div>
                        <h4 className="font-bold text-primary mb-6 uppercase text-xs tracking-widest">Support</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Shipping & Returns</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Size Guide</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Track Order</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                        </ul>
                    </div>

                    {/* Contact / Newsletter */}
                    <div>
                        <h4 className="font-bold text-primary mb-6 uppercase text-xs tracking-widest">Contact</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li className="flex items-center gap-2">
                                <MapPin size={16} className="text-primary shrink-0" />
                                <span>123 Fashion Ave, NY 10001</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone size={16} className="text-primary shrink-0" />
                                <span>+1 (555) 123-4567</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Mail size={16} className="text-primary shrink-0" />
                                <span>support@kipi.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-gray-400">© 2026 Kipi Inc. All rights reserved.</p>
                    <div className="flex items-center gap-6 text-xs text-gray-400">
                        <span className="flex items-center gap-2"><Globe size={14} /> English (US)</span>
                        <span>USD ($)</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
