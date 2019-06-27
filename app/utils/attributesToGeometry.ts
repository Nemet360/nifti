import * as THREE from "three";
import { compose, ifElse, isEmpty, reject, equals } from 'ramda';
import { mode } from "./mode";



export const attributesToGeometry = ({ index, position, color, normal, type, niftiHeader }) => {

    const geometry = new THREE.BufferGeometry();

    geometry.setIndex( new THREE.BufferAttribute( new Uint32Array(index), 1 ) );

    geometry.addAttribute('position', new THREE.BufferAttribute( new Float32Array(position), 3) );

    geometry.addAttribute('color', new THREE.BufferAttribute( new Float32Array(color), 3) );

    geometry.addAttribute('normal', new THREE.BufferAttribute( new Float32Array(normal), 3) );

    geometry.computeBoundingBox();
    
    const g = new THREE.Geometry().fromBufferGeometry(geometry);

    for( let i = 0; i < g.faces.length; i++ ){

        const { a, b, c } = g.faces[i];

        const t1 = type[a * 3];
        
        const t2 = type[b * 3];
        
        const t3 = type[c * 3];

        const list = [t1,t2,t3];

        g.faces[i]['type'] = compose(   

            ifElse( isEmpty, () => 0, mode ),

            reject( equals(0) ) 

        )(list);

    }

    return g;

}