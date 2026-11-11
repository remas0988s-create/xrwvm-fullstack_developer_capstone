const express = require('express');
const mongoose = require('mongoose');
const { timingSafeEqual, randomUUID } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const Dealership = require('./dealership');
const Review = require('./review');
const { dealerships } = require('./data/dealerships.json');
const { reviews } = require('./data/reviews.json');

const app = express();
const mongoUri = process.env.MONGO_URI;
const dataFile = process.env.LOCAL_REVIEW_FILE;
const internalToken = process.env.INTERNAL_TOKEN;
let localReviews = reviews;

app.use(express.json({ limit: '8kb' }));

const handle = (fn) => (req, res, next) => Promise.resolve(fn(req, res)).catch(next);
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

app.get('/fetchDealers/:state?', handle(async (req, res) => {
  const state = req.params.state;
  if (mongoUri) {
    const filter = state ? { state: new RegExp('^' + escapeRegex(state) + '$', 'i') } : {};
    return res.json(await Dealership.find(filter).sort('id').lean());
  }
  res.json(state ? dealerships.filter((d) => d.state.toLowerCase() === state.toLowerCase()) : dealerships);
}));

app.get('/fetchDealer/:id', handle(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id)) return res.status(400).json({ error: 'Invalid dealer ID.' });
  res.json(mongoUri ? await Dealership.find({ id }).lean() : dealerships.filter((d) => d.id === id));
}));

app.get(['/fetchReviews', '/fetchReviews/dealer/:id'], handle(async (req, res) => {
  const dealerId = Number(req.params.id);
  if (req.params.id && !Number.isSafeInteger(dealerId)) {
    return res.status(400).json({ error: 'Invalid dealer ID.' });
  }
  const filter = req.params.id ? { dealership: dealerId } : {};
  res.json(mongoUri ? await Review.find(filter).sort({ _id: -1 }).lean()
    : (req.params.id ? localReviews.filter((r) => Number(r.dealership) === dealerId) : localReviews));
}));

app.post('/insert_review', handle(async (req, res) => {
  const supplied = Buffer.from(req.get('X-Internal-Token') || '');
  const expected = Buffer.from(internalToken || '');
  if (!expected.length || supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return res.status(403).json({ error: 'Forbidden.' });
  }
  const { name, dealership, review, purchase, purchase_date, car_make, car_model, car_year, sentiment } = req.body;
  const entry = {
    id: randomUUID(), name, dealership, review, purchase, purchase_date, car_make, car_model, car_year, sentiment,
  };
  await new Review(entry).validate();
  if (mongoUri) return res.status(201).json(await Review.create(entry));
  const updated = [entry, ...localReviews];
  const tempFile = dataFile + '.tmp';
  fs.writeFileSync(tempFile, JSON.stringify(updated));
  fs.renameSync(tempFile, dataFile);
  localReviews = updated;
  res.status(201).json(entry);
}));

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error instanceof mongoose.Error.ValidationError || error.status === 400) {
    return res.status(400).json({ error: 'Invalid review or request body.' });
  }
  console.error(error);
  res.status(500).json({ error: 'Dealership service error.' });
});

async function start() {
  if (!internalToken) throw new Error('INTERNAL_TOKEN is required.');
  if (mongoUri) {
    await mongoose.connect(mongoUri, { dbName: process.env.MONGO_DB || 'dealershipsDB' });
    await Promise.all([
      Dealership.bulkWrite(dealerships.map((item) => ({
        updateOne: { filter: { id: item.id }, update: { $setOnInsert: item }, upsert: true },
      }))),
      Review.bulkWrite(reviews.map((item) => ({
        updateOne: { filter: { id: String(item.id) }, update: { $setOnInsert: item }, upsert: true },
      }))),
    ]);
  } else {
    if (!dataFile) throw new Error('Set MONGO_URI or explicitly select LOCAL_REVIEW_FILE.');
    fs.mkdirSync(path.dirname(dataFile), { recursive: true });
    if (fs.existsSync(dataFile)) localReviews = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  }
  const port = Number(process.env.PORT || 3030);
  app.listen(port, process.env.HOST || '127.0.0.1', () => {
    console.log(`Dealership API listening on port ${port} (${mongoUri ? 'MongoDB' : 'local JSON'})`);
  });
}

start().catch((error) => { console.error(error); process.exit(1); });
