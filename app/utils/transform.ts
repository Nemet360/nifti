import { marchingCubes } from "../marchingCubes";
import { readNIFTIFile } from "./readNIFTIFile";
import { niftiData } from "../types";
import { transformPerfusionColors } from "./transformPerfusionColors";
import { initializeColors } from "./initializeColors";
import { mergeVertices } from "./mergeVertices";
import { attributesToGeometry } from "./attributesToGeometry";
import { smoothGeometry } from "./smoothGeometry";
import { atlas_name } from "./atlas";



export const transform = (file) => {

    if( ! file ){

        return Promise.resolve(null);

    }

    const requestData = marchingCubes(); 

    return readNIFTIFile(file)
    
    .then((model:niftiData) => {

        const { niftiHeader, niftiImage } = model;
        
        const dims = { x : niftiHeader.dims[1], y : niftiHeader.dims[2], z : niftiHeader.dims[3] };
        
        const result = requestData({ name : file.name, dims, scalars:niftiImage, datatypeCode:niftiHeader.datatypeCode })
        
        const { colors, points, normals, types } = result;

        const rgb = colors ? transformPerfusionColors(colors) : initializeColors(points.length, niftiHeader.datatypeCode); 

        const skipMergeVertices = atlas_name===file.name;

        if(skipMergeVertices){

            return { 
                name : file.name,
                index : null, 
                position : points, 
                color : rgb, 
                normal : normals, 
                types,
                niftiHeader
            }

        }

        const data = mergeVertices( points, normals, rgb, types );

        return { 
            name : file.name,
            index : data.out_index, 
            position : data.out_position, 
            color : data.out_color, 
            normal : data.out_normal, 
            types : data.out_types,
            niftiHeader
        }
      
    })

}