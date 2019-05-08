import { isEmpty, isNil, compose, sort, drop, toPairs, divide, uniqBy, splitEvery, range, path, prop, flatten, clone, map } from 'ramda';
import { taubinSmooth } from '../laplacian';



export const smoothGeometry = (geometry, params={ passBand: 0.2, iters: 20 }) => {

    const a = splitEvery(3, geometry.index.array);

    const b = splitEvery(3, geometry.attributes.position.array);

    return flatten( taubinSmooth( a, b, params ) );

}