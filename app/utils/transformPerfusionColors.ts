import { equalize } from "./equalize";
import * as THREE from "three";



export const transformPerfusionColors = colors => {

    const rgb = [];

    const { equalized, min, max } = equalize(colors);

    const lut = new THREE['Lut']("rainbow", 512);

    lut.setMin(min);

    lut.setMax(max);

    for(let i = 0; i < equalized.length; i++){

        const color = lut.getColor( equalized[i] );

        rgb.push(color.r, color.g, color.b);

    }

    return rgb;

}