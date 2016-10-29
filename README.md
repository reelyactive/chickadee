chickadee
=========


A contextual associations store and API for the IoT
---------------------------------------------------

chickadee is a contextual associations store.  Specifically, it associates wireless device identifiers with a URL and/or a tag.  In other words it maintains, for instance, the link between your wireless device and your online stories so that physical spaces which detect your device can understand what you're sharing about yourself.  As of version 0.4.0, chickadee uses [Sniffypedia](http://sniffypedia.org) for all implicit associations.  It also allows logical groupings of devices to share a common tag such as "lounge", for instance, to represent the sensor devices in a lounge, and "friends", for instance, to represent the devices carried by a group of friends.

chickadee is also a contextual API for the IoT.  It binds to an instance of [barnacles](https://www.npmjs.com/package/barnacles) which provides the current state.  It supports queries regarding the context _at_ or _near_ either a device ID or a tag.  Continuing with the example above, it supports queries such as what is the _contextat_ the lounge, as well as what is the _contextnear_ the friends.

### In the scheme of Things (pun intended)

The [barnowl](https://www.npmjs.com/package/barnowl), [barnacles](https://www.npmjs.com/package/barnacles), [barterer](https://www.npmjs.com/package/barterer) and chickadee packages all work together as a unit, conveniently bundled as [hlc-server](https://www.npmjs.com/package/hlc-server).  Check out [API overview](http://context.reelyactive.com/api.html#contextual) as well as our [developer page](http://reelyactive.github.io/) for more resources on reelyActive software and hardware.


![chickadee logo](http://reelyactive.github.io/chickadee/images/chickadee-bubble.png)


What's in a name?
-----------------

The [Cornell Lab of Ornithology explains](http://www.allaboutbirds.org/guide/black-capped_chickadee/lifehistory): "The Black-Capped Chickadee hides seeds and other food items to eat later. Each item is placed in a different spot and the chickadee can remember thousands of hiding places."  Not only does it have an outstanding associative memory, it is also "almost universally considered _cute_ thanks to its oversized round head, tiny body, and curiosity about everything, including humans."

If you were entrusting a bird to associate your wireless device with your online stories you'd want it to be cute and friendly enough to eat out of your hand, right?  We could have named this package [Clark's Nutcracker](http://www.allaboutbirds.org/guide/clarks_nutcracker/lifehistory), the bird with arguably the best associative memory, but the whole nut-cracking thing doesn't inspire the same level of friendliness now does it?

One more fun fact that we feel compelled to pass along: "Every autumn Black-capped Chickadees allow brain neurons containing old information to die, replacing them with new neurons so they can adapt to changes in their social flocks and environment even with their tiny brains."  Wow, that's database efficiency that we can aspire to!


Installation
------------

    npm install chickadee


Hello chickadee, barnacles & barnowl
------------------------------------

```javascript
var chickadee = require('chickadee');
var barnacles = require('barnacles');
var barnowl = require('barnowl');

var associations = new chickadee();
var notifications = new barnacles();
var middleware = new barnowl();

middleware.bind( { protocol: 'test', path: 'default' } );
notifications.bind( { barnowl: middleware } );
associations.bind( { barnacles: notifications } );
```

When the above is run, you can query the _contextat_ a given (receiving) device, and the _contextnear_ a given (transmitting) device:
- [http://localhost:3004/contextat/receiver/001bc50940800000](http://localhost:3004/contextat/receiver/001bc50940800000)
- [http://localhost:3004/contextnear/transmitter/fee150bada55](http://localhost:3004/contextnear/transmitter/fee150bada55)

A _test_ tag is provided by default for the four simulated test reelceivers, present when [barnowl](https://www.npmjs.com/package/barnowl) is bound to the test protocol, and can be queried at [http://localhost:3004/contextat/tags/test](http://localhost:3004/contextat/tags/test).


RESTful interactions
--------------------

Include _Content-Type: application/json_ in the header of all interactions in which JSON is sent to chickadee.

### GET /contextat/receiver/{device-id}

Retrieve the context at the given receiver device id. For example, the id _001bc50940800000_ would be queried as GET /contextat/receiver/001bc50940800000 and might return:

    {
      "_meta": {
        "message": "ok",
        "statusCode": 200
      },
      "_links": {
        "self": {
          "href": "http://localhost:3004/contextat/receiver/001bc50940800000"
        }
      },
      "devices": {
        "001bc50940100000": {
          "url": "http://reelyactive.com/metadata/test.json",
          "tags": [],
          "nearest": [
            {
              "device": "001bc50940800000",
              "rssi": 144
            }
          ],
          "href": "http://localhost:3004/associations/001bc50940100000"
        },
        "001bc50940800000": {
          "url": "http://reelyactive.com/metadata/ra-rxxx.json",
          "tags": [ "test" ],
          "directory": null,
          "href": "http://localhost:3004/associations/001bc50940800000"
        }
      }
    }

### GET /contextat/directory/{directory}

Retrieve the context at the given directory value.  For example, the directory _forest:tree_ would be queried as GET /contextat/directory/forest:tree and would return data with the same structure as the above.

### GET /contextat/tags/{tags}

Retrieve the context at the given tags.  For example, the tag _test_ would be queried as GET /contextat/tags/test and would return data with the same structure as the above.

### GET /contextnear/transmitter/{device-id}

Retrieve the context near the given transmitter device id. For example, the id 001bc50940100000 would be queried as GET /contextnear/transmitter/001bc50940100000 and might return:

    {
      "_meta": {
        "message": "ok",
        "statusCode": 200
      },
      "_links": {
        "self": {
          "href": "http://localhost:3004/contextnear/transmitter/001bc50940100000"
        }
      },
      "devices": {
        "001bc50940100000": {
          "url": "http://reelyactive.com/metadata/test.json",
          "tags": [],
          "nearest": [
            {
              "device": "001bc50940800000",
              "rssi": 133
            }
          ],
          "href": "http://localhost:3004/associations/001bc50940100000"
        },
        "001bc50940800000": {
          "url": "http://reelyactive.com/metadata/ra-rxxx.json",
          "tags": [ "test" ],
          "directory": null,
          "href": "http://localhost:3004/associations/001bc50940800000"
        }
      }
    }

### GET /contextnear/tags/{tags}

Retrieve the context near the given tags.  For example, the tag _test_ would be queried as GET /contextnear/tags/test and would return data with the same structure as the above.

### GET /associations/{device-id}

Retrieve the association for the device with the given id.  For example the id _001bc50940800000_ would be queried as GET /associations/001bc50940800000 and might return:

    {
      "_meta": {
        "message": "ok",
        "statusCode": 200
      },
      "_links": {
        "self": {
          "href": "http://localhost:3004/associations/001bc50940800000"
        }
      },
      "devices": {
        "001bc50940800000": {
          "url": "http://myjson.info/story/test",
          "directory": "forest:tree",
          "tags": [
            "birdnest"
          ],
          "href": "http://localhost:3004/associations/001bc50940800000"
        }
      }
    }

### PUT /associations/{device-id}

Update or create an association for the given device id.  For example, to update a device with identifier _001bc50940800000_, PUT /associations/001bc50940800000 and include the updated JSON, for example:

    { "url": "http://myjson.info/story/lonely",
      "directory": "forest:tree:branch",
      "tags": [ "birdnest", "home" ] }

A successful response might return:

    {
      "_meta": {
        "message": "ok",
        "statusCode": 200
      },
      "_links": {
        "self": {
          "href": "http://localhost:3004/associations/001bc50940800000"
        }
      },
      "devices": {
        "001bc50940800000": {
          "url": "http://myjson.info/story/lonely",
          "directory": "forest:tree:branch",
          "tags": [
            "birdnest",
            "home"
          ],
          "href": "http://localhost:3004/associations/001bc50940800000"
        }
      }
    }

If the device id does not already exist, it will be created.

### DELETE /associations/{device-id}

Delete a given device association.

### GET /associations/{device-id}/url

### GET /associations/{device-id}/directory

### GET /associations/{device-id}/tags

Identical to GET /associations/id except that only the url, directory or tags is returned, respectively.

### PUT /associations/{device-id}/url

### PUT /associations/{device-id}/directory

### PUT /associations/{device-id}/tags

Identical to PUT /associations/id except that only the url, directory or tags is updated, respectively.

### DELETE /associations/{device-id}/url

### DELETE /associations/{device-id}/directory

### DELETE /associations/{device-id}/tags

Identical to DELETE /associations/id except that only the url, directory or tags is deleted, respectively.


Implicit Associations
---------------------

As of version 0.4.0, all implicit associations are external to chickadee at [sniffypedia.org](http://sniffypedia.org).  Anyone can [contribute associations](http://sniffypedia.org/contribute/) to that project, which will subsequently be integrated in chickadee via the [sniffypedia package](https://www.npmjs.com/package/sniffypedia).


Where to bind?
--------------

### barnacles

[barnacles](https://www.npmjs.com/package/barnacles) provides the current state.  In the absence of a barnacles binding, chickadee will always return a 404 Not Found status.  chickadee can bind to a single instance of barnacles only.

```javascript
associations.bind( { barnacles: notifications } );
```


Options
-------

The following options are supported when instantiating chickadee (those shown are the defaults):

    {
      httpPort: 3004,
      associationManager: null,
      persistentDataFolder: "data",
      associationsRootUrl: "https://sniffypedia.org/"
    }

Notes:
- persistentDataFolder specifies the path to the folder which contains the persistent database file (before v0.3.12 the default was "")


What's next?
------------

This is an active work in progress.  Expect regular changes and updates, as well as improved documentation!  If you're developing with chickadee check out:
* [diyActive](http://reelyactive.github.io/) our developer page
* our [node-style-guide](https://github.com/reelyactive/node-style-guide) and [angular-style-guide](https://github.com/reelyactive/angular-style-guide) for development
* our [contact information](http://context.reelyactive.com/contact.html) to get in touch if you'd like to contribute


License
-------

MIT License

Copyright (c) 2015-2016 reelyActive

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
THE SOFTWARE.

