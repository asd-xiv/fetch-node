import { trim, is, isObject } from "@mutant-ws/m"

export const set = props => ({ baseURL, headers, queryStringifyFn }) => {
  if (is(queryStringifyFn)) {
    if (typeof queryStringifyFn === "function") {
      props.queryStringifyFn = queryStringifyFn
    } else {
      throw new TypeError(
        `mutant-fetch: "queryStringifyFn" should be of type function, received ${JSON.stringify(
          queryStringifyFn
        )}`
      )
    }
  }

  if (is(headers)) {
    if (isObject(headers)) {
      props.headers = {
        ...props.headers,
        ...headers,
      }
    } else {
      throw new TypeError(
        `mutant-fetch: "headers" should be of type object, received ${JSON.stringify(
          headers
        )}`
      )
    }
  }

  if (is(baseURL)) {
    if (typeof baseURL === "string") {
      props.baseURL = trim("/")(baseURL)
    } else {
      throw new TypeError(
        `mutant-fetch: "baseURL" should be of type string, received ${JSON.stringify(
          baseURL
        )}`
      )
    }
  }
}
