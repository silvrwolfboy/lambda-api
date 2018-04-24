'use strict';

const expect = require('chai').expect // Assertion library

// Init API instance
const api = require('../index')({ version: 'v1.0' })

// Add the data namespace
api.app('data',require('./_testData'))

// Add additional namespaces using object
api.app({
  'data2': require('./_testData'),
  'data3': require('./_testData')
})


// NOTE: Set test to true
api._test = true;

let event = {
  httpMethod: 'get',
  path: '/test',
  body: {},
  headers: {
    'Content-Type': 'application/json'
  }
}

/******************************************************************************/
/***  DEFINE TEST ROUTES                                                    ***/
/******************************************************************************/

// This route invokes 'dataCall' using the 'data' namespace
api.get('/testData', function(req,res) {
  let data = req.namespace.data.dataCall()
  res.json({ method:'get', status:'ok', data: data })
})

// This route loads a module directly which accesses the data namespace
api.get('/testAppData', require('./_testApp').dataTest)



/******************************************************************************/
/***  BEGIN TESTS                                                           ***/
/******************************************************************************/

describe('Namespace Tests:', function() {

  it('Check namespace loading', function() {
      expect(Object.keys(api._app).length).to.equal(3)
      expect(api._app).to.have.property('data')
      expect(api._app).to.have.property('data2')
      expect(api._app).to.have.property('data3')
      expect(api._app.data).to.have.property('dataCall')
  }) // end it

  it('Invoke namespace', async function() {
    let _event = Object.assign({},event,{ path:'/testData' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"get","status":"ok","data":{"foo":"sample data","bar":"additional sample data"}}', isBase64Encoded: false })
  }) // end it

  it('Invoke namespace via required module', async function() {
    let _event = Object.assign({},event,{ path:'/testAppData' })
    let result = await new Promise(r => api.run(_event,{},(e,res) => { r(res) }))
    expect(result).to.deep.equal({ headers: { 'content-type': 'application/json' }, statusCode: 200, body: '{"method":"get","status":"ok","data":{"foo":"sample data","bar":"additional sample data"}}', isBase64Encoded: false })
  }) // end it

}) // end MODULE tests
