import { marchingCubes } from "../marchingCubes";
import { readNIFTIFile } from "./readNIFTIFile";
import { niftiData } from "../types";
import { transformPerfusionColors } from "./transformPerfusionColors";
import { initializeColors } from "./initializeColors";
import { mergeVertices } from "./mergeVertices";
import { attributesToGeometry } from "./attributesToGeometry";
import { smoothGeometry } from "./smoothGeometry";
import { atlas_name } from "./atlas";
import { regions } from "./regions";



export const transform = (file, values) => {

    if( ! file ){

        return Promise.resolve(null);

    }

    const requestData = marchingCubes(); 

    return readNIFTIFile(file)
    
    .then((model:niftiData) => {

        if(values){

            return values.map(
                contourValue => {

                    const { niftiHeader, niftiImage } = model;
            
                    const dims = { x : niftiHeader.dims[1], y : niftiHeader.dims[2], z : niftiHeader.dims[3] };
            
                    const result = requestData({ name : file.name, dims, scalars:niftiImage, datatypeCode:niftiHeader.datatypeCode, contourValue })
                
                    const { colors, points, normals, types } = result;
            
                    const rgb = colors ? transformPerfusionColors(colors) : initializeColors(points.length/3, niftiHeader.datatypeCode); 
            
                    const data = mergeVertices( points, normals, rgb, types );
            
                    return { 
                        name : file.name,
                        index : data.out_index, 
                        position : data.out_position, 
                        color : data.out_color, 
                        normal : data.out_normal, 
                        types : data.out_types,
                        niftiHeader,
                        type : contourValue
                    }

                }
            )

        }else{

            const { niftiHeader, niftiImage } = model;
            
            const dims = { x : niftiHeader.dims[1], y : niftiHeader.dims[2], z : niftiHeader.dims[3] };
    
            const result = requestData({ name : file.name, dims, scalars:niftiImage, datatypeCode:niftiHeader.datatypeCode, contourValue:undefined })
        
            const { colors, points, normals, types } = result;
    
            const rgb = colors ? transformPerfusionColors(colors) : initializeColors(points.length/3, niftiHeader.datatypeCode); 
    
            const data = mergeVertices( points, normals, rgb, types );
    
            return { 
                name : file.name,
                index : data.out_index, 
                position : data.out_position, 
                color : data.out_color, 
                normal : data.out_normal, 
                types : data.out_types,
                niftiHeader,
                type : undefined
            }


        }

    })

}