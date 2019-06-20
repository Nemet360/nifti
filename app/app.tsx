import './assets/fonts/index.css'; 
import './assets/styles.css'; 
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { isEmpty, path, identity, contains } from 'ramda';
import { Component } from "react"; 
import { Subscription } from 'rxjs';
import { fromEvent } from 'rxjs/observable/fromEvent'; 
import * as THREE from "three";
import { PerspectiveCamera, Vector3 } from 'three';
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';
import { workerSend } from './utils/workerSend';
import { transform } from './utils/transform';
import { Space } from './Space';
import { merge } from 'rxjs/observable/merge';
import { filter } from 'rxjs/operators';
import { generators } from './generators';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { regions } from './utils/regions';
import { atlas_name } from './utils/atlas';
THREE.BufferGeometry.prototype['computeBoundsTree'] = computeBoundsTree;
THREE.BufferGeometry.prototype['disposeBoundsTree'] = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;



window['THREE'] = THREE;



require('three/examples/js/math/Lut');



interface AppProps{}



interface AppState{
    models:any[],
    camera:PerspectiveCamera,
    region:any
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
            camera : new PerspectiveCamera(50, 1, 1, 2000),
            region : 140 
        };

    } 

    

    componentDidMount(){

        this.subscriptions.push(

            fromEvent(document, 'drop').subscribe( this.drop ),

            merge(
                fromEvent(document, 'dragover'), 
                fromEvent(document, 'dragend'), 
                fromEvent(document, 'dragexit'),
                fromEvent(document, 'dragleave')
            )
            .subscribe((e:any) => { 

                e.preventDefault();

                e.stopPropagation();

            }),

            fromEvent(window, "keydown", event => event).pipe( filter(e => String.fromCharCode( e.which )==='A' ) ).subscribe( this.axial ),

            fromEvent(window, "keydown", event => event).pipe( filter(e => String.fromCharCode( e.which )==='C' ) ).subscribe( this.coronal ),

            fromEvent(window, "keydown", event => event).pipe( filter(e => String.fromCharCode( e.which )==='S' ) ).subscribe( this.sagittal )

        );

    }



    updateAtlasState = region => {

    }
    


    componentDidUpdate(prevProps, prevState){

        if(prevState.region!==this.state.region){

            this.updateAtlasState(this.state.region);

        }

    }



    drop = (event:any) => {
                
        event.preventDefault(); 

        event.stopPropagation();

        const result = path(['dataTransfer','files'])(event);

        console.log(result);

        this.init([...result]);
        
    }



    sagittal = () => {

        const c = this.state.camera; 

        c.position.x = 200;
        c.position.y = 0;
        c.position.z = 0;

        c.lookAt(new Vector3(0,0,0));

        this.onViewChange(c);

    }



    axial = () => {

        const c = this.state.camera; 
        
        c.position.x = 0;
        c.position.y = 0;
        c.position.z = 200;

        c.lookAt(new Vector3(0,0,0));

        this.onViewChange(c);

    }



    coronal = () => {

        const c = this.state.camera;
        
        c.position.x = 0;
        c.position.y = 200;
        c.position.z = 20;

        c.lookAt(new Vector3(0,0,0));

        this.onViewChange(c);

    }



    init = data => {

        const n = data.length - 1;

        this.workers = Array.apply(null, Array(n)).map(v => new Worker('worker.js'));

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

                let dc = attributes.niftiHeader.datatypeCode.toString();

                if(attributes.name===atlas_name){ dc+='E' }
                
                const generator = generators[dc];

                console.log(dc, generator);
          
                if( ! generator ){ return null }

                const group = generator(attributes);

                return group;

            } )
           
            return meshes.filter(identity);

        } )

        .then( (models:any[]) => {

            if(true){

                this.setState({ 
                    
                    models : models
                    
                    .filter(m => m.userData.name===atlas_name)
                    
                    .map( atlas => {
        
                        console.log(atlas);

                        return atlas;
        
                    } )

                });

            }else{

                this.setState({ 
                    
                    models : models
                
                    .filter( m => m.userData.dataType === '16' )
                    
                    .map( m => {
        
                        const group = new THREE.Group();
        
                        group.add(m.clone());
            
                        models.forEach( m => {
        
                            if(m.userData.dataType !== '16'){
        
                                group.add( m.clone() );
        
                            }
        
                        } );
        
                        return group;
        
                    } )

                });

            }

        } )

    }



    onViewChange = (camera:PerspectiveCamera) => {

        this.setState({ camera : camera.clone() })

    }



    render() {  

        const { models, camera } = this.state;

        const names = models.map(m => m.userData.name);

        console.log(names, atlas_name);

        const displaySelector = contains(atlas_name)(names);


        return <div style={{width:"100%", height:"100%"}}>
            { 
                displaySelector &&
                <div style={{
                    position: "absolute",
                    zIndex: 22,
                    padding: "50px"
                }}> 
                    <FormControl style={{width:"100%"}}>

                        <InputLabel htmlFor='region-input'>Select region</InputLabel>

                        <Select
                            value={this.state.region}
                            onChange={event => this.setState({region:event.target.value})}
                            inputProps={{name: 'region', id: 'region-input'}}
                        >
                        {
                            regions.map((item,index:number) => <MenuItem style={{fontWeight:500}} key={`item-${index}`} value={item.value}>{item.name}</MenuItem>)
                        }
                        </Select>

                    </FormControl>
                </div>
            }
            <div style={{
                padding:"10px",
                height:"calc(100% - 20px)", 
                width:"calc(100% - 20px)",
                display:'grid',
                alignItems:'center',
                justifyItems:'center',
                gridGap:"10px",
                gridTemplateColumns:`repeat(${models.length}, [col-start] 1fr)`
            }}> 
            {
                models.map( (group,index) => 

                    <div key={`group-${index}`} style={{width:"100%", height:"100%"}}>  

                        <div style={{
                            height:"100%",
                            width:"100%",
                            display:"flex",
                            flexDirection:"column",
                            justifyContent:"space-between"
                        }}>
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



const init = () => {

    const app = document.createElement('div'); 

    app.style.width = '100%';

    app.style.height = '100%';

    app.id = 'application';

    document.body.appendChild(app);

    ReactDOM.render( <App />, app );

}



init();