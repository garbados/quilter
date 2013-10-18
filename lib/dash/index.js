var couchapp = require('couchapp'),
    path = require('path');

ddoc = {
  _id: '_design/dashboard',
  rewrites: [
    {
      from: '/file/:file',
      to: '/../../:file/file'
    }, {
      from: '/api',
      to: '/'
    }, {
      from: '/api/*',
      to: '/*'
    }, {
      from: '/css/*',
      to: '/css/*'
    }, {
      from: '/js/*',
      to: '/js/*'
    }, {
      from: '',
      to: '/index.html'
    }
  ],
  views: {
    content_types: {
      map: function (doc) {
        if (doc._attachments && doc._attachments.file) {
          var attachment = doc._attachments.file,
              content_type = attachment.content_type.split('/')[0];
          emit([
            content_type, 
            attachment.content_type, 
            doc.timestamp
          ], 
          null);
        }
      },
      reduce: '_count'
    },
    timestamps: {
      map: function (doc) {
        if (doc._attachments && doc._attachments.file) {
          var attachment = doc._attachments.file;
          emit(doc.timestamp, attachment.content_type);
        }
      }
    }
  },
  lists: {},
  shows: {}
};

couchapp.loadAttachments(ddoc, path.join(__dirname, 'app'));

module.exports = ddoc;