'use strict';
var _ = require('lodash');
var SerializerUtils = require('./serializer-utils');

function JsonApiSerializer(collectionName, records, opts){
  if(arguments.length === 3){
    // legacy behavior
    this.collectionName = collectionName;
    this.opts = opts;
    return this.serialize(records);
  }else{
    // treat as a reusable serializer
    this.collectionName = collectionName;
    this.opts = records;
  }
}

JsonApiSerializer.prototype.serialize = function(records){
  var self = this;
  var payload = {};

  function getLinks(links) {
    return _.mapValues(links, function (value) {
      if (_.isFunction(value)) {
        return value(records);
      } else {
        return value;
      }
    });
  }

  function collection() {
    payload.data = [];

    records.forEach(function (record) {
      var serializerUtils = new SerializerUtils(self.collectionName, record,
        payload, self.opts);
      payload.data.push(serializerUtils.perform());
    });

    return payload;
  }

  function resource() {
    payload.data = new SerializerUtils(self.collectionName, records, payload, self.opts)
      .perform(records);

    return payload;
  }

  if (self.opts.topLevelLinks) {
    payload.links = getLinks(self.opts.topLevelLinks);
  }

  if (self.opts.meta) {
    payload.meta = self.opts.meta;
  }

  if (_.isArray(records)) {
    return collection(records);
  } else {
    return resource(records);
  }
};

module.exports = JsonApiSerializer;