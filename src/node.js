/* eslint-disable import/exports-last */

import fetch from "node-fetch"
import {
  pipe,
  reduce,
  startsWith,
  trim,
  when,
  same,
  is,
  isEmpty,
} from "@mutant-ws/m"

import { set } from "./fn.set"
import { filterByValue } from "./fn.filter-by-value"
import { RequestError } from "./fn.request-error"

/**
 * Library options
 */
const props = {
  baseURL: "",
  headers: {},
  queryStringifyFn: null,
}

/**
 * `fetch` wrapper
 *
 * @param  {String} url         API endpoint
 * @param  {String} opt.method  HTTP Method
 * @param  {Object} opt.headers HTTP Headers
 * @param  {Object} opt.body    HTTP Body
 * @param  {Object} opt.query   Query params
 *
 * @return {Promise}            Resolves with response object if code is 20*.
 *                              Reject all other response codes.
 */
const request = (
  url,
  { method, body = {}, headers = {}, query = {}, isFile = false } = {}
) => {
  const reqContent = {
    method,
    headers: filterByValue(is)({
      Accept: "application/json",
      "Content-Type": "application/json",
      ...props.headers,
      ...headers,
    }),
  }

  // Avoid "HEAD or GET Request cannot have a body"
  if (method !== "GET") {
    reqContent.body = isFile ? body : JSON.stringify(body)
  }

  const reqURL = pipe(
    when(
      isEmpty,
      same(url),
      source => `${url}?${props.queryStringifyFn(source)}`
    ),
    trim("/"),
    source => `${props.baseURL}/${source}`
  )(query)

  return fetch(reqURL, reqContent)
    .then(response => {
      const isJSON = startsWith(
        "application/json",
        response.headers.get("Content-Type")
      )

      return Promise.all([response, isJSON ? response.json() : response.text()])
    })
    .then(([response, data]) => {
      /*
       * The Promise returned from fetch() won't reject on HTTP error status
       * even if the response is an HTTP 404 or 500. Instead, it will resolve
       * normally, and it will only reject on network failure or if anything
       * prevented the request from completing.
       */
      if (response.ok) {
        return data
      }

      throw new RequestError(response.statusText, {
        status: response.status,
        body: data,
        url: reqURL,
      })
    })
}

export const useProps = () => [props, set(props)]

export const FILE = (url, { body = {}, headers } = {}) => {
  const form = new FormData()

  return request(url, {
    method: "POST",
    body: pipe(
      Object.entries,
      reduce((acc, [key, value]) => {
        acc.append(key, value)

        return acc
      }, form)
    )(body),
    headers: {
      ...headers,

      // remove content-type header or browser boundery wont get set
      "Content-Type": null,
    },
    isFile: true,
  })
}

export const GET = (url, { query, headers } = {}) =>
  request(url, { method: "GET", query, headers })

export const POST = (url, { body, query, headers } = {}) =>
  request(url, { method: "POST", body, query, headers })

export const PATCH = (url, { body, query, headers } = {}) =>
  request(url, { method: "PATCH", body, query, headers })

export const DELETE = (url, { body, query, headers } = {}) =>
  request(url, { method: "DELETE", body, query, headers })
