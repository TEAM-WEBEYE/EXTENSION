import React from "react";

interface Props {
    coupons: string[];
}

export const CouponComponent: React.FC<Props> = ({ coupons }) => {
    return (
        <div className="p-4 rounded-2xl shadow-md border border-grayscale-300 bg-white">
            <ul className="list-disc pl-5 space-y-1">
                {coupons.map((text, i) => (
                    <li key={i} className="font-16-Regular text-grayscale-800">
                        {text}
                    </li>
                ))}
                <h2 className="font-20-Bold mb-2 text-purple-default">
                    를 사용 가능합니다{" "}
                </h2>
            </ul>
        </div>
    );
};
