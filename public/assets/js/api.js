(function (jQuery) {
    "use strict"

    let ajax = {}

    const STATUS = {
        LOADING: "loading",
        SUCCESS: "success",
        ERROR: "error"
    }

    function Api(base_url) {
        this.baseURL = base_url
    }

    Api.prototype.sheet = function ({route, query = null, payload = null, callback}) {
        route = this.baseURL + `?route=${route}`

        if (ajax != null && ajax[route] != null) {
            ajax[route].abort()
        }

        if (query != null) {
            $.each(query, function (key, value) {
                route += `&${key}=${value}`
            })
        }

        if (payload != null) {
            route += `&payload=${JSON.stringify(payload)}`
        }

        ajax[route] = fetchData(`get`, route, callback)
    }

    Api.prototype.get = function (path, callback) {

        let route = this.baseURL + path

        if (ajax != null && ajax[route] != null) {
            ajax[route].abort()
        }

        let response = {
            status: STATUS.LOADING,
            data: null,
            error: null
        }

        ajax[route] = fetchData(`get`, route, callback)
    }

    Api.prototype.post = function ({path, method = `post`, jsonData, callback}) {

        if (ajax != null && ajax[path] != null) {
            ajax[path].abort()
        }

        ajax[path] = fetchData(method, this.baseURL, callback, jsonData)
    }

    function parseError(jqXHR, exception) {
        let msg = ``
        let status = jqXHR.status

        if (status === `(failed)net:ERR_INTERNET_DISCONNECTED`) {
            msg = `Uncaught Error.\n${jqXHR.responseText}`
        } else if (status === 0) {
            msg = `Not connect.\nVerify Network.`
        } else if (status === 413) {
            msg = `Image size is too large`
        } else if (status === 404) {
            msg = `Requested page not found [404]`
        } else if (status === 405) {
            msg = `Image size is too large`
        } else if (status === 500) {
            msg = `Internal Server Error [500]`
        } else if (exception === `parsererror`) {
            msg = `Requested JSON parse failed.`
        } else if (exception === `timeout`) {
            msg = `Time out error.`
        } else if (exception === `abort`) {
            msg = `Ajax request aborted.`
        } else {
            msg = `Uncaught Error.\n${jqXHR.responseText}`
        }

        return msg
    }

    jQuery.Api = function (base_url) {
        return new Api(base_url)
    }

    function fetchData(method, url, callback, payload = null) {
        let response = {
            status: STATUS.LOADING,
            data: null,
            error: null
        }

        let option = {
            url: url,
            type: method,
            beforeSend: function () {
                callback(response)
            },
            success: function (resp) {
                response.status_code = resp.status
                if (resp.status === 200) {
                    response.status = STATUS.SUCCESS
                } else {
                    response.status = STATUS.ERROR
                }
                response.error = resp.message
                response.data = resp.data
                callback(response)
            },
            error: function (jqXHR, exception) {
                response.status_code = jqXHR.status
                response.status = STATUS.ERROR
                response.error = parseError(jqXHR, exception)
                callback(response)
            }
        }

        if (payload != null) {
            option["data"] = JSON.stringify(payload)
            option["contentType"] = `application/json; charset=utf-8`
        }

        return $.ajax(option)
    }
}(jQuery))
