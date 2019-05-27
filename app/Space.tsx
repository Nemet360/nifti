import './assets/fonts/index.css'; 
import './assets/styles.css'; 
import * as React from 'react';
import { Component } from "react"; 
import { Subscription } from 'rxjs';
import { fromEvent } from 'rxjs/observable/fromEvent'; 
import * as THREE from "three";
import { Vector3, WebGLRenderer, PerspectiveCamera, Scene, Light, Mesh, Box3 } from 'three';
import { lights } from './utils/lights';
import { OrbitControls } from './OrbitControls';
import { isNil } from 'ramda';
import { getObjectCenter } from './utils/getObjectCenter';



const transparencyEquations = {
    "2" : x => 1 - Math.pow( Math.E, - 8 * Math.pow(x, 4) ), 
    "4" : x => 1 - Math.pow( Math.E, - 3 * Math.pow(x, 4) )
};



interface SpaceProps{
    index:number,
    group:Mesh,
    onViewChange:(camera:any) => void,
    camera:PerspectiveCamera
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



    updateTransparency = () => {

        const position = this.getInitialCameraPosition(); 

        const end = new Vector3(0, 0, 0);

        const start = position.distanceTo(end);

        const current = this.camera.position.distanceTo(end);
        
        const x = current/start;

        this.props.group.traverse((mesh:any) => {
            
            const { dataType } = mesh.userData;

            if( ! dataType ){ return }

            const equation = transparencyEquations[dataType]; 

            if( ! equation ){ return }

            const opacity = equation(x);

            if(mesh.userData.transparent){

                mesh.material['opacity'] = opacity;

                mesh.material['transparent'] = true;

                /*
                if(mesh.userData.front && mesh.userData.dataType==="2" && opacity < 0.7){

                    mesh.material.depthWrite = false;

                }else{

                    mesh.material.depthWrite = true;

                }
                */

            }

            /*
            if(mesh.userData.transparent && mesh.userData.shader){
                mesh.material.uniforms.opacity.value = opacity < 0.25 ? 0.25 : opacity; 
            }
            */
           
        });

    }



    componentWillReceiveProps(next:SpaceProps){

        if(next.camera!==this.props.camera){

            this.camera.copy(next.camera);

            this.updateTransparency();

        }

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



    getInitialCameraPosition = () => {

        const { max, min } = new Box3().setFromObject(this.props.group);
        
        const center = getObjectCenter(this.props.group.children[0] as any);

        this.controls.target.set(center.x, center.y, center.z);

        const wd = max.x - min.x;

        const hg = max.y - min.y;

        const x = wd * 3;

        const y = hg * 3;

        const z = 0;

        return new Vector3(x,y,z);

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

        const { onViewChange } = this.props;

        onViewChange(this.camera);

    }



    init = () => { 

        const { group } = this.props;

        this.scene = this.setupScene();

        this.camera = this.setupCamera(this.container);
     
        this.renderer = this.setupRenderer(this.container);

        this.container.appendChild(this.renderer.domElement);
    
        this.controls = this.setupControls(this.container, this.camera, this.onChange, this.onChange);

        const lights = this.setupLights();

        lights.forEach((light:Light) => this.scene.add(light));

        this.scene.add(group);

        const position = this.getInitialCameraPosition(); 

        this.camera.position.copy(position);

        this.camera.lookAt(this.controls.target);

        this.animate();

        this.props.onViewChange(this.camera);

    }    



    setupScene = () => {
        
        const scene = new Scene();

        return scene;

    }



    setupCamera = container => {

        const { width, height } = container.getBoundingClientRect();

        const camera = new PerspectiveCamera(50, width/height, 10, 1000); 

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

        renderer.context.getExtension('EXT_frag_depth');

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
            overflow : "hidden"
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
