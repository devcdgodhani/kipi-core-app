import React from 'react';
import * as LucideIcons from 'lucide-react';
import { useCustomerAppSettings } from '../../context/CustomerAppSettingsContext';

const Footer: React.FC = () => {
    const { getFooter } = useCustomerAppSettings();
    const footer = getFooter();

    if (!footer) return null;

    const { brand, contact } = footer;

    // Helper to render social icons
    const renderSocialIcon = (platform: string) => {
        // Map common platform names to icons or try direct match
        let IconName = 'Globe';
        if (platform.toLowerCase().includes('facebook')) IconName = 'Facebook';
        else if (platform.toLowerCase().includes('twitter')) IconName = 'Twitter';
        else if (platform.toLowerCase().includes('instagram')) IconName = 'Instagram';
        else if (platform.toLowerCase().includes('linkedin')) IconName = 'Linkedin';
        else if (platform.toLowerCase().includes('youtube')) IconName = 'Youtube';

        const Icon = (LucideIcons as any)[IconName] || LucideIcons.Globe;
        return <Icon size={20} />;
    };

    return (
        <footer className="bg-primary/5 pt-12 sm:pt-16 pb-8 border-t border-primary/10 mt-auto">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            {useCustomerAppSettings().settings?.logo ? (
                                <img
                                    src={typeof useCustomerAppSettings().settings?.logo === 'string'
                                        ? useCustomerAppSettings().settings?.logo as string
                                        : (useCustomerAppSettings().settings?.logo as any)?.preSignedUrl}
                                    alt={brand.name}
                                    className="h-8 w-auto object-contain"
                                />
                            ) : (
                                <>
                                        <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center font-bold text-sm text-primary">
                                            {brand.name.charAt(0)}
                                        </div>
                                        <span className="font-bold tracking-widest text-xs uppercase text-primary">{brand.name}</span>
                                </>
                            )}
                        </div>
                        <p className="text-secondary text-sm leading-relaxed">
                            {brand.description}
                        </p>
                        <div className="flex items-center gap-4 text-secondary/50">
                            {footer.socialLinks.filter(l => l.isActive).map((link, idx) => (
                                <a
                                    key={idx}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-primary transition-colors"
                                    title={link.platform}
                                >
                                    {renderSocialIcon(link.platform)}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Dynamic Columns */}
                    {footer.columns.sort((a, b) => a.displayOrder - b.displayOrder).map((column, idx) => (
                        <div key={idx}>
                            <h4 className="font-bold text-primary mb-6 uppercase text-xs tracking-widest">{column.title}</h4>
                            <ul className="space-y-4 text-sm text-secondary">
                                {column.links.filter(l => l.isActive).map((link, linkIdx) => (
                                    <li key={linkIdx}>
                                        <a href={link.url} className="hover:text-primary transition-colors">
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Contact / Newsletter - If less than 4 columns total (including brand), show contact */}
                    {(footer.columns.length < 3) && (
                        <div>
                            <h4 className="font-bold text-primary mb-6 uppercase text-xs tracking-widest">Contact</h4>
                            <ul className="space-y-4 text-sm text-secondary">
                                {contact.address && (
                                    <li className="flex items-center gap-2">
                                        <LucideIcons.MapPin size={16} className="text-primary shrink-0" />
                                        <span>{contact.address}</span>
                                    </li>
                                )}
                                {contact.phone && (
                                    <li className="flex items-center gap-2">
                                        <LucideIcons.Phone size={16} className="text-primary shrink-0" />
                                        <span>{contact.phone}</span>
                                    </li>
                                )}
                                {contact.email && (
                                    <li className="flex items-center gap-2">
                                        <LucideIcons.Mail size={16} className="text-primary shrink-0" />
                                        <span>{contact.email}</span>
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="pt-8 border-t border-primary/10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-secondary/50">{footer.copyright}</p>
                    <div className="flex items-center gap-6 text-xs text-secondary/50">
                        <span className="flex items-center gap-2"><LucideIcons.Globe size={14} /> {footer.language}</span>
                        <span>{footer.currency}</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
