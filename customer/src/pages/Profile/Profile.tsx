import React from 'react';

const Profile: React.FC = () => {
    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-primary">My Profile</h1>

            <div className="bg-white p-8 rounded-3xl border border-primary/10 space-y-6">
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
                        JD
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-primary">John Doe</h2>
                        <p className="text-primary/60">john.doe@example.com</p>
                    </div>
                </div>

                <form className="space-y-6 pt-6 border-t border-primary/10">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-primary/80">First Name</label>
                            <input
                                className="w-full border border-primary/20 bg-primary/5 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                defaultValue="John"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-primary/80">Last Name</label>
                            <input
                                className="w-full border border-primary/20 bg-primary/5 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                defaultValue="Doe"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-primary/80">Email Address</label>
                        <input
                            className="w-full border border-primary/20 bg-primary/5 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
                            defaultValue="john.doe@example.com"
                        />
                    </div>

                    <button className="px-8 py-3 bg-primary text-background rounded-lg font-bold hover:bg-primary/90 transition-all">
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
