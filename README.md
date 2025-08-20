chickadee
=========

__chickadee__ is a contextual associations store and [hyperlocal context](https://www.reelyactive.com/context/) API for [Pareto Anywhere](https://www.reelyactive.com/pareto/anywhere/) open source IoT middleware.

![Overview of chickadee](https://reelyactive.github.io/chickadee/images/overview.png)

Specifically, __chickadee__ associates wireless device identifiers with metadata such as a URL, a tag, a directory, and/or a position.  Additionally, it provides a contextual API when coupled with live data from a [barnacles](https://github.com/reelyactive/barnacles/) instance and optional [chimps](https://github.com/reelyactive/chimps/) instance.  And finally, it provides an API to store and retrieve GeoJSON features.   __chickadee__ can run standalone, although it is usually run together with its peer modules.


Installation
------------

    npm install chickadee


Hello chickadee!
----------------

    npm start

Browse to [localhost:3001/associations/001bc50940810000/1](http://localhost:3001/associations/001bc50940810000/1) to see if there are any associations for the device with EUI-64 identifier 00-1b-c5-09-40-81-00-00.  By default, this should return Not Found.  Interact with __chickadee__ through the REST API described below.


REST API
--------

__chickadee__'s REST API includes the following three base routes:
- /associations _for retrieving/specifying metadata associations with devices_
- /context _for retrieving the context of specific devices_
- /features _for retrieving/specifying GeoJSON features_


### GET /associations[?]

Retrieve all associations, with optional query string.

#### Example request

| Method | Route         | Content-Type     |
|:-------|:--------------|:-----------------|
| GET    | /associations | application/json |

#### Example response

    {
      "_meta": {
        "message": "ok",
        "statusCode": 200
      },
      "_links": {
        "self": {
          "href": "http://localhost:3001/associations"
        }
      },
      "associations": {
        "001bc50940810000/1": {},
        "001bc50940820000/1": {}
      }
    }

By default, each association will be returned as an empty object.  To include one or more association properties, use a query string as specified below.

#### Query strings

The following query string parameters are supported:
- tag _to filter on a specific tag_
- directory _to filter on a specific directory_
- include _to include a specific property in each returned association_

For example GET /associations?tag=animal&include=url would return all associations with "animal" among their tags, and include _only_ the url property, if any, of each association.

It is possible to search on multiple tag, directory and include parameters, for instance GET /associations?tag=new&tag=improved would return all associations with either "new", "improved", or both, among their tags.

The directory parameter is hierarchical.  For instance GET /associations?directory=parc would return associations with directory "parc", "parc:office", "parc:lounge", and so on.


### GET /associations/{id}/{type}

Retrieve the associations for the given device _id_ and _type_.

#### Example request

| Method | Route                            | Content-Type     |
|:-------|:---------------------------------|:-----------------|
| GET    | /associations/001bc50940810000/1 | application/json |

#### Example response

    {
      "_meta": {
        "message": "ok",
        "statusCode": 200
      },
      "_links": {
        "self": {
          "href": "http://localhost:3001/associations/001bc50940810000/1"
        }
      },
      "associations": {
        "001bc50940810000/1": {
          "url": "https://www.reelyactive.com",
          "directory": "parc:office",
          "tags": [ "new", "improved" ],
          "position": [ 0.0, 0.0 ]
        }
      }
    }

#### Single-property routes

The following routes are also supported:
- GET /associations/{id}/{type}/url
- GET /associations/{id}/{type}/directory
- GET /associations/{id}/{type}/tags
- GET /associations/{id}/{type}/position

In each case, the response is as above, but includes only the property specified by the route.


### PUT /associations/{id}/{type}

Replace, or create, the associations for the given device _id_ and _type_.

#### Example request

| Method | Route                            | Content-Type     |
|:-------|:---------------------------------|:-----------------|
| PUT    | /associations/001bc50940810000/1 | application/json |

    {
      "url": "https://www.reelyactive.com",
      "directory": "parc:office",
      "tags": [ "new", "improved" ],
      "position": [ 0.0, 0.0 ]
    }

#### Example response

    {
      "_meta": {
        "message": "ok",
        "statusCode": 200
      },
      "_links": {
        "self": {
          "href": "http://localhost:3001/associations/001bc50940810000/1"
        }
      },
      "associations": {
        "001bc50940810000/1": {
          "url": "https://www.reelyactive.com",
          "directory": "parc:office",
          "tags": [ "new", "improved" ],
          "position": [ 0.0, 0.0 ]
        }
      }
    }

#### Single-property routes

The following routes are also supported:
- PUT /associations/{id}/{type}/url
- PUT /associations/{id}/{type}/directory
- PUT /associations/{id}/{type}/tags
- PUT /associations/{id}/{type}/position

In each case, the request and response are as above, however only the property specified by the route will be considered in the request.


### DELETE /associations/{id}/{type}

Remove the associations for the given device _id_ and _type_.

#### Example request

| Method | Route                            | Content-Type     |
|:-------|:---------------------------------|:-----------------|
| DELETE | /associations/001bc50940810000/1 | application/json |

#### Example response

    {
      "_meta": {
        "message": "ok",
        "statusCode": 200
      },
      "_links": {
        "self": {
          "href": "http://localhost:3001/associations/001bc50940810000/1"
        }
      }

#### Single-property routes

The following routes are also supported:
- DELETE /associations/{id}/{type}/url
- DELETE /associations/{id}/{type}/directory
- DELETE /associations/{id}/{type}/tags
- DELETE /associations/{id}/{type}/position

In each case, the response is as above.


### GET /context[?]

Retrieve the context of all active devices, with optional query string.

#### Example request

| Method | Route    | Content-Type     |
|:-------|:---------|:-----------------|
| GET    | /context | application/json |

#### Example response

    {
      "_meta": {
        "message": "ok",
        "statusCode": 200
      },
      "_links": {
        "self": {
          "href": "http://localhost:3001/context"
        }
      },
      "devices": {
        "fee150bada55/2": {
          "nearest": [
            {
              "device": "001bc50940810000/1",
              "rssi": -72
            },
            {
              "device": "001bc50940820000/1",
              "rssi": -85
            }
          ],
          "dynamb": {
            "timestamp": 1624714123456,
            "batteryPercentage": 67,
            "acceleration": [ -0.15625, -0.94921875, 0.109375 ]
          },
          "spatem": {
            "timestamp": 1624714123456,
            "type": "position",
            "data": {
              "type": "FeatureCollection",
              "features": [
                {
                  "type": "Feature",
                  "properties": {
                    "isDevicePosition": true,
                    "positioningEngine": "External"
                  },
                  "geometry": {
                    "type": "Point",
                    "coordinates": [ -73.57123, 45.50883 ]
                  }
                }
              ]
            }
          },
          "statid": {
            "uuids": [ "feaa" ],
            "uri": "https://sniffypedia.org/Product/Google_Eddystone/",
            "deviceIds": [ "7265656c652055554944/000000000d09" ]
          },
          "url": "https://www.reelyactive.com/team/obelix/",
          "tags": [ "animal" ]
        },
        "001bc50940810000/1": {
          "directory": "parc:office",
          "tags": [ "reelceiver" ]
        },
        "001bc50940820000/1": {
          "directory": "parc:lounge",
          "tags": [ "OiO" ]
        }
      }
    }

#### Query strings

The following query string parameters are supported, in order of precedence:
- format _to format the returned JSON a specific way_ (see [Format Options](#format-options))
- include _to include only a specific property in each returned device_

For example GET /context?include=dynamb would return all devices, and include _only_ the dynamb property, if any, of each device.

It is possible to query on multiple include parameters, for instance GET /context?include=nearest&include=directory would include either, or both, the nearest and directory properties, of each device.


### GET /context/device/{id}/{type}[?]

Retrieve the context of the active device with the given _id_ and _type_, with optional query string.

#### Example request

| Method | Route                          | Content-Type     |
|:-------|:-------------------------------|:-----------------|
| GET    | /context/device/fee150bada55/2 | application/json |

#### Example response

    {
      "_meta": {
        "message": "ok",
        "statusCode": 200
      },
      "_links": {
        "self": {
          "href": "http://localhost:3001/context/device/fee150bada55/2"
        }
      },
      "devices": {
        "fee150bada55/2": {
          "nearest": [
            {
              "device": "001bc50940810000/1",
              "rssi": -72
            },
            {
              "device": "001bc50940820000/1",
              "rssi": -85
            }
          ],
          "dynamb": {
            "timestamp": 1624714123456,
            "batteryPercentage": 67,
            "acceleration": [ -0.15625, -0.94921875, 0.109375 ]
          },
          "spatem": {
            "timestamp": 1624714123456,
            "type": "position",
            "data": {
              "type": "FeatureCollection",
              "features": [
                {
                  "type": "Feature",
                  "properties": {
                    "isDevicePosition": true,
                    "positioningEngine": "External"
                  },
                  "geometry": {
                    "type": "Point",
                    "coordinates": [ -73.57123, 45.50883 ]
                  }
                }
              ]
            }
          },
          "statid": {
            "uuids": [ "feaa" ],
            "uri": "https://sniffypedia.org/Product/Google_Eddystone/",
            "deviceIds": [ "7265656c652055554944/000000000d09" ]
          },
          "url": "https://www.reelyactive.com/team/obelix/",
          "tags": [ "animal" ]
        },
        "001bc50940810000/1": {
          "directory": "parc:office",
          "tags": [ "reelceiver" ]
        },
        "001bc50940820000/1": {
          "directory": "parc:lounge",
          "tags": [ "OiO" ]
        }
      }
    }

#### Query strings

The following query string parameters are supported, in order of precedence:
- format _to format the returned JSON a specific way_ (see [Format Options](#format-options))
- include _to include only a specific property in each returned device_

For example GET /context/device/fee150bada55/2?include=dynamb would return the specified device, and include _only_ its dynamb property, if any.


### GET /context/directory/{directory}[?]

Retrieve the context of all active devices with (and within) the given _directory_, with optional query string.  As directories are hierarchical, specifying the directory _parc_ would include all subdirectories such as _parc:office_ and _parc:lounge_.

#### Example request

| Method | Route                   | Content-Type     |
|:-------|:------------------------|:-----------------|
| GET    | /context/directory/parc | application/json |

#### Example response

    {
      "_meta": {
        "message": "ok",
        "statusCode": 200
      },
      "_links": {
        "self": {
          "href": "http://localhost:3001/context/directory/parc"
        }
      },
      "devices": {
        "fee150bada55/2": {
          "nearest": [
            {
              "device": "001bc50940810000/1",
              "rssi": -72
            },
            {
              "device": "001bc50940820000/1",
              "rssi": -85
            }
          ],
          "dynamb": {
            "timestamp": 1624714123456,
            "batteryPercentage": 67,
            "acceleration": [ -0.15625, -0.94921875, 0.109375 ]
          },
          "spatem": {
            "timestamp": 1624714123456,
            "type": "position",
            "data": {
              "type": "FeatureCollection",
              "features": [
                {
                  "type": "Feature",
                  "properties": {
                    "isDevicePosition": true,
                    "positioningEngine": "External"
                  },
                  "geometry": {
                    "type": "Point",
                    "coordinates": [ -73.57123, 45.50883 ]
                  }
                }
              ]
            }
          },
          "statid": {
            "uuids": [ "feaa" ],
            "uri": "https://sniffypedia.org/Product/Google_Eddystone/",
            "deviceIds": [ "7265656c652055554944/000000000d09" ]
          },
          "url": "https://www.reelyactive.com/team/obelix/",
          "tags": [ "animal" ]
        },
        "001bc50940810000/1": {
          "directory": "parc:office",
          "tags": [ "reelceiver" ]
        },
        "001bc50940820000/1": {
          "directory": "parc:lounge",
          "tags": [ "OiO" ]
        }
      }
    }

#### Query strings

The following query string parameters are supported, in order of precedence:
- format _to format the returned JSON a specific way_ (see [Format Options](#format-options))
- include _to include only a specific property in each returned device_

For example GET /context/directory/parc?include=nearest would return all devices with (and within) the parc _directory_, and include _only_ the nearest property, if any, of each device.


### GET /context/tag/{tag}[?]

Retrieve the context of all active devices with the given _tag_, with optional query string.

#### Example request

| Method | Route               | Content-Type     |
|:-------|:--------------------|:-----------------|
| GET    | /context/tag/animal | application/json |

#### Example response

    {
      "_meta": {
        "message": "ok",
        "statusCode": 200
      },
      "_links": {
        "self": {
          "href": "http://localhost:3001/context/tag/animal"
        }
      },
      "devices": {
        "fee150bada55/2": {
          "nearest": [
            {
              "device": "001bc50940810000/1",
              "rssi": -72
            },
            {
              "device": "001bc50940820000/1",
              "rssi": -85
            }
          ],
          "dynamb": {
            "timestamp": 1624714123456,
            "batteryPercentage": 67,
            "acceleration": [ -0.15625, -0.94921875, 0.109375 ]
          },
          "spatem": {
            "timestamp": 1624714123456,
            "type": "position",
            "data": {
              "type": "FeatureCollection",
              "features": [
                {
                  "type": "Feature",
                  "properties": {
                    "isDevicePosition": true,
                    "positioningEngine": "External"
                  },
                  "geometry": {
                    "type": "Point",
                    "coordinates": [ -73.57123, 45.50883 ]
                  }
                }
              ]
            }
          },
          "statid": {
            "uuids": [ "feaa" ],
            "uri": "https://sniffypedia.org/Product/Google_Eddystone/",
            "deviceIds": [ "7265656c652055554944/000000000d09" ]
          },
          "url": "https://www.reelyactive.com/team/obelix/",
          "tags": [ "animal" ]
        },
        "001bc50940810000/1": {
          "directory": "parc:office",
          "tags": [ "reelceiver" ]
        },
        "001bc50940820000/1": {
          "directory": "parc:lounge",
          "tags": [ "OiO" ]
        }
      }
    }

#### Query strings

The following query string parameters are supported, in order of precedence:
- format _to format the returned JSON a specific way_ (see [Format Options](#format-options))
- include _to include only a specific property in each returned device_

For example GET /context/tag/animal?include=spatem would return all active devices with the animal _tag_, and include _only_ the spatem property, if any, of each device.


### POST /features

Create the GeoJSON feature, which will return a unique _id_, which is a random RFC 4122 version 4 UUID, without dashes.

#### Example request

| Method | Route                                          | Content-Type     |
|:-------|:-----------------------------------------------|:-----------------|
| POST   | /features                                      | application/json |

    {
      "type": "Feature",
      "properties": { "name": "triangle" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [ [ [ 0, 1 ], [ 1, 0 ], [ 0, 0 ], [ 0, 1 ] ] ]
      }
    }

#### Example response

    {
      "_meta": {
        "message": "ok",
        "statusCode": 200
      },
      "_links": {
        "self": {
          "href": "http://localhost:3001/features/"
        }
      },
      "features": {
        "df52b802f4054bdb815102be1d76f8ab": {
          "type": "Feature",
          "id": "df52b802f4054bdb815102be1d76f8ab",
          "properties": { "name": "triangle" },
          "geometry": {
            "type": "Polygon",
            "coordinates": [ [ [ 0, 1 ], [ 1, 0 ], [ 0, 0 ], [ 0, 1 ] ] ]
          }
        }
      }
    }


### GET /features/{id}

Retrieve the GeoJSON feature with for the given _id_.

#### Example request

| Method | Route                                          | Content-Type     |
|:-------|:-----------------------------------------------|:-----------------|
| GET    | /features/df52b802f4054bdb815102be1d76f8ab     | application/json |

#### Example response

    {
      "_meta": {
        "message": "ok",
        "statusCode": 200
      },
      "_links": {
        "self": {
          "href": "http://localhost:3001/features/df52b802f4054bdb815102be1d76f8ab"
        }
      },
      "features": {
        "df52b802f4054bdb815102be1d76f8ab": {
          "type": "Feature",
          "id": "df52b802f4054bdb815102be1d76f8ab",
          "properties": { "name": "triangle" },
          "geometry": {
            "type": "Polygon",
            "coordinates": [ [ [ 0, 1 ], [ 1, 0 ], [ 0, 0 ], [ 0, 1 ] ] ]
          }
        }
      }
    }


### DELETE /features/{id}

Remove the GeoJSON feature with the given _id_.

#### Example request

| Method | Route                                          | Content-Type     |
|:-------|:-----------------------------------------------|:-----------------|
| DELETE | /features/df52b802f4054bdb815102be1d76f8ab     | application/json |

#### Example response

    {
      "_meta": {
        "message": "ok",
        "statusCode": 200
      },
      "_links": {
        "self": {
          "href": "http://localhost:3001/features/df52b802f4054bdb815102be1d76f8ab"
        }
      }


Format Options
--------------

The _format_ query parameter of the /context API supports the following mutually-exclusive options:
- geojson
- dynamblist

### format=geojson

The API will return a GeoJSON FeatureCollection similar to the following, which includes the first feature from each returned device with a [spatem](https://reelyactive.github.io/diy/cheatsheet/#spatem):

    {
      "type": "FeatureCollection",
      "features": [{
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [ 1, 2, 3 ]
        },
        "properties": { "deviceId": "fee150bada55", "deviceIdType": 2 },
        {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [ 3, 2, 1 ]
        },
        "properties": { "deviceId": "bada55beac04", "deviceIdType": 3 }
      ]
    }

### format=dynamblist

The API will return an array (list) similar to the following, which includes each dynamb from the returned devices:

    [
      {
        "deviceId": "001bc50940810000",
        "deviceIdType": 1,
        "numberOfReceivedDevices": 42,
        "numberOfStrongestReceivedDevices": 21,
      },
      {
        "deviceId": "001bc50940820000",
        "deviceIdType": 1,
        "numberOfReceivedDevices": 36,
        "numberOfStrongestReceivedDevices": 27,
      }
    ]


Socket.IO
---------

When initialised with a Socket.IO server as an option, __chickadee__ supports the following namespace:
- /context/device/{id}/{type}

When a change in context for the given device is detected, a devices event is emitted.  For an example of the devices JSON structure, see the sample response of the /context REST API above.


![chickadee logo](https://reelyactive.github.io/chickadee/images/chickadee-bubble.png)


What's in a name?
-----------------

The [Cornell Lab of Ornithology explains](http://www.allaboutbirds.org/guide/black-capped_chickadee/lifehistory): "The Black-Capped Chickadee hides seeds and other food items to eat later. Each item is placed in a different spot and the chickadee can remember thousands of hiding places."  Not only does it have an outstanding associative memory, it is also "almost universally considered _cute_ thanks to its oversized round head, tiny body, and curiosity about everything, including humans."

If you were entrusting a bird to associate your wireless device with your online stories you'd want it to be cute and friendly enough to eat out of your hand, right?  We could have named this package [Clark's Nutcracker](http://www.allaboutbirds.org/guide/clarks_nutcracker/lifehistory), the bird with arguably the best associative memory, but the whole nut-cracking thing doesn't inspire the same level of friendliness now does it?

One more fun fact that we feel compelled to pass along: "Every autumn Black-capped Chickadees allow brain neurons containing old information to die, replacing them with new neurons so they can adapt to changes in their social flocks and environment even with their tiny brains."  Wow, that's database efficiency that we can aspire to!


Project History
---------------

__chickadee__ v1.0.0 was released in July 2019, superseding all earlier versions, the latest of which remains available in the [release-0.4 branch](https://github.com/reelyactive/chickadee/tree/release-0.4) and as [chickadee@0.4.10 on npm](https://www.npmjs.com/package/chickadee/v/0.4.10).

__chickadee__ v1.4.0 migrates to [ESMapDB](https://github.com/reelyactive/esmapdb) from [NeDB](https://github.com/louischatriot/nedb).  If upgrading from a previous version, any stored associations will need to be recreated.


Contributing
------------

Discover [how to contribute](CONTRIBUTING.md) to this open source project which upholds a standard [code of conduct](CODE_OF_CONDUCT.md).


Security
--------

Consult our [security policy](SECURITY.md) for best practices using this open source software and to report vulnerabilities.


License
-------

MIT License

Copyright (c) 2015-2025 [reelyActive](https://www.reelyactive.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
THE SOFTWARE.

