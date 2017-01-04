import { KeyValuePairs } from './dom';
import { Doc } from './ngdoc';
declare namespace reader {
    
    /**
     * Receives a file ("file") whise content is "content" is located in section "section"
     * (examples:  "api", "guide") of the intended documentation.
     * 
     * Builds the "docs" variable declared below
     */
    export function process(content: string, file: string, section: string, options: KeyValuePairs): void;

    export let docs: Array<Doc>;

}