import React from "react";

const HomeSkeleton: React.FC = () => {
    return (
        <div className="container max-w-[1440px] mx-auto p-4">
            <div className="mb-12 max-w-[600px] mx-auto bg-white shadow-lg">
                <div className="flex items-center justify-around p-4 ">
                    <div className="bg-gray-300 animate-pulse h-12 my-auto rounded-full w-12"></div>
                    <div className="bg-gray-300 animate-pulse w-5/6 h-12 rounded-md"></div>

                </div>

            </div>
            {[...Array(5)].map((_, index) => (
                <div key={index} className="flex flex-col  justify-center items-center mb-6 w-full max-w-[800px] mx-auto">
                    <div className="w-full bg-white h-[468px] p-4 rounded-md shadow-md">
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="bg-gray-300 animate-pulse h-12 w-12 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                                <div className="bg-gray-300 animate-pulse h-4 w-1/4 rounded"></div>
                                <div className="bg-gray-300 animate-pulse h-4 w-3/4 rounded"></div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-gray-300 animate-pulse h-4 w-full rounded"></div>
                            <div className="bg-gray-300 animate-pulse h-4 w-5/6 rounded"></div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-4 ">
                            {[...Array(3)].map((_, index) => (
                                <div key={index} className="bg-gray-300  animate-pulse h-[240px] w-[240px] rounded-md"></div>
                            ))}
                        </div>
                        <div className="flex justify-between items-center mt-4">
                            <div className="bg-gray-300 animate-pulse h-4 w-16 rounded"></div>
                            <div className="bg-gray-300 animate-pulse h-4 w-16 rounded"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default HomeSkeleton;
