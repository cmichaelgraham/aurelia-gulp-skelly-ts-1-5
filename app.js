var __decorate = this.__decorate || (typeof Reflect === "object" && Reflect.decorate) || function (decorators, target, key, desc) {
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = this.__metadata || (typeof Reflect === "object" && Reflect.metadata) || function () { };
define(["require", "exports", 'aurelia-dependency-injection', 'aurelia-router', 'bootstrap', 'bootstrap/css/bootstrap.css!'], function (require, exports, aurelia_dependency_injection_1, aurelia_router_1, , ) {
    var App = (function () {
        function App(router) {
            this.router = router;
            this.router.configure(function (config) {
                config.title = 'Aurelia';
                config.map([
                    { route: ['', 'welcome'], moduleId: './welcome', nav: true, title: 'Welcome' },
                    { route: 'flickr', moduleId: './flickr', nav: true },
                    { route: 'child-router', moduleId: './child-router', nav: true, title: 'Child Router' }
                ]);
            });
        }
        App = __decorate([
            aurelia_dependency_injection_1.inject(aurelia_router_1.Router), 
            __metadata('design:paramtypes', [Object])
        ], App);
        return App;
    })();
    exports.App = App;
});
