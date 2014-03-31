var mime = require('mime');
var fs = require('fs');
var path = require('path');
var sep = '/'; // separator used in urls

function file_path (mount, fp) {
  // defaults
  if (!fp) {
    fp = mount;
    mount = this.mount;
  }

  // fix filepath for current OS
  fp = fp.replace(sep, path.sep);
  // add mount if it exists and isn't already in the path
  if (mount && fp.indexOf(mount) === -1) fp = path.join(mount, fp);
  // add home
  var home = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
  fp = fp.replace('~', home);
  // normalize path
  fp = path.normalize(fp);

  return fp;
}

function file_id (mount, fp) {
  // defaults
  if (!fp) {
    fp = mount;
    mount = this.mount;
  }

  // normalize path
  fp = file_path(mount, fp);

  // strip mount point
  if (fp.indexOf(mount) !== -1) {
    fp = fp.slice(fp.indexOf(mount) + mount.length);
  }

  // yield OS-independent id
  fp = fp
    .split(path.sep)
    .filter(function (row) { return row; })
    .join(sep);
  return fp;
}

function file_type (fp) {
  return mime.lookup(fp.toLowerCase());
}

module.exports = {
  id: file_id,
  path: file_path,
  type: file_type
};