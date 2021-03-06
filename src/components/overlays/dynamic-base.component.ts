
import { Component, ElementRef, EventEmitter, Input, Output, Type, ViewChild } from '@angular/core';
import { ChangeDetectorRef, ComponentFactoryResolver, Renderer2, ViewContainerRef } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

import { WIDGETS } from '../../settings';

@Component({
    selector: 'dynamic-base',
    template: '',
    styles: [''],
})
export class DynamicBaseComponent {
    protected static instance_stack: any = {};

    @Input() public id: string = '';
    @Input() public model: any = {};
    @Input() public cmp_ref: any = null;
    @Input() public parent: any = null;
    @Input() public rendered: boolean = false;
    @Output() public events: any = new EventEmitter();
    public box: any = null;

    protected static internal_state: any = {};
    protected sub: any = null;
    protected uid: string = '';
    protected state: any = {};
    protected stack_id: string = '';
    protected type = 'Dynamic';

    @ViewChild('body') protected body: ElementRef;
    @ViewChild('content', { read: ViewContainerRef }) private _content: ViewContainerRef;

    constructor(private _cfr: ComponentFactoryResolver, protected _cdr: ChangeDetectorRef, public renderer: Renderer2) {
        this.stack_id = Math.floor(Math.random() * 89999999 + 10000000).toString();
    }

    public ngOnInit() {
        if (!DynamicBaseComponent.internal_state[this.type]) {
            DynamicBaseComponent.internal_state[this.type] = new BehaviorSubject('');
        }
        this.renderer.listen('window', 'resize', () => { this.resize(); });
        if (!DynamicBaseComponent.instance_stack[this.type]) {
            DynamicBaseComponent.instance_stack[this.type] = [];
        }
        DynamicBaseComponent.instance_stack[this.type].push(this.stack_id);
        DynamicBaseComponent.internal_state[this.type].next(this.stack_id);
        this.state.sub = new Subject();
        this.state.obs = this.state.sub.asObservable();
        this.listenState();
        setTimeout(() => {
            this.init();
            this.model.initialised = true;
            this._cdr.markForCheck();
        }, 300);
    }

    public init(parent?: any, id?: string) {
        this.parent = parent || this.parent;
        this.id = id || this.id;
    }

    public ngAfterViewInit() {
        setTimeout(() => {
            this.initBox();
        }, 300);
    }

    public listenState(tries: number = 0) {
        if (tries > 10) { return; };
        if (DynamicBaseComponent.internal_state[this.type]) {
            this.sub = DynamicBaseComponent.internal_state[this.type]
                .subscribe((value: any) => {
                    this.updateState(value);
                });
        } else {
            setTimeout(() => {
                this.listenState(++tries);
            }, 300);
        }
    }

    public initBox(tries: number = 0) {
        if (tries > 5) { return; }
        if (this.body && this.body.nativeElement) {
            this.box = this.body.nativeElement.getBoundingClientRect();
        } else {
            setTimeout(() => {
                this.initBox(++tries);
            }, 300 * ((tries / 2) + 1));
        }
    }

    public ngOnDestroy() {
        if (this.cmp_ref) {
            this.cmp_ref.destroy();
            this.cmp_ref = null;
        }
        if (this.sub) {
            this.sub.unsubscribe();
        }
        const index = DynamicBaseComponent.instance_stack[this.type] ? DynamicBaseComponent.instance_stack[this.type].indexOf(this.stack_id) : -1;
        if (index >= 0) {
            DynamicBaseComponent.instance_stack[this.type].splice(index, 1);
            if (DynamicBaseComponent.internal_state[this.type]) {
                const length = DynamicBaseComponent.instance_stack[this.type].length;
                DynamicBaseComponent.internal_state[this.type].next(
                    DynamicBaseComponent.instance_stack[this.type][length - 1]
                );
            }
        }
    }

    public updateState(state: any) {

    }

    public tap() {
        WIDGETS.log('DYN_BASE', `Tap called on component ${this.id}`);
        this.model.tapped = true;
        setTimeout(() => {
            this.model.tapped = false;
        }, 300);
    }

    public close(e?: any) {
        setTimeout(() => {
            if (e && this.body && this.body.nativeElement && this.model.initialised) {
                if (e.touches && e.touches.length > 0) {
                    e = e.touches[0];
                }
                const c = { x: e.clientX || e.pageX, y: e.clientY || e.pageY };
                this.initBox();
                if (this.box) {
                    if (c.x < this.box.left || c.y < this.box.top ||
                        c.x > this.box.left + this.box.width || c.y > this.box.top + this.box.height) {

                        this.model.show = false;
                        // WIDGETS.log('DYN_BASE', `Closing component ${this.id} from external click.`);
                        this.event('close', 'Outside');
                    }
                }
            }
        }, 200);
    }
    /**
     * Posts an event to the Observable.
     * @param  {string}    type Type of event that has occured
     * @param  {string =    'Code'}    location Location that the event has come from
     * @return {void}
     */
    public event(type: string, location: string = 'Code') {
        setTimeout(() => {
            if (this.cmp_ref) {
                this.model.data = this.cmp_ref.instance.model;
            }
            if (type.toLowerCase() !== 'close') {
                WIDGETS.log('DYN_BASE', `Event on component ${this.id} of type '${type}' from '${location.toLowerCase()}'`);
            }
            const event = {
                id: this.id,
                type,
                location,
                data: this.model.data,
                update: (form: any) => { this.set({ data: form }); },
                close: () => {
                    console.log('Close:', this.uid, ',', `${this.id}|${this.model.cmp.name}`)
                    this.parent.remove(this.uid || `${this.id}|${this.model.cmp.name}`);
                },
            };
            this.events.emit(event);
            if (this.state.sub) {
                this.state.sub.next(event);
            } else {
                WIDGETS.log('DYN_BASE', `Event observable was deleted before overlay's event could occur.`, null, 'warn');
                this.remove();
            }
        }, 20);
    }

    public subscribe(next: () => void, error?: () => void, complete?: () => void) {
        return this.watch(next, error, complete);
    }

    public watch(next: () => void, error?: () => void, complete?: () => void) {
        if (this.state.obs) {
            return this.state.obs.subscribe(next, error, complete);
        } else {
            return null;
        }
    }

    public resize() {
        this.box = null;
        this.initBox();
    }

    public set(data: any) {
        this.update(data);
    }

    protected update(data: any) {
        const cmp = this.model.cmp;
        data.container = this.parent ? this.parent.id : 'root';
        for (const f in data) {
            if (data.hasOwnProperty(f)) {
                this.model[f] = data[f];
            }
        }
        if (cmp !== this.model.cmp || !this.cmp_ref) {
            this.render();
        } else {
            this.updateComponent(data);
        }
        this._cdr.markForCheck();
    }

    protected updateComponent(data: any, tries: number = 0) {
        if (tries > 10) { return; }
        if (this.cmp_ref) {
            this.cmp_ref.instance.set(data);
        } else {
            tries++;
            setTimeout(() => {
                this.updateComponent(data, tries);
            }, 200 * tries);
        }
    }

    protected remove() {
        if (this.parent) {
            this.parent.remove(this.id);
        }
    }

    /**
     * Resolves the factory, then creates the content component
     * @return {void}
     */
    private render(tries: number = 0) {
        if (tries > 10) {
            return WIDGETS.error('DYN_BASE', 'No component/template set to render ', [this.id, this.model.cmp]);
        }
        this.rendered = false;
        if (!this._cfr || !this._content) {
            return setTimeout(() => this.render(++tries), 200);
        }
        if (this.model.cmp) {
            setTimeout(() => {
                const factory = this._cfr.resolveComponentFactory(this.model.cmp);
                if (factory) {
                    if (this.cmp_ref) {
                        this.cmp_ref.destroy();
                    }
                    this.cmp_ref = this._content.createComponent(factory);

                    // Inject data into component instance
                    const inst = this.cmp_ref.instance;
                    inst.set(this.model.data);
                    inst.parent = this;
                    if (!inst.model) {
                        inst.model = {};
                    }
                    if (!inst.fn) {
                        inst.fn = {};
                    }
                    inst.fn.close = (cb: () => void) => { this.event('close', 'Component'); };
                    inst.fn.event = (option: string) => { this.event(option, 'Component'); };
                    // WIDGETS.log('DYN_BASE', `Created component with id '${this.id}'`);
                    setTimeout(() => {
                        if (inst.init) {
                            inst.init();
                        }
                        setTimeout(() => {
                            this.rendered = true;
                            this.resize();
                        }, 20);
                    }, 50);
                } else {
                    WIDGETS.error('DYN_BASE', 'Unable to find factory for: ', this.model.cmp.name);
                }
            }, 10);
        } else if (!this.model.template) {
            setTimeout(() => this.render(++tries), 200);
        }
    }
}