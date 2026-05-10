// src/components/aframe-360-video.tsx
"use client";

import { useEffect, useRef } from "react";

// Since A-Frame is loaded via a script tag, we need to declare the types for the custom elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'a-scene': React.DetailedHTMLProps<any, HTMLElement>;
      'a-videosphere': React.DetailedHTMLProps<any, HTMLElement>;
      'a-assets': React.DetailedHTMLProps<any, HTMLElement>;
      'a-entity': React.DetailedHTMLProps<any, HTMLElement>;
    }
  }
}

interface AFrame360VideoProps {
  videoUrl: string;
}

export default function AFrame360Video({ videoUrl }: AFrame360VideoProps) {
  const sceneRef = useRef<any>(null);

  useEffect(() => {
    // This is a workaround to ensure A-Frame scene is properly initialized in Next.js
    const scene = sceneRef.current;
    if (scene) {
      if (scene.hasLoaded) {
        // Scene is already loaded
      } else {
        scene.addEventListener('loaded', () => {
          // Scene has loaded
        });
      }
    }
  }, []);

  return (
    <a-scene ref={sceneRef} embedded style={{ width: '100%', height: '100%' }}>
      <a-assets>
        <video id="video360" src={videoUrl} autoPlay loop crossOrigin="anonymous"></video>
      </a-assets>
      <a-videosphere src="#video360"></a-videosphere>
      <a-entity camera look-controls wasd-controls-enabled="false"></a-entity>
    </a-scene>
  );
}
