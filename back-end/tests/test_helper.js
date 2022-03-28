import sinon from 'sinon'
import chai from 'chai'
import sinonChai from 'sinon-chai'
var expect = chai.expect
chai.use(sinonChai)

var supertest = require("supertest");

module.exports = {
  sinon: sinon,
  chai: chai,
  expect: expect,
  supertest: supertest
} 