import React from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import animationData from "@src/assets/VOIM_downloading.json";

export default function Loading() {
    return (
        <Player
            autoplay
            loop
            src={animationData}
            style={{ height: 243, width: 260 }}
        />
    );
}
