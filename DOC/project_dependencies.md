## 프로젝트 라이브러리 추가

### handsontable 적용
```
npm install --save handsontable
npm install --save-dev style-loader
npm install --save-dev css-loader

webpack.config.js 수정
    module: {
        loaders: [{
            test: /\.css$/,
            include: /node_modules/,
            loaders: ['style-loader', 'css-loader'],
        }],
        noParse: [path.join(__dirname, "node_modules/handsontable/dist/handsontable.full.js")]
    },
    resolve: {
        alias: {
            'handsontable': path.join(__dirname, 'node_modules/handsontable/dist/handsontable.full.js'),
            'handsontable.css': path.join(__dirname, 'node_modules/handsontable/dist/handsontable.full.css'),
            "handlebars": path.join(__dirname, '/node_modules/handlebars/dist/handlebars')
        }
    },

main.js 수정
import Handsontable from 'handsontable';
import 'handsontable.css';
```

### handlebars 적용
```
npm install -D handlebars

webpack.config.js 수정
    resolve: {
        alias: {
            "handlebars": path.join(__dirname, '/node_modules/handlebars/dist/handlebars')
        }
    },

import handlebars from 'handlebars';
```

### tree-model 적용
```
npm install tree-model

webpack.config.js 수정
    module: {
        noParse: [
            path.join(__dirname, "node_modules/tree-model/dist/TreeModel-min.js"),
        ]
    },
    resolve: {
        alias: {
            'TreeModel': path.join(__dirname, '/node_modules/tree-model/dist/TreeModel-min.js')
        }
    },
```

### fortawesome 적용
https://fontawesome.com/how-to-use/use-with-node-js 참고
```
npm i --save @fortawesome/fontawesome
npm i --save @fortawesome/fontawesome-free-solid


import fontawesome from '@fortawesome/fontawesome';
import solid from '@fortawesome/fontawesome-free-solid'

// Add the icon to the library so you can use it in your page
fontawesome.library.add(solid.faUser);
```

### fortawesome 적용
https://github.com/jmblog/how-to-optimize-momentjs-with-webpack 참고
```
npm install --save moment

webpack.config.js 수정

webpack.config.js 수정
    resolve: {
        alias: {
            'moment': path.join(__dirname, '/node_modules/moment/moment.js')
        }
    },
    plugins: [
        // 한글언어팩만 추가
        new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /ko/)
    ]
```

### Handsontable formula 적용
```
npm install hot-formula-parser --save
```