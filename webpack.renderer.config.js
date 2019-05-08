const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');      



module.exports = env => [

  {

    mode : env, 

    context : __dirname + "/app",

    entry : {    
        'worker' : './worker.ts'
    },

    output : {            
      filename : "[name].js" , 
      path : path.resolve(__dirname,env) 
    },

    target : 'webworker',

    devtool : 'cheap-module-source-map',

    resolve : { 
        extensions:[".ts", ".js", ".json"]
    }, 

    module : {
      rules : [
        {  
          test : /\.(ts|tsx)?$/,  
          exclude : /(node_modules)/, 
          loader : "awesome-typescript-loader"
        },
        {     
          test : /\.(js|jsx)$/,
          loader : "babel-loader",
          exclude : /node_modules/
        }
      ]
    }

  },

  { 

    mode : env, 

    entry : {    
      "app" : "./app/app.tsx"
    },      

    output : {            
      filename : "[name].js" , 
      path : path.resolve(__dirname,env) 
    },     
     
    resolve : { 
      extensions : [".ts", ".tsx", ".js", ".json", ".css"]
    }, 
                  
    module : { 
      rules : [ 
        {   
          test : /\.(css|scss)$/,   
          use : [ 'style-loader', 'css-loader']
        },  
        {  
          test : /\.(ts|tsx)?$/,  
          exclude : path.resolve(__dirname,'node_modules'), 
          loader : "awesome-typescript-loader"
        },      
        {   
          test : /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
          loader : "file-loader" 
        },    
        {     
          test : /\.(js|jsx)$/,
          loader : "babel-loader",
          exclude : /node_modules/
        }
      ]    
    },
     
    target : "electron-renderer", //"web"

    plugins : [
      new CopyWebpackPlugin([{ from : "./app/assets" }]),
      new HtmlWebpackPlugin({
          inject:true, 
          title:"NIFTI Viewer",     
          chunks:["app"],
          filename:"app.html" 
      })
    ],

    node : { 
        __dirname: false, 
        __filename: false
    }

  }

]