/**
 * Returns the resource of a "control" type
 */
module.exports = function (module, config) {
    "use strict";

    let async = require('async');

    let multilanguage = (typeof config.multilanguage === 'undefined') ? true : config.multilanguage;
    config.multilanguage = multilanguage;
    Object.defineProperty(this, 'multilanguage', {
        'get': function () {
            return multilanguage;
        }
    });

    Object.defineProperty(this, 'extname', {
        'get': function () {
            return '.html';
        }
    });

    let scope = function (code) {

        // add an extra tab in all lines
        code = code.replace(/\n/g, '\n    ');
        code = '    ' + code + '\n';

        // add script inside its own function
        let output = '';
        output += '<dom-module id="' + config.id + '"';

        if (config.is) {
            output += ' is="' + config.is + '"';
        }

        output += '>\n\n';
        output += code;
        output += '</dom-module>';

        return output;

    };

    this.process = async(function *(resolve, reject, language) {

        let error = require('../../error.js')(module, 'control');

        if (!config.id) {
            let message = 'Control resource requires to define its "id"';
            reject(error(message));
            return;
        }

        if (config.id.indexOf('-') === -1) {
            let message = 'Control element id must have the "-" character';
            reject(error(message));
            return;
        }

        let resource = yield require('./processors.js')(module, config, language);

        let code = resource.dependencies;
        if (code) code += '\n';
        code += scope(resource['dom-module']);
        resolve(code);

    });

    this.setBuildConfig = async(function *(resolve, reject, json) {

        json.id = config.id;
        json.dependencies = config.dependencies;

        resolve();

    });

};
