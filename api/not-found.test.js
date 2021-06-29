import { suite } from './suite.test.js'

/**
 * NOTES
 *
 * This file might be merged with other test file that are common.
 * Just to make the directory tidy, so there are not too many test files.
 */

suite('random not found route', test => {
  test('should be not found', async ({ fetch }) => {
    await fetch('/rich/by/bitcoin').expect(404, {
      error: 'cannot GET /rich/by/bitcoin'
    })
  })
})
