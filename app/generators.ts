import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Component } from "react"; 
import { toPairs } from 'ramda';
import * as THREE from "three";
import { MeshPhysicalMaterial } from 'three';
import { attributesToGeometry } from './utils/attributesToGeometry';
import { getRandomColor } from './utils/getRandomColor';



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
            color : '#aa8822',
            //vertexColors : THREE.VertexColors,
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

    const points = {};

    for(let i = 0; i < attributes.position.length; i += 9){
    
        const t = attributes.types[i];

        if(points[t]){

            points[t].position.push(
                attributes.position[i],
                attributes.position[i+1],
                attributes.position[i+2],

                attributes.position[i+3],
                attributes.position[i+4],
                attributes.position[i+5],

                attributes.position[i+6],
                attributes.position[i+7],
                attributes.position[i+8]
            );

            points[t].normal.push(
                attributes.normal[i],
                attributes.normal[i+1],
                attributes.normal[i+2],

                attributes.normal[i+3],
                attributes.normal[i+4],
                attributes.normal[i+5],

                attributes.normal[i+6],
                attributes.normal[i+7],
                attributes.normal[i+8],
            );

            points[t].color.push(
                attributes.color[i],
                attributes.color[i+1],
                attributes.color[i+2],

                attributes.color[i+3],
                attributes.color[i+4],
                attributes.color[i+5],

                attributes.color[i+6],
                attributes.color[i+7],
                attributes.color[i+8]
            );

        }else{

            points[t] = { 
                position:[
                    attributes.position[i],
                    attributes.position[i+1],
                    attributes.position[i+2],

                    attributes.position[i+3],
                    attributes.position[i+4],
                    attributes.position[i+5],

                    attributes.position[i+6],
                    attributes.position[i+7],
                    attributes.position[i+8]
                ], normal:[
                    attributes.normal[i],
                    attributes.normal[i+1],
                    attributes.normal[i+2],

                    attributes.normal[i+3],
                    attributes.normal[i+4],
                    attributes.normal[i+5],

                    attributes.normal[i+6],
                    attributes.normal[i+7],
                    attributes.normal[i+8],
                ], 
                color:[
                    attributes.color[i],
                    attributes.color[i+1],
                    attributes.color[i+2],

                    attributes.color[i+3],
                    attributes.color[i+4],
                    attributes.color[i+5],

                    attributes.color[i+6],
                    attributes.color[i+7],
                    attributes.color[i+8]
                ] 
            };

        }

    }

    const group = new THREE.Group();

    const pairs = toPairs(points);

    pairs.forEach( ( [ type, { position, normal, color } ], index ) => {

        const geometry = new THREE.BufferGeometry();

        geometry.addAttribute('position', new THREE.BufferAttribute( new Float32Array(position), 3) );
    
        //geometry.addAttribute('color', new THREE.BufferAttribute( new Float32Array(color), 3) );
    
        //geometry.addAttribute('normal', new THREE.BufferAttribute( new Float32Array(normal), 3) );
    
        geometry.computeBoundingBox();
        
        geometry.center();
    
        const material1 = new THREE[material]( parameters[material] );
    
        const m1 = new THREE.Mesh(geometry, material1);
    
        m1.userData.transparent = false;

        m1.userData.type = type;
    
        m1.userData.dataType = "2";
        
        m1.userData.name = attributes.name;

        group.add(m1);

    } );
    
    
    group.userData.brain = true;

    group.userData.dataType = "2";
    
    group.userData.atlas = true;

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
        

        m1.translateZ(7);

        m1.translateX(0.5);

        m1.userData.brain = true;

        m1.userData.dataType = "16";

        return m1;

    },

    "2" : attributes => {

        console.log("2", attributes);

        const material = 'MeshPhysicalMaterial';
        
        const color = getRandomColor();

        const parameters = {
            'MeshLambertMaterial': {
                color : parseInt(getRandomColor().replace(/^#/, ''), 16),
                emissive : parseInt(getRandomColor().replace(/^#/, ''), 16),
                emissiveIntensity : 0.5,
                side : THREE.DoubleSide,
                reflectivity : 0.5
            },
            'MeshToonMaterial':{ 
                side : THREE.DoubleSide, 
                //vertexColors : THREE.VertexColors,
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
                color : parseInt(color.replace(/^#/, ''), 16),
                //vertexColors : THREE.VertexColors,
                metalness : 0.0,
                roughness : 0.0,
                clearCoat : 0.5,
                clearCoatRoughness : 0.0,
                reflectivity : 0.6,
                transparent : false,
                opacity : 1.0,
                depthWrite : true,
                clipShadows : true
            }
        };

        const geometry = attributesToGeometry(attributes);

        geometry.center();

        const material1 = new THREE[material]( parameters[material] );

        const m1 = new THREE.Mesh(geometry, material1);

        m1.userData.transparent = false;

        m1.userData.dataType = "2";
        
        m1.userData.name = attributes.name;

        m1.userData.brain = true;

        return m1;

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