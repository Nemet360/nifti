import * as React from 'react';



export const vertex_model_front = (

    <script id="vertex-model-front" type="x-shader/x-vertex">
    {`
        precision mediump float;
        precision mediump int;

        uniform vec3 light;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float time;


        attribute vec3 position;
        attribute vec3 normal;
        attribute vec4 color;

        varying vec3 vPosition;
        varying vec4 vColor;
        varying vec3 vNormal;

        void main()	{

            vNormal = normal;
            vPosition = position;
            vColor = color;

            gl_Position = projectionMatrix * modelViewMatrix * vec4( vPosition, 1.0 );

        }
    `}
    </script>

);