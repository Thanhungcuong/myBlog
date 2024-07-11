import React from 'react'

const SettingsSkeleton = () => {
    return (
        <div className='flex flex-col items-center mt-5 bg-[#fefefe]'>
            <div className='min-w-[768px] mx-auto bg-slate-200 p-10 rounded-2xl my-12 h-screen'>
                <div className='flex justify-between my-12'>
                    <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
                    <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
                </div>
                <div className='w-full h-[200px] bg-gray-300 rounded animate-pulse'>

                </div>


                <div className='flex justify-between my-12'>
                    <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
                    <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
                </div>
                <div className=' h-[200px] w-[200px] mx-auto bg-gray-300 rounded-full animate-pulse'>

                </div>
            </div>

        </div>
    )
}

export default SettingsSkeleton