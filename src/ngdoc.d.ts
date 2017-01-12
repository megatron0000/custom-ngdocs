import { DOM, KeyValuePairs } from './dom';
declare namespace ngdoc {

    interface DocInlineMember {
        name: string;
        shortName: string;
        description: string;
        options: any;
        scenarios: Array<any>;
        requires: Array<{ name: string; text: string }>;
        param: Array<DocParam>;
        properties: Array<DocInlineProperty | DocBlockProperty>;
        methods: Array<DocInlineMethod | DocBlockMethod>;
        events: Array<any>;
        links: Array<string>;
        anchors: Array<string>;
    }

    interface DocInlineProperty extends DocInlineMember {
        type: string;
    }

    interface DocInlineMethod extends DocInlineMember {
        returns: Array<{ type: string; description: string }>;
    }

    interface DocBlockMember extends DocInlineMember {
        text: string;
        file: string;
        line: number;
        codeline: number;
        section: string;
        ngdoc: string;
        id: string;
    }

    interface DocBlockProperty extends DocBlockMember {
        type: string;
        propertyOf: string;
    }

    interface DocBlockMethod extends DocBlockMember {
        methodOf: string;
        returns: Array<{ type: string; description: string }>;
    }

    interface DocRequires {
        name: string;
        text: string;
    }

    interface DocParam {
        name: string;
        description: string;
        type: string;
        optional: boolean;
        default: string | undefined;    // undefined if param is not optional
        // If I pass an object as param, it will have nested .properties
        properties?: Array<{
            name: string;
            description: string;
            type: string;
            optional: boolean;
            default: string | undefined;
        }>;
    }

    interface DocDirective {
        name: string;
        shortName: string;
        options: Array<any>;
        description: string;
        text: string;
        file: string;
        line: number;
        codeline: number;
        section: string;
        ngdoc: string;
        id: string;

        /**
         * Combination of 'A' , 'E' , 'C' , 'M'
         */
        restrict: string;
        usage: string;
        /**
         * Inputting "@scope" in block comment (without description lines) already 
         * sets this.scope (means that this directive creates scope)
         */
        scope: any;
        /**
         * Set through "@priority 0. "
         */
        priority: number;
    }

    interface DocFilter {
        name: string;
        shortName: string;
        options: Array<any>;
        description: string;
        text: string;
        file: string;
        line: number;
        codeline: number;
        section: string;
        ngdoc: string;
        id: string;
        /**
         * @usage blabla
         */
        usage: string;
        /**
         * @param blablabla
         */
        param: Array<string>;
        /**
         * @returns blablabla;
         */
        returns: string;
        /**
         * @this blablabla
         */
        this: string;
    }

    /**
     * This library (JS source) inserts other properties here 
     * if they are detected at comment blocks
     * (example: it will detect inline @xyz , even though it is unknown)
     */
    export class Doc implements DocBlockMember {

        /**
         * startLine and endLine refer to the block comment in source code
         * Therefore, this.codeLine === endLine + 1 will be true
         * 
         * "options" is received from reader.js in the normal 
         * flow of the documentation generation
         */
        constructor(properties: KeyValuePairs, file: string, startLine: number, endLine: number, options: KeyValuePairs);
        constructor(text: string, file: string, startLine: number, endLine: number, options: KeyValuePairs);

        /**
         * Is set in the last "else" statement of this.parse()
         */
        name: string;

        /**
         * Set inside this.parse(), by splitting this.name
         */
        shortName: string;

        /**
         * Set in the last "else" statement of this.parse()
         */
        description: string;

        scenarios: Array<any>;

        /**
         * Set in the middle of this.parse()
         */
        requires: Array<{ name: string; text: string }>;
        param: Array<DocParam>;
        properties: Array<DocInlineProperty | DocBlockProperty>;
        methods: Array<DocInlineMethod | DocBlockMethod>;
        /**
         * Real name is "constructor", but Typescript complained, so I put "_constructor"
         *
         * Is set if @constructor is detected in the source block comment
         */
        _constructor?: boolean;

        events: Array<any>;

        /**
         * Collected while processing text during
         * lifecycle of an instance of this class
         */
        links: Array<string>;

        /**
         * Array of html "id" attributes and < a > element "name" attributes
         * set during lifecycle of an instance of this class (example: an id is 
         * generated for every header inside utilized DOM class instance).
         * Array of ids is collected from DOM inside this.html()
         */
        anchors: Array<string>;

        /**
         * Set uniquely through constructor
         */
        text: string;
        file: string;
        line: number;
        codeline: number;
        options: any;


        section: string;

        /**
         * Type of ngdoc (example: "@ngdoc method" has this.ngdoc === 'method')
         * It is set on the last "else" statement of this.parse()
         */
        ngdoc: string;

        /**
         * Unique identifier. I can provide one with "@id someId",
         * otherwise it defaults to this.name (which is the fully qualified name anyway)
         */
        id: string;
        ////////////////////////////////

        /**
         * Seems to be set at Doc.parse(), when it finds a line like "@module myModule".
         * If no @module is present in the block, this.moduleName is inferred by splitting this.name 
         * (logically perfect, by the way). However, this is done inside makeTitle(), which is a 
         * helper function of title(), which by itself is a helper function of this.html().
         * In other words, this.moduleName is set only in the final moments of the instance,
         * when it is already producing its final HTML output
         */
        moduleName?: string;

        /**
         * Useless words like prepositions and articles
         */
        static METADATA_IGNORE: Array<string>;
        /**
         * Reads this.text and, from each method/property, it also reads (method/property).(text/description).
         * 
         * Extracts all words that are not in this.METADATA_IGNORE and returns Array of them (alphabetical order)
         */
        keyword(): Array<string>;
        /**
         * Pega a primeira linha de this.description,
         * retira qualquer coisa entre "< >", escapa "{" e "}",
         * e retorna o resultado.
         */
        shortDescription(): string;
        /**
         * Não sei
         */
        getMinerrNamespace(): string;
        /**
         * Não sei
         */
        getMinerrCode(): string;
        /**
         * Converts relative urls (without section) into absolute
         * Absolute url means url with section
         *
         * @example
         * if the link is inside any api doc:
         * angular.widget -> api/angular.widget
         *
         * if the link is inside any guid doc:
         * intro -> guide/intro
         *
         * @param {string} url Absolute or relative url
         * @returns {string} Absolute url
         */
        convertUrlToAbsolute(): string;
        /**
         * Executes the following operators on the text:
         *  - Process examples (like <example>blabla</example>). For details, check "documentation of grunt-ngdocs"
         *  - Puts \n inside empty div (if there are empty divs)
         *  - Process all {@link blabla bla}, converting relative to absolute urls (collects links in this.links)
         *  - If not full url, pushes to this.links (internal links, therefore)
         *  - Process all {@type typeName optionalUrl}, generating <a></a> (uses this.prepare_type_hint_class_name)
         *  - Process {@installModule moduleName}
         *  - Encloses all content inside div with a class name (given by concatenation of this.name with "-")
         *  - Process REPLACEME
         *  - Transforms markdown syntax in "text" to valid html, using global variable "marked"
         *  - Process //!annotate="REGEXP" title|content \n line
         *  - Process //!details="REGEX" /path/to/local/docs/file.html
         * Finally, returns the result
         */
        markdown(text: string): string;
        /**
         * Processess a block of documentation (/** @ngdoc blabla \n\n\n... * /)
         * That means it builds this.param , or this.returns... 
         * Workflow is as follows:
         *  1. Process this.text to extract inline documented members
         *   1. @param NOT instanceof Doc (even optional ones with default values. It nests object properties passed as parameter)
         *   2. @return | @returns NOT instanceof Doc
         *   3. @requires NOT instanceof Doc
         *   4. @property ** instanceof Doc !!!
         *   5. @eventType
         *   6. @constructor
         *   7. @unknown (that is, it does "this[unknown] = this.text". This behavior can be overriden to extend functionality)
         *       Even though I call it "unknown", the "name" property (for example) is set here.
         *  2. Set this.shortName (try to split this.name with "#", then with ":", then with ".", otherwise assign entire this.name)
         *  3. Sets this.id (tries to use @id that was maybe collected in 1.7.  then tries to use filename - if .ngdoc extension
         *     - then assigns this.name)
         *  4. Sets remaining:
         *     - this.description
         *     - this.example
         *     - this.this
         */
        parse(): void;
        /**
         * Builds entire html page corresponding to this Doc instance (making use of html_usage_ family of functions)
         * Workflow is as follows:
         *  1. Use this.options.editLink to display "Improve this doc" (editLink must be implemented)
         *  2. Use this.options.sourceLink to display "View source" (sourceLink must be implemented)
         *  3. Calls dom.h() to generate the following:
         *      1. Title of the page (with private helper function title())
         *      2. Deprecation notice (optional. With private helper function notice())
         *      3. Processing of "@ngdoc error" block comment (does not work for now)
         *      4. Dependencies
         *      5. Description
         *      6. html_usage_ family of functions
         *      7. Example
         *  4. Assigns the array of anchors from Dom instance to Doc instance
         *  5. Returns dom.toString(), effectively producing HTML
         */
        html(): void;

        /**
         * Receives "type" extracted from @type somewhere (like @property, @returns)
         * and generates an HTML class attribute based on that
         */
        prepare_type_hint_class_name(type: string): string;

        /**
         * Workflow process is as follows:
         *  1. Insert < ul > for this.animations (if not empty)
         *  2. Insert < h2 >Parameters< /h2 > and following < table > if this.param is not empty.
         *     To build the table, it calls helper processParams(), which does:
         *      1. param.type is cloned and the clone is turned into Array (if block comment had "@type string|number etc.")
         *      2. (optional) is put into html if param.optional === true. param.name is also put
         *      3. clone of param.type is put into html, inside < a > attribute with correct links (if type is iternally defined)
         *      4. param.description is put into html
         *      5. param.default is put right below description (if default was set in block comment from source)
         *      6. If param.properties is defined (see interface DomParam), subtable is created, processed and finished
         *  3. Table is closed. Finished.
         */
        html_usage_parameters(): void;

        /**
         * Puts a header "Returns", and a table structured much like the former params table.
         * Gets its input from this.returns
         */
        html_usage_returns(): void;

        /**
         * Displays information collected from "@this someName": "<h>Method's this</h> someThing"
         */
        html_usage_this(): void;


        /**
         * Uses "dom" argument to generate html for the signature of the method whose params are this.param
         * Separates parameters using "separator".
         * Jumps over the first parameter if "skipFirst === true"
         * Uses the separator even before the first param if "prefix === true"
         * (this last option could look strange: "(, paramNumber, paramString, paramArray)")
         */
        parameters(dom: DOM, separator: string, skipFirst: boolean, prefix: boolean): void;

        /**
         * Workflow:
         *  1. Outputs "Usage" header
         *  2. Inside < code >, puts signature (including "new" if "@constructor" was present). Uses aforementioned this.parameters()
         *  3. html_usage_parameters()
         *  4. html_usage_this()
         *  5. html_usage_returns()
         */
        html_usage_function(): void;

        /**
         * Like the name suggests, it WOULD be used for block comments of the type "@ngdoc property"
         * Workflow is:
         *  1. "Usage" header
         *  2. this.name is put below the header
         *  3. this.html_usage_returns(), for documenting this.returns (although property should not have "@retuns")
         * 
         * BEWARE: Strange as it is, it is not called for "@ngdoc property". Instead, is used as helper
         * function for other type of ngdoc (namely, uniquely for html_usage_method)
         */
        html_usage_property(): void;

        /**
         * Calls html_usage_property(). Only....
         */
        html_usage_method(): void;

        /**
         * Not called directly, only as helper to this.html_usage_directive()
         * Builds a < ul > and puts the lines "This directive creates new scope." and 
         * "This directive executes at priority level ' + this.priority + '.'" inside it.
         * (Only if this.scope or this.priority is set - maybe both).
         */
        html_usage_directiveInfo(): void;

        /**
         * Workflow is as follows:
         *  1. < h >Usage< /h >
         *  2. If this.usage is set (only if "@usage blabla" was collected) outputs < code >this.usage< /code >
         *  3. Else (this.usage was not set), tries to use this.restrict to produce the same thing
         *      Uses renderParams() helper function to do this (it displays param signature)
         *  4. html_usage_directiveInfo()
         *  5. html_usage_parameters()
         *  6. method_properties_events()
         */
        html_usage_directive(): void;

        /**
         * Workflow is as follows:
         *  1. < h >Usage< /h >
         *  2. < h >In HTML template Binding< /h >
         *  3. dom.text(this.usage) (if set)
         *  4. if this.usage is not set, uses this.shortName. In both situations, calls this.parameters()
         *  5. < h >In Javascript< /h >
         *  6. Uses this.shortName (calls this.parameters())
         *  7. this.html_usage_parameters()
         *  8. this.html_usage_this()
         *  9. this.html_usage_returns()
         */
        html_usage_filter(): void;

        /**
         * Well, I am not interested...
         */
        html_usage_inputType(): void;

        /**
         * Only calls dom.html(this.description)
         */
        html_usage_overview(): void;

        /**
         * Only calls dom.html() without arguments.
         * Looking at dom.js source, I see dom.html() without
         * argument does nothing and simply returns
         */
        html_usage_error(): void;

        /**
         * Workflow is as follows:
         *  1. < h >Usage< /h > whose content is set with this.name and this.parameters()
         *  2. If this.param exists:
         *      1. this.html_usage_parameters()
         *      2. this.html_usage_this()
         *      3. this.html_usage_returns()
         *  3. this.method_properties_events()
         */
        html_usage_interface(): void;

        /**
         * Five methods that exclusively delegate to this.html_usage_interface
         */
        html_usage_service(): void;
        html_usage_constant(): void;
        html_usage_object(): void;
        html_usage_type(): void;
        html_usage_controller(): void;

        /**
         * Workflow is as follows:
         *  1. If this.methods is not empty, puts a div with class "member method". Inside it:
         *      1. < h >Methods< /h >. Begins iteration over this.methods. For each one:
         *      2. Set "View source" if this.options.sourceLink is set
         *      3. Set a header containing method signature   (My custom code puts classes .public, .private, .deprecated in this header)
         *      4. Inside header "callback", list Dependencies taken from this.requires (Dependencies is custom code)
         *      5. Still inside, calls method.html_usage_parameters(), method.html_usage_this() and method.html_usage_returns()
         *      6. Still inside, sets header "Example" whose content is set to be method.example
         *  2. If this.properties is not empty, puts a div with class "member property". Inside it:
         *      1. < h >Properties< /h >. Begins iterarion over this.properties. For each one:
         *      2. Sets header with property name (My custom code puts classes .public, .private, .deprecated in this header)
         *      3. As a callback to the header, puts property type+description (table), then calls property.html_usage_returns(),
         *            then sets header "Example" with content bound to this.example
         *  3. If this.events is not empty, process it as well. I am not interested in this part...
         */
        method_properties_events(): void;


    }

    /**
     * When Docs are generated, everything that has "@ngdoc something" becomes a Doc,
     * including things that should not (like @ngdoc property, @ngdoc method).
     * "merge" takes an array of such produced Docs, extracting from top level what 
     * should not be top level and reinserting these inside their corresponding parents
     * 
     * Sorts these "should-not-be-top-level" things by name
     */
    export function merge(docs: Array<Doc>): Array<Doc>;

    /**
     * console.logs broken links and anchors
     */
    export function checkBrokenLinks(docs: Array<Doc>, apis: Array<any>, options: KeyValuePairs): void;

    /**
     * Reduces indentation by one level (level is defined by minimum non-zero indentation present),
     * removes leading and trailing empty lines.
     * Return the result
     */
    export function trim(text: string): string;

    /**
     * Outputs a code-like, protractor-functional string, to be used at testing 
     * navigation to all pages created while generating documentation
     */
    export function scenarios(docs: Array<Doc>): string;
}

export = ngdoc;