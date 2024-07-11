import React from "react";

const IndividualSkeleton: React.FC = () => {
    return (
        <div className="flex flex-col items-center mt-5 bg-[#fefefe]">
            <div className="flex flex-col items-center mb-20 relative w-2/3">
                <div className="w-full h-64 overflow-hidden">
                    <div className="h-64 bg-gray-200 animate-pulse"></div>
                </div>
                <div className="flex justify-between w-full">
                    <div className="absolute bottom-0 left-[20%] transform -translate-x-1/2 flex gap-5 translate-y-[30%] z-50">
                        <div className="w-40 h-40 bg-gray-300 border-4 border-white rounded-full animate-pulse"></div>
                        <div className="my-auto space-y-2">
                            <div className="h-6 bg-gray-300 rounded w-32 animate-pulse"></div>
                            <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
                            <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
                        </div>
                    </div>
                    <div className="ml-auto mt-4">
                        <div className="bg-gray-300 hover:bg-slate-300 p-4 rounded-lg text-lg font-semibold w-48 h-12 animate-pulse"></div>
                    </div>
                </div>
            </div>
            <div className="w-full max-w-3xl flex flex-col gap-10">
                {[...Array(3)].map((_, index) => (
                    <div key={index} className="w-full bg-white p-4 rounded-md shadow-md mb-6 animate-pulse">
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="bg-gray-300 h-12 w-12 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                                <div className="bg-gray-300 h-4 w-1/4 rounded"></div>
                                <div className="bg-gray-300 h-4 w-3/4 rounded"></div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-gray-300 h-4 w-full rounded"></div>
                            <div className="bg-gray-300 h-4 w-5/6 rounded"></div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-4">
                            {[...Array(3)].map((_, index) => (
                                <div key={index} className="bg-gray-300 h-24 rounded-md"></div>
                            ))}
                        </div>
                        <div className="flex justify-between items-center mt-4">
                            <div className="bg-gray-300 h-4 w-16 rounded"></div>
                            <div className="bg-gray-300 h-4 w-16 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default IndividualSkeleton;
