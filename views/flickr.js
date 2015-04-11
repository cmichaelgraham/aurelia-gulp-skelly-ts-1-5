var __decorate = this.__decorate || (typeof Reflect === "object" && Reflect.decorate) || function (decorators, target, key, desc) {
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = this.__metadata || (typeof Reflect === "object" && Reflect.metadata) || function () { };
define(["require", "exports", 'aurelia-framework', 'aurelia-http-client'], function (require, exports, aurelia_framework_1, aurelia_http_client_1) {
    var Flickr = (function () {
        function Flickr(http) {
            this.heading = 'Flickr';
            this.images = [];
            this.url = 'http://api.flickr.com/services/feeds/photos_public.gne?tags=rainier&tagmode=any&format=json';
            this.http = http;
        }
        Flickr.prototype.activate = function () {
            var _this = this;
            return this.http.jsonp(this.url).then(function (response) {
                _this.images = response.content.items;
            });
        };
        Flickr.prototype.canDeactivate = function () {
            return confirm('Are you sure you want to leave?');
        };
        Flickr = __decorate([
            aurelia_framework_1.inject(aurelia_http_client_1.HttpClient), 
            __metadata('design:paramtypes', [Object])
        ], Flickr);
        return Flickr;
    })();
    exports.Flickr = Flickr;
});
