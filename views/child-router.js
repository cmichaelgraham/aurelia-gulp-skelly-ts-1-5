var __decorate = this.__decorate || (typeof Reflect === "object" && Reflect.decorate) || function (decorators, target, key, desc) {
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = this.__metadata || (typeof Reflect === "object" && Reflect.metadata) || function () { };
define(["require", "exports", "aurelia-router"], function (require, exports, aur) {
    var Welcome = (function () {
        function Welcome(router) {
            this.router = router;
            this.heading = "Child Router";
            router.configure(function (config) {
                config.map([
                    { route: ["", "welcome"], moduleId: "views/welcome", nav: true, title: "Welcome" },
                    { route: "flickr", moduleId: "views/flickr", nav: true },
                    { route: "child-router", moduleId: "views/child-router", nav: true, title: "Child Router" }
                ]);
            });
        }
        Welcome.inject = [aur.Router];
        return Welcome;
    })();
    exports.Welcome = Welcome;
});
