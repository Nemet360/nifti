import './assets/fonts/index.css'; 
import './assets/styles.css'; 
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Store, niftiData } from './types';
import { reducer, defaultProps } from './reducer';
import { isEmpty, isNil, compose, sort, drop, toPairs, divide, uniqBy, splitEvery, range, path, prop, flatten, clone, map } from 'ramda';
import { Provider, connect } from "react-redux";
import { createStore } from "redux"; 
import { Component } from "react"; 
import { ipcRenderer, remote } from 'electron';
import { Subscription } from 'rxjs';
import { fromEvent } from 'rxjs/observable/fromEvent'; 
import Button from '@material-ui/core/Button';
import * as THREE from "three";
import { Vector3, WebGLRenderer, PerspectiveCamera, Scene, Light, Mesh, BufferGeometry, Geometry, Raycaster, Color, Matrix4 } from 'three';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography'; 
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Slider from '@material-ui/lab/Slider';
import { readNIFTIFile } from './utils/readNIFTIFile';
import { getObjectCenter } from './utils/getObjectCenter';
import { attachDispatchToProps } from './utils/attachDispatchToProps';
import { exportJSON } from './utils/exportJSON';
import { lights } from './utils/lights';
import { imageToTypedData } from './utils/imageToTypedData';
import Paper from '@material-ui/core/Paper';
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';
import { geometryToMesh } from './utils/geometryToMesh';
import { equalize } from './utils/equalize';
import { mergeVertices } from './utils/mergeVertices';
import { typeEquals } from './utils/typeEquals';
import { filter, first } from 'rxjs/operators';
import { workerSend } from './utils/workerSend';
import { transform } from './utils/transform';
import { initializeColors } from './utils/initializeColors';
import { transformPerfusionColors } from './utils/transformPerfusionColors';
import { measureTimePromise } from './utils/measureTimePromise';
import { taubinSmooth } from './laplacian';
import { OrbitControls } from './OrbitControls';
import { Space } from './Space';
import { attributesToGeometry } from './utils/attributesToGeometry';

THREE.BufferGeometry.prototype['computeBoundsTree'] = computeBoundsTree;
THREE.BufferGeometry.prototype['disposeBoundsTree'] = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

window['THREE'] = THREE;

require('three/examples/js/math/Lut');



interface AppState{
    models:any[]
}



@connect(store => store, attachDispatchToProps)
export class App extends Component<Store,AppState>{
    container:HTMLElement
    subscriptions:Subscription[]
    workers:Worker[]



    constructor(props){ 

        super(props);

        this.subscriptions = [];

        this.workers = [];

        this.state = { models : [] };

    } 



    componentDidMount(){

        const { data } = this.props;

        const n = data.length;

        this.workers = Array.apply(null, Array(n)).map(v => new Worker('worker.js'));

        console.log(data);

        //this.generateMeshes(data);

    }



    componentWillUnmount(){

        this.workers.forEach(worker => worker.terminate());

        this.subscriptions.forEach(subscription => subscription.unsubscribe());

        this.workers = [];

        this.subscriptions = [];

    }



    generateMeshes = data => {

        if( isEmpty(data) ){ return }

        const first = data[0];

        const remainder = data.slice(1, data.length);

        const workers = this.workers.map( workerSend ).map( ( f, i ) => f( remainder[i] ) );

        return Promise.all([ transform(first), ...workers ])

        .then( collection => {

            const geometries = collection.map( attributes => {

                const geometry = attributesToGeometry(attributes);

                return geometry;

            } );

            const meshes = geometries.map(geometry => {

                const mesh = geometryToMesh(geometry);

                return mesh;

            })

            return meshes;

        } )

        .then(
            models => {

               this.setState({models})

            }
        )

    }



    render() {  

        const { models } = this.state;

        const items = models.length===0 ? 1 : models.length;

        const width = 100 / items;

        return <div style={{height:'100%', width:'100%', display:"flex", flexDirection:"row"}}> 
        {
            models.map( group => 

                <div style={{width:`${width}%`, height:"100%"}}>   
                    <Space group={group} />
                </div>

            )
        }
        </div> 

    }

} 



ipcRenderer.once("loaded", ( event, data ) => {

    const app = document.createElement('div'); 

    app.style.width = '100%';

    app.style.height = '100%';

    app.id = 'application';

    document.body.appendChild(app);  

    defaultProps.data = data; 

    const store = createStore( reducer, defaultProps as any );

    const entry = <Provider store={store}><App {...{} as any} /></Provider> 

    ReactDOM.render( entry, app );

});
