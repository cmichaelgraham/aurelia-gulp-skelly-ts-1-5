var __decorate = this.__decorate || (typeof Reflect === "object" && Reflect.decorate) || function (decorators, target, key, desc) {
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = this.__metadata || (typeof Reflect === "object" && Reflect.metadata) || function () { };
define(["require", "exports", 'aurelia-framework', 'aurelia-logging-console'], function (require, exports, aurelia_framework_1, aurelia_logging_console_1) {
    aurelia_framework_1.LogManager.addAppender(new aurelia_logging_console_1.ConsoleAppender());
    aurelia_framework_1.LogManager.setLevel(4 /* debug */);
    function configure(aurelia) {
        aurelia.use
            .defaultBindingLanguage()
            .defaultResources()
            .router()
            .eventAggregator();
        // .plugin('./path/to/plugin');
        aurelia.start().then(function (a) { return a.setRoot('views/app', document.body); });
    }
    exports.configure = configure;
});
