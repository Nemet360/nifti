import { imageToTypedData } from "./imageToTypedData";
const nifti = require("nifti-reader-js");



const readNIFTI = (data) => {

    let niftiHeader, niftiImage;

    if (nifti.isCompressed(data)) {
        data = nifti.decompress(data);
    }

    if (nifti.isNIFTI(data)) {
        niftiHeader = nifti.readHeader(data);
        niftiImage = nifti.readImage(niftiHeader, data);
    }

    return { niftiHeader, niftiImage };

}



export const readNIFTIFile = file => (

    new Promise(

        resolve => {
        
            const blob = new Blob([new Uint8Array(file)]);

            const reader = new FileReader();

            reader.onloadend = function (evt) {

                if (evt.target['readyState'] === FileReader.DONE) {

                    const model = readNIFTI(evt.target['result']);

                    model.niftiImage = imageToTypedData(model.niftiImage, model.niftiHeader);

                    resolve(model);

                }

            };

            reader.readAsArrayBuffer(blob);

        }

    )

)