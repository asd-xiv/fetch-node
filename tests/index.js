/* eslint-disable new-cap,no-sync */

const { describe } = require("riteway")
const qs = require("qs")

const { set, GET } = require("../src")

set({
  queryStringifyFn: source => qs.stringify(source),
})

describe("fetch-node", async assert => {
  const data = await GET("https://api.ipify.org", {
    query: {
      format: "json",
    },
  })

  assert({
    given: "the burning need to know one's public IP",
    should: "do a GET request to ipify.org",
    actual: {
      hasIpField: typeof data.ip === "string",
    },
    expected: {
      hasIpField: true,
    },
  })
})
