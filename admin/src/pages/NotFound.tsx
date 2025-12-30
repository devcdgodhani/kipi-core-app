import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center space-y-6 bg-background">
            <h1 className="text-9xl font-bold text-primary/10">404</h1>
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-primary">Page Not Found</h2>
                <p className="text-primary/60">The page you are looking for doesn't exist or has been moved.</p>
                <Link
                    to="/"
                    className="inline-block px-8 py-3 bg-primary text-background rounded-full font-bold hover:bg-primary/90 transition-all"
                >
                    Go Home
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
