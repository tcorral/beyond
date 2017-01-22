require('colors');

module.exports = require('async')(function *(resolve, reject, module, specs, json) {
    "use strict";

    let fs = require('co-fs');
    let mkdir = require('../fs/mkdir');
    let save = require('../fs/save');
    let copy = require('../fs/copy');

    // building start script
    if (module.start) {

        json.js.start = {'js': {'files': ['start.js']}};

        let script = yield module.start();

        // check if destination path exists
        let path = version.build.js;
        if (!(yield fs.exists(path)))
            yield mkdir(path);

        let target;
        if (specs.mode === 'beyond') {
            target = require('path').join(path, key, 'start.js');
        }
        else if (specs.mode === 'deploy') {
            let name = (key === '.') ? 'main.js' : key + '.js';
            target = require('path').join(path, 'start', name);
        }

        yield save(target, script.content);

    }

    // building code script
    if (module.code) {

        let script = yield module.code();
        let path = version.build.js;

        // check if destination path exists
        if (!(yield fs.exists(path)))
            yield mkdir(path);

        json.client.code = {'js': {'source': ['code.js']}};

        if (specs.mode === 'beyond') {

            let target = require('path').join(path, key, 'code.js');
            yield save(target, script.content);

        }
        else if (specs.mode === 'deploy') {

            let name = (key === '.') ? 'main.js' : key + '.js';

            let target = require('path').join(path, name);
            yield save(target, script.content);

        }

    }

    // building code script
    if (module.polymer) {

        let code = yield module.polymer();
        let path = version.build.js;

        // check if destination path exists
        if (!(yield fs.exists(path)))
            yield mkdir(path);

        let target = require('path').join(path, key, 'control.html');
        yield save(target, code.content);

    }

    // copying static resources
    if (module.static) {

        moduleJson.js.static = module.static.config;

        yield module.static.process();
        for (let path of module.static.keys) {

            let resource = module.static.items[path];

            let target = require('path').join(
                version.build.js,
                module.path,
                'static',
                resource.relative.file);

            if (resource.content) {
                yield save(target, resource.content);
            }
            else {
                yield copy.file(resource.file, target);
            }

        }

    }

    if (module.config.page) {
        moduleJson.js.page = module.config.page;
    }

    if (module.config.widget) {
        moduleJson.js.widget = module.config.widget;
    }

    if (module.config.polymer) {
        moduleJson.js.polymer = module.config.polymer;
    }

    // build library service
    // copy backend source code
    if (library.service.code) {

        libraryJson.ws.service = {};
        libraryJson.ws.service.path = './service/code';

        let source, destination;

        // copy the service
        source = library.service.path;
        destination = require('path').join(library.build.ws, 'service/code');
        yield copy.recursive(source, destination);

        // copy the service configuration if it was set
        if (library.service.specs) {

            libraryJson.ws.service.config = './service/config.json';

            destination = require('path').join(library.build.ws, 'service/config.json');
            yield save(destination, JSON.stringify(library.service.specs));

        }

    }

    // build server actions, backend and config
    let server = module.server.config;
    if (server && server.actions && specs.server) {

        let path = version.build.ws;
        moduleJson.ws.server = {'actions': './actions'};

        // copy actions source code
        let source = require('path').join(module.dirname, server.actions);
        let destination = require('path').join(path, module.path, 'actions');
        yield copy.recursive(source, destination);

        // copy backend source code
        if (server.backend) {
            moduleJson.ws.server.backend = './backend';
            let source = require('path').join(module.dirname, server.backend);
            let destination = require('path').join(path, module.path, 'backend');
            yield copy.recursive(source, destination);
        }

        // copy module configuration
        if (server.config) {
            moduleJson.ws.server.config = './config.json';
            let source = require('path').join(module.dirname, server.config);
            let destination = require('path').join(path, module.path, 'config.json');
            yield copy.file(source, destination);
        }

        // save module.json
        let target = require('path').join(path, module.path, 'module.json');
        yield save(target, JSON.stringify(moduleJson.ws));

    }

    // saving module.json file
    if (specs.mode === 'beyond') {

        let target = require('path').join(
            version.build.js,
            key,
            'module.json');

        yield save(target, JSON.stringify(moduleJson.js));

    }

});