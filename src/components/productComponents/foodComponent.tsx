import React from "react";

export const FoodComponent = () => {
    return (
        <div
            id="voim-food-component"
            style={{
                position: "fixed",
                bottom: "20px",
                right: "20px",
                backgroundColor: "white",
                border: "2px solid #8914FF",
                borderRadius: "12px",
                padding: "16px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                zIndex: 9999,
            }}
        >
            <p style={{ color: "#8914FF", fontWeight: 700 }}>
                이 상품은 [식품/뷰티/건강] 카테고리에 해당됩니다.
            </p>
        </div>
    );
};
