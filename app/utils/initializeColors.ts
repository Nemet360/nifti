
export const initializeColors = length => {

    const rgb = [];

    const color = { r : 0.925, g : 0.5, b : 0.5 };

    for(let i = 0; i < length; i++){

        rgb.push(color.r, color.g, color.b);

    }

    return rgb;

}
