import * as THREE from "three";
import { smoothGeometry } from "./smoothGeometry";



export const attributesToGeometry = ({ index, position, color, normal, niftiHeader }) => {

    const geometry = new THREE.BufferGeometry();

    geometry.setIndex( new THREE.BufferAttribute( new Uint32Array(index), 1 ) );

    geometry.addAttribute('position', new THREE.BufferAttribute( new Float32Array(position), 3) );

    geometry.addAttribute('color', new THREE.BufferAttribute( new Float32Array(color), 3) );

    geometry.addAttribute('normal', new THREE.BufferAttribute( new Float32Array(normal), 3) );

    geometry.computeBoundingBox();
    
    return geometry;

}