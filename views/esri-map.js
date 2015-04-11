//$(document).ready(() =>
//{
//    require(["esri/map", "dojo/domReady!"], function (Map) {
//    var map = new Map("map", {
//        center: [-118, 34.5],
//        zoom: 8,
//        basemap: "topo"
//    });
//})});
var __decorate = this.__decorate || (typeof Reflect === "object" && Reflect.decorate) || function (decorators, target, key, desc) {
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
define(["require", "exports", "esri/map"], function (require, exports, Map) {
    var EsriMap = (function () {
        function EsriMap() {
        }
        EsriMap.prototype.attached = function () {
            var map = new Map("map", {
                center: [-118, 34.5],
                zoom: 8,
                basemap: "topo"
            });
        };
        return EsriMap;
    })();
    exports.EsriMap = EsriMap;
});
