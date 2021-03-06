
import { ChangeDetectorRef, Component, Input, Output, OnInit, HostListener } from '@angular/core';

@Component({
    selector: 'overlay-content',
    template: '',
    styles: [''],
})
export class OverlayContentComponent implements OnInit {
    @Input() public id: string = '';    // Overlay ID
    @Input() public name: string = '';    // Overlay ID
    @Input() public model: any = {};    // Overlay data
    @Input() public fn: any = {};       // Overlay interaction functions

    public static className() { return 'OverlayContentComponent'; }
    public className() { return OverlayContentComponent.className; }

    @HostListener('window:resize') public resize() {
        this._cdr.markForCheck();
    }

    constructor(protected _cdr: ChangeDetectorRef) {
        this.id = `overlay-${Math.floor(Math.random() * 8999999 + 1000000)}`;
    }

    public ngOnInit() {
        setTimeout(() => {
            this._cdr.markForCheck();
        }, 300);
    }

    public set(data: any) {
        if (!this.model) {
            this.model = data;
        } else {
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    this.model[key] = data[key];
                }
            }
        }
        this._cdr.markForCheck();
    }
}
