'use client';

import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';

/**
 * Шейдер «рентгеновского просвечивания»: свечение накапливается
 * по краям объекта (френель) и слегка пульсирует, имитируя
 * подсветку негатоскопа.
 */
export const XrayFresnelMaterial = shaderMaterial(
  {
    uColor: new THREE.Color('#BFD8E6'),
    uRim: new THREE.Color('#EFE9DF'),
    uPower: 2.4,
    uIntensity: 1.15,
    uTime: 0,
  },
  /* glsl */ `
    varying vec3 vNormalW;
    varying vec3 vViewDir;

    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vNormalW = normalize(mat3(modelMatrix) * normal);
      vViewDir = normalize(cameraPosition - worldPosition.xyz);
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  /* glsl */ `
    uniform vec3 uColor;
    uniform vec3 uRim;
    uniform float uPower;
    uniform float uIntensity;
    uniform float uTime;

    varying vec3 vNormalW;
    varying vec3 vViewDir;

    void main() {
      float fresnel = pow(1.0 - clamp(dot(normalize(vNormalW), normalize(vViewDir)), 0.0, 1.0), uPower);
      float breathe = 0.92 + 0.08 * sin(uTime * 0.7);
      vec3 color = mix(uColor, uRim, fresnel) * fresnel * uIntensity * breathe;
      gl_FragColor = vec4(color, clamp(fresnel * 0.95, 0.0, 1.0));
      #include <colorspace_fragment>
    }
  `
);

extend({ XrayFresnelMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    xrayFresnelMaterial: ThreeElements['meshBasicMaterial'] & {
      uColor?: THREE.Color | string;
      uRim?: THREE.Color | string;
      uPower?: number;
      uIntensity?: number;
      uTime?: number;
    };
  }
}
