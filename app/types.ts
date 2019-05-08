export type Dispatch = (action:action) => void



export type niftiData = { niftiHeader:any, niftiImage:any };



export interface action{ type:keyof Store, load:any }



export interface Store{
	width:number,
    height:number,
    data:any[],
    dispatch?:Dispatch,
    multiple?:any
}