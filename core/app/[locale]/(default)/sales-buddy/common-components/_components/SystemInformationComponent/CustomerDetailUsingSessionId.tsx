import React from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCw } from 'lucide-react';
import SystemInfoComponent from '.';

interface UserData {
    agent_id: number;
    cart_id: string;
    customer_emailid: string;
    customer_group_id: string;
    customer_id: string;
    customer_name: string;
    details: string;
    id: number;
    referral_id: string;
    session_id: string;
}

interface UrlData {
    id: string;
    url: string;
}

interface CompactUserCardProps {
    data: UserData;
    shopperSystemInfo: any; // Type should be specified based on SystemInfoComponent props
    customerVisitedUrl?: UrlData[];
    onReload?: () => void;
}

const UrlList: React.FC<{ urls: UrlData[] }> = ({ urls }) => (
    <div className="px-4 py-3">
        <div className="space-y-3">
            {urls.map((item) => (
                <div
                    key={item.id}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                    <Link
                        href={item.url}
                        className="flex items-start gap-3 text-gray-700 hover:text-blue-600 break-all"
                    >
                        <div className="flex-shrink-0 mt-1">
                            <AlertCircle className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium group-hover:underline">
                            {item.url}
                        </span>
                    </Link>
                </div>
            ))}
        </div>
    </div>
);

const InfoSection: React.FC<{
    title: string;
    children: React.ReactNode;
}> = ({ title, children }) => (
    <>
        <div className="bg-gray-50 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
            {title}
        </div>
        {children}
    </>
);

const InfoPair: React.FC<{
    label: string;
    value: string | number | undefined;
}> = ({ label, value }) => {
    const displayValue = value?.toString();
    const isEmpty = !displayValue || displayValue === "undefined undefined" || displayValue === "undefined";

    return (
        <div className="border-b border-gray-100 last:border-0">
            <div className="px-4 py-3 hover:bg-gray-50/50 transition-colors">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {label}
                </div>
                <div className="mt-1 text-sm font-medium text-gray-900 break-all">
                    {!isEmpty ? displayValue : "—"}
                </div>
            </div>
        </div>
    );
};

const CompactUserCard: React.FC<CompactUserCardProps> = ({
    data,
    shopperSystemInfo,
    customerVisitedUrl = [],
    onReload,
}) => {
    const [isRotating, setIsRotating] = React.useState(false);

    const handleReload = () => {
        setIsRotating(true);
        if (onReload) {
            onReload();
        }
        // Reset rotation after animation
        setTimeout(() => setIsRotating(false), 1000);
    };
    return (
        <div className="w-full max-w-[500px] mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold text-white">
                            Session Details
                        </h2>

                    </div>
                    <div className='flex items-center'>
                        <div className="px-3 py-1 bg-white/20 rounded-full text-xs text-white font-medium">
                            {data.session_id}

                        </div>
                        <div>
                            <button
                                onClick={handleReload}
                                className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                                title="Reload data"
                            >
                                <RotateCw
                                    className={`w-5 h-5 text-white ${isRotating ? 'animate-spin' : ''}`}
                                />
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* Content */}
            <div className="divide-y divide-gray-100">
                <InfoSection title="Basic Information">
                    <InfoPair label="Customer Name" value={data.customer_name} />
                    <InfoPair label="Email" value={data.customer_emailid} />
                    <InfoPair label="Customer ID" value={data.customer_id} />
                </InfoSection>

                <InfoSection title="Additional Details">
                    <InfoPair label="Customer Group" value={data.customer_group_id} />
                    <InfoPair label="Cart ID" value={data.cart_id} />
                    <InfoPair label="Agent ID" value={data.agent_id} />
                </InfoSection>

                <InfoSection title="Session Information">
                    <InfoPair label="Referral ID" value={data.referral_id} />
                    <InfoPair label="Session ID" value={data.session_id} />

                </InfoSection>
                <InfoSection title="System Information">
                    {shopperSystemInfo && (
                        <div className="border-t border-gray-100">
                            <SystemInfoComponent data={shopperSystemInfo} />
                        </div>
                    )}
                </InfoSection>
                <InfoSection title="Browsing History">
                    {customerVisitedUrl && customerVisitedUrl.length > 0 ? (
                        <UrlList urls={customerVisitedUrl} />
                    ) : (
                        <div className="px-4 py-6 text-center text-gray-500">
                            No browsing history available
                        </div>
                    )}
                </InfoSection>


            </div>
        </div>
    );
};

export default CompactUserCard;