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