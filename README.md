chickadee
=========


A hyperlocal context associations store
---------------------------------------

chickadee is a contextual associations store.  Specifically, it associates wireless device identifiers with either metadata or human-friendly place names.  In other words it maintains, for instance, the link between your wireless device and your online stories so that Smart Spaces which detect your device can understand what you're sharing about yourself.  Why the name?  The [Cornell Lab of Ornithology explains](http://www.allaboutbirds.org/guide/black-capped_chickadee/lifehistory): "The Black-Capped Chickadee hides seeds and other food items to eat later. Each item is placed in a different spot and the chickadee can remember thousands of hiding places."  Not only does it have an outstanding associative memory, it is also "almost universally considered _cute_ thanks to its oversized round head, tiny body, and curiosity about everything, including humans."

If you were entrusting a bird to associate your wireless device with your online stories you'd want it to be cute and friendly enough to eat out of your hand, right?  We could have named this package [Clark's Nutcracker](http://www.allaboutbirds.org/guide/clarks_nutcracker/lifehistory), the bird with arguably the best associative memory, but the whole nut-cracking thing doesn't inspire the same level of friendliness now does it?

One more fun fact that we feel compelled to pass along: "Every autumn Black-capped Chickadees allow brain neurons containing old information to die, replacing them with new neurons so they can adapt to changes in their social flocks and environment even with their tiny brains."  Wow, that's database efficiency that we can aspire to!


Installation
------------

    npm install chickadee


Hello chickadee
---------------

```javascript
var chickadee = require('chickadee');
var associations = new chickadee();
```


RESTful interactions
--------------------

__POST /id__

Create a new device association.  For example, to associate a device with identifier 001bc50940100000 to the url [http://myjson.info/story/test](http://myjson.info/story/test) include the following JSON:

    {
      "identifier": "001bc50940100000",
      "url": "http://myjson.info/story/test"
    }

__POST /at__

Create a new place association.  For example, to associate a place named _test_ to the device identifiers 001bc50940800000 and 001bc50940810000 include the following JSON:

    {
      "place": "test",
      "identifiers": [ "001bc50940800000", "001bc50940810000" ]
    }

__GET /at/place__

Retrieve the association for the given place.  For example, the place named _test_ would return:

    {
      "_meta": {
        "message": "ok",
        "statusCode": 200
      },
      "_links": {
        "self": {
            "href": "http://localhost:3004/at/test"
        }
      },
      "places": {
        "test": {
          "identifiers": [
            "001bc50940800000",
            "001bc50940810000"
          ],
          "href": "http://localhost:3004/at/test"
        }
      }
    }


What's next?
------------

This is an active work in progress.  Expect regular changes and updates, as well as improved documentation!


License
-------

MIT License

Copyright (c) 2015 reelyActive

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
THE SOFTWARE.

