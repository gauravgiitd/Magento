/**
 * Copyright 2016 Facebook, Inc.
 *
 * You are hereby granted a non-exclusive, worldwide, royalty-free license to
 * use, copy, modify, and distribute this software in source code or binary
 * form for use in connection with the web services and APIs provided by
 * Facebook.
 *
 * As with any software that integrates with the Facebook platform, your use
 * of this software is subject to the Facebook Developer Principles and
 * Policies [http://developers.facebook.com/policy/]. This copyright notice
 * shall be included in all copies or substantial portions of the software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE
 */
import fetch from 'isomorphic-fetch';

'use strict';
/* global Parse */

var API_URL = 'http://magento.westus.cloudapp.azure.com/index.php/rest/V1/products';
var PAGE_SIZE = 25;
var PARAMS = '?searchCriteria[pageSize]=' + PAGE_SIZE;
var REQUEST_URL = API_URL + PARAMS;

async function importObject(ClassType, item) {
  let obj = new ClassType();

  var description = item.custom_attributes.find((attribute) => { return attribute.attribute_code == "description" });
  var image = item.custom_attributes.find((attribute) => { return attribute.attribute_code == "small_image" });
  console.log(item.name);


  obj.set('day', 1);
  obj.set('sessionTitle', item.name);
  if (description != null) obj.set('sessionDescription', description.value);
  if (image != null)
  {
    var imagePath = 'http://magento.westus.cloudapp.azure.com/pub/media/catalog/product/cache/1/small_image/240x300/beff4985b56e3afdbeabfc89641a4582' + image.value;
    console.log(imagePath);
    obj.set('ogImage', imagePath);
  }

  obj = await obj.save();
  console.log(obj);
  return obj;
}

async function importFromMagento(className) {
  console.log('Loading from Magento');
  const response = await fetch(REQUEST_URL, {
    method: 'get',
  });
  const results = await response.json();
  console.log(results);
  const ClassType = Parse.Object.extend(className);
  console.log('Cleaning old', className, 'data');
  await new Parse.Query(ClassType)
    .each(record => record.destroy());
  console.log('Converting', className);
  return Promise.all(results.items.map(item => importObject(ClassType, item)));
}


Parse.Cloud.define('sessions', async function(request, response) {
  Parse.Cloud.useMasterKey();

  //await importFromMagento('Agenda');

  console.log('Quering sessions');

  new Parse.Query('Agenda')
    .include('speakers')
    .ascending('startTime')
    .find()
    .then(
      function(value) { response.success(value); },
      function(error) { response.error(error); }
    );
});
