const express = require('express');
const _ = require('lodash');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer'); // v1.0.5
const cors = require('cors');
const upload = multer(); // for parsing multipart/form-data
const app = express();
const port = 4000;

app.use(cors());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

const { Schema } = mongoose;

async function connectDB() {
  await mongoose.connect('mongodb://127.0.0.1:27017/final-pos');
}

const catalogueSchema = new Schema({
  sku: {
    type: String,
    unique: true,
    minLength: 4,
    maxLength: 12,
    required: [true, 'Mohon input SKU'],
    trim: true,
  },
  nama: {
    type: String,
    minLength: 2,
    maxLength: 32,
    required: [true, 'Mohon input Nama'],
    trim: true,
  },
  tipe: {
    type: String,
    enum: {
      values: ['food', 'drink'],
      message: '{VALUE} tidak tersedia',
    },
    required: [true, 'Mohon input Tipe'],
  },
  kategori: {
    type: String,
    minLength: 4,
    maxLength: 32,
    required: [true, 'Mohon input Kategori'],
    trim: true,
  },
  harga: {
    type: Number,
    default: 0,
    required: [true, 'Mohon input Harga'],
  },
  diskon: {
    type: Number,
    default: 0,
  },
  audit: {
    dibuatTgl: Date,
    diubahTgl: Date,
    dibuatOleh: { type: mongoose.Schema.ObjectId, ref: 'User' },
    diubahOleh: { type: mongoose.Schema.ObjectId, ref: 'User' },
  },
});

const Catalogue = mongoose.model('Catalogue', catalogueSchema);

function errorHandler(e) {
  let _error = {};
  Object.keys(e?.errors).map(function (key, index) {
    try {
      _error[key] = [];
    } catch (e) {}
    _error[key].push(e?.errors[key].message);
  });

  return _error;
}

function consoleAll(req, res, next) {
  console.log('req params', req?.params);
  console.log('req body', req?.body);
  console.log('req query', req?.query);
  next();
}

app.get('/catalogue/:type', consoleAll, async (req, res) => {
  if (req?.params?.type === 'food' || req?.params?.type === 'drink') {
    let data = await Catalogue.find({ tipe: req?.params?.type });
    res.status(200).json({
      success: true,
      message: 'GET CATALOG ' + req?.params?.type,
      data,
    });
  } else {
    res.status(500).json({ success: false, message: 'UNKNOWN TYPE', data: null });
  }
});

app.get('/catalogue/detail/:id', consoleAll, async (req, res) => {
  let data = await Catalogue.findOne({ _id: req?.params?.id });
  res.status(200).json({
    success: true,
    message: 'GET DETAIL CATALOG ' + req?.params?.id,
    data,
  });
});

app.post('/catalogue/:type', upload.array(), consoleAll, async function (req, res) {
  try {
    const newCatalogue = new Catalogue();

    const { sku, nama, kategori, harga, diskon, tipe } = req?.body || {};

    newCatalogue.sku = sku;
    newCatalogue.nama = nama;
    newCatalogue.kategori = kategori?.toLowerCase();
    newCatalogue.harga = harga;
    newCatalogue.diskon = diskon;
    newCatalogue.tipe = tipe?.toLowerCase();

    const data = await newCatalogue.save();

    if (data) {
      res.status(201).json({
        success: true,
        message: 'Berhasil menambahkan data ' + data?._id,
        data,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Gagal menambahkan data',
        data: null,
      });
    }
  } catch (e) {
    res.status(400).json({
      success: false,
      message: 'Terdapat data yang perlu dicek',
      data: errorHandler(e),
    });
  }
});

app.put('/catalogue/:id', upload.array(), consoleAll, async function (req, res) {
  try {
    const currentCatalogue = await Catalogue.findOne({ _id: req?.params?.id });

    const { sku, nama, kategori, harga, diskon, tipe } = req?.body || {};

    currentCatalogue.sku = sku;
    currentCatalogue.nama = nama;
    currentCatalogue.kategori = kategori?.toLowerCase();
    currentCatalogue.harga = harga;
    currentCatalogue.diskon = diskon;
    currentCatalogue.tipe = tipe?.toLowerCase();

    const data = await currentCatalogue.save();

    if (data) {
      res.status(201).json({
        success: true,
        message: 'Berhasil mengubah data ' + data?._id,
        data,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Gagal mengubah data',
        data: null,
      });
    }
  } catch (e) {
    console.log('E', typeof e, JSON.stringify(e));
    if (_.isObject(e)) {
      if (e?.name === 'CastError' && e?.kind == 'ObjectId') {
        res.status(500).json({
          success: false,
          message: e?.value + ' tidak ditemukan',
          data: null,
        });
      } else if (e?.errors) {
        res.status(400).json({
          success: false,
          message: 'Terdapat data yang perlu dicek',
          data: errorHandler(e),
        });
      }
    } else {
      res.status(500).json({
        success: false,
        message: 'Error',
        data: null,
      });
    }
  }
});

app.patch('/catalogue/:id', upload.array(), consoleAll, function (req, res) {
  res.send('UPDATE CATALOG ' + req?.params?.id);
});

app.delete('/catalogue/:id', upload.array(), consoleAll, async function (req, res) {
  const data = await Catalogue.findOne({ _id: req?.params?.id }).deleteOne().exec();

  if (data?.deletedCount > 0) {
    res.status(201).json({
      success: true,
      message: 'Berhasil menghapus data ' + req?.params?.id,
      data,
    });
  } else {
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus data',
      data: null,
    });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
  connectDB().catch((err) => console.log(err));
});
