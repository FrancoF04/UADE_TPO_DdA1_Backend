const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const multer = require('multer');

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const MIME_TO_EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
};

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function makeStorage(subDir) {
  return multer.diskStorage({
    destination(_req, _file, cb) {
      const dir = path.join(UPLOAD_DIR, subDir);
      ensureDir(dir);
      cb(null, dir);
    },
    filename(_req, file, cb) {
      // Use random UUID + extension derived from mimetype to avoid path traversal
      const ext = MIME_TO_EXT[file.mimetype] || '.jpg';
      cb(null, `${crypto.randomUUID()}${ext}`);
    },
  });
}

function fileFilter(_req, file, cb) {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      Object.assign(new Error('Tipo de archivo no permitido. Solo se aceptan imagenes (jpeg, png, gif, webp).'), {
        status: 400,
      }),
      false,
    );
  }
}

const uploadUserPhoto = multer({
  storage: makeStorage('users'),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
}).single('photo');

const uploadActivityImage = multer({
  storage: makeStorage('activities'),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
}).single('image');

module.exports = { uploadUserPhoto, uploadActivityImage, UPLOAD_DIR };
