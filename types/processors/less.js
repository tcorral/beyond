module.exports = require('async')(function *(resolve, reject, module, files, minify, error) {

    let fs = require('co-fs');

    let output = '';
    for (let file of files) {

        if (file.extname !== '.less') {
            reject(error('invalid file extension "' + file.relative.file + '"'));
            return;
        }

        output += yield fs.readFile(file.file, {'encoding': 'utf8'});

    }

    if (!output) {
        resolve();
        return;
    }

    // Compile less
    let less = require('less');
    less.render(output, {'compress': false}, function (e, processed) {

        if (e) {
            reject(error(e.message));
            return;
        }

        output = processed.css;

    });

    if (!minify) {
        // replace all ' to "
        output = output.replace(/\'/g, '"');
        resolve(output);
        return;
    }

    // Minify css
    let cleaned = new (require('clean-css'))().minify(output);
    if (cleaned.errors.length || cleaned.warnings.length) {

        for (let i in cleaned.errors) {
            console.log('\tERROR: '.red + (cleaned.errors[i]).red);
        }
        for (let i in cleaned.warnings) {
            console.log('\tWARNING: '.yellow + (cleaned.warnings[i]).yellow);
        }

        if (cleaned.errors.length) {
            reject(error('check console for warning and errors'));
            return;
        }

    }
    output = cleaned.styles;

    // replace all ' to "
    output = output.replace(/\'/g, '"');
    resolve(output);

});
