# aurelia-sample-bug

Illustration of a dojo amd issue loading aurelia

## gulp-based sample

the issue is that `aurelia-templating/custom-element` is loaded properly for the following locations:

1. [gets defined ok](https://github.com/cmichaelgraham/aurelia-sample-bug/blob/master/scripts/aurelia/aurelia-bundle.js#L11625) - looks good at the end of this method - is on the exports object
2. [imports properly here](https://github.com/cmichaelgraham/aurelia-sample-bug/blob/master/scripts/aurelia/aurelia-bundle.js#L11857)
3. [and here](https://github.com/cmichaelgraham/aurelia-sample-bug/blob/master/scripts/aurelia/aurelia-bundle.js#L12018)
4. but not [here](https://github.com/cmichaelgraham/aurelia-sample-bug/blob/master/scripts/aurelia/aurelia-bundle.js#L11176)

but then something happens that makes it try to load from the root (which i believe is like it was removed from the define list in memory or something like that.

1. run `git bash` shell
3. run `npm install`
4. run `gulp serve`
5. run chrome browser and point at `http://localhost:9000`
6. choose the release link
7. F12 for dev tools
8. You should see this:

![new aurelia bug](https://cloud.githubusercontent.com/assets/10272832/6877029/cc985106-d492-11e4-8293-37856deeb58b.jpg)



## Contributing

We'd love for you to contribute to our source code and to make this project even better than it is today! If this interests you, please begin by reading [our contributing guidelines](https://github.com/DurandalProject/about/blob/master/CONTRIBUTING.md). The contributing document will provide you with all the information you need to get started. Once you have read that, you will need to also [sign our CLA](http://goo.gl/forms/dI8QDDSyKR) before we can accepts a Pull Request from you. More information on the process is including in the [contributor's guide](https://github.com/DurandalProject/about/blob/master/CONTRIBUTING.md).
