chickadee
=========


A contextual associations store and API for the IoT
---------------------------------------------------

__chickadee__ is a contextual associations store.  Specifically, it associates wireless device identifiers with metadata such as a URL, a tag, a directory, etc.  __chickadee__ can run standalone, although it is usually run together with other software packages of the reelyActive open source stack, as in the [hlc-server](https://github.com/reelyactive/hlc-server) bundle.


Installation
------------

    npm install chickadee


Hello chickadee!
----------------

    npm start

Browse to [http://localhost:3001/associations/001bc50940810000/1](localhost:3001/associations/001bc50940810000/1) to see if there are any associations for the device with EUI-64 identifier 00-1b-c5-09-40-81-00-00.  By default, this should return Not Found.  Interact with __chickadee__ through the REST API described below.


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


![chickadee logo](https://reelyactive.github.io/chickadee/images/chickadee-bubble.png)


What's in a name?
-----------------

The [Cornell Lab of Ornithology explains](http://www.allaboutbirds.org/guide/black-capped_chickadee/lifehistory): "The Black-Capped Chickadee hides seeds and other food items to eat later. Each item is placed in a different spot and the chickadee can remember thousands of hiding places."  Not only does it have an outstanding associative memory, it is also "almost universally considered _cute_ thanks to its oversized round head, tiny body, and curiosity about everything, including humans."

If you were entrusting a bird to associate your wireless device with your online stories you'd want it to be cute and friendly enough to eat out of your hand, right?  We could have named this package [Clark's Nutcracker](http://www.allaboutbirds.org/guide/clarks_nutcracker/lifehistory), the bird with arguably the best associative memory, but the whole nut-cracking thing doesn't inspire the same level of friendliness now does it?

One more fun fact that we feel compelled to pass along: "Every autumn Black-capped Chickadees allow brain neurons containing old information to die, replacing them with new neurons so they can adapt to changes in their social flocks and environment even with their tiny brains."  Wow, that's database efficiency that we can aspire to!


License
-------

MIT License

Copyright (c) 2015-2019 [reelyActive](https://www.reelyactive.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
THE SOFTWARE.

