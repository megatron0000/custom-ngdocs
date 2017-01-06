'use strict';

var directive = {};
var service = {
    value: {}
};

var DEPENDENCIES = {
    'angular.js': 'http://code.angularjs.org/' + angular.version.full + '/angular.min.js',
    'angular-resource.js': 'http://code.angularjs.org/' + angular.version.full + '/angular-resource.min.js',
    'angular-route.js': 'http://code.angularjs.org/' + angular.version.full + '/angular-route.min.js',
    'angular-animate.js': 'http://code.angularjs.org/' + angular.version.full + '/angular-animate.min.js',
    'angular-sanitize.js': 'http://code.angularjs.org/' + angular.version.full + '/angular-sanitize.min.js',
    'angular-cookies.js': 'http://code.angularjs.org/' + angular.version.full + '/angular-cookies.min.js'
};

/**
 * @ngdoc function
 * @name bootstrapPrettify.function:escape
 * @param {string} text Input to be escaped
 * @returns {string} Escaped text
 * @description
 * É um escape para html (ou seja: "&", "<", ">", """).
 */
function escape(text) {
    return text.
    replace(/\&/g, '&amp;').
    replace(/\</g, '&lt;').
    replace(/\>/g, '&gt;').
    replace(/"/g, '&quot;');
}

/**
 * @ngdoc function
 * @name bootstrapPrettify.function:setHtmlIe8SafeWay
 * @param {JQueryElement} element HTML element inside which we want to put content (will be emptie if comes with something inside)
 * @param {string} html What we want to put inside the element
 * @returns {JQueryElement} Input element stuffed with html
 * @description
 * Apparently, IE8 had some bugs with simply ``element.innerHTML(html)``, hence this workaround
 * 
 * http://stackoverflow.com/questions/451486/pre-tag-loses-line-breaks-when-setting-innerhtml-in-ie
 * 
 * http://stackoverflow.com/questions/195363/inserting-a-newline-into-a-pre-tag-ie-javascript
 */
function setHtmlIe8SafeWay(element, html) {
    var newElement = angular.element('<pre>' + html + '</pre>');

    element.empty();
    element.append(newElement.contents());
    return element;
}

/**
 * @ngdoc directive
 * @name bootstrapPrettify.directive:jsFiddle
 * @restrict ANY
 * @usage 
 * Don't know yet...
 * @requires getEmbeddedTemplate
 * @requires escape
 * @requires script
 */
directive.jsFiddle = function(getEmbeddedTemplate, escape, script) {
    return {
        terminal: true,
        link: function(scope, element, attr) {
            var name = '',
                stylesheet = '<link rel="stylesheet" href="http://twitter.github.com/bootstrap/assets/css/bootstrap.css">\n',
                fields = {
                    html: '',
                    css: '',
                    js: ''
                };

            angular.forEach(attr.jsFiddle.split(' '), function(file, index) {
                var fileType = file.split('.')[1];

                if (fileType == 'html') {
                    if (index == 0) {
                        fields[fileType] +=
                            '<div ng-app' + (attr.module ? '="' + attr.module + '"' : '') + '>\n' +
                            getEmbeddedTemplate(file, 2);
                    } else {
                        fields[fileType] += '\n\n\n  <!-- CACHE FILE: ' + file + ' -->\n' +
                            '  <script type="text/ng-template" id="' + file + '">\n' +
                            getEmbeddedTemplate(file, 4) +
                            '  </script>\n';
                    }
                } else {
                    fields[fileType] += getEmbeddedTemplate(file) + '\n';
                }
            });

            fields.html += '</div>\n';

            setHtmlIe8SafeWay(element,
                '<form class="jsfiddle" method="post" action="http://jsfiddle.net/api/post/library/pure/" target="_blank">' +
                hiddenField('title', 'AngularJS Example: ' + name) +
                hiddenField('css', '</style> <!-- Ugly Hack due to jsFiddle issue: http://goo.gl/BUfGZ --> \n' +
                    stylesheet +
                    script.angular +
                    (attr.resource ? script.resource : '') +
                    '<style>\n' +
                    fields.css) +
                hiddenField('html', fields.html) +
                hiddenField('js', fields.js) +
                '<button class="btn btn-primary"><i class="icon-white icon-pencil"></i> Edit Me</button>' +
                '</form>');

            function hiddenField(name, value) {
                return '<input type="hidden" name="' + name + '" value="' + escape(value) + '">';
            }
        }
    }
};

/**
 * @ngdoc directive
 * @name bootstrapPrettify.directive:code
 * @restrict E
 * @description
 * Does nothing, but is a *terminal* directive.
 */
directive.code = function() {
    return {
        restrict: 'E',
        terminal: true
    };
};

/**
 * @ngdoc directive
 * @name bootstrapPrettify.directive:prettyprint
 * @requires bootstrapPrettify.service:reindentCode
 * @restrict C
 * @description
 * Processes html content of observed element, using Google's ``windows.prettyPrintOne()``
 * to color and apply line numbers to this html.
 * 
 * Returns "prettified" html
 */
directive.prettyprint = ['reindentCode', function(reindentCode) {
    return {
        restrict: 'C',
        compile: function(element) {
            var html = element.html();
            //ensure that angular won't compile {{ curly }} values
            html = html.replace(/\{\{/g, '<span>{{</span>')
                .replace(/\}\}/g, '<span>}}</span>');
            if (window.RUNNING_IN_NG_TEST_RUNNER) {
                element.html(html);
            } else {
                element.html(window.prettyPrintOne(reindentCode(html), undefined, true));
            }
        }
    };
}];

/**
 * @ngdoc directive
 * @name bootstrapPrettify.directive:ngSetText
 * @requires bootstrapPrettify.service:getEmbeddedTemplate
 * @restrict CA
 * @usage
 * <div ng-set-text="someCoolStuff.js">
 * </div>
 * @description
 * In the example provided, will look for an **embedded** template with CSS id === "someCoolStuff.js".
 * If found, will set this element´s text to be equal to the template´s innerHTML (escaped)
 */
directive.ngSetText = ['getEmbeddedTemplate', function(getEmbeddedTemplate) {
    return {
        restrict: 'CA',
        priority: 10,
        compile: function(element, attr) {
            setHtmlIe8SafeWay(element, escape(getEmbeddedTemplate(attr.ngSetText)));
        }
    }
}]

/**
 * @ngdoc directive
 * @name bootstrapPrettify.directive:ngHtmlWrap
 * @requires bootstrapPrettify.service:reindentCode
 * @requires bootstrapPrettify.service:templateMerge
 * @requires bootstrapPrettify.function:escape
 * @usage
 * <ANY ng-html-wrap="moduleName controllers.js services.js dependency.css dependency.js">
 *      ...
 * </ANY>
 * @description
 * Expects to be used on element whose content is a "html body content"
 * (that is, something that could well be the content of body part
 * from some document).
 * 
 * It alters the observed element´s content, surrounding it with <html ng-app="moduleName"> ,
 * <head (containing designated dependencies).
 * 
 * ** Does NOT prettify the result. This is responsibility of ``prettify`` directive **
 */
directive.ngHtmlWrap = ['reindentCode', 'templateMerge', function(reindentCode, templateMerge) {
    return {
        compile: function(element, attr) {
            var properties = {
                    head: '',
                    module: '',
                    body: element.text()
                },
                html = "<!doctype html>\n<html ng-app{{module}}>\n  <head>\n{{head:4}}  </head>\n  <body>\n{{body:4}}  </body>\n</html>";

            angular.forEach((attr.ngHtmlWrap || '').split(' '), function(dep) {
                if (!dep) return;
                dep = DEPENDENCIES[dep] || dep;

                var ext = dep.split(/\./).pop();

                if (ext == 'css') {
                    properties.head += '<link rel="stylesheet" href="' + dep + '" type="text/css">\n';
                } else if (ext == 'js') {
                    properties.head += '<script src="' + dep + '"></script>\n';
                } else {
                    properties.module = '="' + dep + '"';
                }
            });

            setHtmlIe8SafeWay(element, escape(templateMerge(html, properties)));
        }
    }
}];

/**
 * @ngdoc directive
 * @name bootstrapPrettify.directive:ngSetHtml
 * @requires bootstrapPrettify.service:getEmbeddedTemplate
 * @restrict CA
 * @usage
 * <div ng-set-html="someCoolStuff.html">
 * </div>
 * @description
 * In the example provided, will look for an **embedded** template with CSS id === "someCoolStuff.html".
 * If found, will set this element´s html to be equal to the template´s innerHTML (**NOT** escaped).
 * 
 * Note the difference between this and {@link bootstrapPrettify.directive:ngSetText ngSetText}. The latter
 * escapes all content (its objective is displaying code). The former ** DOES NOT ** escape (its objective is 
 * displaying result of html).
 */
directive.ngSetHtml = ['getEmbeddedTemplate', function(getEmbeddedTemplate) {
    return {
        restrict: 'CA',
        priority: 10,
        compile: function(element, attr) {
            setHtmlIe8SafeWay(element, getEmbeddedTemplate(attr.ngSetHtml));
        }
    }
}];

/**
 * @ngdoc directive
 * @name bootstrapPrettify.directive:ngEvalJavascript
 * @restrict A
 * @usage
 * <ANY ng-eval-javascript="someScript.js">
 *      ...
 * </ANY>
 * @description
 * Reads and executes "someScript.js" (from the example usage) on the window object.
 * This "someScript.js" must be an embedded template (that is, must be contained
 * inside an HTML element with CSS id === someScript.js)
 */
directive.ngEvalJavascript = ['getEmbeddedTemplate', function(getEmbeddedTemplate) {
    return {
        compile: function(element, attr) {
            var fileNames = attr.ngEvalJavascript.split(' ');
            angular.forEach(fileNames, function(fileName) {
                var script = getEmbeddedTemplate(fileName);
                try {
                    if (window.execScript) { // IE
                        window.execScript(script || '""'); // IE complains when evaling empty string
                    } else {
                        window.eval(script + '//@ sourceURL=' + fileName);
                    }
                } catch (e) {
                    if (window.console) {
                        window.console.log(script, '\n', e);
                    } else {
                        window.alert(e);
                    }
                }
            });
        }
    };
}];

/**
 * @ngdoc directive
 * @name bootstrapPrettify.directive:ngEmbedApp
 * @description
 * ## TODO
 */
directive.ngEmbedApp = ['$templateCache', '$browser', '$rootScope', '$location', '$sniffer', '$exceptionHandler',
    function($templateCache, $browser, docsRootScope, $location, $sniffer, $exceptionHandler) {
        return {
            terminal: true,
            link: function(scope, element, attrs) {
                var modules = ['ngAnimate'],
                    embedRootScope,
                    deregisterEmbedRootScope;

                modules.push(['$provide', function($provide) {
                    $provide.value('$templateCache', $templateCache);
                    $provide.value('$anchorScroll', angular.noop);
                    $provide.value('$browser', $browser);
                    $provide.value('$sniffer', $sniffer);
                    $provide.provider('$location', function() {
                        this.$get = ['$rootScope', function($rootScope) {
                            docsRootScope.$on('$locationChangeSuccess', function(event, oldUrl, newUrl) {
                                $rootScope.$broadcast('$locationChangeSuccess', oldUrl, newUrl);
                            });
                            return $location;
                        }];
                        this.html5Mode = angular.noop;
                        this.hashPrefix = function() {
                            return '';
                        };
                    });

                    $provide.decorator('$rootScope', ['$delegate', function($delegate) {
                        embedRootScope = $delegate;

                        // Since we are teleporting the $animate service, which relies on the $$postDigestQueue
                        // we need the embedded scope to use the same $$postDigestQueue as the outer scope
                        function docsRootDigest() {
                            var postDigestQueue = docsRootScope.$$postDigestQueue;
                            while (postDigestQueue.length) {
                                try {
                                    postDigestQueue.shift()();
                                } catch (e) {
                                    $exceptionHandler(e);
                                }
                            }
                        }
                        embedRootScope.$watch(function() {
                            embedRootScope.$$postDigest(docsRootDigest);
                        })

                        deregisterEmbedRootScope = docsRootScope.$watch(function embedRootScopeDigestWatch() {
                            embedRootScope.$digest();
                        });

                        return embedRootScope;
                    }]);
                }]);
                if (attrs.ngEmbedApp) modules.push(attrs.ngEmbedApp);

                element.on('click', function(event) {
                    if (event.target.attributes.getNamedItem('ng-click')) {
                        event.preventDefault();
                    }
                });

                element.bind('$destroy', function() {
                    if (deregisterEmbedRootScope) {
                        deregisterEmbedRootScope();
                    }
                    if (embedRootScope) {
                        embedRootScope.$destroy();
                    }
                });

                element.data('$injector', null);
                angular.bootstrap(element, modules);
            }
        };
    }
];

/**
 * @ngdoc service
 * @name bootstrapPrettify.service:reindentCode
 * @description
 * "Rises" or "lowers" a block of text by a certain quantity of spaces. Does not use syntax for detecting where to indent, rather
 * just prefixes all lines with the same amount of spaces.
 * @param {string} text Text to be reindented
 * @param {number=} [spaces=0] How much space will be the base indentation (indentation of the least indented line in ``text``)
 * @returns {string} Reindented text
 */
service.reindentCode = function() {
    return function(text, spaces) {
        if (!text) return text;
        var lines = text.split(/\r?\n/);
        var prefix = '      '.substr(0, spaces || 0);
        var i;

        // remove any leading blank lines
        while (lines.length && lines[0].match(/^\s*$/)) lines.shift();
        // remove any trailing blank lines
        while (lines.length && lines[lines.length - 1].match(/^\s*$/)) lines.pop();
        var minIndent = 999;
        for (i = 0; i < lines.length; i++) {
            var line = lines[0];
            var reindentCode = line.match(/^\s*/)[0];
            if (reindentCode !== line && reindentCode.length < minIndent) {
                minIndent = reindentCode.length;
            }
        }

        for (i = 0; i < lines.length; i++) {
            lines[i] = prefix + lines[i].substring(minIndent);
        }
        lines.push('');
        return lines.join('\n');
    }
};

/**
 * @ngdoc service
 * @name bootstrapPrettify.service:templateMerge
 * @requires {@link bootstrapPrettify.service:reindentCode}
 * @description
 * Interpolates expressions in a template string (template can also specify indentation of the interpolation)
 * @param {string} template Template like "{{name:4}}", which will be substituted by the value of the key ``name`` from ``properties``
 * with 4 spaces of indentation
 * @param {KeyValuePairs} properties HashMap of the values to be put in place of the keys present in the interpolation template
 * @returns {string} String after complete interpolation
 */
service.templateMerge = ['reindentCode', function(indentCode) {
    return function(template, properties) {
        return template.replace(/\{\{(\w+)(?:\:(\d+))?\}\}/g, function(_, key, indent) {
            var value = properties[key];

            if (indent) {
                value = indentCode(value, indent);
            }

            return value == undefined ? '' : value;
        });
    };
}];

/**
 * @ngdoc service
 * @name bootstrapPrettify.service:getEmbeddedTemplate
 * @requires bootstrapPrettify.service:reindentCode
 * @description
 * "Embedded" means "inside the html page" (hidden, of course, since it is only a template).
 * 
 * Takes a css id and returns inner html of getElementById(id)
 * @param {number} id CSS id from template container
 * @returns {string} Template recovered from inside its container. **null** if container not found
 */
service.getEmbeddedTemplate = ['reindentCode', function(reindentCode) {
    return function(id) {
        var element = document.getElementById(id);

        if (!element) {
            return null;
        }

        return reindentCode(angular.element(element).html(), 0);
    }
}];


angular.module('bootstrapPrettify', []).directive(directive).factory(service);