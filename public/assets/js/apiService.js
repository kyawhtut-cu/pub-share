(function (jQuery) {

    let Api = null
    let App = null

    jQuery.ApiService = function (app) {
        Api = $.Api(`https://script.google.com/macros/s/AKfycbwEE6yzT4-YEVF9a7FMvcVO3LAMoK1PPfnDiMOoF_n-4iRHfk0NdU3UEYcidvoQP8s2_w/exec`)
        App = app

        return {
            submitData,
            getSaveData
        }
    }

    const submitData = (data, callback) => {
        Api.sheet({
            route: `submit_generate_data`,
            payload: data,
            callback: function (response) {
                checkNetworkResponse(response, callback)
            }
        })
    }

    const getSaveData = (data, callback) => {
        Api.sheet({
            route: `get_save_data`,
            payload: data,
            callback: function (response) {
                toggleAnimation(response.status === `loading`, response.status === `error`)

                if (response.status === `success`) {
                    callback(response.data)
                } else if (response.status === `error` && response.status_code !== 401) {
                    App.showAlert(response.error)
                }
            }
        })
    }

    const toggleAnimation = (isLoading, isError) => {
        if (isError || !isLoading) {
            $(`#loading`).remove()
            return
        }
        let loadingDiv = $(
            `<div>`,
            {
                'class': `w-100 h-100`,
                'style': `top: 0; position: fixed; z-index: 1; display: flex; justify-content: center; align-items: center; background: rgba(0, 0, 0, .25);`,
                'id': `loading`
            }
        ).append(
            $(
                `<div>`,
                {
                    'class': `spinner-border text-primary`,
                    'role': `status`,
                    'style': `width: 3rem; height: 3rem;`
                }
            )
        ).append(
            $(
                `<span>`,
                {
                    'class': `sr-only`
                }
            ).text(`Loading...`)
        )
        $(`body`).append(loadingDiv)
    }

    const checkNetworkResponse = (response, callback) => {
        toggleAnimation(response.status === `loading`, response.status === `error`)

        if (response.status === `success`) {
            callback(response.data)
        } else if (response.status === `error`) {
            App.showAlert(response.error)
        }
    }

}(jQuery))
