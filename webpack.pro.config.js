const path = require("path");
const hotMiddlewareScript = "webpack-hot-middleware/client?reload=true";
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
const OpenBrowserPlugin = require("open-browser-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
const Jarvis = require("webpack-jarvis");

//提取package里依赖的包
function getVendors() {
    let pkg = require("./package.json");
    let _vendors = [];
    for (const key in pkg.dependencies) {
      _vendors.push(key);
    }
    return _vendors;
  }
//优化配置，对于使用CDN作为包资源的引用从外到内的配置
const externals = {
    "axios" : "axios",
    "react": "React",
    "react-dom": "ReactDOM",
    "tinper-bee": "TinperBee"
  }
  
  //默认加载扩展名、相对JS路径模块的配置
  const resolve = {
    extensions: [
      ".jsx", ".js",".less",".css",".json"
    ],
    alias: {
      components: path.resolve(__dirname, "src/components/"),
      modules: path.resolve(__dirname, "src/modules/"),
      routes : path.resolve(__dirname, "src/routes/"),
      layout : path.resolve(__dirname, "src/layout/"),
      utils : path.resolve(__dirname, "src/utils/")
    }
  }
  
  //开发和生产需要的loader
  const rules = [{
    test: /\.js[x]?$/,
    exclude: /(node_modules)/,
    include: path.resolve("src"),
    use: [{
      loader: "babel-loader"
    }]
  }, {
    test: /\.css$/,
    use: ExtractTextPlugin.extract({
      use: [{
        loader:"css-loader",
        options:{
          modules : false
        }
      }, "postcss-loader"],
      fallback: "style-loader"
    })
  }, {
    test: /\.less$/,
    use: ExtractTextPlugin.extract({
      use: [{
        loader:"css-loader",
        options:{
          modules : false
        }
      }, 'postcss-loader' ,'less-loader'],
      fallback: 'style-loader'
    })
  }, {
    test: /\.(png|jpg|jpeg|gif)(\?.+)?$/,
    exclude: /favicon\.png$/,
    use: [{
      loader: "url-loader",
      options: {
        limit: 8196,
        name: "images/[name].[ext]"
      }
    }]
  }, {
    test: /\.(eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,
    use: [{
      loader: "file-loader",
      options: {
        name: "images/[name].[ext]"
      }
    }]
  }]
  
//生产环境的webpack配置
const prodConfig = {
    devtool : "source-map",
    entry: {
      vendors: getVendors(),
      app: "./src/app.jsx"
    },
    output: {
      path: path.resolve(__dirname, "./dist"),
      filename: "[name].js",
      publicPath: ""
    },
    externals: externals,
    module: {
      rules: rules
    },
    plugins: [
      new CommonsChunkPlugin({
        name: "vendors"
      }),
      new ExtractTextPlugin({
        filename: "[name].css"
      }),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('production')
        }
      }),
      // new UglifyJSPlugin({
      //   sourceMap : true
      // }),
      new webpack.optimize.UglifyJsPlugin({
          sourceMap : true
      }),
      new CleanWebpackPlugin(['dist']),
      new HtmlWebpackPlugin({
        filename: "index.html",
        template: "./src/index.html",
        inject: "body",
        hash: true,
        favicon: "./src/static/images/favicon.png",
        chunks: ["vendors", "app"]
      })
    ],
    resolve: resolve
  }
  