require('dev-server/lib/main').start({
    babel: {
        include: [/^\/(src|test).*\.js$/, /^\/node_modules\/vcomponent\//, /^\/node_modules\/vtpl\//]
    }
});
