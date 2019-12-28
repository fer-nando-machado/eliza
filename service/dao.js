app.service('dao', function($q) {
    this.find = function(target, query, sort) {
      let deferred = $q.defer();
      target.find(query).sort(sort).exec(function(err, doc) {
        err ? deferred.reject(err) : deferred.resolve(doc);
      });
      return deferred.promise;
    };
  
    this.findOne = function(target, query) {
      let deferred = $q.defer();
      target.findOne(query, function(err, docs) {
        err ? deferred.reject(err) : deferred.resolve(docs);
      });
      return deferred.promise;
    };

    this.count = function(target, query) {
      let deferred = $q.defer();
      target.count(query).exec(function(err, doc) {
        err ? deferred.reject(err) : deferred.resolve(doc);
      });
      return deferred.promise;
    };
  
    this.insert = function(target, doc) {
      let deferred = $q.defer();
      target.insert(doc, function(err, newDoc) {
        err ? deferred.reject(err) : deferred.resolve(newDoc);
      });
      return deferred.promise;
    };
  
    this.update = function(target, query, update, multi) {
      let deferred = $q.defer();
      target.update(query, update, {multi: multi, upsert: false, returnUpdatedDocs: true}, function(err, numAffected, affectedDocuments, upsert) {
        err ? deferred.reject(err) : deferred.resolve(affectedDocuments);
      });
      return deferred.promise;
    };
  
    this.remove = function(target, query, multi) {
      let deferred = $q.defer();
      target.remove(query, {multi: multi}, function(err, count) {
        err ? deferred.reject(err) : deferred.resolve(count);
      });
      return deferred.promise;
    };
  
    this.ensureUniqueIndex = function(target, field) {
      let deferred = $q.defer();
      target.ensureIndex({ fieldName: field, unique: true }, function (err) {
        err ? deferred.reject(err) : deferred.resolve();
      });
      return deferred.promise;
    };
  
  });
  