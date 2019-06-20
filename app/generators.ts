import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Component } from "react"; 
import * as THREE from "three";
import { PerspectiveCamera, MeshPhysicalMaterial, Vector3 } from 'three';
import { attributesToGeometry } from './utils/attributesToGeometry';



const atlasMeshGenerator = attributes => {

    const material = 'MeshPhysicalMaterial';

    const parameters = {

        'MeshToonMaterial':{ 
            side : THREE.DoubleSide, 
            vertexColors : THREE.VertexColors,
            transparent : false, 
            opacity : 1
        },

        'MeshPhongMaterial':{ 
            side : THREE.DoubleSide, 
            vertexColors : THREE.VertexColors,
            transparent : false, 
            opacity : 1
        },

        'MeshPhysicalMaterial':{
            side : THREE.DoubleSide,
            vertexColors : THREE.VertexColors,
            metalness : 0.0,
            roughness : 0.5,
            clearCoat : 0.5,
            clearCoatRoughness : 0.5,
            reflectivity : 0.3,
            transparent : false,
            opacity : 1.0,
            depthWrite : true,
            clipShadows : true
        }

    };

    console.log("2", attributes);

    /*
    TODO split points
    */

    const geometry = new THREE.BufferGeometry();

    geometry.addAttribute('position', new THREE.BufferAttribute( new Float32Array(attributes.position), 3) );

    geometry.addAttribute('color', new THREE.BufferAttribute( new Float32Array(attributes.color), 3) );

    geometry.addAttribute('normal', new THREE.BufferAttribute( new Float32Array(attributes.normal), 3) );

    geometry.computeBoundingBox();
    
    geometry.center();

    const material1 = new THREE[material]( parameters[material] );

    const m1 = new THREE.Mesh(geometry, material1);

    m1.userData.transparent = false;

    m1.userData.dataType = "2";
    
    m1.userData.name = attributes.name;

    const group = new THREE.Group();
    
    group.add(m1);

    group.userData.brain = true;

    group.userData.dataType = "2";
    
    group.userData.name = attributes.name;

    return group;

}



export const generators = {

    "2E" : atlasMeshGenerator,

    "16" : attributes => {

        console.log("16", attributes);

        const material = 'MeshToonMaterial';

        const parameters = {

            'MeshToonMaterial':{ 
                side : THREE.DoubleSide, 
                vertexColors : THREE.VertexColors,
                transparent : false, 
                opacity : 1
            },

            'MeshPhongMaterial':{ 
                side : THREE.DoubleSide, 
                vertexColors : THREE.VertexColors,
                transparent : false, 
                opacity : 1
            },

            'MeshPhysicalMaterial':{
                side : THREE.DoubleSide,
                vertexColors : THREE.VertexColors,
                metalness : 0.0,
                roughness : 0.5,
                clearCoat : 0.5,
                clearCoatRoughness : 0.5,
                reflectivity : 0.3,
                transparent : false,
                opacity : 1.0,
                depthWrite : true,
                clipShadows : true
            }

        };

        const geometry = attributesToGeometry(attributes);

        geometry.scale(0.95, 0.95, 0.95);

        geometry.center();

        const material1 = new THREE[material]( parameters[material] );
        
        const m1 = new THREE.Mesh(geometry, material1);

        m1.userData.dataType = "16";

        m1.userData.name = attributes.name;

        const group = new THREE.Group();
        
        group.add(m1);

        group.translateZ(7);

        group.translateX(0.5);

        group.userData.brain = true;

        group.userData.dataType = "16";

        return group;

    },

    "2" : attributes => {

        console.log("2", attributes);

        const geometry = attributesToGeometry(attributes);

        geometry.center();

        const material1 = new MeshPhysicalMaterial({
            side : THREE.FrontSide,
            vertexColors : THREE.VertexColors,
            metalness : 0.0,
            roughness : 0.0,
            clearCoat : 1.0,
            clearCoatRoughness : 1.0,
            reflectivity : 1.0,
            transparent : false,
            opacity : 1,
            clipShadows : true,
            depthWrite : true
        });

        const material2 = new MeshPhysicalMaterial({
            side : THREE.BackSide,
            vertexColors : THREE.VertexColors,
            metalness : 0.0,
            roughness : 0.0,
            clearCoat : 1.0,
            clearCoatRoughness : 1.0,
            reflectivity : 1.0,
            transparent : true,
            opacity : 1,
            clipShadows : true,
            depthWrite : false
        });

        const m1 = new THREE.Mesh(geometry, material1);

        const m2 = new THREE.Mesh(geometry, material2);

        m1.userData.transparent = true;

        m2.userData.transparent = true;

        m1.userData.dataType = "2";

        m2.userData.dataType = "2";
        
        m1.userData.name = attributes.name;

        m2.userData.name = attributes.name;

        const group = new THREE.Group();
        
        group.add(m1);

        group.add(m2);

        group.userData.brain = true;

        group.userData.dataType = "2";

        group.userData.name = attributes.name;

        return group;

    },

    "4" : attributes => {

        console.log("4", attributes);

        const geometry = attributesToGeometry(attributes);

        geometry.scale( 0.65, 0.65, 0.65 );

        geometry.center();

        const material1 = new MeshPhysicalMaterial({
            side : THREE.FrontSide,
            vertexColors : THREE.VertexColors,
            metalness : 0.0,
            roughness : 0.5,
            clearCoat : 0.5,
            clearCoatRoughness : 0.5,
            reflectivity : 0.5,
            transparent : false,
            opacity : 1,
            clipShadows : true,
            depthWrite : true
        });

        const material2 = new MeshPhysicalMaterial({
            side : THREE.BackSide,
            vertexColors : THREE.VertexColors,
            metalness : 0.0,
            roughness : 0.5,
            clearCoat : 0.5,
            clearCoatRoughness : 0.5,
            reflectivity : 0.5,
            transparent : true,
            opacity : 1,
            clipShadows : true,
            depthWrite : false
        });

        const m1 = new THREE.Mesh(geometry, material1);

        const m2 = new THREE.Mesh(geometry, material2);

        m1.userData.transparent = true;

        m2.userData.transparent = true;

        m1.userData.dataType = "4";

        m2.userData.dataType = "4";

        m1.userData.name = attributes.name;

        m2.userData.name = attributes.name;

        m1.rotation.x = 2 * Math.PI;

        m1.rotation.y = 2 * Math.PI;

        m2.rotation.x = 2 * Math.PI;

        m2.rotation.y = 2 * Math.PI;

        const group = new THREE.Group();
        
        group.add(m1);
        
        group.add(m2);

        group.userData.brain = true;

        group.userData.dataType = "4";

        return group;

    }

}