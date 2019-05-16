import './assets/fonts/index.css'; 
import './assets/styles.css'; 
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { isEmpty, isNil, compose, sort, drop, toPairs, divide, uniqBy, splitEvery, range, path, prop, flatten, clone, map, identity } from 'ramda';
import { createStore } from "redux"; 
import { Component } from "react"; 
import { ipcRenderer, remote } from 'electron';
import { Subscription } from 'rxjs';
import { fromEvent } from 'rxjs/observable/fromEvent'; 
import Button from '@material-ui/core/Button';
import * as THREE from "three";
import { Vector3, WebGLRenderer, PerspectiveCamera, Scene, Light, Mesh, MeshPhysicalMaterial } from 'three';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography'; 
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Slider from '@material-ui/lab/Slider';
import { readNIFTIFile } from './utils/readNIFTIFile';
import { getObjectCenter } from './utils/getObjectCenter';
import { exportJSON } from './utils/exportJSON';
import { lights } from './utils/lights';
import { imageToTypedData } from './utils/imageToTypedData';
import Paper from '@material-ui/core/Paper';
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';
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
import { Quaternion } from 'three';
import { fragment_model_front } from './shaders/fragment-model-front';
import { vertex_model_front } from './shaders/vertex-model-front';
import { fragment_perfusion_front } from './shaders/fragment-perfusion-front';
import { vertex_perfusion_front } from './shaders/vertex-perfusion-front';
import { merge } from 'rxjs/observable/merge';
import { smoothGeometry } from './utils/smoothGeometry';
THREE.BufferGeometry.prototype['computeBoundsTree'] = computeBoundsTree;
THREE.BufferGeometry.prototype['disposeBoundsTree'] = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

window['THREE'] = THREE;

require('three/examples/js/math/Lut');



const generators = {

    "16" : attributes => {

        const geometry = attributesToGeometry(attributes);

        geometry.scale(0.95, 0.95, 0.95);

        geometry.center();

        const material1 = new MeshPhysicalMaterial({
            side : THREE.DoubleSide,
            vertexColors : THREE.VertexColors,
            metalness : 0.0,
            roughness : 0.5,
            clearCoat : 0.5,
            clearCoatRoughness : 0.5,
            reflectivity : 0.3,
            transparent : false,
            opacity : 1.0,
            depthWrite : true,
            clipShadows : true
        });

        const m1 = new THREE.Mesh(geometry, material1);

        m1.userData.dataType = "16";

        const group = new THREE.Group();
        
        group.add(m1);

        group.translateZ(7);

        group.translateX(0.5);

        group.userData.brain = true;

        return group;

    },

    "2" : attributes => {

        const geometry = attributesToGeometry(attributes);

        geometry.center();

        const material1 = new MeshPhysicalMaterial({
            side : THREE.FrontSide,
            vertexColors : THREE.VertexColors,
            metalness : 0.0,
            roughness : 0.0,
            clearCoat : 1.0,
            clearCoatRoughness : 1.0,
            reflectivity : 1.0,
            transparent : false,
            opacity : 1,
            clipShadows : true,
            depthWrite : true
        });

        const material2 = new MeshPhysicalMaterial({
            side : THREE.BackSide,
            vertexColors : THREE.VertexColors,
            metalness : 0.0,
            roughness : 0.0,
            clearCoat : 1.0,
            clearCoatRoughness : 1.0,
            reflectivity : 1.0,
            transparent : true,
            opacity : 1,
            clipShadows : true,
            depthWrite : false
        });

        const m1 = new THREE.Mesh(geometry, material1);

        const m2 = new THREE.Mesh(geometry, material2);

        m1.userData.transparent = true;

        m2.userData.transparent = true;

        m1.userData.dataType = "2";

        m2.userData.dataType = "2";

        const group = new THREE.Group();
        
        group.add(m1);

        group.add(m2);

        group.userData.brain = true;

        return group;

    },

    "4" : attributes => {

        const geometry = attributesToGeometry(attributes);

        geometry.scale( 0.65, 0.65, 0.65 );

        geometry.center();

        const material1 = new MeshPhysicalMaterial({
            side : THREE.FrontSide,
            vertexColors : THREE.VertexColors,
            metalness : 0.0,
            roughness : 0.5,
            clearCoat : 0.5,
            clearCoatRoughness : 0.5,
            reflectivity : 0.5,
            transparent : false,
            opacity : 1,
            clipShadows : true,
            depthWrite : true
        });

        const material2 = new MeshPhysicalMaterial({
            side : THREE.BackSide,
            vertexColors : THREE.VertexColors,
            metalness : 0.0,
            roughness : 0.5,
            clearCoat : 0.5,
            clearCoatRoughness : 0.5,
            reflectivity : 0.5,
            transparent : true,
            opacity : 1,
            clipShadows : true,
            depthWrite : false
        });

        const m1 = new THREE.Mesh(geometry, material1);

        const m2 = new THREE.Mesh(geometry, material2);

        m1.userData.transparent = true;

        m2.userData.transparent = true;

        m1.userData.dataType = "4";

        m2.userData.dataType = "4";

        m1.rotation.x = 2 * Math.PI;

        m1.rotation.y = 2 * Math.PI;

        m2.rotation.x = 2 * Math.PI;

        m2.rotation.y = 2 * Math.PI;

        const group = new THREE.Group();
        
        group.add(m1);
        
        group.add(m2);

        group.userData.brain = true;

        return group;

    }

}



interface AppProps{
    data:any[]
}



interface AppState{
    models:any[],
    camera:PerspectiveCamera
}



export class App extends Component<AppProps,AppState>{
    container:HTMLElement
    subscriptions:Subscription[]
    workers:Worker[]



    constructor(props){ 

        super(props);

        this.subscriptions = [];

        this.workers = [];

        this.state = { 
            models : [],
            camera : new PerspectiveCamera(50, 1, 1, 2000) 
        };

    } 

    

    componentDidMount(){

        const { data } = this.props;

        const n = data.length - 1;

        this.workers = Array.apply(null, Array(n)).map(v => new Worker('worker.js'));

        
        this.subscriptions.push(

            fromEvent(document, 'drop').subscribe( (event:any) => {
                
                event.preventDefault(); 
                event.stopPropagation();

                const result = path(['dataTransfer','files'])(event);

                console.log(result);
                
            } ),

            merge(
                fromEvent(document, 'dragover'), 
                fromEvent(document, 'dragend'), 
                fromEvent(document, 'dragexit'),
                fromEvent(document, 'dragleave')
            ).subscribe((e:any) => { 
                e.preventDefault();
                e.stopPropagation();
            }),

            fromEvent(ipcRenderer, "axial", event => event). subscribe( () => {

                const c = new PerspectiveCamera(50, 1, 1, 2000);
                
                c.position.x = 0;
                c.position.y = 0;
                c.position.z = 200;

                c.lookAt(new Vector3(0,0,0));

                this.onViewChange(c);

            } ),

            fromEvent(ipcRenderer, "coronal", event => event). subscribe( () => {


                const c = new PerspectiveCamera(50, 1, 1, 2000);
                
                c.position.x = 0;
                c.position.y = 200;
                c.position.z = 20;

                c.lookAt(new Vector3(0,0,0));

                this.onViewChange(c);

            } ),

            fromEvent(ipcRenderer, "sagittal", event => event).subscribe( () => {

                const c = new PerspectiveCamera(50, 1, 1, 2000);
                
                c.position.x = 200;
                c.position.y = 0;
                c.position.z = 0;

                c.lookAt(new Vector3(0,0,0));

                this.onViewChange(c);

            } ),

        );
        

        this.generateMeshes(data);

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

            const meshes = collection.map( attributes => {

                const dc = attributes.niftiHeader.datatypeCode.toString();

                const generator =  generators[dc]; //customShaders ? generatorsShaders[dc] : generators[dc];
          
                if( ! generator ){ return null }

                const group = generator(attributes);

                return group;

            } )
           
            return meshes.filter(identity);

        } )

        .then( (models:any[]) => {

            const m = models.slice(0,2).map( m => {

                const group = new THREE.Group();
    
                models.forEach( m => group.add( m.clone() ) );

                return group;

            } );

            this.setState({ models : m });

        } )

    }



    onViewChange = (camera:PerspectiveCamera) => {

        this.setState({ camera : camera.clone() })

    }



    render() {  

        const { models, camera } = this.state;

        return <div style={{width:"100%", height:"100%"}}>

            { fragment_model_front }
            { vertex_model_front }

            { fragment_perfusion_front } 
            { vertex_perfusion_front }

            <div style={{
                padding:"10px",
                height:"calc(100% - 20px)", 
                width:"calc(100% - 20px)",
                display:'grid',
                alignItems:'center',
                justifyItems:'center',
                gridGap:"10px",
                gridTemplateColumns:`repeat(${2}, [col-start] 1fr)`
            }}> 
            {
                models.map( (group,index) => 

                    <div 
                        key={`group-${index}`} 
                        style={{width:"100%", height:"100%"}}
                    >   
                        <div 
                            style={{
                                height:"100%",
                                width:"100%",
                                display:"flex",
                                flexDirection:"column",
                                justifyContent:"space-between"
                            }}
                        >
                            <Space 
                                index={index}
                                group={group} 
                                onViewChange={this.onViewChange} 
                                camera={camera}
                            />
                        </div>
                    </div>

                )
            }
            </div> 

        </div>

    }

} 



ipcRenderer.once("loaded", ( event, data ) => {

    const app = document.createElement('div'); 

    app.style.width = '100%';

    app.style.height = '100%';

    app.id = 'application';

    document.body.appendChild(app);

    const entry = <App data={data} />

    ReactDOM.render( entry, app );

});



/*
const customShaders = false;

const generatorsShaders = {

    "16" : attributes => {

        const geometry = attributesToGeometry(attributes);

        geometry.center();

        const material1 = new THREE.RawShaderMaterial( {
            uniforms : {
                time : { value : 1.0 },
                light : { type : "v3", value : new Vector3(50, 60, 10) }
            },
            vertexShader : document.getElementById( 'vertex-perfusion-front' ).textContent,
            fragmentShader : document.getElementById( 'fragment-perfusion-front' ).textContent,
            side : THREE.DoubleSide,
            transparent : false
        } );

        const m1 = new THREE.Mesh(geometry, material1);

        const group = new THREE.Group();
        
        group.add(m1);

        group.translateZ(6);

        group.userData.brain = true;

        return group;

    },

    "2" : attributes => {

        const geometry = attributesToGeometry(attributes);

        geometry.center();

        const material1 = new THREE.RawShaderMaterial( {
            uniforms : {
                time : { type : "f", value : 1.0 },
                opacity : { type : "f", value : 1.0 },
                light : { type : "v3", value : new Vector3(50, 60, 10) }
            },
            vertexShader : document.getElementById( 'vertex-model-front' ).textContent,
            fragmentShader : document.getElementById( 'fragment-model-front' ).textContent,
            side : THREE.FrontSide,
            transparent : true
        } );

        const material2 = new THREE.RawShaderMaterial( {
            uniforms : {
                time : { type : "f", value : 1.0 },
                opacity : { type : "f", value : 1.0 },
                light : { type : "v3", value : new Vector3(50, 60, 10) }
            },
            vertexShader : document.getElementById( 'vertex-model-front' ).textContent,
            fragmentShader : document.getElementById( 'fragment-model-front' ).textContent,
            side : THREE.BackSide,
            transparent : true
        } );

        const m1 = new THREE.Mesh(geometry, material1);

        m1.userData.transparent = true;

        m1.userData.shader = true;

        const m2 = new THREE.Mesh(geometry, material2);

        const group = new THREE.Group();
        
        group.add(m1);

        group.add(m2);

        group.userData.brain = true;

        return group;

    },

    "4" : attributes => {

        const geometry = attributesToGeometry(attributes);

        geometry.center();

        const material = new MeshPhysicalMaterial({
            side : THREE.FrontSide,
            vertexColors : THREE.VertexColors,
            metalness : 0.0,
            roughness : 0.0,
            clearCoat : 1.0,
            clearCoatRoughness : 1.0,
            reflectivity : 1.0,
            transparent : false,
            opacity : 1,
            clipShadows : true,
            depthWrite : true
        });
    
        geometry.scale( 0.8, 0.8, 0.8 );

        const m = new THREE.Mesh(geometry, material);

        m.rotation.x = Math.PI / 2;

        m.userData.transparent = true;

        const group = new THREE.Group();
        
        group.add(m);

        group.userData.brain = true;

        return group;

    }

}
*/
