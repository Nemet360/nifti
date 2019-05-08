import './assets/fonts/index.css'; 
import './assets/styles.css'; 
import * as React from 'react';
import { Component } from "react"; 
import { Subscription } from 'rxjs';
import { fromEvent } from 'rxjs/observable/fromEvent'; 
import * as THREE from "three";
import { Vector3, WebGLRenderer, PerspectiveCamera, Scene, Light, Mesh, BufferGeometry, Geometry, Raycaster, Color, Matrix4 } from 'three';
import { lights } from './utils/lights';
import { OrbitControls } from './OrbitControls';
import { isNil, isEmpty, compose, sort, drop, toPairs, divide, uniqBy, splitEvery, range, path, prop, flatten, clone } from 'ramda';
import * as ReactDOM from 'react-dom';
import { Store, niftiData } from './types';
import { reducer, defaultProps } from './reducer';
import { Provider, connect } from "react-redux";
import { createStore } from "redux"; 
import { ipcRenderer, remote } from 'electron';
import Button from '@material-ui/core/Button';
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
import { imageToTypedData } from './utils/imageToTypedData';
import Paper from '@material-ui/core/Paper';
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';
import { equalize } from './utils/equalize';
import { mergeVertices } from './utils/mergeVertices';
import { typeEquals } from './utils/typeEquals';
import { filter, first, map } from 'rxjs/operators';
import { workerSend } from './utils/workerSend';
import { transform } from './utils/transform';
import { initializeColors } from './utils/initializeColors';
import { transformPerfusionColors } from './utils/transformPerfusionColors';
import { measureTimePromise } from './utils/measureTimePromise';
import { taubinSmooth } from './laplacian';
const Spinner = require('react-spinkit');



interface SpaceProps{
    group:Mesh
}



interface SpaceState{
    width:number,
    height:number
}



export class Space extends Component<SpaceProps,SpaceState>{
    container:HTMLElement
    boundingBox:any
    scene:Scene
    camera:PerspectiveCamera
    renderer:WebGLRenderer
    controls:any
    subscriptions:Subscription[]



    constructor(props){ 

        super(props);

        this.subscriptions = [];

        this.state = { width : 0, height : 0 };

    } 



    componentDidMount(){

        if(isNil(this.container)){ return }    

        this.subscriptions.push(

            fromEvent( window, "resize" ).subscribe(this.onResize)
            
        );

        this.boundingBox = this.container.getBoundingClientRect();

        const { width, height } = this.boundingBox;

        this.setState({ width, height }, this.init);

    }



    componentWillUnmount(){

        this.subscriptions.forEach(subscription => subscription.unsubscribe());

        this.subscriptions = [];

    }



    onResize = e => {

        this.boundingBox = this.container.getBoundingClientRect();

        const { width, height } = this.boundingBox;

        this.camera.aspect = width / height;
    
        this.camera.updateProjectionMatrix(); 
                
        this.renderer.setSize(width, height);  
        
        this.setState({ width, height });

        this.renderer.render(this.scene, this.camera);

    }



    onChange = () => {

        console.log("controller activated")

    }



    init = () => { 

        const { group } = this.props;

        console.log("init", group);

        this.scene = this.setupScene();

        this.camera = this.setupCamera(this.container);
     
        this.renderer = this.setupRenderer(this.container);

        this.container.appendChild(this.renderer.domElement);
    
        this.controls = this.setupControls(this.container, this.camera, this.onChange, this.onChange);

        const lights = this.setupLights();

        lights.forEach((light:Light) => this.scene.add(light));

        this.scene.add(group);

        this.animate();

    }    



    setupScene = () => {
        
        const scene = new Scene();

        return scene;

    }



    setupCamera = container => {

        const { width, height } = container.getBoundingClientRect();

        const camera = new PerspectiveCamera(50, width/height, 1, 2000); 

        camera.position.set(50,50,50);

        camera.lookAt(new Vector3(0,0,0)); 

        return camera;

    }



    setupRenderer = container => {

        const { width, height } = container.getBoundingClientRect();

        const renderer = new WebGLRenderer({ antialias : true, alpha : true }); 

        renderer.setSize(width, height, true);  

        renderer.setClearColor(0xeeeeee); 

        renderer.setPixelRatio(window.devicePixelRatio);

        renderer.gammaInput = true;

        renderer.gammaOutput = true;

        renderer.toneMapping = THREE.Uncharted2ToneMapping;

        renderer.toneMappingExposure = 0.75;

        renderer.shadowMap.enabled = true;

        renderer.localClippingEnabled = true;

        return renderer;

    }



    setupControls = (container, camera, onZoom, onRotate) => {

        const controls = new OrbitControls({
            object:camera, 
            domElement:container, 
            onZoom, 
            onRotate
        });

        controls.enablePan = false;

        return controls;

    }



    setupLights = () => {

        const list = lights();

        return list;

    }



    animate = () => {  

        this.renderer.render(this.scene, this.camera);

        requestAnimationFrame(this.animate);

    }  



    render() {

        return isNil(this.props.group) ? null :
        
        <div style={{ 
            width : "100%", 
            height : "100%", 
            position : "relative", 
            overflow : "hidden",
            zIndex : 0
        }}>   
            <div 
                ref={thisNode => { this.container = thisNode; }}
                style={{
                    width : "inherit", 
                    height : "inherit", 
                    position : "absolute", 
                    top : 0,
                    left : 0
                }}   
            />
        </div>

    }

}