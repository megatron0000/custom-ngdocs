var seqCount = 0;
var usedIds = {};
var makeUnique = {
    'index.html': true,
    'style.css': true,
    'script.js': true,
    'unit.js': true,
    'spec.js': true,
    'scenario.js': true
}

/**
 * Given a list of objects, 
 * returns a string with their ids (fully qualified names),
 * separated by spaces
 */
function ids(list) {
    return list.map(function(item) {
        return item.id;
    }).join(' ');
}


exports.Example = function(scenarios) {
    console.log("Entered Example#constructor(", scenarios, ")");
    this.module = '';
    this.deps = ['angular.js'];
    this.html = [];
    this.css = [];
    this.js = [];
    this.json = [];
    this.unit = [];
    this.scenario = [];
    this.scenarios = scenarios;
    console.log("Exiting Example#constructor(", scenarios, ")");
}

exports.Example.prototype.setModule = function(module) {
    console.log("Entered Example#setModule(", module, ")");
    if (module) {
        this.module = module;
    }
    console.log("Exiting Example#setModule(", module, ")");
};

exports.Example.prototype.addDeps = function(deps) {
    console.log("Entered Example#addDeps(", deps, ")");
    deps && deps.split(/[\s\,]/).forEach(function(dep) {
        if (dep) {
            this.deps.push(dep);
        }
    }, this);
    console.log("About to exit Example#addDeps(", deps, ")");
};

/**
 * Sources are <file name="">...</file> or <file src=""></file>
 * placed inside <example>s.
 * 
 * Note that this[extension] is appended with requested source,
 * but only JS files are also taken as DEPENDENCIES
 */
exports.Example.prototype.addSource = function(name, content) {
    var ext = name == 'scenario.js' ? 'scenario' : name.split('.')[1],
        id = name;

    console.log("Entering Example#addSource(", name, ",", content, ")");
    if (makeUnique[name] && usedIds[id]) {
        id = name + '-' + (seqCount++);
    }
    console.log("Produced id === ", id, " and found extension === ", ext);
    usedIds[id] = true;

    this[ext].push({
        name: name,
        content: content,
        id: id
    });
    if (name.match(/\.js$/) && name !== 'spec.js' && name !== 'unit.js' && name != 'scenario.js') {
        this.deps.push(name);
    }
    if (ext == 'scenario') {
        this.scenarios.push(content);
    }

    console.log("About to exit Example#addSource(", name, ",", content, ")");
};

exports.Example.prototype.enableAnimations = function() {
    this.animations = true;
};

exports.Example.prototype.disableAnimations = function() {
    this.animations = false;
};

exports.Example.prototype.toHtml = function() {
    console.log("Entered Example#toHtml()");
    var html = "<h2>Source</h2>\n";
    html += this.toHtmlEdit();
    console.log("Exit Example#toHtmlEdit(). Entering example.toHtmlTabs()");
    console.log("Local var 'html' === ", html);
    console.log("Entering Example#toHtmlTabs()");
    html += this.toHtmlTabs();
    console.log("Exit Example#toHtmlTabs()");
    console.log("Local var html === ", html);
    if (this.animations) {
        html += '<div class="pull-right">';
        html += ' <button class="btn btn-primary" ng-click="animationsOff=true" ng-hide="animationsOff">Animations on</button>';
        html += ' <button class="btn btn-primary disabled" ng-click="animationsOff=false" ng-show="animationsOff">Animations off</button>';
        html += '</div>';
    }
    console.log("Entering Example#toHtmlEmbed()");
    html += "<h2>Demo</h2>\n";
    html += this.toHtmlEmbed();
    console.log("Exited example.toHtmlEmbed(). Am right before Example.prototype.toHtml() return");
    return html;
};


/**
 * Generates 0x0 div with <a> element inside (visible, of course).
 * This <a> element will be used to open code in Plunkr.
 * 
 * Observe how this.deps in considered for outside view (plunkr)
 */
exports.Example.prototype.toHtmlEdit = function() {
    console.log("Entering Example.prototype.toHtmlEdit()");
    var out = [];
    out.push('<div source-edit="' + this.module + '"');
    out.push(' source-edit-deps="' + this.deps.join(' ') + '"');
    out.push(' source-edit-html="' + ids(this.html) + '"');
    out.push(' source-edit-css="' + ids(this.css) + '"');
    out.push(' source-edit-js="' + ids(this.js) + '"');
    out.push(' source-edit-json="' + ids(this.json) + '"');
    out.push(' source-edit-unit="' + ids(this.unit) + '"');
    out.push(' source-edit-scenario="' + ids(this.scenario) + '"');
    out.push('></div>\n');
    console.log("Exiting Example.prototype.toHtmlEdit(), right before return");
    return out.join('');
};

/**
 * Used for generating tab-panes whose contents
 * are pages that were specified inside <file>...</file>.
 * 
 * Each file is shown inside a <pre.prettyprint>...</pre>
 * And effectively loaded 
 * 
 * Observe how this.deps DOES NOT COUNT for inside view (tab-panes).
 * 
 * Dependencies will only be put in ng-html-wrap-loaded attribute
 * of a file named index.html (if you do not specify one, no dependency
 * will be included anywhere)
 */
exports.Example.prototype.toHtmlTabs = function() {
    console.log("Entered Example#toHtmlTabs()");
    var out = [],
        self = this;

    out.push('<div class="tabbable">');
    htmlTabs(this.html);
    htmlTabs(this.css);
    htmlTabs(this.js);
    htmlTabs(this.json);
    htmlTabs(this.unit);
    htmlTabs(this.scenario);
    out.push('</div>');
    console.log("Exiting Example#toHtmlTabs(), right before return");
    return out.join('');

    function htmlTabs(sources) {
        sources.forEach(function(source) {
            var wrap = '',
                isCss = source.name.match(/\.css$/),
                name = source.name;

            if (name === 'index.html') {
                wrap = ' ng-html-wrap-loaded="' + self.module + ' ' + self.deps.join(' ') + '"';
            }
            if (name == 'scenario.js') name = 'End to end test';

            out.push(
                '<div class="tab-pane" title="' + name + '">\n' +
                '<pre class="prettyprint linenums" ng-set-text="' + source.id + '"' + wrap + '></pre>\n' +
                (isCss ?
                    ('<style style="display:none" type="text/css" id="' + source.id + '">' + source.content + '</style>\n') :
                    ('<script style="display:none" type="text/ng-template" id="' + source.id + '">' + source.content + '</script>\n')) +
                '</div>\n');

        });
    }
};

/**
 * Responsible for the live DEMO.
 * Note it does not load css files.
 */
exports.Example.prototype.toHtmlEmbed = function() {
    console.log("Entered Example#toHtmlEmbed()");
    var out = [];
    out.push('<div class="well doc-example-live animate-container"');
    if (this.animations) {
        out.push(" ng-class=\"{'animations-off':animationsOff == true}\"");
    }
    out.push(' ng-embed-app="' + this.module + '"');
    out.push(' ng-set-html="' + this.html[0].id + '"');
    out.push(' ng-eval-javascript="' + ids(this.js) + '">');
    out.push('</div>');
    console.log("Exiting Example#toHtmlEmbed(), right before return");
    return out.join('');
};