declare namespace dom {
    export function htmlEscape(text: string): string;

    export function normalizeHeaderToId(header: string): string;
    export function normalizeHeaderToId(header: any): '';
    export class DOM {

        /**
         * output of this object (i.e, pure html)
         */
        out: Array<string>;

        /**
         * Used by html() to keep track of which header to produce (h1, or h2...)
         */
        headingDepth: number;

        currentHeaders: any[];

        /**
         * Array of html "id" attributes and < a > element "name" attributes
         * set during lifecycle of an instance of this class (example: an id is 
         * generated for every header)
         */
        anchors: string[];

        /**
         * Concatenates this.out using empty string
         * At this point, the returned string can be readily used in a browser
         */
        toString(): string;

        text(content: string): void;

        /**
         * text(content: any[]): void;
         */
        text(callback: (self: DOM) => void): void;

        /**
         * While processing, it inserts "id" at headers (h1, etc) and collects hrefs inside < a > elements
         */
        html(html: string): void;

        tag(name: string, text: string): void;
        tag(name: string, attributes: HtmlAttributes, text: string): void;
        tag(name: string, attributes: HtmlAttributes, callback: (self: DOM) => void): void;

        code(text: string): void;

        div(text: string): void;
        div(attributes: HtmlAttributes, text: string): void;

        h(heading: string): void;
        /**
         * "content: string[]" produces HTML OUTSIDE the header (after it)
         */
        h(heading: string, content: string[]): void;
        /**
         * "callback" operates on "content" to produce HTML OUTSIDE the header (after it)
         */
        h(heading: string, content: any[], callback: (item: any) => void): void;
        /**
         * "callback"" operates on "content" to generate HTML OUTSIDE the header (after it). This latter content is encapsulated in a div
         */
        h(heading: string, content: KeyValuePairs, callback: (content: KeyValuePairs) => void): void;
        /**
         * "callback" generates HTML OUTSIDE header (after it)
         */
        h(headingGenerator: (self: DOM) => void, callback: (self: DOM) => void): void;
        /**
         * "callback" generates HTML OUTSIDE header (after it)
         */
        h(heading: string, callback: (self: DOM) => void): void;

        /**
         * 4 métodos abaixo acabam não sendo utilizados
         * por esta livraria, apesar de estarem definidos
         * 
         */
        /**
         * h1()
         */
        /**
         * h2()
         */
        /**
         * h3()
         */
        /**
         * p()
         */
        /**
         * ul() has other signatures,
         * but only this is used by the library
         */
        ul(list: string[]): void;


    }

    export interface HtmlAttributes {
        [name: string]: string;
    }

    export interface KeyValuePairs {
        [name: string]: any;
    }
}

export = dom;
