import { KeyValuePairs } from './dom';
import { Doc } from './ngdoc';
declare namespace reader {
    
    /**
     * Receives a file "file" whose content "content" is located in section "section"
     * (examples:  "api", "guide") of the intended documentation.
     * 
     * Builds this.docs
     */
    export function process(content: string, file: string, section: string, options: KeyValuePairs): void;

    export let docs: Array<Doc>;

}