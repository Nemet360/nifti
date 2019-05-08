import { transform } from "./utils/transform";
import * as THREE from "three";

self['THREE'] = THREE;

require('three/examples/js/math/Lut');

const sendMessage = postMessage as any;



onmessage = (e) => {

    const file = e.data; 

    transform(file)
    
    .then(

        result => {
            
            sendMessage(result);

        }

    );

}