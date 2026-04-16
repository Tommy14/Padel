"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";

type BackgroundVideoProps = {
  src: string;
};

export function BackgroundVideo({ src }: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.muted = muted;
    void video.play().catch(() => {
      // Browsers can block autoplay; user interaction on the button will retry.
    });
  }, [muted]);

  const handleToggleMute = async () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const nextMuted = !muted;
    video.muted = nextMuted;
    setMuted(nextMuted);

    try {
      await video.play();
    } catch {
      // No-op: if playback is blocked, the browser handles it.
    }
  };

  return (
    <>
      <video ref={videoRef} className="h-full w-full object-cover opacity-55" autoPlay loop playsInline preload="metadata">
        <source src={src} type="video/mp4" />
      </video>
      <div className="absolute right-4 top-4 z-20">
        <Button type="button" variant="secondary" size="sm" className="pointer-events-auto gap-2 bg-background/70 backdrop-blur" onClick={handleToggleMute}>
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          {muted ? "Unmute" : "Mute"}
        </Button>
      </div>
    </>
  );
}

