/**
* @Author: Alex Sorafumo
* @Date:   13/10/2016 11:13 AM
* @Email:  alex@yuion.net
* @Filename: keys.pipe.ts
* @Last modified by:   Alex Sorafumo
* @Last modified time: 15/12/2016 11:36 AM
*/

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'keys'})
export class KeysPipe implements PipeTransform {
    transform(value: any, args:string[]) : any {
        if (!value) {
            return value;
        }

        let keys: any[] = [];
        for (let key in value) {
            keys.push({key: key, value: value[key]});
        }
        return keys;
    }
}
