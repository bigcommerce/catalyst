import React from 'react';

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

const CompactUserCard: React.FC<{ data: UserData }> = ({ data }) => {
    const renderInfoPair = (label:any, value:any) => (
        <div className="border-b border-gray-100 last:border-0">
            <div className="px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {label}
                </div>
                <div className="mt-1 text-sm font-medium text-gray-900 break-all">
                    {value != "undefined undefined" && value != "undefined" ? value : "—"}
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-[500px] mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">{data && data.session_id}</h2>
                    {/* <div className="px-2 py-1 bg-white/20 rounded text-xs text-white font-medium">
                        ID: {data?.id}
                    </div> */}
                </div>
            </div>

            {/* Content */}
            <div className="divide-y divide-gray-100">
                <div className="bg-gray-50 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Basic Information
                </div>
                {renderInfoPair("Customer Name", data?.customer_name ? data?.customer_name : "—")}
                {renderInfoPair("Email", data?.customer_emailid)}
                {renderInfoPair("Customer ID", data?.customer_id)}

                <div className="bg-gray-50 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Additional Details
                </div>
                {renderInfoPair("Customer Group", data?.customer_group_id)}
                {renderInfoPair("Cart ID", data?.cart_id)}
                {renderInfoPair("Agent ID", data?.agent_id)}

                <div className="bg-gray-50 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Session Information
                </div>
                {renderInfoPair("Referral ID", data?.referral_id)}
                {renderInfoPair("Session ID", data?.session_id)}
                {renderInfoPair("Details", data?.details)}
            </div>
        </div>
    );
};

export default CompactUserCard;