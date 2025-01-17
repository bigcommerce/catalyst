import React from 'react';
import { Laptop, Wifi, Globe, MapPin, Monitor, Clock } from 'lucide-react';

const SystemInfoComponent = ({ data }) => {


    const sections = [
        {
            title: "Device",
            icon: <Laptop className="w-4 h-4" />,
            items: ['deviceType', 'platform']
        },
        // {
        //     title: "Network",
        //     icon: <Wifi className="w-4 h-4" />,
        //     items: ['connection', "ip"]
        // },
        // {
        //     title: "Location",
        //     icon: <MapPin className="w-4 h-4" />,
        //     items: ['city', 'country', 'latitude', 'longitude']
        // },
        {
            title: "Display",
            icon: <Monitor className="w-4 h-4" />,
            items: ['screenWidth', 'screenHeight']
        }
    ];

    const formatValue = (key, value) => {
        if (typeof value === 'number' && (key === 'latitude' || key === 'longitude')) {
            return value.toFixed(4);
        }
        return " " + value || 'N/A';
    };

    const formatKey = (key) => {
        return key
            .split(/(?=[A-Z])/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return (
        <div className=" p-1 bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4  border-b border-gray-200">
                {/* <h2 className="text-lg font-semibold text-gray-800">System Information : {data.session_id}</h2> */}
            </div>

            <div className="p-4 space-y-4">
                {sections.map((section) => (
                    <div key={section.title} className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                            {section.icon}
                            {section.title}
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm pl-6">
                            {section.items.map((key) => (
                                <div key={key} className="flex">
                                    <span className="text-gray-500">{formatKey(key)} : <span className="font-medium text-gray-900 space-x-1">{formatValue(key, data[key])}</span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SystemInfoComponent;