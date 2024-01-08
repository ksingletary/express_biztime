const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");

const slugify = require('slugify');

// GET /companies


router.get('/', async (req, res, next) => {
  try {
    const result = await db.query('SELECT code, name FROM companies');
    return res.json({ companies: result.rows });
  } catch (err) {
    return next(err);
  }
});

router.get('/:code', async (req, res, next) => {
  const companyCode = req.params.code;

  // Validate the input
  if (!companyCode) {
    return res.status(400).send('Invalid company code');
  }

  try {
   
    const [companyResult, industriesResult] = await Promise.all([
      db.query('SELECT code, name, description FROM companies WHERE code = $1', [companyCode]),
      db.query('SELECT i.code, i.industry FROM industries AS i JOIN company_industries AS ci ON i.code = ci.industry_code WHERE ci.company_code = $1', [companyCode])
    ]);

    if (companyResult.rows.length === 0) {
      return res.sendStatus(404);
    }

    const company = companyResult.rows[0];
    company.industries = industriesResult.rows;

    return res.json({ company });
  } catch (err) {

    return next(err);
  }
});

