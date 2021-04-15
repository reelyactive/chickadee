chickadee
=========


A contextual associations store and API for the IoT
---------------------------------------------------

__chickadee__ is a contextual associations store and a core module of the [Pareto Anywhere](https://www.reelyactive.com/pareto/anywhere/) open source software of the [reelyActive technology platform](https://www.reelyactive.com/technology/).

Specifically, __chickadee__ associates wireless device identifiers with metadata such as a URL, a tag, a directory, and/or a position.  __chickadee__ can run standalone, although it is usually run together with its peer modules.


Installation
------------

    npm install chickadee


Hello chickadee!
----------------

    npm start

Browse to [localhost:3001/associations/001bc50940810000/1](http://localhost:3001/associations/001bc50940810000/1) to see if there are any associations for the device with EUI-64 identifier 00-1b-c5-09-40-81-00-00.  By default, this should return Not Found.  Interact with __chickadee__ through the REST API described below.


REST API
--------


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
          "directory": "hq:lab",
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
      "directory": "hq:lab",
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
          "directory": "hq:lab",
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


![chickadee logo](https://reelyactive.github.io/chickadee/images/chickadee-bubble.png)


What's in a name?
-----------------

The [Cornell Lab of Ornithology explains](http://www.allaboutbirds.org/guide/black-capped_chickadee/lifehistory): "The Black-Capped Chickadee hides seeds and other food items to eat later. Each item is placed in a different spot and the chickadee can remember thousands of hiding places."  Not only does it have an outstanding associative memory, it is also "almost universally considered _cute_ thanks to its oversized round head, tiny body, and curiosity about everything, including humans."

If you were entrusting a bird to associate your wireless device with your online stories you'd want it to be cute and friendly enough to eat out of your hand, right?  We could have named this package [Clark's Nutcracker](http://www.allaboutbirds.org/guide/clarks_nutcracker/lifehistory), the bird with arguably the best associative memory, but the whole nut-cracking thing doesn't inspire the same level of friendliness now does it?

One more fun fact that we feel compelled to pass along: "Every autumn Black-capped Chickadees allow brain neurons containing old information to die, replacing them with new neurons so they can adapt to changes in their social flocks and environment even with their tiny brains."  Wow, that's database efficiency that we can aspire to!


What's next?
------------

__chickadee__ v1.0.0 was released in July 2019, superseding all earlier versions, the latest of which remains available in the [release-0.4 branch](https://github.com/reelyactive/chickadee/tree/release-0.4) and as [chickadee@0.4.10 on npm](https://www.npmjs.com/package/chickadee/v/0.4.10).

If you're developing with __chickadee__ check out:
* [diyActive](https://reelyactive.github.io/) our developer page
* our [node-style-guide](https://github.com/reelyactive/node-style-guide) and [web-style-guide](https://github.com/reelyactive/web-style-guide) for development
* our [contact information](https://www.reelyactive.com/contact/) to get in touch if you'd like to contribute


License
-------

MIT License

Copyright (c) 2015-2021 [reelyActive](https://www.reelyactive.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
THE SOFTWARE.

