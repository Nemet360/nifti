import * as THREE from "three";
import { MeshPhysicalMaterial, DoubleSide } from 'three';

 

export const geometryToMesh = geometry => {
    
    const material = new MeshPhysicalMaterial({
        vertexColors : THREE.VertexColors,
        //depthWrite: true,
        metalness : 0.4,
        roughness : 0.8,
        clearCoat : 0.2,
        clearCoatRoughness : 0.2,
        reflectivity : 0.2,
        side : DoubleSide,
        transparent : false,
        opacity : 1,
        clipShadows : true,
        depthTest : true
    });

    const mesh = new THREE.Mesh(geometry, material);

    mesh.castShadow = true;

    mesh.receiveShadow = true;

    mesh.frustumCulled = false;

    mesh.userData.brain = true;

    return mesh;

}