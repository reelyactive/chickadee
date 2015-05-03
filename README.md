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

Include _Content-Type: application/json_ in the header of all interactions in which JSON is sent to chickadee.

__GET /id?value=identifier__

Retrieve the device association based on the given identifier value.  This can be useful for retrieving the static identifier of a device based on its current cyclic identifier.  For example to retrieve the association related to a Bluetooth Smart device advertising "2c0ffeeb4bed" as a random address you would GET /id?value=2c0ffeeb4bed which would generate a response similar to the following:

    {
      "_meta": {
        "message": "ok",
        "statusCode": 200
      },
      "_links": {
        "self": {
          "href": "http://localhost:3004/id?value=2c0ffeeb4bed"
        }
      },
      "devices": {
        "fee150bada55": {
          "identifier": [
            {
              "type": "ADVA-48",
              "value": "2c0ffeeb4bed",
              "advHeader": {
                "txAdd": "random"
              }
            },
            {
              "type": "ADVA-48",
              "value": "fee150bada55",
              "advHeader": {
                "txAdd": "public"
              }
            }
          ],
          "href": "http://localhost:3004/id/fee150bada55"
        }
      }
    }

__GET /id/id__

Retrieve the device association with the given id.  For example the id _001bc50940100000_ would generate a response similar to the following:

    {
      "_meta": {
        "message": "ok",
        "statusCode": 200
      },
      "_links": {
        "self": {
          "href": "http://localhost:3004/id/001bc50940100000"
        }
      },
      "devices": {
        "001bc50940100000": {
          "identifier": "001bc50940100000",
          "url": "http://myjson.info/story/test",
          "href": "http://localhost:3004/id/001bc50940100000"
        }
      }
    }


__POST /id__

Create a new device association.  For example, to associate a device with identifier 001bc50940100000 to the url [http://myjson.info/story/test](http://myjson.info/story/test) include the following JSON:

    {
      "identifier": "001bc50940100000",
      "url": "http://myjson.info/story/test"
    }

If the static device identifier does not already exist, the association will be created and the response will be similar to the following:

    {
      "_meta": {
        "message": "created",
        "statusCode": 201
      },
      "_links": {
        "self": {
          "href": "http://localhost:3004/id/001bc50940100000"
        }
      },
      "devices": {
        "001bc50940100000": {
          "identifier": "001bc50940100000",
          "url": "http://myjson.info/story/test",
          "href": "http://localhost:3004/id/001bc50940100000"
        }
      }
    }

__PUT /id/id__

Update a device association.  For example, to update a device with identifier 001bc50940100000, PUT /id/001bc50940100000 and include the updated JSON, for example:

    {
      "identifier": "001bc50940100000",
      "url": "http://myjson.info/story/lonely"
    }

If the static device identifier already exists, the association will be updated with the included JSON and the response will be similar to the following:

    {
      "_meta": {
        "message": "ok",
        "statusCode": 200
      },
      "_links": {
        "self": {
          "href": "http://localhost:3004/id/001bc50940100000"
        }
      },
      "devices": {
        "001bc50940100000": {
          "identifier": "001bc50940100000",
          "url": "http://myjson.info/story/lonely",
          "href": "http://localhost:3004/id/001bc50940100000"
        }
      }
    }

If the static device identifier does not already exist, it will be created similar to POST /id.

__DELETE /id/id__

Delete a device association.

__POST /places__

Create a new place.  For example, to create a place named _birdnest_ with two infrastructure devices having ids 001bc50940800000 and 001bc50940810000, and an association with the url [http://myjson.info/story/test](http://myjson.info/story/test) include the following JSON:

    {
      "name": "birdnest",
      "devices": [ { "id": "001bc50940800000", "type": "infrastructure" },
                   { "id": "001bc50940810000", "type": "infrastructure" } ],
      "url": "http://myjson.info/story/test"
    }

__PUT /places/place__

Update a place association.  For example, to update a place named _birdnest_, PUT /places/birdnest and include the updated JSON, for example:

    {
      "devices": [ { "id": "001bc50940800001", "type": "infrastructure" },
                   { "id": "001bc50940810001", "type": "infrastructure" } ]
    }

__GET /places/place__

Retrieve the association for the given place.  For example, the place named _test_ would return:

    {
      "_meta": {
        "message": "ok",
        "statusCode": 200
      },
      "_links": {
        "self": {
            "href": "http://localhost:3004/places/test"
        }
      },
      "places": {
        "test": {
          "devices": [
            { "id": "001bc50940800000", "type": "infrastructure" },
            { "id": "001bc50940810000", "type": "infrastructure" }
          ],
          "href": "http://localhost:3004/places/test"
        }
      }
    }

__DELETE /places/place__

Delete a place.

__PUT /places/place/devices/id__

Update a device associated with the given place.  For example, to add device 001bc50940800000 to a place named _birdnest_, PUT /places/birdnest/devices/001bc50940800000 and include the updated JSON, for example:

    { "device": { "type": "infrastructure" } }

__DELETE /places/place/devices/id__

Delete a device associated with the given place.


Implicit Associations
---------------------

The following implicit associations are supported.  In other words, the implicit _url_ will be provided unless the device is already uniquely associated, via its identifier, with a _url_.  If you're one of the manufacturers below and would like the URL to instead point to an API on your server please [contact us](http://context.reelyactive.com/contact.html).

- reelyActive Active RFID Tag (RA-T411)
    * Identifier Type: EUI-64
    * OUI-36: 001bc5094
    * URL: http://reelyactive.com/metadata/ra-t411.json
    * [Product link](http://shop.reelyactive.com/products/ra-t411)
- reelyActive reelceiver (RA-Rxxx)
    * Identifier Type: EUI-64
    * OUI-36: 001bc5094
    * URL: http://reelyactive.com/metadata/ra-rxxx.json
    * [Product link](http://shop.reelyactive.com/collections/infrastructure)
- reelyActive Bluetooth Smart reelceiver (RA-R436)
    * UUID: 7265656c794163746976652055554944
    * URL: http://reelyactive.com/metadata/ra-r436.json
    * [Product link](http://shop.reelyactive.com/products/ra-r436)
- Fitbit
    * UUID: adabfb006e7d4601bda2bffaa68956ba
    * URL: http://reelyactive.com/metadata/fitbit.json
    * [Product link](http://www.fitbit.com/)
- WNDR app
    * UUID: 2f521f8c4d6f12269c600050e4c00067
    * [Product link](https://itunes.apple.com/ca/app/wndr/id891132023)
- Thalmic Labs Myo
    * UUID: d5060001a904deb947482c7f4a124842
    * URL: http://reelyactive.com/metadata/myo.json
    * [Product link](https://www.thalmic.com/en/myo/)
- Punch Through Design Bean
    * UUID: a495ff10c5b14b44b5121370f02d74de
    * URL: http://reelyactive.com/metadata/bean.json
    * [Product link](https://punchthrough.com/bean/)
- TrackR
    * UUID: 0f3e
    * URL: http://reelyactive.com/metadata/trackr.json
    * [Product link](http://thetrackr.com/)
- Nod (OpenSpatial)
    * UUID: febf
    * URL: http://reelyactive.com/metadata/nod.json
    * [Product link](https://www.hellonod.com/)
- Physical Web (Google)
    * UUID: fed8
    * URL: Parsed from UriBeacon service data
    * [Product link](http://physical-web.org/)
- Seed Labs
    * UUID: fee6
    * URL: http://reelyactive.com/metadata/seedlabs.json
    * [Product link](http://seedlabs.io/)
- Tile
    * UUID: feed
    * URL: http://reelyactive.com/metadata/tile.json
    * [Product link](http://thetileapp.com/)
- Estimote beacon
    * iBeacon UUID: b9407f30f5f8466eaff925556b57fe6d
    * URL: http://reelyactive.com/metadata/estimote.json
    * [Product link](http://estimote.com/#jump-to-products)
- Roximity beacon
    * iBeacon UUID: 8deefbb9f7384297804096668bb44281
    * URL: http://reelyactive.com/metadata/roximity.json
    * [Product link](http://roximity.com/)
- LocosLab beacon
    * iBeacon UUID: f0018b9b75094c31a9051a27d39c003c
    * URL: http://reelyactive.com/metadata/locoslab.json
    * [Product link](http://www.locoslab.com/)
- Apple devices
    * companyIdentifierCode: 004c
    * URL: http://reelyactive.com/metadata/apple.json
- Gimbal devices
    * companyIdentifierCode: 008c
    * URL: http://reelyactive.com/metadata/gimbal.json
- Curious devices (any SCAN_REQ)
    * URL: http://reelyactive.com/metadata/curious.json
- Bluetooth Smart devices (anything else which is Bluetooth Smart)
    * URL: http://reelyactive.com/metadata/bluetoothsmart.json


Options
-------

The following options are supported when instantiating chickadee (those shown are the defaults):

    {
      httpPort: 3004,
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

