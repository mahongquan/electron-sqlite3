'use strict'
var addon = require('./hello_nodegyp/index')
for(var i in addon)
{
	console.log(i);
}
console.log(addon.add(3,4));
console.log(addon.path)