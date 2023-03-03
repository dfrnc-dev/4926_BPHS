const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const sortCSSmq = require('sort-css-media-queries');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const isDev = process.argv[process.argv.indexOf('--mode') + 1] === 'development';

/**
 *  add multiple page
 */
const pages = fs
	.readdirSync(__dirname + '/../src/pages/', { withFileTypes: true })
	.filter((item) => item.isDirectory())
	.filter((item) => { if (item.name[0] != "_") return true; })
	.map((item) => item.name);

console.log(pages);

let entry = {}
pages.forEach(page => {
	entry[page] = path.resolve(__dirname, `../src/pages/${page}/${page}-entry.js`)
})
let pluginsHtmlPages = []
pages.forEach(page => {
	pluginsHtmlPages.push(
		new HtmlWebpackPlugin({
			filename: `${page}.html`,
			template: `./src/pages/${page}/${page}.hbs`,
			chunks: [`${page}`],
			inject: true,
			minify: false
		}))
});


module.exports = {
	entry: {
		...entry
	},
	output: {
		filename: 'assets/js/[name].js',
		path: path.resolve(__dirname, '../dist'),
		clean: true,
	},
	resolve: {
		alias: {
			scr: path.resolve(__dirname, "../src"),
		}
	},
	devtool: isDev ? 'source-map' : undefined,
	mode: isDev ? 'development' : 'production',
	devServer: {
		port: 3030,
		watchFiles: ["src/**/*"],
	},
	plugins: [
		...pluginsHtmlPages,
		new MiniCssExtractPlugin({
			filename: "assets/css/[name].css",
		}),
		new CopyPlugin({
			patterns: [{
				from: path.resolve(__dirname, '../src/static'),
				to: "./assets",
				noErrorOnMissing: true,
			}],
		}),
		new CleanWebpackPlugin(),
	],

	resolveLoader: {
		alias: {
			'svg-anim-loader': path.resolve(__dirname, './loader/svg-anim-loader.js'),
		},
	},
	module: {
		rules: [
			// {
			// 	test: /\.svg$/,
			// 	use: [
			// 		{
			// 			loader : 'svg-anim-loader',
			// 			options: {
			// 				outImageUrl : "/assets/img/",
			// 				needContent : false,
			// 			}
			//
			// 		},
			// 		// loader: "html-loader",
			// 		// 'babel-loader',
			// 		// loader: 'svg-loader',
			// 		// loader: 'file-loader',
			// 	],
			// 	exclude: /(node_modules|bower_components)/,
			//
			// },
			{
				test: /\.(hbs|svg)$/,
				loader: "handlebars-loader",
				exclude: /(node_modules|bower_components)/,
			},
			{
				test: /\.js$/,
				loader: 'babel-loader',
				exclude: '/node_modules/'
			},
			{
				test: /\.html$/i,
				loader: "html-loader",
				options: {
					minimize: false,
					esModule: false,
					root: path.resolve(__dirname, '../dist'),
					attrs: ['img:src', 'link:href'],
					// attrs: ['img:src','link:href','image:xlink:href']
				},
			},
			{
				test: /\.(png|jpg|gif|webp)$/,
				use: [
					{
						loader: "file-loader",
						options: {
							name: '[name].[ext]',
							outputPath: './assets/img',
							publicPath: './assets/img',
							// useRelativePaths: true
						}
					}
				]
			},
			{
				test: /\.(css|s[ac]ss)$/,
				use: [
					'style-loader',
					{
						loader: MiniCssExtractPlugin.loader,
						options: {
							esModule: false,
						},
					},
					{
						loader: 'css-loader',
						options: {
							sourceMap: isDev,
							url: false,
							esModule: false,
						}
					}, {
						loader: 'postcss-loader',
						options: {
							postcssOptions: (!isDev) ? {
								plugins: {
									'autoprefixer': {},
									'css-mqpacker': {
										sort: sortCSSmq
									},
									'cssnano': {
										preset: [
											'default', {
												discardComments: {
													removeAll: true,
												}
											}
										]
									},
								}
							} : {},
							sourceMap: true,
						}
					},
					{
						loader: 'sass-loader',
						options: { sourceMap: true }
					}
				]
			},
			// {
			// 	test: /\.(ttf|woff(2)?|eot)$/,
			// 	use: [
			// 		{
			// 			loader: "file-loader",
			// 			options: {
			// 				name: '[name].[ext]',
			// 				outputPath: './fonts',
			// 				// publicPath: './src/fonts',
			// 				// useRelativePaths: true
			// 			}
			// 		}
			// 	]
			// },
		]
	}
}

