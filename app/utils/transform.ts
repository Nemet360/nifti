import { marchingCubes } from "../marchingCubes";
import { readNIFTIFile } from "./readNIFTIFile";
import { niftiData } from "../types";
import { transformPerfusionColors } from "./transformPerfusionColors";
import { initializeColors } from "./initializeColors";
import { mergeVertices } from "./mergeVertices";



export const transform = file => {

    if( ! file ){

        return Promise.resolve(null);

    }

    const requestData = marchingCubes(); 

    return readNIFTIFile(file)
    
    .then((model:niftiData) => {

        const { niftiHeader, niftiImage } = model;
        
        const dims = { x : niftiHeader.dims[1], y : niftiHeader.dims[2], z : niftiHeader.dims[3] };

        const result = requestData({ dims, scalars:niftiImage, color:niftiHeader.datatypeCode===16 })
    
        const { colors, points, normals } = result;

        const rgb = colors ? transformPerfusionColors(colors) : initializeColors(points.length); 

        const { out_index, out_position, out_color, out_normal } = mergeVertices( points, normals, rgb );

        return { 
            index : out_index, 
            position : out_position, 
            color : out_color, 
            normal : out_normal, 
            niftiHeader
        }
      
    })

}