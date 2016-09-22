import { Component, Pipe, Input, Output, EventEmitter, ElementRef} from '@angular/core';
import { ViewChild, ContentChildren, QueryList, AfterContentInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { TabBody } from './tab-body.component';
import { TabHead } from './tab-head.component';

@Pipe({name: 'safe'})
export class SafePipe {
  constructor(private sanitizer:DomSanitizer){
    this.sanitizer = sanitizer;
  }

  transform(style) {
    return this.sanitizer.bypassSecurityTrustHtml(style);
  }
}

@Component({
    selector: 'tab-group',
    templateUrl: './tabs.template.html',
    styles: [ require('./tabs.styles.scss') ]
})
export class TabGroup implements AfterContentInit  {

    @Input() state: string = '0';
    @Input() routable: string = ''; // Search, Query, Hash, Route
    @Input() routeParam: string = 'tab'; //
    @Input() cssClass: string = 'default';
    @Output() stateChange = new EventEmitter();

    //*
        //Toggle Knob
    @ContentChildren(TabHead) tabHeaders: QueryList<TabHead>;
    @ContentChildren(TabBody) tabBodies: QueryList<TabBody>;

    active: TabBody;
    rvalue: string;
    qvalue: string;
    hvalue: string;

    constructor(private loc : Location, private route: ActivatedRoute, private _router: Router){
        this.route.params.map(params => params[this.routeParam]).subscribe(params => {
            this.rvalue = params;
        })
        this.processRoute();
    }

    ngAfterContentInit(){
        this.initElements();
        if(this.routableValid()) {
                // Get Route Value
            setTimeout(() => {
                if(this.routeValue && this.routeValue !== this.state) this.setActiveTab(this.routeValue);
            }, 100);
        }
    }

    processRoute() {
        let path = this.loc.path();
        if(path.indexOf('?') >= 0) {
            let query = path.substring(path.indexOf('?')+1, path.length);
            let q = query.split('&');
            for(var i in q){
                let param = q[i].split('=');
                if(param[0] === this.routeParam) {
                    this.qvalue = param[1];
                    break;
                }
            }
        } else if(path.indexOf('#') >= 0) {
            let hash = path.substring(path.indexOf('#')+1, path.length);
            let h = hash.split('&');
            for(var i in h){
                let param = h[i].split('=');
                if(param[0] === this.routeParam) {
                    this.hvalue = param[1];
                    break;
                }
            }

        }
    }

    get routeValue() {
        let value = '';
        switch(this.routable.toLowerCase()) {
            case 'query':
            case 'search':
                value = this.qvalue;
                break;
            case 'hash':
                value = this.hvalue;
                break;
            case 'route':
                value = this.rvalue;
                break;
        }
        return value;
    }


    routableValid() {
        return this.routable &&
                (this.routable.toLowerCase() === 'search' ||
                 this.routable.toLowerCase() === 'query' ||
                 this.routable.toLowerCase() === 'hash' ||
                 this.routable.toLowerCase() === 'route' );
    }

    initElements(){
            // Setup Tabs Header
        if(!this.state){
            if(this.tabHeaders.first) this.state = this.tabHeaders.first.id;
        }
            //Setup active tab
        this.setActiveTab(this.state, true);
    }

    setActiveTab(id, init:boolean = false) {
        this.state = id;

        let tabs = this.tabHeaders.toArray();
        for(let i = 0; i < this.tabHeaders.length; i++){
            if(tabs[i].id === id) tabs[i].active();
            else tabs[i].inactive();
        }
        let content = this.tabBodies.toArray();
        for(let i = 0; i < this.tabBodies.length; i++){
            if(content[i].id === id) this.active = content[i];
            else content[i].hide();
        }
        if(this.active) {
            this.active.show();
        }
        this.stateChange.emit(this.state);
        if(this.routableValid() && !init){
            this.updateRouteValue();
        }
    }

    updateRouteValue() {
        let route = this.loc.path();
        if(this.routable.toLowerCase() === 'route') {
            route = route.replace('/' + this.rvalue, '/' + this.state);
            this.rvalue = this.state;
        } else if(this.routable.toLowerCase() === 'query' || this.routable.toLowerCase() === 'search') {
            route = route.replace(this.routeParam + '=' + this.qvalue, this.routeParam + '=' + this.state);
        } else if(this.routable.toLowerCase() === 'hash') {
            route = route.replace(this.routeParam + '=' + this.hvalue, this.routeParam + '=' + this.state);
        }
        this.loc.replaceState(route);
        this.processRoute();
    }

}