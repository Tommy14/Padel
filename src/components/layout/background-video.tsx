"use client";

import { useEffect, useRef } from "react";

type BackgroundVideoProps = {
  src: string;
};

export function BackgroundVideo({ src }: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.muted = true;
    void video.play().catch(() => {
      // Browsers can block autoplay; keep static background in that case.
    });
  }, []);

  return (
    <div className="relative h-screen w-full">
      <video ref={videoRef} className="h-full w-full object-cover opacity-55" autoPlay loop muted playsInline preload="metadata">
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
}

