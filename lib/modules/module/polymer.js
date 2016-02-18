var async = require('async');

/**
 * Returns the code of the script
 */
module.exports = function (module, config) {
    "use strict";

    let error = require('./error.js')(module);
    let code = require('./polymer/');

    let scope = function (code) {

        // add an extra tab in all lines
        code = code.replace(/\n/g, '\n    ');
        code = '    ' + code + '\n';

        // add script inside its own function
        let output = '';
        output += '<dom-module id="' + config.id + '"';

        if (config.is) output += ' is="' + config.is + '"';

        output += '>\n\n';
        output += code;
        output += '</dom-module>';

        return output;

    };

    return async(function *(resolve, reject, language) {

        if (!config.id) {

            let message = 'polymer resource requires to define its "id"';
            reject(error(message));
            return;

        }

        if (config.id.indexOf('-') === -1) {

            let message = 'polymer element id must have the "-" character';
            reject(error(message));
            return;

        }

        if (module.localized && !language) {

            let message = 'language not set on localized module';
            reject(error(message));
            return;

        }

        let script = yield code(module, config, language);

        let output = require('./header')(module, true);

        output += scope(script);

        let Resource = require('path').join(require('main.lib'), 'resource');
        Resource = require(Resource);
        let resource = new Resource({'content': output, 'contentType': '.js'});

        resolve(resource);

    });

};