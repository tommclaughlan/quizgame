import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name : 'backwards' })
export class BackwardsPipe implements PipeTransform {
    transform(value : string, capitalise : boolean) : string {
        let result = '';
        let parts = value.replace('?', '').split(' ');
        if (capitalise) {
            parts[0] = parts[0].toLowerCase();
        }
        parts = parts.reverse();
        if (capitalise) {
            parts[0] = parts[0].replace(/^\w/, chr => chr.toUpperCase());
        }
        result = parts.join(' ');
        return result;
    }
}